import worker from "@ohos:worker";
import type { ThreadWorkerGlobalScope } from "@ohos:worker";
import type { MessageEvents } from "@ohos:worker";
import fileIo from "@ohos:file.fs";
import type { BusinessError } from "@ohos:base";
import { FileHashUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/duplicate/FileHashUtil";
import { WorkerMessageType, createDuplicateFileItem, createDuplicateGroup } from "@bundle:com.example.filesmanger/entry/ets/common/model/DuplicateModels";
import type { DuplicateFileItem, WorkerMessage, ScanStartPayload, ProgressPayload, NewDuplicatePayload, ScanCompletePayload, TempScanFile, TempScanFileWithSize } from "@bundle:com.example.filesmanger/entry/ets/common/model/DuplicateModels";
const workerPort: ThreadWorkerGlobalScope = worker.workerPort;
// 内部状态
let isCancelled = false;
let scannedCount = 0;
let totalFilesCount = 0;
// 哈希映射: hash -> 文件列表
const duplicateMap = new Map<string, DuplicateFileItem[]>();
// 处理主线程消息
workerPort.onmessage = (e: MessageEvents) => {
    const message = e.data as WorkerMessage;
    switch (message.type) {
        case WorkerMessageType.SCAN_START:
            handleScanStart(message.payload as ScanStartPayload);
            break;
        case WorkerMessageType.CANCEL:
            isCancelled = true;
            break;
    }
};
/**
 * 模拟延时
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 处理开始扫描
 */
async function handleScanStart(payload: ScanStartPayload) {
    const dirPath = payload.dirPath;
    const isIncremental = payload.isIncremental;
    isCancelled = false;
    scannedCount = 0;
    totalFilesCount = 0;
    duplicateMap.clear();
    try {
        // 阶段1: 快速收集所有文件信息并建立 Size Map (用于优化)
        // Map<size, Array<TempScanFile>>
        const sizeMap = new Map<number, Array<TempScanFile>>();
        collectFiles(dirPath, sizeMap);
        // 如果取消了，直接返回
        if (isCancelled)
            return;
        // 阶段2: 逐个处理潜在的重复文件 (只有相同大小的文件才可能是重复的)
        await processFiles(sizeMap);
        // 阶段3: 扫描完成
        if (!isCancelled) {
            const groups = Array.from(duplicateMap.values())
                .filter(list => list.length > 1)
                .map(list => {
                // 注意：这里需要重新构建 group，虽然我们在 processFiles 已经发过消息
                // 但最后返回完整结果用于状态保存
                const first = list[0];
                // hash 实际上存储在 item.hash 中
                const hash = first.hash;
                // 重新查找 groupId (为了简化，这里可以不传 groupId，由主线程处理，或者我们复用之前的逻辑)
                // 这里简单生成一个新的，主线程可能会用之前接收到的
                return createDuplicateGroup(FileHashUtil.generateUniqueId(), hash, first.size, list);
            });
            const completeMsg: WorkerMessage = {
                type: WorkerMessageType.SCAN_COMPLETE,
                payload: {
                    totalFiles: totalFilesCount,
                    duplicateGroups: groups
                } as ScanCompletePayload
            };
            workerPort.postMessage(completeMsg);
        }
    }
    catch (error) {
        const err = error as BusinessError;
        const errorMsg: WorkerMessage = {
            type: WorkerMessageType.ERROR,
            payload: `Scan failed: ${err.message}`
        };
        workerPort.postMessage(errorMsg);
    }
}
/**
 * 递归收集文件，建立大小索引
 */
function collectFiles(dir: string, sizeMap: Map<number, Array<TempScanFile>>) {
    if (isCancelled)
        return;
    try {
        const entries = fileIo.listFileSync(dir);
        for (const entry of entries) {
            if (isCancelled)
                return;
            const fullPath = `${dir}/${entry}`;
            try {
                const stat = fileIo.statSync(fullPath);
                if (stat.isDirectory()) {
                    collectFiles(fullPath, sizeMap);
                }
                else if (stat.isFile() && stat.size > 0) {
                    totalFilesCount++;
                    // 将文件按大小分类
                    if (!sizeMap.has(stat.size)) {
                        sizeMap.set(stat.size, []);
                    }
                    sizeMap.get(stat.size)!.push({
                        path: fullPath,
                        name: entry,
                        mtime: stat.mtime
                    });
                    // 发送进度 (只更新总数，scanned 在第二阶段更新)
                    // 为了 UI 平滑，这里可以不频繁发送，或者只在 totalFilesCount 变化较大时发送
                    if (totalFilesCount % 50 === 0) {
                        postProgress(0, totalFilesCount, 'Scanning...');
                    }
                }
            }
            catch (e) {
                // 忽略无法访问的文件
            }
        }
    }
    catch (e) {
        // 忽略无法访问的目录
    }
}
/**
 * 处理文件：计算哈希并检测重复
 */
async function processFiles(sizeMap: Map<number, Array<TempScanFile>>) {
    // 过滤掉只有1个文件的 size 组 (不可能是重复的)
    // 我们只处理那些 size 对应文件数量 > 1 的
    const potentialDuplicates: Array<TempScanFileWithSize> = [];
    sizeMap.forEach((files, size) => {
        if (files.length > 1) {
            files.forEach(f => {
                potentialDuplicates.push({
                    path: f.path,
                    name: f.name,
                    mtime: f.mtime,
                    size: size
                });
            });
        }
        else {
            // 那些确定不重复的文件，也算作"已扫描"
            scannedCount++;
        }
    });
    // 更新一下进度，跳过了很多文件
    postProgress(scannedCount, totalFilesCount, 'Analyzing...');
    // 处理潜在重复文件
    for (const file of potentialDuplicates) {
        if (isCancelled)
            return;
        // 模拟耗时，放慢速度 (100ms)
        await sleep(100);
        // 计算哈希
        const hash = FileHashUtil.calculateFileHash(file.path);
        // 构建唯一键 (size + hash) 防止哈希碰撞
        const uniqueHash = `${file.size}_${hash}`;
        // 创建 Item
        const item = createDuplicateFileItem(file.path, file.name, file.size, file.mtime, uniqueHash);
        // 检查是否重复
        if (duplicateMap.has(uniqueHash)) {
            const list = duplicateMap.get(uniqueHash)!;
            list.push(item);
            // 构建组对象
            // 如果长度是 2，说明是新发现的重复组 (之前只有1个在map里)
            // 如果长度 > 2，说明是更新现有组
            const isNewGroup = list.length === 2;
            const listCopy: DuplicateFileItem[] = [];
            let i = 0;
            while (i < list.length) {
                listCopy.push(list[i]);
                i++;
            }
            const group = createDuplicateGroup(FileHashUtil.generateUniqueId(), // 主线程可以通过 hash 去重/合并
            uniqueHash, file.size, listCopy // 复制一份列表
            );
            // 发送重复发现消息
            const msg: WorkerMessage = {
                type: WorkerMessageType.NEW_DUPLICATE,
                payload: {
                    group: group,
                    isNewGroup: isNewGroup
                } as NewDuplicatePayload
            };
            workerPort.postMessage(msg);
        }
        else {
            // 第一次遇到这个 hash
            duplicateMap.set(uniqueHash, [item]);
        }
        scannedCount++;
        // 每处理一个文件发送进度 (或者每隔几个)
        if (scannedCount % 5 === 0 || scannedCount === totalFilesCount) {
            postProgress(scannedCount, totalFilesCount, file.name);
        }
    }
}
function postProgress(scanned: number, total: number, current: string) {
    const msg: WorkerMessage = {
        type: WorkerMessageType.PROGRESS,
        payload: {
            scannedCount: scanned,
            totalCount: total,
            currentPath: current
        } as ProgressPayload
    };
    workerPort.postMessage(msg);
}
