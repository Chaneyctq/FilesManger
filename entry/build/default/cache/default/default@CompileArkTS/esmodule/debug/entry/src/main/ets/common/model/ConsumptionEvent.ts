import type { Ticket, TicketType } from './Ticket';
// 消费事件类型枚举
export enum EventType {
    BUSINESS_TRIP = "\u5DEE\u65C5\u51FA\u884C",
    DAILY_EXPENSE = "\u65E5\u5E38\u6D88\u8D39",
    ENTERTAINMENT = "\u4F11\u95F2\u5A31\u4E50",
    DINING_GATHERING = "\u805A\u9910\u6D3B\u52A8",
    SHOPPING_SPREE = "\u8D2D\u7269\u6D88\u8D39",
    OTHER = "\u5176\u4ED6"
}
// 消费事件接口
export interface ConsumptionEvent {
    id: string;
    name: string;
    eventType: EventType;
    startDate: number;
    endDate: number;
    location: string;
    tickets: Ticket[];
    ticketIds: string[];
    totalAmount: number;
    description: string;
    associationReason: string; // 关联原因说明
}
// 事件关联规则配置
export interface EventAssociationRule {
    maxTimeDiffHours: number;
    relatedTypes: TicketType[][];
}
