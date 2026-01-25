import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket, TicketSearchFilter, ReportSummary, DuplicateGroup } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { ConsumptionEvent } from '../model/ConsumptionEvent';
import type { SandboxFileItem } from '../model/SandboxFileItem';
import { TicketParser } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/TicketParser";
import { DuplicateDetector } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/DuplicateDetector";
import { TicketSearcher } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/TicketSearcher";
import { EventAssociator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/EventAssociator";
import { ReportGenerator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/ReportGenerator";
import { TicketGenerator } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/TicketGenerator";
import type { TicketGenerateParams } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ticket/TicketGenerator";
export class TicketUtil {
    /**
     * 处理文件并解析为票据
     */
    static processFile(file: SandboxFileItem): Ticket {
        return TicketParser.parseTicketFile(file);
    }
    /**
     * 异步处理文件并解析为票据（支持PDF压缩流）
     */
    static async processFileAsync(file: SandboxFileItem): Promise<Ticket> {
        return TicketParser.parseTicketFileAsync(file);
    }
    static calculateTotal(tickets: Ticket[]): number {
        let total = 0;
        for (const t of tickets) {
            total += t.amount;
        }
        return total;
    }
    static generateReport(tickets: Ticket[]): Map<TicketType, number> {
        const report = new Map<TicketType, number>();
        // Initialize with 0
        report.set(TicketType.CATERING, 0);
        report.set(TicketType.TRANSPORT, 0);
        report.set(TicketType.HOTEL, 0);
        report.set(TicketType.OTHER, 0);
        for (const t of tickets) {
            const current = report.get(t.type);
            if (current !== undefined) {
                report.set(t.type, current + t.amount);
            }
        }
        return report;
    }
    static findDuplicates(tickets: Ticket[]): Ticket[] {
        return DuplicateDetector.getDuplicateIds(tickets).map(id => {
            const found = tickets.find(t => t.id === id);
            return found as Ticket;
        }).filter(t => t !== undefined);
    }
    /**
     * 搜索票据
     */
    static searchTickets(tickets: Ticket[], filter: TicketSearchFilter): Ticket[] {
        return TicketSearcher.search(tickets, filter);
    }
    /**
     * 关联消费事件
     */
    static associateEvents(tickets: Ticket[]): ConsumptionEvent[] {
        return EventAssociator.associateEvents(tickets);
    }
    /**
     * 异步生成报表
     */
    static async generateReportAsync(tickets: Ticket[]): Promise<ReportSummary> {
        return ReportGenerator.generateReportAsync(tickets);
    }
    /**
     * 生成票据文件
     */
    static generateTicket(params: TicketGenerateParams): string {
        return TicketGenerator.generateTicket(params);
    }
    /**
     * 获取重复票据分组
     */
    static getDuplicateGroups(tickets: Ticket[]): DuplicateGroup[] {
        return DuplicateDetector.getDuplicateGroups(tickets);
    }
    /**
     * 将票据移动到对应分类目录
     */
    static moveTicketToTypedDir(ticket: Ticket): string {
        return TicketGenerator.moveTicketToTypedDir(ticket.file.path, ticket.type);
    }
    /**
     * 整理所有票据到分类目录
     */
    static organizeTickets(tickets: Ticket[]): void {
        for (const ticket of tickets) {
            TicketGenerator.moveTicketToTypedDir(ticket.file.path, ticket.type);
        }
    }
    /**
     * 生成测试票据数据
     */
    static generateTestTickets(): void {
        TicketGenerator.generateTestTickets();
    }
}
