文件去重扫描原理详解
当前系统中，文件去重功能采用了一种流式、多阶段、基于哈希指纹的检测策略，并在此基础上区分了全量扫描与增量扫描。
核心检测原理 (Worker 内部逻辑)
无论是全量还是增量，底层检测核心都遵循以下三个阶段，旨在最大化性能并减少不必要的 I/O 操作：
第一阶段：快速筛选 (Size Mapping)
原理：只有文件大小完全相同的文件，才有可能是重复文件。
操作：
1.  快速遍历目标目录，读取所有文件的元数据（文件名、路径、大小、修改时间）。
2.  构建一个 Size Map（大小映射表）：key 是文件大小，value 是具有该大小的文件列表。
3.  优化：直接丢弃 Size Map 中列表长度为 1 的记录。这些文件大小独一无二，绝对不可能是重复文件。
第二阶段：哈希计算 (Hash Calculation)
原理：对经过第一阶段筛选剩下的文件（即存在大小相同的文件组），计算其内容的哈希指纹。
操作：
1.  小文件：读取完整内容计算 MD5/SHA256 哈希。
2.  大文件（>128KB）：为了速度，只读取头部 64KB 和 尾部 64KB 进行混合哈希。这在绝大多数场景下能极快地识别差异（例如视频文件通常头部元数据或尾部索引不同）。
3.  生成唯一键：结合 FileSize + Hash 生成唯一标识，防止极小概率的哈希碰撞。
第三阶段：流式反馈 (Streaming Feedback)
原理：不等待所有文件处理完毕，发现一个上报一个。
操作：
1.  维护一个 Duplicate Map。
2.  每计算出一个文件的哈希，就去 Map 中查找。
3.  命中（Hit）：如果 Map 中已有该哈希，说明发现了重复。
    *   立即构建/更新“重复组”对象。
    *   实时发送消息给 UI 线程，实现列表的动态插入。
4.  未命中（Miss）：将该文件存入 Map，等待后续文件来匹配。
---
全量扫描 (Full Scan)
定义：不依赖任何历史记录，对指定目录进行彻底的重新检查。
*   流程：
    1.  清空所有内存缓存和历史状态。
    2.  重新遍历整个目录树。
    3.  对所有文件执行上述三个阶段。
*   适用场景：
    *   首次使用。
    *   用户怀疑缓存失效或希望彻底检查。
    *   移动了大量文件位置后。
增量扫描 (Incremental Scan)
定义：基于上次扫描的缓存（快照），仅识别发生变更（新增、修改）的文件，极大地提升二次扫描速度。
*   核心逻辑（DuplicateScannerUtil.ets 中实现）：
    1.  目录指纹比对：
        *   系统记录了上次扫描时每个目录的 修改时间 (mtime)。
        *   扫描开始时，先检查目录的 mtime 是否变化。
        *   未变目录：直接跳过文件遍历，从缓存中加载该目录下的所有文件记录（包括已计算好的哈希）。
        *   已变目录：重新遍历该目录下的文件。
    2.  文件指纹比对：
        *   对于已变目录中的文件，对比缓存中的 (路径, 大小, 修改时间)。
        *   未变文件：复用缓存中的哈希值，跳过繁重的哈希计算。
        *   新增/修改文件：标记为"变更"，重新计算哈希。
    3.  合并检测：
        *   将“缓存中的未变文件”与“新计算的变更文件”合并。
        *   执行核心检测逻辑（查找重复哈希）。
    4.  UI 差异化展示（您之前的需求）：
        *   系统知道哪些重复组是“上次就有的”（指纹存在于 knownDuplicateGroupHashes）。
        *   UI 列表仅展示那些新出现的重复组，自动过滤掉老生常谈的问题，让用户专注于新产生的垃圾文件。
增量扫描的优势：
假设您有 100GB 的照片库，新增了 10 张照片。
*   全量扫描：读取 100GB 数据，耗时数分钟。
*   增量扫描：只扫描新增的 10 张照片和变更的目录元数据，耗时几百毫秒。
1. 智能去重机制
系统允许用户对重复文件进行清理，无论是精细的手动选择还是高效的一键处理，其核心目标都是：在确保数据安全的前提下释放空间。
A. 手动处理 (Manual Deletion)
用户可以展开任意一个重复组，勾选特定的文件进行删除。
实现原理：
1.  文件锁定：系统会阻止用户删除组内的最后一个文件。
    *   逻辑：if (selectedCount >= group.files.length) { alert("至少保留一个文件"); return; }
    *   目的：防止用户因误操作导致数据彻底丢失（即把所有备份都删了）。
2.  移动而非删除：当用户点击删除时，文件并不是直接从磁盘抹去，而是执行了 move 操作，将其移动到应用专属的“回收站”目录。
3.  状态更新：
    *   内存中的 duplicateGroups 列表会立即移除已删除的文件项。
    *   如果某组只剩下一个文件（不再重复），该组会自动从列表中移除。
    *   UI 使用 animateTo 触发平滑的过渡动画。

    
B. 一键去重 (One-Click Deduplication)
用户可以点击“一键去重”，系统会自动处理所有重复组。
实现原理：
1.  保留策略：系统默认保留每组列表中的第一个文件。
    *   排序依据：在扫描阶段，文件通常是按扫描顺序或修改时间加入列表的。保留第一个通常意味着保留“最老”或“被发现最早”的文件（具体取决于 Worker 的遍历顺序）。
2.  批量处理：
    *   遍历所有重复组。
    *   对每一组，收集从 index 1 开始的所有文件（即除了第一个以外的所有文件）。
    *   将这些文件批量移动到回收站。
3.  原子性与日志：虽然文件操作是逐个进行的，但在 UI 层面这是一次原子操作。系统会记录删除的总数，并清空当前视图，给用户“瞬间完成”的反馈。
---
2. 误操作回滚 (Recycle Bin & Restore)
为了防止用户后悔，系统实现了一个轻量级的“回收站”机制，允许随时恢复文件。
A. 回收站架构 (The Recycle Bin)
回收站本质上是一个特殊的隐藏目录加上元数据索引。
*   物理存储：
    *   系统在沙箱 cacheDir 下创建一个名为 .recycle_bin 的隐藏目录。
    *   选择 cacheDir 的原因：系统缓存目录通常不被视为用户重要数据区，且在极端存储紧缺时可能被系统清理（符合回收站特性），但在此应用生命周期内是安全的。
*   元数据管理 (RecycleBinUtil.ets)：
    *   系统维护一个 deleted_files.json 索引文件。
    *   记录内容：
        *   id: 唯一标识符。
        *   originalPath: 文件原始路径（恢复时的目的地）。
        *   backupPath: 文件在回收站中的实际路径（如 .recycle_bin/timestamp_random.bak）。
        *   deletedTime: 删除时间。
B. 删除流程 (Move to Recycle Bin)
当用户执行“删除”操作时：
1.  生成记录：创建一个包含原始路径信息的 DeletedFileRecord。
2.  物理移动：调用 fileIo.moveFile 将文件从 originalPath 移动到 .recycle_bin 下的新路径。这比复制+删除更快，且保留文件属性。
3.  持久化索引：将记录写入 JSON 文件，确保应用重启后回收站依然存在。
C. 恢复流程 (Restore)
当用户点击“恢复”时：
1.  路径检查：检查文件的 originalPath（原位置）是否已有同名文件存在。
    *   冲突处理：虽然当前版本简化了逻辑，但理想情况是如果原位置有文件，则重命名恢复（如 file(1).txt）。
2.  物理还原：将文件从回收站移回原路径。
3.  清理索引：从 JSON 记录中移除该条目。
4.  自动刷新：如果恢复操作发生时用户正在浏览文件列表，列表会自动刷新以显示归来的文件。

1. 架构概览
*   主线程 (DuplicateFilesTab.ets): 负责创建 Worker、发送扫描指令、接收进度和结果并更新 UI。
*   Worker 线程 (DuplicateScanWorker.ets): 负责执行核心的文件扫描算法（遍历目录 -> 按大小分组 -> 计算哈希 -> 识别重复）。
2. 具体实现步骤
第一步：创建与管理 Worker (主线程)
在 entry/src/main/ets/view/DuplicateFilesTab.ets 中，UI 组件通过 initWorker 方法实例化 Worker：
// 引入 worker 模块
import { worker } from '@kit.ArkTS';
// ... 组件内部
private scanWorker: worker.ThreadWorker | null = null;
private initWorker() {
  if (this.scanWorker) {
    return;
  }
  // 1. 创建 Worker 实例，指向对应的 worker 脚本路径
  this.scanWorker = new worker.ThreadWorker('entry/ets/workers/DuplicateScanWorker.ets');
  
  // 2. 监听 Worker 发回的消息（进度、新发现的重复项、完成、错误）
  this.scanWorker.onmessage = (e) => {
    const msg = e.data as WorkerMessage;
    this.handleWorkerMessage(msg); // 处理消息更新 UI
  };
}
第二步：启动扫描任务 (主线程 -> Worker)
当用户点击扫描按钮时，主线程构造一个消息对象并通过 postMessage 发送给 Worker：
private startScan(forceFullScan: boolean): void {
  // ... 状态初始化
  this.initWorker();
  const payload: ScanStartPayload = {
    dirPath: this.scanDirectory,
    isIncremental: !forceFullScan,
  };
  const msg: WorkerMessage = {
    type: WorkerMessageType.SCAN_START,
    payload: payload
  };
  // 发送消息给 Worker，触发扫描
  this.scanWorker!.postMessage(msg);
}
第三步：Worker 内部逻辑 (Worker 线程)
在 entry/src/main/ets/workers/DuplicateScanWorker.ets 中，Worker 接收消息并执行分阶段扫描策略：
1.  监听消息:
        const workerPort: ThreadWorkerGlobalScope = worker.workerPort;
    workerPort.onmessage = (e: MessageEvents) => {
      // 解析消息类型，调用 handleScanStart
    };
    
2.  阶段一：快速筛选 (Collect Files)
    递归遍历目录，只收集文件路径和大小，建立一个 Size Map (大小 -> 文件列表)。
    *   优化点: 这一步非常快，因为只读取元数据，不读取文件内容。
        function collectFiles(dir: string, sizeMap: Map<number, Array<TempScanFile>>) {
       // 使用 fileIo.listFileSync 和 fileIo.statSync 同步遍历
       // 将文件按 size 存入 map
    }
    
3.  阶段二：精准比对 (Process Files)
    遍历 Size Map，只有当同一大小的文件数量 > 1 时，才进行哈希计算。
    *   优化点: 极大地减少了磁盘 I/O 和 CPU 计算，因为绝大多数文件大小是唯一的。
        async function processFiles(sizeMap: Map<number, Array<TempScanFile>>) {
      sizeMap.forEach((files, size) => {
        if (files.length > 1) {
          // 只有潜在的重复文件才进入此处
          // 1. 计算哈希 (FileHashUtil.calculateFileHash)
          // 2. 存入 duplicateMap
          // 3. 发现重复时，通过 workerPort.postMessage 发送 NEW_DUPLICATE 消息
        }
      });
    }
    
第四步：实时反馈 (Worker -> 主线程)
Worker 在扫描过程中会不断向主线程发送消息：
*   进度更新 (PROGRESS): 告知当前扫描了多少文件。
*   发现重复 (NEW_DUPLICATE): 一旦发现一组重复文件，立即通知 UI 渲染，而不是等全部扫完，提升用户体验。
*   扫描完成 (SCAN_COMPLETE): 发送最终统计结果。