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

import { fileIo } from '@kit.CoreFileKit';
import { BusinessError } from '@kit.BasicServicesKit';
import Logger from '../Logger';
import { FileHashUtil } from './FileHashUtil';
import {
  DuplicateFileItem,
  DuplicateGroup,
  FileScanCacheItem,
  DirCacheItem,
  ScanState,
  IncrementalScanResult,
  createDuplicateFileItem,
  createDuplicateGroup,
  createFileScanCacheItem,
  createDirCacheItem,
  createEmptyScanState,
  createEmptyIncrementalScanResult
} from '../../model/DuplicateModels';

/**
 * 重复文件扫描工具类
 * 支持全量扫描和增量扫描
 */
export class DuplicateScannerUtil {
  private static scanState: ScanState = createEmptyScanState();
  private static skippedDirsCounter: number = 0;

  /**
   * 获取当前扫描状态
   */
  static getScanState(): ScanState {
    return DuplicateScannerUtil.scanState;
  }

  /**
   * 设置扫描状态（用于恢复）
   */
  static setScanState(state: ScanState): void {
    DuplicateScannerUtil.scanState = state;
  }

  /**
   * 清除扫描缓存
   */
  static clearCache(): void {
    DuplicateScannerUtil.scanState = createEmptyScanState();
  }

  /**
   * 扫描目录查找重复文件
   * @param dirPath 要扫描的目录路径
   * @param forceFullScan 是否强制全量扫描
   * @returns 增量扫描结果
   */
  static scanDirectory(dirPath: string, forceFullScan: boolean): IncrementalScanResult {
    const startTime: number = Date.now();
    const result: IncrementalScanResult = createEmptyIncrementalScanResult();

    try {
      // 判断是否可以进行增量扫描
      const canIncremental: boolean = !forceFullScan &&
        DuplicateScannerUtil.scanState.lastScanDir === dirPath &&
        DuplicateScannerUtil.scanState.lastScanTime > 0 &&
        DuplicateScannerUtil.scanState.fileCache.length > 0;

      result.isIncrementalScan = canIncremental;

      // 重置跳过目录计数器
      DuplicateScannerUtil.skippedDirsCounter = 0;

      // 获取目录中的所有文件（增量扫描时会跳过未变更的目录）
      const allFiles: FileScanCacheItem[] = canIncremental ?
        DuplicateScannerUtil.collectAllFilesIncremental(dirPath) :
        DuplicateScannerUtil.collectAllFiles(dirPath);

      result.totalFilesScanned = allFiles.length;
      result.skippedDirsCount = DuplicateScannerUtil.skippedDirsCounter;

      let filesToProcess: FileScanCacheItem[] = [];
      const previousGroupCount: number = DuplicateScannerUtil.scanState.duplicateGroupsFound;

      if (canIncremental) {
        // 增量扫描：只对变更的文件计算哈希
        Logger.info('Performing incremental scan...');

        // 获取变更的文件（新增或修改的）
        const changedFiles: FileScanCacheItem[] = DuplicateScannerUtil.getChangedFiles(allFiles);
        result.changedFilesCount = changedFiles.length;

        Logger.info('Changed files: ' + changedFiles.length);

        // 为变更的文件计算哈希
        DuplicateScannerUtil.calculateHashForFiles(changedFiles);

        // 获取未变更的文件（从缓存中获取，已有哈希）
        const unchangedFiles: FileScanCacheItem[] = DuplicateScannerUtil.getUnchangedFilesFromCache(allFiles);

        Logger.info('Unchanged files from cache: ' + unchangedFiles.length);

        // 合并所有文件
        filesToProcess = DuplicateScannerUtil.mergeFiles(unchangedFiles, changedFiles);
      } else {
        // 全量扫描：为所有文件计算哈希
        Logger.info('Performing full scan...');
        DuplicateScannerUtil.calculateHashForFiles(allFiles);
        filesToProcess = allFiles;
        result.changedFilesCount = allFiles.length;
      }

      // 查找重复组（所有的）
      const allGroups: DuplicateGroup[] = DuplicateScannerUtil.findDuplicateGroups(filesToProcess);
      
      // 准备上次扫描的已知组哈希集合
      const previousKnownHashes: string[] = DuplicateScannerUtil.scanState.knownDuplicateGroupHashes || [];
      const previousHashesSet: Set<string> = new Set();
      let k: number = 0;
      while (k < previousKnownHashes.length) {
        previousHashesSet.add(previousKnownHashes[k]);
        k = k + 1;
      }

      // 计算新增的重复组数量并过滤结果
      if (canIncremental) {
        // 增量扫描：只返回新增的重复组给UI
        const newGroups: DuplicateGroup[] = [];
        let m: number = 0;
        while (m < allGroups.length) {
          if (!previousHashesSet.has(allGroups[m].hash)) {
            newGroups.push(allGroups[m]);
          }
          m = m + 1;
        }
        
        result.groups = newGroups;
        result.newDuplicatesCount = newGroups.length;
        
        Logger.info('Incremental scan: showing ' + newGroups.length + ' new groups out of ' + allGroups.length + ' total');
      } else {
        // 全量扫描：返回所有
        result.groups = allGroups;
        result.newDuplicatesCount = allGroups.length;
      }

      // 更新扫描状态（注意：必须保存 ALL groups，以便下次增量扫描使用）
      DuplicateScannerUtil.updateScanState(dirPath, filesToProcess, allGroups);

      result.scanDuration = Date.now() - startTime;

      Logger.info('Scan completed: ' + result.groups.length + ' duplicate groups found, ' +
        'incremental=' + canIncremental + ', skipped dirs=' + result.skippedDirsCount +
        ', duration=' + result.scanDuration + 'ms');
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('scanDirectory failed, code=' + err.code + ', message=' + err.message);
    }

    return result;
  }

  /**
   * 为文件列表计算哈希
   */
  private static calculateHashForFiles(files: FileScanCacheItem[]): void {
    let i: number = 0;
    while (i < files.length) {
      const file: FileScanCacheItem = files[i];
      if (file.hash === '') {
        file.hash = FileHashUtil.calculateFileHash(file.path);
      }
      i = i + 1;
    }
  }

  /**
   * 递归收集目录中的所有文件（只收集基本信息）
   */
  private static collectAllFiles(dirPath: string): FileScanCacheItem[] {
    const files: FileScanCacheItem[] = [];

    try {
      const entries: string[] = fileIo.listFileSync(dirPath);
      let i: number = 0;

      while (i < entries.length) {
        const entry: string = entries[i];
        const fullPath: string = dirPath + '/' + entry;

        try {
          const stat: fileIo.Stat = fileIo.statSync(fullPath);

          if (stat.isDirectory()) {
            // 递归扫描子目录
            const subFiles: FileScanCacheItem[] = DuplicateScannerUtil.collectAllFiles(fullPath);
            let j: number = 0;
            while (j < subFiles.length) {
              files.push(subFiles[j]);
              j = j + 1;
            }
          } else if (stat.isFile() && stat.size > 0) {
            // 添加文件（跳过空文件），哈希稍后按需计算
            const item: FileScanCacheItem = createFileScanCacheItem(
              fullPath,
              entry,
              stat.size,
              stat.mtime,
              '' // 哈希稍后按需计算
            );
            files.push(item);
          }
        } catch (e) {
          // 跳过无法访问的文件
          Logger.warn('Cannot access file: ' + fullPath);
        }

        i = i + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('collectAllFiles failed, code=' + err.code + ', message=' + err.message);
    }

    return files;
  }

  /**
   * 增量方式收集文件（跳过未变更的目录）
   * @param dirPath 要扫描的目录路径
   * @returns 文件列表
   */
  private static collectAllFilesIncremental(dirPath: string): FileScanCacheItem[] {
    const files: FileScanCacheItem[] = [];

    // 构建目录缓存映射
    const dirCacheMap: Map<string, DirCacheItem> = new Map();
    let i: number = 0;
    while (i < DuplicateScannerUtil.scanState.dirCache.length) {
      const cached: DirCacheItem = DuplicateScannerUtil.scanState.dirCache[i];
      dirCacheMap.set(cached.path, cached);
      i = i + 1;
    }

    // 执行增量收集
    DuplicateScannerUtil.collectFilesRecursiveIncremental(dirPath, files, dirCacheMap);

    return files;
  }

  /**
   * 递归收集文件（增量模式）
   */
  private static collectFilesRecursiveIncremental(
    dirPath: string,
    files: FileScanCacheItem[],
    dirCacheMap: Map<string, DirCacheItem>
  ): void {
    try {
      const dirStat: fileIo.Stat = fileIo.statSync(dirPath);
      const cachedDir: DirCacheItem | undefined = dirCacheMap.get(dirPath);

      // 检查目录是否变更
      const dirChanged: boolean = cachedDir === undefined || cachedDir.modifiedTime !== dirStat.mtime;

      if (!dirChanged) {
        // 目录未变更，从文件缓存中获取该目录下的所有文件
        Logger.info('Skipping unchanged directory: ' + dirPath);
        DuplicateScannerUtil.skippedDirsCounter = DuplicateScannerUtil.skippedDirsCounter + 1;

        const cachedFiles: FileScanCacheItem[] = DuplicateScannerUtil.getFilesFromCacheByDir(dirPath);
        let i: number = 0;
        while (i < cachedFiles.length) {
          files.push(cachedFiles[i]);
          i = i + 1;
        }
        return;
      }

      // 目录已变更，需要扫描
      const entries: string[] = fileIo.listFileSync(dirPath);
      let j: number = 0;

      while (j < entries.length) {
        const entry: string = entries[j];
        const fullPath: string = dirPath + '/' + entry;

        try {
          const stat: fileIo.Stat = fileIo.statSync(fullPath);

          if (stat.isDirectory()) {
            // 递归扫描子目录
            DuplicateScannerUtil.collectFilesRecursiveIncremental(fullPath, files, dirCacheMap);
          } else if (stat.isFile() && stat.size > 0) {
            // 添加文件（跳过空文件）
            const item: FileScanCacheItem = createFileScanCacheItem(
              fullPath,
              entry,
              stat.size,
              stat.mtime,
              '' // 哈希稍后按需计算
            );
            files.push(item);
          }
        } catch (e) {
          // 跳过无法访问的文件
          Logger.warn('Cannot access file: ' + fullPath);
        }

        j = j + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('collectFilesRecursiveIncremental failed, code=' + err.code + ', message=' + err.message);
    }
  }

  /**
   * 从缓存中获取指定目录下的所有文件
   */
  private static getFilesFromCacheByDir(dirPath: string): FileScanCacheItem[] {
    const dirPrefix: string = dirPath + '/';
    const result: FileScanCacheItem[] = [];

    let i: number = 0;
    while (i < DuplicateScannerUtil.scanState.fileCache.length) {
      const cached: FileScanCacheItem = DuplicateScannerUtil.scanState.fileCache[i];
      if (cached.path === dirPath || cached.path.startsWith(dirPrefix)) {
        result.push(cached);
      }
      i = i + 1;
    }

    return result;
  }

  /**
   * 获取变更的文件（新增或修改）
   */
  private static getChangedFiles(currentFiles: FileScanCacheItem[]): FileScanCacheItem[] {
    const changedFiles: FileScanCacheItem[] = [];
    const cacheMap: Map<string, FileScanCacheItem> = new Map();

    // 构建缓存映射
    let i: number = 0;
    while (i < DuplicateScannerUtil.scanState.fileCache.length) {
      const cached: FileScanCacheItem = DuplicateScannerUtil.scanState.fileCache[i];
      cacheMap.set(cached.path, cached);
      i = i + 1;
    }

    // 检查每个当前文件
    let j: number = 0;
    while (j < currentFiles.length) {
      const current: FileScanCacheItem = currentFiles[j];
      const cached: FileScanCacheItem | undefined = cacheMap.get(current.path);

      if (cached === undefined) {
        // 新文件
        changedFiles.push(current);
      } else if (cached.modifiedTime !== current.modifiedTime || cached.size !== current.size) {
        // 修改过的文件
        changedFiles.push(current);
      }

      j = j + 1;
    }

    return changedFiles;
  }

  /**
   * 从缓存中获取未变更的文件（包含已计算的哈希）
   */
  private static getUnchangedFilesFromCache(currentFiles: FileScanCacheItem[]): FileScanCacheItem[] {
    const unchangedFiles: FileScanCacheItem[] = [];

    // 构建当前文件映射
    const currentFileMap: Map<string, FileScanCacheItem> = new Map();
    let i: number = 0;
    while (i < currentFiles.length) {
      currentFileMap.set(currentFiles[i].path, currentFiles[i]);
      i = i + 1;
    }

    // 从缓存中查找未变更的文件
    let j: number = 0;
    while (j < DuplicateScannerUtil.scanState.fileCache.length) {
      const cached: FileScanCacheItem = DuplicateScannerUtil.scanState.fileCache[j];
      const current: FileScanCacheItem | undefined = currentFileMap.get(cached.path);

      if (current !== undefined) {
        // 文件仍存在，检查是否变更
        if (current.modifiedTime === cached.modifiedTime && current.size === cached.size) {
          // 未变更，使用缓存中的数据（包含哈希）
          unchangedFiles.push(cached);
        }
      }

      j = j + 1;
    }

    return unchangedFiles;
  }

  /**
   * 合并文件列表
   */
  private static mergeFiles(files1: FileScanCacheItem[], files2: FileScanCacheItem[]): FileScanCacheItem[] {
    const merged: FileScanCacheItem[] = [];
    const pathSet: Set<string> = new Set();

    // 添加第一个列表
    let i: number = 0;
    while (i < files1.length) {
      merged.push(files1[i]);
      pathSet.add(files1[i].path);
      i = i + 1;
    }

    // 添加第二个列表中不重复的项
    let j: number = 0;
    while (j < files2.length) {
      if (!pathSet.has(files2[j].path)) {
        merged.push(files2[j]);
        pathSet.add(files2[j].path);
      }
      j = j + 1;
    }

    return merged;
  }

  /**
   * 查找重复文件组
   */
  private static findDuplicateGroups(files: FileScanCacheItem[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const hashMap: Map<string, DuplicateFileItem[]> = new Map();

    // 按哈希分组
    let i: number = 0;
    while (i < files.length) {
      const file: FileScanCacheItem = files[i];

      if (file.hash !== '') {
        // 使用 size + hash 作为分组键
        const groupKey: string = file.size.toString() + '_' + file.hash;

        const existingFiles: DuplicateFileItem[] | undefined = hashMap.get(groupKey);
        const newItem: DuplicateFileItem = createDuplicateFileItem(
          file.path,
          file.name,
          file.size,
          file.modifiedTime,
          file.hash
        );

        if (existingFiles === undefined) {
          const newArray: DuplicateFileItem[] = [newItem];
          hashMap.set(groupKey, newArray);
        } else {
          existingFiles.push(newItem);
        }
      }

      i = i + 1;
    }

    // 过滤出有重复的组
    hashMap.forEach((fileList: DuplicateFileItem[], key: string) => {
      if (fileList.length > 1) {
        const group: DuplicateGroup = createDuplicateGroup(
          FileHashUtil.generateUniqueId(),
          key,
          fileList[0].size,
          fileList
        );
        groups.push(group);
      }
    });

    // 按文件大小降序排序（大文件优先处理）
    groups.sort((a: DuplicateGroup, b: DuplicateGroup) => {
      return b.fileSize - a.fileSize;
    });

    return groups;
  }

  /**
   * 更新扫描状态（保存带有哈希的文件缓存和目录缓存）
   */
  private static updateScanState(dirPath: string, filesWithHash: FileScanCacheItem[], groups: DuplicateGroup[]): void {
    // 创建新的文件缓存列表，确保每个文件都有哈希
    const cacheItems: FileScanCacheItem[] = [];
    let i: number = 0;
    while (i < filesWithHash.length) {
      const file: FileScanCacheItem = filesWithHash[i];
      const cacheItem: FileScanCacheItem = createFileScanCacheItem(
        file.path,
        file.name,
        file.size,
        file.modifiedTime,
        file.hash
      );
      cacheItems.push(cacheItem);
      i = i + 1;
    }

    // 收集所有目录的修改时间（用于下次增量扫描判断）
    const dirCache: DirCacheItem[] = DuplicateScannerUtil.collectDirCache(dirPath);

    // 提取已知重复组的哈希
    const knownHashes: string[] = [];
    let j: number = 0;
    while (j < groups.length) {
      // 使用 size + hash 作为唯一标识，确保准确性
      // 这里 groups 中的 hash 已经是 content hash，但 DuplicateGroup 定义里也有 hash
      // 我们使用 group.hash，通常它应该就是内容的 hash
      // 不过为了与查找逻辑一致，我们可以复用 groupKey 的生成逻辑
      // 实际上 DuplicateGroup.hash 字段在 createDuplicateGroup 时被赋值为 key (即 size_hash)
      // 但让我们确认一下 findDuplicateGroups 中的逻辑
      // findDuplicateGroups 中: createDuplicateGroup(..., key, ...)
      // 所以 group.hash 实际上就是 "size_hash"
      knownHashes.push(groups[j].hash);
      j = j + 1;
    }

    const newState: ScanState = {
      lastScanTime: Date.now(),
      lastScanDir: dirPath,
      totalFilesScanned: cacheItems.length,
      duplicateGroupsFound: groups.length,
      fileCache: cacheItems,
      dirCache: dirCache,
      knownDuplicateGroupHashes: knownHashes
    };
    DuplicateScannerUtil.scanState = newState;

    Logger.info('Scan state updated: ' + cacheItems.length + ' files cached, ' +
      dirCache.length + ' directories cached, ' + knownHashes.length + ' groups cached');
  }

  /**
   * 收集目录树中所有目录的修改时间
   */
  private static collectDirCache(dirPath: string): DirCacheItem[] {
    const dirCache: DirCacheItem[] = [];

    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      const item: DirCacheItem = createDirCacheItem(dirPath, stat.mtime);
      dirCache.push(item);

      // 递归收集子目录
      const entries: string[] = fileIo.listFileSync(dirPath);
      let i: number = 0;
      while (i < entries.length) {
        const entry: string = entries[i];
        const fullPath: string = dirPath + '/' + entry;

        try {
          const entryStat: fileIo.Stat = fileIo.statSync(fullPath);
          if (entryStat.isDirectory()) {
            const subDirCache: DirCacheItem[] = DuplicateScannerUtil.collectDirCache(fullPath);
            let j: number = 0;
            while (j < subDirCache.length) {
              dirCache.push(subDirCache[j]);
              j = j + 1;
            }
          }
        } catch (e) {
          // 跳过无法访问的目录
          Logger.warn('Cannot access directory: ' + fullPath);
        }

        i = i + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('collectDirCache failed, code=' + err.code + ', message=' + err.message);
    }

    return dirCache;
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes.toString() + ' B';
    } else if (bytes < 1024 * 1024) {
      const kb: number = Math.floor(bytes / 1024 * 10) / 10;
      return kb.toString() + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      const mb: number = Math.floor(bytes / (1024 * 1024) * 10) / 10;
      return mb.toString() + ' MB';
    } else {
      const gb: number = Math.floor(bytes / (1024 * 1024 * 1024) * 10) / 10;
      return gb.toString() + ' GB';
    }
  }

  /**
   * 格式化时间
   */
  static formatTime(timestamp: number): string {
    const date: Date = new Date(timestamp);
    const year: number = date.getFullYear();
    const month: string = DuplicateScannerUtil.padZero(date.getMonth() + 1);
    const day: string = DuplicateScannerUtil.padZero(date.getDate());
    const hours: string = DuplicateScannerUtil.padZero(date.getHours());
    const minutes: string = DuplicateScannerUtil.padZero(date.getMinutes());
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
  }

  private static padZero(num: number): string {
    if (num < 10) {
      return '0' + num.toString();
    }
    return num.toString();
  }
}
