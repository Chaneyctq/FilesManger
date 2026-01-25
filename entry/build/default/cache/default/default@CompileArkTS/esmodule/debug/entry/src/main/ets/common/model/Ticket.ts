import type { SandboxFileItem } from './SandboxFileItem';
// 票据类型枚举
export enum TicketType {
    CATERING = "\u9910\u996E\u7F8E\u98DF",
    TRANSPORT = "\u4EA4\u901A\u51FA\u884C",
    HOTEL = "\u9152\u5E97\u4F4F\u5BBF",
    SHOPPING = "\u8D2D\u7269\u6D88\u8D39",
    ENTERTAINMENT = "\u4F11\u95F2\u5A31\u4E50",
    OTHER = "\u5176\u4ED6"
}
// 票据文件格式枚举
export enum TicketFileFormat {
    TXT = "txt",
    PDF = "pdf",
    OFD = "ofd",
    UNKNOWN = "unknown"
}
// 票据接口
export interface Ticket {
    id: string;
    file: SandboxFileItem;
    fileFormat: TicketFileFormat;
    invoiceCode: string;
    orderNumber: string;
    amount: number;
    date: number;
    type: TicketType;
    merchantName: string;
    itemDescription: string; // 具体购买的商品或服务描述
    location: string;
    rawContent: string;
    isDuplicate: boolean;
    eventId: string;
}
// 报表项接口
export interface ReportItem {
    type: TicketType;
    amount: number;
    count: number;
    color: string;
}
// 搜索过滤条件接口
export interface TicketSearchFilter {
    keyword: string;
    merchantName: string;
    minAmount: number;
    maxAmount: number;
    startDate: number;
    endDate: number;
    types: TicketType[];
}
// 报表统计结果接口
export interface ReportSummary {
    totalAmount: number;
    totalCount: number;
    categoryBreakdown: ReportItem[];
    duplicateCount: number;
    duplicateAmount: number;
    eventCount: number;
}
// 重复票据分组接口
export interface DuplicateGroup {
    groupId: string;
    reason: string;
    tickets: Ticket[];
    totalAmount: number;
}
