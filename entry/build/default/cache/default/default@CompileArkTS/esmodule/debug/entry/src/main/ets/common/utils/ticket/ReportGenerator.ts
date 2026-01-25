import taskpool from "@ohos:taskpool";
import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket, ReportItem, ReportSummary } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import { DuplicateDetector } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/DuplicateDetector";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
/**
 * 分片计算任务的输入数据
 */
interface ChunkData {
    amounts: number[];
    types: string[];
}
/**
 * 分片计算结果
 */
interface ChunkResult {
    total: number;
    categoryTotals: Record<string, number>;
    categoryCounts: Record<string, number>;
}
/**
 * 并发计算金额累加任务
 */
function calculateChunk(data: ChunkData): ChunkResult {
    "use concurrent";
    let total = 0;
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    for (let i = 0; i < data.amounts.length; i++) {
        const amount = data.amounts[i];
        const type = data.types[i];
        total += amount;
        if (categoryTotals[type] === undefined) {
            categoryTotals[type] = 0;
            categoryCounts[type] = 0;
        }
        categoryTotals[type] += amount;
        categoryCounts[type] += 1;
    }
    return {
        total: total,
        categoryTotals: categoryTotals,
        categoryCounts: categoryCounts
    };
}
/**
 * 多线程报表生成器
 */
export class ReportGenerator {
    private static readonly TAG: string = 'ReportGenerator';
    private static readonly CHUNK_SIZE: number = 100;
    /**
     * 使用TaskPool并行生成报表
     */
    static async generateReportAsync(tickets: Ticket[]): Promise<ReportSummary> {
        if (tickets.length === 0) {
            return ReportGenerator.createEmptyReport();
        }
        // 检测重复
        const duplicateResult = DuplicateDetector.detectDuplicates(tickets);
        // 分片处理
        const chunks = ReportGenerator.splitIntoChunks(tickets);
        const tasks: taskpool.Task[] = [];
        for (const chunk of chunks) {
            const task = new taskpool.Task(calculateChunk, chunk);
            tasks.push(task);
        }
        // 并行执行
        const results = await ReportGenerator.executeTasksParallel(tasks);
        // 合并结果
        return ReportGenerator.mergeResults(results, duplicateResult.duplicates.length, duplicateResult.totalDuplicateAmount);
    }
    /**
     * 创建空报表
     */
    private static createEmptyReport(): ReportSummary {
        return {
            totalAmount: 0,
            totalCount: 0,
            categoryBreakdown: [],
            duplicateCount: 0,
            duplicateAmount: 0,
            eventCount: 0
        };
    }
    /**
     * 将票据分片
     */
    private static splitIntoChunks(tickets: Ticket[]): ChunkData[] {
        const chunks: ChunkData[] = [];
        const chunkSize = ReportGenerator.CHUNK_SIZE;
        for (let i = 0; i < tickets.length; i += chunkSize) {
            const end = Math.min(i + chunkSize, tickets.length);
            const amounts: number[] = [];
            const types: string[] = [];
            for (let j = i; j < end; j++) {
                amounts.push(tickets[j].amount);
                types.push(tickets[j].type);
            }
            chunks.push({ amounts: amounts, types: types });
        }
        return chunks;
    }
    /**
     * 并行执行任务
     */
    private static async executeTasksParallel(tasks: taskpool.Task[]): Promise<ChunkResult[]> {
        const results: ChunkResult[] = [];
        try {
            const promises: Promise<ChunkResult>[] = [];
            for (const task of tasks) {
                const promise = taskpool.execute(task) as Promise<ChunkResult>;
                promises.push(promise);
            }
            const settled = await Promise.all(promises);
            for (const result of settled) {
                results.push(result);
            }
        }
        catch (error) {
            Logger.error(ReportGenerator.TAG, 'Task execution failed');
        }
        return results;
    }
    /**
     * 合并分片结果
     */
    private static mergeResults(results: ChunkResult[], duplicateCount: number, duplicateAmount: number): ReportSummary {
        let totalAmount = 0;
        let totalCount = 0;
        const categoryTotals: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};
        for (const result of results) {
            totalAmount += result.total;
            const types = Object.keys(result.categoryTotals);
            for (const type of types) {
                if (categoryTotals[type] === undefined) {
                    categoryTotals[type] = 0;
                    categoryCounts[type] = 0;
                }
                categoryTotals[type] += result.categoryTotals[type];
                categoryCounts[type] += result.categoryCounts[type];
                totalCount += result.categoryCounts[type];
            }
        }
        // 构建分类明细
        const breakdown = ReportGenerator.buildCategoryBreakdown(categoryTotals, categoryCounts);
        return {
            totalAmount: totalAmount,
            totalCount: totalCount,
            categoryBreakdown: breakdown,
            duplicateCount: duplicateCount,
            duplicateAmount: duplicateAmount,
            eventCount: 0
        };
    }
    /**
     * 构建分类明细
     */
    private static buildCategoryBreakdown(totals: Record<string, number>, counts: Record<string, number>): ReportItem[] {
        const items: ReportItem[] = [];
        const types = Object.keys(totals);
        for (const type of types) {
            const item: ReportItem = {
                type: type as TicketType,
                amount: totals[type],
                count: counts[type],
                color: ReportGenerator.getTypeColor(type as TicketType)
            };
            items.push(item);
        }
        // 按金额降序排序
        items.sort((a, b) => b.amount - a.amount);
        return items;
    }
    /**
     * 获取类型对应颜色
     */
    private static getTypeColor(type: TicketType): string {
        switch (type) {
            case TicketType.CATERING:
                return '#FF9800';
            case TicketType.TRANSPORT:
                return '#2196F3';
            case TicketType.HOTEL:
                return '#9C27B0';
            case TicketType.SHOPPING:
                return '#4CAF50';
            case TicketType.ENTERTAINMENT:
                return '#E91E63';
            default:
                return '#757575';
        }
    }
}
