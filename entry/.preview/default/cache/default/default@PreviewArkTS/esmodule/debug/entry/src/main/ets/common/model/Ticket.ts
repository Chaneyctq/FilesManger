import type { SandboxFileItem } from './SandboxFileItem';
export enum TicketType {
    CATERING = "\u9910\u996E\u7F8E\u98DF",
    TRANSPORT = "\u4EA4\u901A\u51FA\u884C",
    HOTEL = "\u9152\u5E97\u4F4F\u5BBF",
    OTHER = "\u5176\u4ED6"
}
export interface Ticket {
    id: string; // Unique ID (e.g., hash or uuid)
    file: SandboxFileItem;
    invoiceCode?: string; // Optional: detected invoice code
    orderNumber?: string; // Optional: detected order number
    amount: number;
    date: number; // Timestamp of consumption
    type: TicketType;
    merchantName: string;
}
