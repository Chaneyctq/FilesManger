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
/**
 * 重复文件项
 */
export interface DuplicateFileItem {
    path: string;
    name: string;
    size: number;
    modifiedTime: number;
    hash: string;
    isSelected: boolean;
}
/**
 * 重复文件组
 */
export interface DuplicateGroup {
    groupId: string;
    hash: string;
    fileSize: number;
    files: DuplicateFileItem[];
    totalCount: number;
    wastedSize: number; // 新增：可释放空间 = fileSize * (totalCount - 1)
}
// ... existing code ...
/**
 * 创建 DuplicateGroup
 */
export function createDuplicateGroup(groupId: string, hash: string, fileSize: number, files: DuplicateFileItem[]): DuplicateGroup {
    const group: DuplicateGroup = {
        groupId: groupId,
        hash: hash,
        fileSize: fileSize,
        files: files,
        totalCount: files.length,
        wastedSize: fileSize * (files.length - 1) // 初始化计算
    };
    return group;
}
// Worker 通信相关定义
export enum WorkerMessageType {
    SCAN_START = 0,
    PROGRESS = 1,
    NEW_DUPLICATE = 2,
    SCAN_COMPLETE = 3,
    ERROR = 4,
    CANCEL = 5 // 主线程 -> Worker: 取消扫描
}
export interface ScanStartPayload {
    dirPath: string;
    isIncremental: boolean;
    scanState?: ScanState; // 传递主线程的 ScanState 给 Worker
}
export interface ProgressPayload {
    scannedCount: number;
    totalCount: number;
    currentPath: string;
}
export interface NewDuplicatePayload {
    group: DuplicateGroup;
    isNewGroup: boolean; // true=新组插入, false=现有组更新
}
export interface ScanCompletePayload {
    totalFiles: number;
    duplicateGroups: DuplicateGroup[];
}
export type WorkerMessagePayload = ScanStartPayload | ProgressPayload | NewDuplicatePayload | ScanCompletePayload | string;
export interface WorkerMessage {
    type: WorkerMessageType;
    payload: WorkerMessagePayload;
}
/**
 * 已删除文件记录（用于回滚恢复）
 */
export interface DeletedFileRecord {
    id: string;
    originalPath: string;
    originalName: string;
    backupPath: string;
    size: number;
    deletedTime: number;
    hash: string;
}
/**
 * 文件扫描缓存项（用于增量扫描）
 */
export interface FileScanCacheItem {
    path: string;
    name: string;
    size: number;
    modifiedTime: number;
    hash: string;
}
/**
 * 目录缓存项（用于判断目录是否变更）
 */
export interface DirCacheItem {
    path: string;
    modifiedTime: number;
}
/**
 * Worker 扫描过程中的临时文件对象
 */
export interface TempScanFile {
    path: string;
    name: string;
    mtime: number;
}
export interface TempScanFileWithSize extends TempScanFile {
    size: number;
}
/**
 * 扫描状态
 */
export interface ScanState {
    lastScanTime: number;
    lastScanDir: string;
    totalFilesScanned: number;
    duplicateGroupsFound: number;
    fileCache: FileScanCacheItem[];
    dirCache: DirCacheItem[];
    knownDuplicateGroupHashes: string[]; // 新增：记录已知重复组的哈希
}
/**
 * 增量扫描结果
 */
export interface IncrementalScanResult {
    groups: DuplicateGroup[];
    newDuplicatesCount: number;
    isIncrementalScan: boolean;
    changedFilesCount: number;
    totalFilesScanned: number;
    scanDuration: number;
    skippedDirsCount: number;
}
/**
 * 创建空的扫描状态
 */
export function createEmptyScanState(): ScanState {
    const state: ScanState = {
        lastScanTime: 0,
        lastScanDir: '',
        totalFilesScanned: 0,
        duplicateGroupsFound: 0,
        fileCache: [],
        dirCache: [],
        knownDuplicateGroupHashes: []
    };
    return state;
}
/**
 * 创建空的增量扫描结果
 */
export function createEmptyIncrementalScanResult(): IncrementalScanResult {
    const result: IncrementalScanResult = {
        groups: [],
        newDuplicatesCount: 0,
        isIncrementalScan: false,
        changedFilesCount: 0,
        totalFilesScanned: 0,
        scanDuration: 0,
        skippedDirsCount: 0
    };
    return result;
}
/**
 * 创建 DuplicateFileItem
 */
export function createDuplicateFileItem(path: string, name: string, size: number, modifiedTime: number, hash: string): DuplicateFileItem {
    const item: DuplicateFileItem = {
        path: path,
        name: name,
        size: size,
        modifiedTime: modifiedTime,
        hash: hash,
        isSelected: false
    };
    return item;
}
/**
 * 创建 DeletedFileRecord
 */
export function createDeletedFileRecord(id: string, originalPath: string, originalName: string, backupPath: string, size: number, hash: string): DeletedFileRecord {
    const record: DeletedFileRecord = {
        id: id,
        originalPath: originalPath,
        originalName: originalName,
        backupPath: backupPath,
        size: size,
        deletedTime: Date.now(),
        hash: hash
    };
    return record;
}
/**
 * 创建 FileScanCacheItem
 */
export function createFileScanCacheItem(path: string, name: string, size: number, modifiedTime: number, hash: string): FileScanCacheItem {
    const item: FileScanCacheItem = {
        path: path,
        name: name,
        size: size,
        modifiedTime: modifiedTime,
        hash: hash
    };
    return item;
}
/**
 * 创建 DirCacheItem
 */
export function createDirCacheItem(path: string, modifiedTime: number): DirCacheItem {
    const item: DirCacheItem = {
        path: path,
        modifiedTime: modifiedTime
    };
    return item;
}
