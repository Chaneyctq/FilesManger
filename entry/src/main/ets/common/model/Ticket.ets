import { SandboxFileItem } from './SandboxFileItem';

// 票据类型枚举
export enum TicketType {
  CATERING = '餐饮美食',
  TRANSPORT = '交通出行',
  HOTEL = '酒店住宿',
  SHOPPING = '购物消费',
  ENTERTAINMENT = '休闲娱乐',
  OTHER = '其他'
}

// 票据文件格式枚举
export enum TicketFileFormat {
  TXT = 'txt',
  PDF = 'pdf',
  OFD = 'ofd',
  UNKNOWN = 'unknown'
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
  itemDescription: string;  // 具体购买的商品或服务描述
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
