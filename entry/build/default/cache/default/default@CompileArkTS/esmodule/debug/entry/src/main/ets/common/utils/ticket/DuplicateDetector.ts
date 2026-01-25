import type { Ticket, DuplicateGroup } from '../../model/Ticket';
/**
 * 重复票据信息
 */
export interface DuplicateInfo {
    ticket: Ticket;
    duplicateWith: Ticket[];
    reason: string;
}
/**
 * 重复检测结果
 */
export interface DuplicateCheckResult {
    hasDuplicates: boolean;
    duplicates: DuplicateInfo[];
    totalDuplicateAmount: number;
}
/**
 * 重复报销检测工具
 */
export class DuplicateDetector {
    private static readonly TAG: string = 'DuplicateDetector';
    /**
     * 检测重复票据
     */
    static detectDuplicates(tickets: Ticket[]): DuplicateCheckResult {
        const result: DuplicateCheckResult = {
            hasDuplicates: false,
            duplicates: [],
            totalDuplicateAmount: 0
        };
        // 按发票代码分组
        const invoiceCodeMap = new Map<string, Ticket[]>();
        // 按订单号分组
        const orderNumberMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            // 发票代码检测
            if (ticket.invoiceCode.length > 0) {
                const existing = invoiceCodeMap.get(ticket.invoiceCode);
                if (existing) {
                    existing.push(ticket);
                }
                else {
                    invoiceCodeMap.set(ticket.invoiceCode, [ticket]);
                }
            }
            // 订单号检测
            if (ticket.orderNumber.length > 0) {
                const existing = orderNumberMap.get(ticket.orderNumber);
                if (existing) {
                    existing.push(ticket);
                }
                else {
                    orderNumberMap.set(ticket.orderNumber, [ticket]);
                }
            }
        }
        // 处理发票代码重复
        DuplicateDetector.processDuplicateGroup(invoiceCodeMap, '发票代码相同', result);
        // 处理订单号重复
        DuplicateDetector.processDuplicateGroup(orderNumberMap, '订单号相同', result);
        result.hasDuplicates = result.duplicates.length > 0;
        return result;
    }
    /**
     * 处理重复分组
     */
    private static processDuplicateGroup(groupMap: Map<string, Ticket[]>, reason: string, result: DuplicateCheckResult): void {
        groupMap.forEach((group: Ticket[]) => {
            if (group.length > 1) {
                // 第一个作为原始票据，其余为重复
                const original = group[0];
                for (let i = 1; i < group.length; i++) {
                    const duplicate = group[i];
                    const info: DuplicateInfo = {
                        ticket: duplicate,
                        duplicateWith: [original],
                        reason: reason
                    };
                    result.duplicates.push(info);
                    result.totalDuplicateAmount += duplicate.amount;
                }
            }
        });
    }
    /**
     * 标记票据的重复状态
     */
    static markDuplicates(tickets: Ticket[]): Ticket[] {
        const checkResult = DuplicateDetector.detectDuplicates(tickets);
        const duplicateIds = new Set<string>();
        for (const info of checkResult.duplicates) {
            duplicateIds.add(info.ticket.id);
        }
        const markedTickets: Ticket[] = [];
        for (const ticket of tickets) {
            const marked: Ticket = {
                id: ticket.id,
                file: ticket.file,
                fileFormat: ticket.fileFormat,
                invoiceCode: ticket.invoiceCode,
                orderNumber: ticket.orderNumber,
                amount: ticket.amount,
                date: ticket.date,
                type: ticket.type,
                merchantName: ticket.merchantName,
                itemDescription: ticket.itemDescription,
                location: ticket.location,
                rawContent: ticket.rawContent,
                isDuplicate: duplicateIds.has(ticket.id),
                eventId: ticket.eventId
            };
            markedTickets.push(marked);
        }
        return markedTickets;
    }
    /**
     * 获取重复票据ID列表
     */
    static getDuplicateIds(tickets: Ticket[]): string[] {
        const checkResult = DuplicateDetector.detectDuplicates(tickets);
        const ids: string[] = [];
        for (const info of checkResult.duplicates) {
            ids.push(info.ticket.id);
        }
        return ids;
    }
    /**
     * 获取重复票据分组（合并相同票据，避免重复分组）
     */
    static getDuplicateGroups(tickets: Ticket[]): DuplicateGroup[] {
        // 按发票代码分组
        const invoiceCodeMap = new Map<string, Ticket[]>();
        // 按订单号分组
        const orderNumberMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            if (ticket.invoiceCode.length > 0) {
                const existing = invoiceCodeMap.get(ticket.invoiceCode);
                if (existing) {
                    existing.push(ticket);
                }
                else {
                    invoiceCodeMap.set(ticket.invoiceCode, [ticket]);
                }
            }
            if (ticket.orderNumber.length > 0) {
                const existing = orderNumberMap.get(ticket.orderNumber);
                if (existing) {
                    existing.push(ticket);
                }
                else {
                    orderNumberMap.set(ticket.orderNumber, [ticket]);
                }
            }
        }
        // 使用并查集思想合并重复组
        const ticketToGroupId = new Map<string, string>();
        const groupIdToTickets = new Map<string, Set<string>>();
        const groupIdToReason = new Map<string, string>();
        let groupCounter = 0;
        // 处理发票代码重复
        invoiceCodeMap.forEach((ticketList: Ticket[], code: string) => {
            if (ticketList.length > 1) {
                DuplicateDetector.mergeTicketsIntoGroup(ticketList, '发票代码相同', ticketToGroupId, groupIdToTickets, groupIdToReason, groupCounter);
                groupCounter++;
            }
        });
        // 处理订单号重复
        orderNumberMap.forEach((ticketList: Ticket[], orderNum: string) => {
            if (ticketList.length > 1) {
                DuplicateDetector.mergeTicketsIntoGroup(ticketList, '订单号相同', ticketToGroupId, groupIdToTickets, groupIdToReason, groupCounter);
                groupCounter++;
            }
        });
        // 构建最终分组
        const ticketMap = new Map<string, Ticket>();
        for (const ticket of tickets) {
            ticketMap.set(ticket.id, ticket);
        }
        const groups: DuplicateGroup[] = [];
        const processedGroupIds = new Set<string>();
        groupIdToTickets.forEach((ticketIds: Set<string>, groupId: string) => {
            if (processedGroupIds.has(groupId) || ticketIds.size < 2) {
                return;
            }
            processedGroupIds.add(groupId);
            const groupTickets: Ticket[] = [];
            let total = 0;
            ticketIds.forEach((tid: string) => {
                const t = ticketMap.get(tid);
                if (t) {
                    groupTickets.push(t);
                    total += t.amount;
                }
            });
            if (groupTickets.length > 1) {
                const reason = groupIdToReason.get(groupId) || '重复票据';
                const group: DuplicateGroup = {
                    groupId: groupId,
                    reason: reason,
                    tickets: groupTickets,
                    totalAmount: total
                };
                groups.push(group);
            }
        });
        return groups;
    }
    /**
     * 合并票据到分组（如果票据已在某个组，则合并两个组）
     */
    private static mergeTicketsIntoGroup(ticketList: Ticket[], reason: string, ticketToGroupId: Map<string, string>, groupIdToTickets: Map<string, Set<string>>, groupIdToReason: Map<string, string>, newGroupId: number): void {
        // 找出这些票据已经属于的组
        const existingGroupIds = new Set<string>();
        for (const ticket of ticketList) {
            const gid = ticketToGroupId.get(ticket.id);
            if (gid) {
                existingGroupIds.add(gid);
            }
        }
        let targetGroupId: string;
        if (existingGroupIds.size === 0) {
            // 创建新组
            targetGroupId = 'group_' + newGroupId;
            groupIdToTickets.set(targetGroupId, new Set<string>());
            groupIdToReason.set(targetGroupId, reason);
        }
        else {
            // 使用第一个已存在的组作为目标组
            const existingArr: string[] = [];
            existingGroupIds.forEach((gid: string) => existingArr.push(gid));
            targetGroupId = existingArr[0];
            // 合并其他组到目标组
            for (let i = 1; i < existingArr.length; i++) {
                const otherGroupId = existingArr[i];
                const otherTickets = groupIdToTickets.get(otherGroupId);
                if (otherTickets) {
                    const targetTickets = groupIdToTickets.get(targetGroupId);
                    if (targetTickets) {
                        otherTickets.forEach((tid: string) => {
                            targetTickets.add(tid);
                            ticketToGroupId.set(tid, targetGroupId);
                        });
                    }
                    groupIdToTickets.delete(otherGroupId);
                    groupIdToReason.delete(otherGroupId);
                }
            }
            // 更新原因（合并原因）
            const existingReason = groupIdToReason.get(targetGroupId) || '';
            if (existingReason.indexOf(reason) < 0) {
                groupIdToReason.set(targetGroupId, existingReason + '/' + reason);
            }
        }
        // 将所有票据加入目标组
        const targetTickets = groupIdToTickets.get(targetGroupId);
        if (targetTickets) {
            for (const ticket of ticketList) {
                targetTickets.add(ticket.id);
                ticketToGroupId.set(ticket.id, targetGroupId);
            }
        }
    }
    /**
     * 构建重复分组
     */
    private static buildGroups(groupMap: Map<string, Ticket[]>, reason: string, groups: DuplicateGroup[]): void {
        groupMap.forEach((ticketList: Ticket[], key: string) => {
            if (ticketList.length > 1) {
                let total: number = 0;
                for (const t of ticketList) {
                    total += t.amount;
                }
                const group: DuplicateGroup = {
                    groupId: key,
                    reason: reason,
                    tickets: ticketList,
                    totalAmount: total
                };
                groups.push(group);
            }
        });
    }
}
