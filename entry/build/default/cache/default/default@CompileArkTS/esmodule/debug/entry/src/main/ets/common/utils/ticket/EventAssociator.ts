import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import { EventType } from "@bundle:com.example.filesmanger/entry/ets/common/model/ConsumptionEvent";
import type { ConsumptionEvent } from "@bundle:com.example.filesmanger/entry/ets/common/model/ConsumptionEvent";
/**
 * 消费事件关联工具 - 发现票据间的时间与空间联系
 */
export class EventAssociator {
    private static readonly TAG: string = 'EventAssociator';
    private static readonly MAX_TIME_DIFF_HOURS: number = 48;
    private static readonly SECONDS_PER_DAY: number = 86400;
    /**
     * 分析票据并关联消费事件
     */
    static associateEvents(tickets: Ticket[]): ConsumptionEvent[] {
        if (tickets.length === 0) {
            return [];
        }
        const sorted = EventAssociator.sortByDate(tickets);
        const usedIds = new Set<string>();
        const allEvents: ConsumptionEvent[] = [];
        // 1. 查找差旅事件（交通+酒店）
        const tripEvents = EventAssociator.findTripEvents(sorted, usedIds);
        for (const e of tripEvents) {
            allEvents.push(e);
        }
        // 2. 查找聚餐活动（同地点同日多笔餐饮）
        const diningEvents = EventAssociator.findDiningEvents(sorted, usedIds);
        for (const e of diningEvents) {
            allEvents.push(e);
        }
        // 3. 查找休闲娱乐事件（娱乐+餐饮组合）
        const entertainEvents = EventAssociator.findEntertainmentEvents(sorted, usedIds);
        for (const e of entertainEvents) {
            allEvents.push(e);
        }
        // 4. 查找购物消费事件（同日多笔购物）
        const shoppingEvents = EventAssociator.findShoppingEvents(sorted, usedIds);
        for (const e of shoppingEvents) {
            allEvents.push(e);
        }
        // 5. 查找同地点日常消费
        const locationEvents = EventAssociator.findLocationEvents(sorted, usedIds);
        for (const e of locationEvents) {
            allEvents.push(e);
        }
        // 6. 查找同日期日常消费
        const dailyEvents = EventAssociator.findDailyEvents(sorted, usedIds);
        for (const e of dailyEvents) {
            allEvents.push(e);
        }
        return allEvents;
    }
    /**
     * 按日期排序票据
     */
    private static sortByDate(tickets: Ticket[]): Ticket[] {
        const sorted: Ticket[] = [];
        for (const t of tickets) {
            sorted.push(t);
        }
        sorted.sort((a, b) => a.date - b.date);
        return sorted;
    }
    /**
     * 查找差旅事件（交通+酒店组合）
     */
    private static findTripEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const transportTickets = tickets.filter(t => t.type === TicketType.TRANSPORT && !usedIds.has(t.id));
        for (const transport of transportTickets) {
            if (usedIds.has(transport.id)) {
                continue;
            }
            const relatedHotels = EventAssociator.findRelatedTickets(tickets, transport, TicketType.HOTEL, usedIds);
            if (relatedHotels.length > 0) {
                const eventTickets: Ticket[] = [transport];
                for (const hotel of relatedHotels) {
                    eventTickets.push(hotel);
                    usedIds.add(hotel.id);
                }
                usedIds.add(transport.id);
                const reason = '交通票据与酒店票据在48小时内，判定为一次差旅出行';
                const event = EventAssociator.createEventWithReason(eventTickets, EventType.BUSINESS_TRIP, reason);
                events.push(event);
            }
        }
        return events;
    }
    /**
     * 查找相关票据
     */
    private static findRelatedTickets(tickets: Ticket[], baseTicket: Ticket, targetType: TicketType, usedIds: Set<string>): Ticket[] {
        const related: Ticket[] = [];
        const maxDiff = EventAssociator.MAX_TIME_DIFF_HOURS * 3600;
        for (const ticket of tickets) {
            if (usedIds.has(ticket.id)) {
                continue;
            }
            if (ticket.type !== targetType) {
                continue;
            }
            const timeDiff = Math.abs(ticket.date - baseTicket.date);
            if (timeDiff <= maxDiff) {
                related.push(ticket);
            }
        }
        return related;
    }
    /**
     * 查找日常消费事件（同日期多笔消费）
     */
    private static findDailyEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const dayMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            if (usedIds.has(ticket.id)) {
                continue;
            }
            const dayKey = EventAssociator.getDayKey(ticket.date);
            const existing = dayMap.get(dayKey);
            if (existing) {
                existing.push(ticket);
            }
            else {
                dayMap.set(dayKey, [ticket]);
            }
        }
        dayMap.forEach((dayTickets: Ticket[], dayKey: string) => {
            if (dayTickets.length >= 2) {
                for (const t of dayTickets) {
                    usedIds.add(t.id);
                }
                const reason = '同一天(' + dayKey + ')产生' + dayTickets.length + '笔消费';
                const event = EventAssociator.createEventWithReason(dayTickets, EventType.DAILY_EXPENSE, reason);
                events.push(event);
            }
        });
        return events;
    }
    /**
     * 查找聚餐活动（同日多笔餐饮消费）
     */
    private static findDiningEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const dayMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            if (usedIds.has(ticket.id) || ticket.type !== TicketType.CATERING) {
                continue;
            }
            const dayKey = EventAssociator.getDayKey(ticket.date);
            const existing = dayMap.get(dayKey);
            if (existing) {
                existing.push(ticket);
            }
            else {
                dayMap.set(dayKey, [ticket]);
            }
        }
        dayMap.forEach((dayTickets: Ticket[], dayKey: string) => {
            if (dayTickets.length >= 2) {
                for (const t of dayTickets) {
                    usedIds.add(t.id);
                }
                const reason = '同一天(' + dayKey + ')有' + dayTickets.length + '笔餐饮消费，可能为聚餐活动';
                const event = EventAssociator.createEventWithReason(dayTickets, EventType.DINING_GATHERING, reason);
                events.push(event);
            }
        });
        return events;
    }
    /**
     * 查找休闲娱乐事件（娱乐+餐饮组合）
     */
    private static findEntertainmentEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const entertainTickets = tickets.filter(t => t.type === TicketType.ENTERTAINMENT && !usedIds.has(t.id));
        for (const entertain of entertainTickets) {
            if (usedIds.has(entertain.id)) {
                continue;
            }
            const relatedCatering = EventAssociator.findRelatedTickets(tickets, entertain, TicketType.CATERING, usedIds);
            if (relatedCatering.length > 0) {
                const eventTickets: Ticket[] = [entertain];
                for (const catering of relatedCatering) {
                    eventTickets.push(catering);
                    usedIds.add(catering.id);
                }
                usedIds.add(entertain.id);
                const reason = '娱乐消费与餐饮消费在48小时内，判定为一次休闲娱乐活动';
                const event = EventAssociator.createEventWithReason(eventTickets, EventType.ENTERTAINMENT, reason);
                events.push(event);
            }
        }
        return events;
    }
    /**
     * 查找购物消费事件（同日多笔购物）
     */
    private static findShoppingEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const dayMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            if (usedIds.has(ticket.id) || ticket.type !== TicketType.SHOPPING) {
                continue;
            }
            const dayKey = EventAssociator.getDayKey(ticket.date);
            const existing = dayMap.get(dayKey);
            if (existing) {
                existing.push(ticket);
            }
            else {
                dayMap.set(dayKey, [ticket]);
            }
        }
        dayMap.forEach((dayTickets: Ticket[], dayKey: string) => {
            if (dayTickets.length >= 2) {
                for (const t of dayTickets) {
                    usedIds.add(t.id);
                }
                const reason = '同一天(' + dayKey + ')有' + dayTickets.length + '笔购物消费';
                const event = EventAssociator.createEventWithReason(dayTickets, EventType.SHOPPING_SPREE, reason);
                events.push(event);
            }
        });
        return events;
    }
    /**
     * 查找同地点消费事件
     */
    private static findLocationEvents(tickets: Ticket[], usedIds: Set<string>): ConsumptionEvent[] {
        const events: ConsumptionEvent[] = [];
        const locationMap = new Map<string, Ticket[]>();
        for (const ticket of tickets) {
            if (usedIds.has(ticket.id) || ticket.location.length === 0) {
                continue;
            }
            const locKey = ticket.location.substring(0, 6);
            const existing = locationMap.get(locKey);
            if (existing) {
                existing.push(ticket);
            }
            else {
                locationMap.set(locKey, [ticket]);
            }
        }
        locationMap.forEach((locTickets: Ticket[], locKey: string) => {
            if (locTickets.length >= 2) {
                for (const t of locTickets) {
                    usedIds.add(t.id);
                }
                const reason = '同一地点(' + locKey + ')产生' + locTickets.length + '笔消费';
                const event = EventAssociator.createEventWithReason(locTickets, EventType.DAILY_EXPENSE, reason);
                events.push(event);
            }
        });
        return events;
    }
    /**
     * 获取日期键值
     */
    private static getDayKey(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return year + '-' + month + '-' + day;
    }
    /**
     * 创建带关联原因的消费事件
     */
    private static createEventWithReason(tickets: Ticket[], eventType: EventType, reason: string): ConsumptionEvent {
        let totalAmount = 0;
        let minDate = Number.MAX_VALUE;
        let maxDate = 0;
        const ticketIds: string[] = [];
        let location = '';
        for (const ticket of tickets) {
            totalAmount += ticket.amount;
            ticketIds.push(ticket.id);
            if (ticket.date < minDate) {
                minDate = ticket.date;
            }
            if (ticket.date > maxDate) {
                maxDate = ticket.date;
            }
            if (ticket.location.length > 0 && location.length === 0) {
                location = ticket.location;
            }
        }
        const startDate = new Date(minDate * 1000);
        const eventName = EventAssociator.generateEventName(eventType, startDate, location);
        const event: ConsumptionEvent = {
            id: 'EVT-' + minDate + '-' + tickets.length,
            name: eventName,
            eventType: eventType,
            startDate: minDate,
            endDate: maxDate,
            location: location,
            tickets: tickets,
            ticketIds: ticketIds,
            totalAmount: totalAmount,
            description: '',
            associationReason: reason
        };
        return event;
    }
    /**
     * 生成事件名称
     */
    private static generateEventName(eventType: EventType, date: Date, location: string): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateStr = year + '-' + month + '-' + day;
        if (eventType === EventType.BUSINESS_TRIP) {
            if (location.length > 0) {
                return dateStr + ' ' + location + '差旅';
            }
            return dateStr + ' 差旅出行';
        }
        return dateStr + ' ' + eventType;
    }
}
