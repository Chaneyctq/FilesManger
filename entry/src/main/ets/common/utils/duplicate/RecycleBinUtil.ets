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
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import Logger from '../Logger';
import { FileHashUtil } from './FileHashUtil';
import {
  DeletedFileRecord,
  DuplicateFileItem,
  createDeletedFileRecord
} from '../../model/DuplicateModels';

const RECYCLE_BIN_DIR: string = '.duplicate_recycle_bin';
const UI_CONTEXT_KEY: string = 'uiContext';

/**
 * 回收站工具类
 * 管理删除的文件，支持恢复操作
 */
export class RecycleBinUtil {
  private static deletedRecords: DeletedFileRecord[] = [];

  /**
   * 获取回收站目录路径
   * 使用 cacheDir 而非 filesDir，避免回收站被扫描到
   */
  static getRecycleBinPath(): string {
    const uiContext: UIContext | undefined = AppStorage.get(UI_CONTEXT_KEY);
    const context: common.UIAbilityContext = uiContext!.getHostContext() as common.UIAbilityContext;
    return context.cacheDir + '/' + RECYCLE_BIN_DIR;
  }

  /**
   * 确保回收站目录存在
   */
  static ensureRecycleBinExists(): boolean {
    try {
      const recycleBinPath: string = RecycleBinUtil.getRecycleBinPath();
      try {
        fileIo.statSync(recycleBinPath);
      } catch (e) {
        // 目录不存在，创建它
        fileIo.mkdirSync(recycleBinPath);
        Logger.info('Created recycle bin directory: ' + recycleBinPath);
      }
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('ensureRecycleBinExists failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  /**
   * 获取所有已删除的文件记录
   */
  static getDeletedRecords(): DeletedFileRecord[] {
    return RecycleBinUtil.deletedRecords;
  }

  /**
   * 移动文件到回收站（软删除）
   * @param filePath 要删除的文件路径
   * @returns 删除记录，失败返回 null
   */
  static moveToRecycleBin(filePath: string): DeletedFileRecord | null {
    try {
      RecycleBinUtil.ensureRecycleBinExists();

      // 获取文件信息
      const stat: fileIo.Stat = fileIo.statSync(filePath);
      const fileName: string = RecycleBinUtil.getFileName(filePath);
      const hash: string = FileHashUtil.calculateFileHash(filePath);

      // 生成备份路径
      const uniqueId: string = FileHashUtil.generateUniqueId();
      const backupName: string = uniqueId + '_' + fileName;
      const backupPath: string = RecycleBinUtil.getRecycleBinPath() + '/' + backupName;

      // 复制文件到回收站
      fileIo.copyFileSync(filePath, backupPath);

      // 删除原文件
      fileIo.unlinkSync(filePath);

      // 创建删除记录
      const record: DeletedFileRecord = createDeletedFileRecord(
        uniqueId,
        filePath,
        fileName,
        backupPath,
        stat.size,
        hash
      );

      RecycleBinUtil.deletedRecords.push(record);

      Logger.info('Moved to recycle bin: ' + filePath + ' -> ' + backupPath);
      return record;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('moveToRecycleBin failed, code=' + err.code + ', message=' + err.message);
      return null;
    }
  }

  /**
   * 批量删除文件到回收站
   * @param files 要删除的文件列表
   * @returns 成功删除的记录列表
   */
  static batchMoveToRecycleBin(files: DuplicateFileItem[]): DeletedFileRecord[] {
    const records: DeletedFileRecord[] = [];

    let i: number = 0;
    while (i < files.length) {
      const file: DuplicateFileItem = files[i];
      const record: DeletedFileRecord | null = RecycleBinUtil.moveToRecycleBin(file.path);
      if (record !== null) {
        records.push(record);
      }
      i = i + 1;
    }

    return records;
  }

  /**
   * 从回收站恢复文件
   * @param recordId 删除记录的ID
   * @returns 是否恢复成功
   */
  static restoreFromRecycleBin(recordId: string): boolean {
    try {
      // 查找记录
      let recordIndex: number = -1;
      let record: DeletedFileRecord | null = null;

      let i: number = 0;
      while (i < RecycleBinUtil.deletedRecords.length) {
        if (RecycleBinUtil.deletedRecords[i].id === recordId) {
          recordIndex = i;
          record = RecycleBinUtil.deletedRecords[i];
          break;
        }
        i = i + 1;
      }

      if (record === null || recordIndex === -1) {
        Logger.error('Record not found: ' + recordId);
        return false;
      }

      // 检查备份文件是否存在
      try {
        fileIo.statSync(record.backupPath);
      } catch (e) {
        Logger.error('Backup file not found: ' + record.backupPath);
        return false;
      }

      // 确保原路径的父目录存在
      const parentDir: string = RecycleBinUtil.getParentDir(record.originalPath);
      RecycleBinUtil.ensureDirectoryExists(parentDir);

      // 检查原路径是否已存在文件
      try {
        fileIo.statSync(record.originalPath);
        // 文件已存在，使用新名称
        const newPath: string = RecycleBinUtil.generateUniqueFilePath(record.originalPath);
        fileIo.copyFileSync(record.backupPath, newPath);
        Logger.info('Restored to new path: ' + newPath);
      } catch (e) {
        // 原路径不存在，直接恢复
        fileIo.copyFileSync(record.backupPath, record.originalPath);
        Logger.info('Restored to original path: ' + record.originalPath);
      }

      // 删除备份文件
      fileIo.unlinkSync(record.backupPath);

      // 从记录列表中移除
      RecycleBinUtil.deletedRecords.splice(recordIndex, 1);

      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('restoreFromRecycleBin failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  /**
   * 恢复所有已删除的文件
   * @returns 成功恢复的数量
   */
  static restoreAll(): number {
    let restoredCount: number = 0;

    // 从后向前遍历，因为恢复会修改数组
    while (RecycleBinUtil.deletedRecords.length > 0) {
      const record: DeletedFileRecord = RecycleBinUtil.deletedRecords[RecycleBinUtil.deletedRecords.length - 1];
      if (RecycleBinUtil.restoreFromRecycleBin(record.id)) {
        restoredCount = restoredCount + 1;
      } else {
        // 如果恢复失败，移除记录防止无限循环
        RecycleBinUtil.deletedRecords.pop();
      }
    }

    return restoredCount;
  }

  /**
   * 永久删除回收站中的文件
   * @param recordId 删除记录的ID
   * @returns 是否删除成功
   */
  static permanentDelete(recordId: string): boolean {
    try {
      let recordIndex: number = -1;
      let record: DeletedFileRecord | null = null;

      let i: number = 0;
      while (i < RecycleBinUtil.deletedRecords.length) {
        if (RecycleBinUtil.deletedRecords[i].id === recordId) {
          recordIndex = i;
          record = RecycleBinUtil.deletedRecords[i];
          break;
        }
        i = i + 1;
      }

      if (record === null || recordIndex === -1) {
        return false;
      }

      // 删除备份文件
      try {
        fileIo.unlinkSync(record.backupPath);
      } catch (e) {
        // 文件可能已不存在
      }

      // 从记录列表中移除
      RecycleBinUtil.deletedRecords.splice(recordIndex, 1);

      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('permanentDelete failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  /**
   * 清空回收站
   * @returns 删除的文件数量
   */
  static emptyRecycleBin(): number {
    let deletedCount: number = 0;

    try {
      const recycleBinPath: string = RecycleBinUtil.getRecycleBinPath();

      // 删除所有备份文件
      let i: number = 0;
      while (i < RecycleBinUtil.deletedRecords.length) {
        try {
          fileIo.unlinkSync(RecycleBinUtil.deletedRecords[i].backupPath);
          deletedCount = deletedCount + 1;
        } catch (e) {
          // 忽略错误
        }
        i = i + 1;
      }

      // 清空记录
      RecycleBinUtil.deletedRecords = [];

      Logger.info('Emptied recycle bin, deleted ' + deletedCount + ' files');
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('emptyRecycleBin failed, code=' + err.code + ', message=' + err.message);
    }

    return deletedCount;
  }

  /**
   * 获取回收站占用空间
   */
  static getRecycleBinSize(): number {
    let totalSize: number = 0;

    let i: number = 0;
    while (i < RecycleBinUtil.deletedRecords.length) {
      totalSize = totalSize + RecycleBinUtil.deletedRecords[i].size;
      i = i + 1;
    }

    return totalSize;
  }

  /**
   * 获取文件名
   */
  private static getFileName(filePath: string): string {
    const parts: string[] = filePath.split('/');
    return parts[parts.length - 1];
  }

  /**
   * 获取父目录路径
   */
  private static getParentDir(filePath: string): string {
    const lastSlash: number = filePath.lastIndexOf('/');
    if (lastSlash > 0) {
      return filePath.substring(0, lastSlash);
    }
    return '/';
  }

  /**
   * 确保目录存在
   */
  private static ensureDirectoryExists(dirPath: string): void {
    try {
      fileIo.statSync(dirPath);
    } catch (e) {
      // 递归创建目录
      const parent: string = RecycleBinUtil.getParentDir(dirPath);
      if (parent !== '/' && parent !== dirPath) {
        RecycleBinUtil.ensureDirectoryExists(parent);
      }
      try {
        fileIo.mkdirSync(dirPath);
      } catch (err) {
        // 可能已存在
      }
    }
  }

  /**
   * 生成唯一的文件路径（如果文件已存在）
   */
  private static generateUniqueFilePath(originalPath: string): string {
    const lastDot: number = originalPath.lastIndexOf('.');
    const lastSlash: number = originalPath.lastIndexOf('/');

    let basePath: string;
    let extension: string;

    if (lastDot > lastSlash) {
      basePath = originalPath.substring(0, lastDot);
      extension = originalPath.substring(lastDot);
    } else {
      basePath = originalPath;
      extension = '';
    }

    let counter: number = 1;
    let newPath: string = basePath + '_restored_' + counter + extension;

    while (RecycleBinUtil.fileExists(newPath)) {
      counter = counter + 1;
      newPath = basePath + '_restored_' + counter + extension;
    }

    return newPath;
  }

  /**
   * 检查文件是否存在
   */
  private static fileExists(filePath: string): boolean {
    try {
      fileIo.statSync(filePath);
      return true;
    } catch (e) {
      return false;
    }
  }
}
