import { Ticket, TicketType } from './Ticket';

// 消费事件类型枚举
export enum EventType {
  BUSINESS_TRIP = '差旅出行',
  DAILY_EXPENSE = '日常消费',
  ENTERTAINMENT = '休闲娱乐',
  DINING_GATHERING = '聚餐活动',
  SHOPPING_SPREE = '购物消费',
  OTHER = '其他'
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
  associationReason: string;  // 关联原因说明
}

// 事件关联规则配置
export interface EventAssociationRule {
  maxTimeDiffHours: number;
  relatedTypes: TicketType[][];
}
