/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { common } from '@kit.AbilityKit';
import { worker } from '@kit.ArkTS';
import { fileIo } from '@kit.CoreFileKit';
import {
  DuplicateGroup,
  DuplicateFileItem,
  DeletedFileRecord,
  IncrementalScanResult,
  WorkerMessage,
  WorkerMessageType,
  ScanStartPayload,
  ProgressPayload,
  NewDuplicatePayload,
  ScanCompletePayload,
  createEmptyIncrementalScanResult
} from '../common/model/DuplicateModels';
import { DuplicateScannerUtil } from '../common/utils/duplicate/DuplicateScannerUtil';
import { RecycleBinUtil } from '../common/utils/duplicate/RecycleBinUtil';
import Logger from '../common/utils/Logger';

const UI_CONTEXT_KEY: string = 'uiContext';

@Component
export struct DuplicateFilesTab {
  // 扫描状态
  @State isScanning: boolean = false;
  @State scanProgress: string = '';
  @State scanProgressPercent: number = 0; // 新增：进度百分比

  // 扫描结果
  @State duplicateGroups: DuplicateGroup[] = [];
  @State scanResult: IncrementalScanResult | null = null;

  // Worker 实例
  private scanWorker: worker.ThreadWorker | null = null;

  // ... (保留之前的其他状态变量)
  @State deletedRecords: DeletedFileRecord[] = [];
  @State showRecycleBin: boolean = false;
  @State showConfirmDialog: boolean = false;
  @State confirmDialogTitle: string = '';
  @State confirmDialogMessage: string = '';
  @State confirmDialogAction: string = '';
  @State expandedGroupIndex: number = -1;
  @State selectedFilesMap: Map<string, boolean> = new Map();
  private scanDirectory: string = '';
  @State selectedPathName: string = '应用文件';

  aboutToAppear(): void {
    // 获取沙箱目录作为默认扫描目录
    const uiContext: UIContext | undefined = AppStorage.get(UI_CONTEXT_KEY);
    if (uiContext !== undefined) {
      const context: common.UIAbilityContext = uiContext.getHostContext() as common.UIAbilityContext;
      this.scanDirectory = context.filesDir;
      this.selectedPathName = '应用文件';
    }
    this.deletedRecords = RecycleBinUtil.getDeletedRecords();
  }

  /**
   * 显示目录选择器（选择 filesDir 下的子目录）
   */
  private showDirectorySelector() {
    try {
      const uiContext: UIContext | undefined = AppStorage.get(UI_CONTEXT_KEY);
      if (uiContext === undefined) {
        return;
      }
      const context: common.UIAbilityContext = uiContext.getHostContext() as common.UIAbilityContext;
      const rootDir = context.filesDir;

      const subDirs: string[] = ['应用文件 (根目录)'];
      const dirPaths: string[] = [rootDir];

      const filenames = fileIo.listFileSync(rootDir);
      let i = 0;
      while (i < filenames.length) {
        const name = filenames[i];
        const path = rootDir + '/' + name;
        try {
          if (fileIo.statSync(path).isDirectory()) {
            subDirs.push(name);
            dirPaths.push(path);
          }
        } catch (e) {
          // ignore
        }
        i++;
      }

      TextPickerDialog.show({
        range: subDirs,
        selected: 0,
        onAccept: (value: TextPickerResult) => {
          // value.index 是 number | number[]，这里单选是 number
          const index = Number(value.index);
          if (index >= 0 && index < dirPaths.length) {
            this.scanDirectory = dirPaths[index];
            this.selectedPathName = subDirs[index];
            Logger.info('Selected scan directory: ' + this.scanDirectory);
            // 切换目录后，清空当前结果，提示用户重新扫描
            this.duplicateGroups = [];
            this.scanResult = null;
          }
        }
      });
    } catch (e) {
      Logger.error('List directories failed: ' + JSON.stringify(e));
    }
  }

  aboutToDisappear(): void {
    // 销毁 worker
    if (this.scanWorker) {
      this.scanWorker.terminate();
      this.scanWorker = null;
    }
  }

  /**
   * 初始化 Worker
   */
  private initWorker() {
    if (this.scanWorker) {
      return;
    }
    this.scanWorker = new worker.ThreadWorker('entry/ets/workers/DuplicateScanWorker.ets');
    
    this.scanWorker.onmessage = (e) => {
      const msg = e.data as WorkerMessage;
      this.handleWorkerMessage(msg);
    };
    
    this.scanWorker.onerror = (e) => {
      Logger.error('Worker error: ' + JSON.stringify(e));
      this.isScanning = false;
      this.scanProgress = '扫描出错';
    };
  }

  /**
   * 处理 Worker 消息
   */
  private handleWorkerMessage(msg: WorkerMessage) {
    switch (msg.type) {
      case WorkerMessageType.PROGRESS:
        const progress = msg.payload as ProgressPayload;
        if (progress.totalCount > 0) {
          this.scanProgressPercent = Math.floor((progress.scannedCount / progress.totalCount) * 100);
          this.scanProgress = `正在扫描... ${this.scanProgressPercent}% (${progress.scannedCount}/${progress.totalCount})`;
        } else {
          this.scanProgress = '正在扫描目录...';
        }
        break;

      case WorkerMessageType.NEW_DUPLICATE:
        const data = msg.payload as NewDuplicatePayload;
        this.updateDuplicateGroups(data.group, data.isNewGroup);
        break;

      case WorkerMessageType.SCAN_COMPLETE:
        const result = msg.payload as ScanCompletePayload;
        this.isScanning = false;
        this.scanProgress = '';
        Logger.info('Worker scan complete: ' + result.duplicateGroups.length + ' groups');
        
        // 构造 IncrementalScanResult 用于 UI 显示统计
        // 注意：Worker 目前可能没返回所有统计字段，这里先用基本信息
        if (!this.scanResult) {
          this.scanResult = createEmptyIncrementalScanResult();
        }
        this.scanResult.totalFilesScanned = result.totalFiles;
        this.scanResult.newDuplicatesCount = this.duplicateGroups.length;
        this.scanResult.changedFilesCount = 0; // Worker 暂未细分
        this.scanResult.skippedDirsCount = 0;  // Worker 暂未细分
        
        // 确保最终列表与 Worker 结果一致 (虽然中间已经动态更新了)
        // 可以选择在这里做一次最终同步，或者信任中间的更新
        // 为了防止遗漏，这里覆盖一次
        // 但为了保留用户的操作（如展开），如果中间更新正确，其实不用覆盖
        // this.duplicateGroups = result.duplicateGroups;
        
        break;

      case WorkerMessageType.ERROR:
        this.isScanning = false;
        this.scanProgress = '扫描失败: ' + msg.payload;
        break;
    }
  }

  /**
   * 动态更新重复组列表
   */
  private updateDuplicateGroups(newGroup: DuplicateGroup, isNew: boolean) {
    // 记录日志，确认消息实时性
    Logger.info('UI update group: isNew=' + isNew + ', files=' + newGroup.files.length);

    // 使用 animateTo 实现平滑插入和重排
    animateTo({ duration: 300, curve: Curve.EaseOut }, () => {
      // 1. 手动复制现有数组，创建新引用
      const newGroups: DuplicateGroup[] = [];
      let i = 0;
      while (i < this.duplicateGroups.length) {
        newGroups.push(this.duplicateGroups[i]);
        i++;
      }

      // 2. 在新数组上操作
      if (isNew) {
        // 插入新组
        newGroups.push(newGroup);
      } else {
        // 更新现有组
        const index = newGroups.findIndex(g => g.hash === newGroup.hash);
        if (index !== -1) {
          const oldGroup = newGroups[index];
          newGroup.groupId = oldGroup.groupId; // 保持 ID 不变
          newGroups[index] = newGroup;
        } else {
          newGroups.push(newGroup); // 兜底
        }
      }

      // 3. 排序
      newGroups.sort((a, b) => b.wastedSize - a.wastedSize);

      // 4. 赋值回 @State 变量，触发 UI 更新
      this.duplicateGroups = newGroups;
    });
  }

  /**
   * 开始扫描 (替代旧的 startScan)
   */
  private startScan(forceFullScan: boolean): void {
    if (this.isScanning) return;

    this.isScanning = true;
    this.scanProgress = '准备扫描...';
    this.scanProgressPercent = 0;
    this.selectedFilesMap = new Map();
    this.duplicateGroups = []; // 清空列表，重新开始
    this.scanResult = createEmptyIncrementalScanResult();

    this.initWorker();

    // 构造启动参数
    const payload: ScanStartPayload = {
      dirPath: this.scanDirectory,
      isIncremental: !forceFullScan,
      // 如果需要真正的增量逻辑，需要传递 scanState
      // scanState: DuplicateScannerUtil.getScanState() 
    };

    const msg: WorkerMessage = {
      type: WorkerMessageType.SCAN_START,
      payload: payload
    };

    this.scanWorker!.postMessage(msg);
  }

  /**
   * 切换文件选中状态
   */
  private toggleFileSelection(filePath: string): void {
    const newMap: Map<string, boolean> = new Map();
    let found: boolean = false;

    this.selectedFilesMap.forEach((value: boolean, key: string) => {
      if (key === filePath) {
        found = true;
        // 如果已选中则取消，否则不添加（相当于删除）
        if (!value) {
          newMap.set(key, true);
        }
      } else {
        newMap.set(key, value);
      }
    });

    // 如果没找到，说明是新选中
    if (!found) {
      newMap.set(filePath, true);
    }

    this.selectedFilesMap = newMap;
  }

  /**
   * 检查文件是否被选中
   */
  private isFileSelected(filePath: string): boolean {
    const selected: boolean | undefined = this.selectedFilesMap.get(filePath);
    return selected === true;
  }

  /**
   * 获取组内选中的文件数量
   */
  private getSelectedCountInGroup(group: DuplicateGroup): number {
    let count: number = 0;
    let i: number = 0;
    while (i < group.files.length) {
      if (this.isFileSelected(group.files[i].path)) {
        count = count + 1;
      }
      i = i + 1;
    }
    return count;
  }

  /**
   * 获取总共选中的文件数量
   */
  private getTotalSelectedCount(): number {
    let count: number = 0;
    this.selectedFilesMap.forEach((value: boolean) => {
      if (value) {
        count = count + 1;
      }
    });
    return count;
  }

  /**
   * 查看文件内容
   */
  private viewFile(file: DuplicateFileItem): void {
    this.getUIContext().getRouter().pushUrl({
      url: 'pages/SandboxFileEditorPage',
      params: {
        path: file.path,
        name: file.name
      }
    });
  }

  /**
   * 删除单个文件
   */
  private deleteSingleFile(groupIndex: number, fileIndex: number): void {
    if (groupIndex < 0 || groupIndex >= this.duplicateGroups.length) {
      return;
    }

    const group: DuplicateGroup = this.duplicateGroups[groupIndex];
    if (fileIndex < 0 || fileIndex >= group.files.length) {
      return;
    }

    // 不允许删除组内最后一个文件
    if (group.files.length <= 1) {
      return;
    }

    const file: DuplicateFileItem = group.files[fileIndex];
    const record: DeletedFileRecord | null = RecycleBinUtil.moveToRecycleBin(file.path);

    if (record !== null) {
      // 从选中列表移除
      this.removeFromSelection(file.path);

      // 重建文件列表（排除已删除的文件）
      const newFiles: DuplicateFileItem[] = [];
      let i: number = 0;
      while (i < group.files.length) {
        if (i !== fileIndex) {
          newFiles.push(group.files[i]);
        }
        i = i + 1;
      }

      // 如果组中只剩一个文件，移除整个组
      if (newFiles.length <= 1) {
        // 重建组列表（排除当前组）
        const newGroups: DuplicateGroup[] = [];
        let j: number = 0;
        while (j < this.duplicateGroups.length) {
          if (j !== groupIndex) {
            newGroups.push(this.duplicateGroups[j]);
          }
          j = j + 1;
        }
        this.duplicateGroups = newGroups;

        // 更新展开索引
        if (this.expandedGroupIndex === groupIndex) {
          this.expandedGroupIndex = -1;
        } else if (this.expandedGroupIndex > groupIndex) {
          this.expandedGroupIndex = this.expandedGroupIndex - 1;
        }
      } else {
        // 重建当前组
        const newGroup: DuplicateGroup = {
          groupId: group.groupId,
          hash: group.hash,
          fileSize: group.fileSize,
          files: newFiles,
          totalCount: newFiles.length,
          wastedSize: group.fileSize * (newFiles.length - 1)
        };

        // 重建组列表
        const newGroups: DuplicateGroup[] = [];
        let j: number = 0;
        while (j < this.duplicateGroups.length) {
          if (j === groupIndex) {
            newGroups.push(newGroup);
          } else {
            newGroups.push(this.duplicateGroups[j]);
          }
          j = j + 1;
        }
        this.duplicateGroups = newGroups;
      }

      // 更新回收站记录
      this.deletedRecords = RecycleBinUtil.getDeletedRecords();

      Logger.info('Deleted file: ' + file.name + ', remaining files in group: ' + newFiles.length);
    }
  }

  /**
   * 从选中列表移除
   */
  private removeFromSelection(filePath: string): void {
    const newMap: Map<string, boolean> = new Map();
    this.selectedFilesMap.forEach((value: boolean, key: string) => {
      if (key !== filePath) {
        newMap.set(key, value);
      }
    });
    this.selectedFilesMap = newMap;
  }

  /**
   * 删除组内所有选中的文件
   */
  private deleteSelectedInGroup(groupIndex: number): void {
    if (groupIndex < 0 || groupIndex >= this.duplicateGroups.length) {
      return;
    }

    const group: DuplicateGroup = this.duplicateGroups[groupIndex];
    const selectedCount: number = this.getSelectedCountInGroup(group);

    // 不能删除所有文件，至少保留一个
    if (selectedCount >= group.files.length) {
      this.confirmDialogTitle = '提示';
      this.confirmDialogMessage = '不能删除组内所有文件，请至少保留一个文件！';
      this.confirmDialogAction = 'alert';
      this.showConfirmDialog = true;
      return;
    }

    if (selectedCount === 0) {
      return;
    }

    // 收集要删除的文件和保留的文件
    const filesToDelete: DuplicateFileItem[] = [];
    const filesToKeep: DuplicateFileItem[] = [];

    let i: number = 0;
    while (i < group.files.length) {
      if (this.isFileSelected(group.files[i].path)) {
        filesToDelete.push(group.files[i]);
      } else {
        filesToKeep.push(group.files[i]);
      }
      i = i + 1;
    }

    // 执行删除
    const records: DeletedFileRecord[] = RecycleBinUtil.batchMoveToRecycleBin(filesToDelete);

    // 清除已删除文件的选中状态
    let j: number = 0;
    while (j < filesToDelete.length) {
      this.removeFromSelection(filesToDelete[j].path);
      j = j + 1;
    }

    // 如果组中只剩一个文件，移除整个组
    if (filesToKeep.length <= 1) {
      // 重建组列表（排除当前组）
      const newGroups: DuplicateGroup[] = [];
      let k: number = 0;
      while (k < this.duplicateGroups.length) {
        if (k !== groupIndex) {
          newGroups.push(this.duplicateGroups[k]);
        }
        k = k + 1;
      }
      this.duplicateGroups = newGroups;

      // 更新展开索引
      if (this.expandedGroupIndex === groupIndex) {
        this.expandedGroupIndex = -1;
      } else if (this.expandedGroupIndex > groupIndex) {
        this.expandedGroupIndex = this.expandedGroupIndex - 1;
      }
    } else {
      // 重建当前组
      const newGroup: DuplicateGroup = {
        groupId: group.groupId,
        hash: group.hash,
        fileSize: group.fileSize,
        files: filesToKeep,
        totalCount: filesToKeep.length,
        wastedSize: group.fileSize * (filesToKeep.length - 1)
      };

      // 重建组列表
      const newGroups: DuplicateGroup[] = [];
      let k: number = 0;
      while (k < this.duplicateGroups.length) {
        if (k === groupIndex) {
          newGroups.push(newGroup);
        } else {
          newGroups.push(this.duplicateGroups[k]);
        }
        k = k + 1;
      }
      this.duplicateGroups = newGroups;
    }

    // 更新回收站记录
    this.deletedRecords = RecycleBinUtil.getDeletedRecords();

    Logger.info('Deleted ' + records.length + ' files from group, remaining: ' + filesToKeep.length);
  }

  /**
   * 全选/取消全选组内文件（除了第一个）
   */
  private toggleSelectAllInGroup(group: DuplicateGroup): void {
    const selectedCount: number = this.getSelectedCountInGroup(group);
    const newMap: Map<string, boolean> = new Map();

    // 复制现有的选择（其他组的）
    this.selectedFilesMap.forEach((value: boolean, key: string) => {
      let belongsToGroup: boolean = false;
      let i: number = 0;
      while (i < group.files.length) {
        if (group.files[i].path === key) {
          belongsToGroup = true;
          break;
        }
        i = i + 1;
      }
      if (!belongsToGroup) {
        newMap.set(key, value);
      }
    });

    // 如果已经有选中的，则取消全选；否则选中除第一个外的所有
    if (selectedCount > 0) {
      // 取消全选 - 不添加任何该组的文件
    } else {
      // 选中除第一个外的所有文件
      let i: number = 1; // 从第二个开始
      while (i < group.files.length) {
        newMap.set(group.files[i].path, true);
        i = i + 1;
      }
    }

    this.selectedFilesMap = newMap;
  }

  /**
   * 一键去重 - 每组保留第一个文件，删除其余
   */
  private handleAllGroups(): void {
    this.confirmDialogTitle = '一键去重';
    this.confirmDialogMessage = '将对所有 ' + this.duplicateGroups.length +
      ' 个重复组执行去重，每组保留第一个文件，删除其余文件。确定继续？';
    this.confirmDialogAction = 'dedup_all';
    this.showConfirmDialog = true;
  }

  /**
   * 执行一键去重
   */
  private executeDeduplicateAll(): void {
    let totalDeleted: number = 0;

    // 从后向前处理，避免索引问题
    let i: number = this.duplicateGroups.length - 1;
    while (i >= 0) {
      const group: DuplicateGroup = this.duplicateGroups[i];
      const filesToDelete: DuplicateFileItem[] = [];

      // 保留第一个，删除其余
      let j: number = 1;
      while (j < group.files.length) {
        filesToDelete.push(group.files[j]);
        j = j + 1;
      }

      const records: DeletedFileRecord[] = RecycleBinUtil.batchMoveToRecycleBin(filesToDelete);
      totalDeleted = totalDeleted + records.length;

      i = i - 1;
    }

    this.duplicateGroups = [];
    this.expandedGroupIndex = -1;
    this.selectedFilesMap = new Map();
    this.deletedRecords = RecycleBinUtil.getDeletedRecords();

    Logger.info('Deduplicated all groups, deleted ' + totalDeleted + ' files');
  }

  /**
   * 恢复文件
   */
  private restoreFile(recordId: string): void {
    const success: boolean = RecycleBinUtil.restoreFromRecycleBin(recordId);
    if (success) {
      this.deletedRecords = RecycleBinUtil.getDeletedRecords();
      // 恢复后需要重新扫描
      this.startScan(true);
    }
  }

  /**
   * 恢复所有文件
   */
  private restoreAllFiles(): void {
    this.confirmDialogTitle = '恢复所有文件';
    this.confirmDialogMessage = '将恢复回收站中的 ' + this.deletedRecords.length + ' 个文件。确定继续？';
    this.confirmDialogAction = 'restore_all';
    this.showConfirmDialog = true;
  }

  /**
   * 执行恢复所有
   */
  private executeRestoreAll(): void {
    const count: number = RecycleBinUtil.restoreAll();
    this.deletedRecords = RecycleBinUtil.getDeletedRecords();
    Logger.info('Restored ' + count + ' files');
    // 恢复后重新扫描
    this.startScan(true);
  }

  /**
   * 处理确认对话框
   */
  private handleConfirmAction(): void {
    this.showConfirmDialog = false;

    if (this.confirmDialogAction === 'dedup_all') {
      this.executeDeduplicateAll();
    } else if (this.confirmDialogAction === 'restore_all') {
      this.executeRestoreAll();
    }
    // alert 类型不需要额外处理
  }

  /**
   * 切换组展开状态
   */
  private toggleGroupExpand(index: number): void {
    if (this.expandedGroupIndex === index) {
      this.expandedGroupIndex = -1;
    } else {
      this.expandedGroupIndex = index;
    }
  }

  build() {
    Stack() {
      // 背景
      Image($r('app.media.background'))
        .width('100%')
        .height('100%')
        .objectFit(ImageFit.Cover)

      Column() {
        // 顶部操作区
        this.buildHeader()

        // 扫描状态信息
        if (this.scanResult !== null && !this.isScanning) {
          this.buildScanInfo()
        }

        // 主内容区
        if (this.showRecycleBin) {
          this.buildRecycleBinView()
        } else {
          this.buildDuplicateGroupsView()
        }
      }
      .width('100%')
      .height('100%')

      // 确认对话框
      if (this.showConfirmDialog) {
        this.buildConfirmDialog()
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  buildHeader() {
    Column() {
      // 路径选择行
      Row() {
        Text('扫描位置: ')
          .fontSize(14)
          .fontColor($r('app.color.text_color'))

        Text(this.selectedPathName)
          .fontSize(14)
          .fontWeight(500)
          .fontColor('#2196F3')
          .decoration({ type: TextDecorationType.Underline, color: '#2196F3' })
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .layoutWeight(1)
          .onClick(() => {
            this.showDirectorySelector();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 4 })

      // 扫描按钮行
      Row() {
        Button(this.isScanning ? '扫描中...' : '增量扫描')
          .fontSize(14)
          .fontColor('#000000')
          .height(36)
          .backgroundColor($r('app.color.button_background'))
          .enabled(!this.isScanning)
          .onClick(() => {
            this.startScan(false);
          })

        Button('全量扫描')
          .fontSize(14)
          .fontColor('#000000')
          .height(36)
          .margin({ left: 8 })
          .backgroundColor($r('app.color.button_background'))
          .enabled(!this.isScanning)
          .onClick(() => {
            this.startScan(true);
          })

        Blank()

        Button(this.showRecycleBin ? '返回' : '回收站(' + this.deletedRecords.length + ')')
          .fontSize(14)
          .fontColor('#000000')
          .height(36)
          .backgroundColor($r('app.color.button_background'))
          .onClick(() => {
            this.showRecycleBin = !this.showRecycleBin;
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12 })

      // 一键操作行
      if (!this.showRecycleBin && this.duplicateGroups.length > 0) {
        Row() {
          Text('发现 ' + this.duplicateGroups.length + ' 组重复文件')
            .fontSize(14)
            .fontColor($r('app.color.text_color'))
            .layoutWeight(1)

          Button('一键去重')
            .fontSize(14)
            .fontColor('#ffffff')
            .height(32)
            .backgroundColor('#E53935')
            .onClick(() => {
              this.handleAllGroups();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8 })
      }

      if (this.showRecycleBin && this.deletedRecords.length > 0) {
        Row() {
          Text('回收站: ' + this.deletedRecords.length + ' 个文件')
            .fontSize(14)
            .fontColor($r('app.color.text_color'))
            .layoutWeight(1)

          Button('恢复全部')
            .fontSize(14)
            .fontColor('#ffffff')
            .height(32)
            .backgroundColor('#4CAF50')
            .onClick(() => {
              this.restoreAllFiles();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 8 })
      }
    }
  }

  @Builder
  buildScanInfo() {
    Column() {
      Row() {
        if (this.scanResult!.isIncrementalScan) {
          Text('本次仅扫描变更文件')
            .fontSize(12)
            .fontColor('#4CAF50')
            .margin({ right: 8 })
        }

        if (this.scanResult!.newDuplicatesCount > 0) {
          Text('自上次扫描后新增重复 ' + this.scanResult!.newDuplicatesCount + ' 组')
            .fontSize(12)
            .fontColor('#FF9800')
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 4 })

      Row() {
        Text('扫描文件: ' + this.scanResult!.totalFilesScanned + ' 个')
          .fontSize(11)
          .fontColor($r('app.color.text_color'))
          .opacity(0.6)
          .margin({ right: 12 })

        if (this.scanResult!.isIncrementalScan) {
          Text('变更文件: ' + this.scanResult!.changedFilesCount + ' 个')
            .fontSize(11)
            .fontColor($r('app.color.text_color'))
            .opacity(0.6)
            .margin({ right: 12 })

          Text('跳过目录: ' + this.scanResult!.skippedDirsCount + ' 个')
            .fontSize(11)
            .fontColor($r('app.color.text_color'))
            .opacity(0.6)
            .margin({ right: 12 })
        }

        Text('耗时: ' + this.scanResult!.scanDuration + ' ms')
          .fontSize(11)
          .fontColor($r('app.color.text_color'))
          .opacity(0.6)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 2, bottom: 8 })
    }
    .backgroundColor('#22000000')
  }

  @Builder
  buildDuplicateGroupsView() {
    Column() {
      if (this.isScanning) {
        Column() {
          LoadingProgress()
            .width(32)
            .height(32)
          Text(this.scanProgress)
            .fontSize(12)
            .fontColor($r('app.color.text_color'))
            .margin({ top: 8 })
        }
        .width('100%')
        .padding({ top: 12, bottom: 4 })
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      }

      if (this.duplicateGroups.length > 0) {
        List() {
          ForEach(this.duplicateGroups, (group: DuplicateGroup, index: number) => {
            ListItem() {
              this.buildGroupCard(group, index)
            }
            .margin({ left: 16, right: 16, top: 8 })
          }, (group: DuplicateGroup) => group.groupId)
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ bottom: 16 })
      } else if (!this.isScanning) {
        Column() {
          Text(this.scanResult === null ? '点击扫描按钮开始查找重复文件' : '未发现重复文件')
            .fontSize(16)
            .fontColor($r('app.color.text_color'))
            .opacity(0.6)
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else {
        // 扫描中且暂无数据
        Blank().layoutWeight(1)
      }
    }
    .width('100%')
    .layoutWeight(1)
  }

  @Builder
  buildGroupCard(group: DuplicateGroup, index: number) {
    Column() {
      // 组标题行
      Row() {
        Column() {
          Text('重复组 #' + (index + 1))
            .fontSize(15)
            .fontWeight(600)
            .fontColor($r('app.color.text_color'))

          Text(group.totalCount + ' 个文件 · ' + DuplicateScannerUtil.formatFileSize(group.fileSize) + ' 每个')
            .fontSize(12)
            .fontColor($r('app.color.text_color'))
            .opacity(0.6)
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)

        Button(this.expandedGroupIndex === index ? '收起' : '展开')
          .fontSize(12)
          .fontColor('#000000')
          .height(28)
          .backgroundColor($r('app.color.button_background'))
          .onClick(() => {
            this.toggleGroupExpand(index);
          })
      }
      .width('100%')
      .padding(12)

      // 展开的文件列表
      if (this.expandedGroupIndex === index) {
        Column() {
          // 操作按钮行
          Row() {
            Text('勾选要删除的文件')
              .fontSize(11)
              .fontColor('#FF9800')
              .layoutWeight(1)

            Text('全选')
              .fontSize(12)
              .fontColor('#2196F3')
              .padding({ left: 8, right: 8 })
              .onClick(() => {
                this.toggleSelectAllInGroup(group);
              })

            if (this.getSelectedCountInGroup(group) > 0) {
              Text('删除选中(' + this.getSelectedCountInGroup(group) + ')')
                .fontSize(12)
                .fontColor('#ffffff')
                .backgroundColor('#E53935')
                .borderRadius(4)
                .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                .margin({ left: 8 })
                .onClick(() => {
                  this.deleteSelectedInGroup(index);
                })
            }
          }
          .width('100%')
          .padding({ left: 12, right: 12, top: 8, bottom: 8 })
          .backgroundColor('#33FF9800')

          // 文件列表
          ForEach(group.files, (file: DuplicateFileItem, fileIndex: number) => {
            Row() {
              // 复选框
              Checkbox()
                .select(this.isFileSelected(file.path))
                .selectedColor('#E53935')
                .width(20)
                .height(20)
                .onChange((isChecked: boolean) => {
                  this.toggleFileSelection(file.path);
                })

              // 文件信息
              Column() {
                Text(file.name)
                  .fontSize(13)
                  .fontColor($r('app.color.text_color'))
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })

                Text(file.path)
                  .fontSize(10)
                  .fontColor($r('app.color.text_color'))
                  .opacity(0.5)
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .margin({ top: 2 })

                Text(DuplicateScannerUtil.formatFileSize(file.size) + ' · ' +
                  DuplicateScannerUtil.formatTime(file.modifiedTime))
                  .fontSize(9)
                  .fontColor($r('app.color.text_color'))
                  .opacity(0.4)
                  .margin({ top: 1 })
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.Start)
              .margin({ left: 10 })

              // 按钮区
              Row() {
                Text('查看')
                  .fontSize(11)
                  .fontColor('#2196F3')
                  .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                  .onClick(() => {
                    this.viewFile(file);
                  })

                Text('删除')
                  .fontSize(11)
                  .fontColor('#E53935')
                  .padding({ left: 8, right: 8, top: 4, bottom: 4 })
                  .onClick(() => {
                    this.deleteSingleFile(index, fileIndex);
                  })
              }
            }
            .width('100%')
            .padding({ left: 12, right: 12, top: 10, bottom: 10 })
            .backgroundColor(this.isFileSelected(file.path) ? '#1AE53935' : '#00000000')
          }, (file: DuplicateFileItem) => file.path)
        }
        .width('100%')
        .backgroundColor('#11000000')
      }
    }
    .width('100%')
    .backgroundColor($r('app.color.start_window_background'))
    .borderRadius(12)
  }

  @Builder
  buildRecycleBinView() {
    if (this.deletedRecords.length === 0) {
      Column() {
        Text('回收站为空')
          .fontSize(16)
          .fontColor($r('app.color.text_color'))
          .opacity(0.6)
      }
      .width('100%')
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
    } else {
      List() {
        ForEach(this.deletedRecords, (record: DeletedFileRecord) => {
          ListItem() {
            Row() {
              Column() {
                Text(record.originalName)
                  .fontSize(14)
                  .fontWeight(500)
                  .fontColor($r('app.color.text_color'))

                Text(record.originalPath)
                  .fontSize(11)
                  .fontColor($r('app.color.text_color'))
                  .opacity(0.5)
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .margin({ top: 2 })

                Text(DuplicateScannerUtil.formatFileSize(record.size) + ' · ' +
                  DuplicateScannerUtil.formatTime(record.deletedTime))
                  .fontSize(10)
                  .fontColor($r('app.color.text_color'))
                  .opacity(0.4)
                  .margin({ top: 2 })
              }
              .layoutWeight(1)
              .alignItems(HorizontalAlign.Start)

              Button('恢复')
                .fontSize(12)
                .fontColor('#ffffff')
                .height(28)
                .backgroundColor('#4CAF50')
                .onClick(() => {
                  this.restoreFile(record.id);
                })
            }
            .width('100%')
            .padding(12)
            .backgroundColor($r('app.color.start_window_background'))
            .borderRadius(12)
          }
          .margin({ left: 16, right: 16, top: 8 })
        }, (record: DeletedFileRecord) => record.id)
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ bottom: 16 })
    }
  }

  @Builder
  buildConfirmDialog() {
    Column() {
      Column() {
        Text(this.confirmDialogTitle)
          .fontSize(18)
          .fontWeight(600)
          .fontColor($r('app.color.text_color'))
          .margin({ bottom: 12 })

        Text(this.confirmDialogMessage)
          .fontSize(14)
          .fontColor($r('app.color.text_color'))
          .opacity(0.8)
          .textAlign(TextAlign.Center)
          .margin({ bottom: 20 })

        if (this.confirmDialogAction === 'alert') {
          // 仅提示，只有确定按钮
          Button('确定')
            .fontSize(14)
            .fontColor('#ffffff')
            .width('100%')
            .height(40)
            .backgroundColor('#2196F3')
            .onClick(() => {
              this.showConfirmDialog = false;
            })
        } else {
          // 确认操作，有取消和确定按钮
          Row() {
            Button('取消')
              .fontSize(14)
              .fontColor('#000000')
              .layoutWeight(1)
              .height(40)
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                this.showConfirmDialog = false;
              })

            Button('确定')
              .fontSize(14)
              .fontColor('#ffffff')
              .layoutWeight(1)
              .height(40)
              .margin({ left: 12 })
              .backgroundColor('#E53935')
              .onClick(() => {
                this.handleConfirmAction();
              })
          }
          .width('100%')
        }
      }
      .width('85%')
      .padding(20)
      .backgroundColor($r('app.color.start_window_background'))
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor('#66000000')
  }
}
