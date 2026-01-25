/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import { Ticket, TicketType, TicketSearchFilter } from '../../model/Ticket';
import Logger from '../Logger';

/**
 * 高性能账目检索工具
 */
export class TicketSearcher {
  private static readonly TAG: string = 'TicketSearcher';

  /**
   * 根据过滤条件搜索票据
   */
  static search(
    tickets: Ticket[],
    filter: TicketSearchFilter
  ): Ticket[] {
    let results = tickets;

    // 关键词搜索
    if (filter.keyword.length > 0) {
      results = TicketSearcher.filterByKeyword(results, filter.keyword);
    }

    // 商家名称搜索
    if (filter.merchantName.length > 0) {
      results = TicketSearcher.filterByMerchant(results, filter.merchantName);
    }

    // 金额范围搜索
    if (filter.minAmount > 0 || filter.maxAmount > 0) {
      results = TicketSearcher.filterByAmount(
        results, filter.minAmount, filter.maxAmount
      );
    }

    // 日期范围搜索
    if (filter.startDate > 0 || filter.endDate > 0) {
      results = TicketSearcher.filterByDate(
        results, filter.startDate, filter.endDate
      );
    }

    // 类型过滤
    if (filter.types.length > 0) {
      results = TicketSearcher.filterByTypes(results, filter.types);
    }

    return results;
  }

  /**
   * 关键词过滤
   */
  private static filterByKeyword(
    tickets: Ticket[],
    keyword: string
  ): Ticket[] {
    const k = keyword.toLowerCase();
    const filtered: Ticket[] = [];

    for (const ticket of tickets) {
      if (TicketSearcher.matchKeyword(ticket, k)) {
        filtered.push(ticket);
      }
    }

    return filtered;
  }

  /**
   * 匹配关键词
   */
  private static matchKeyword(ticket: Ticket, keyword: string): boolean {
    const merchantMatch = ticket.merchantName.toLowerCase().includes(keyword);
    const typeMatch = ticket.type.toLowerCase().includes(keyword);
    const codeMatch = ticket.invoiceCode.toLowerCase().includes(keyword);
    const orderMatch = ticket.orderNumber.toLowerCase().includes(keyword);
    const locationMatch = ticket.location.toLowerCase().includes(keyword);

    return merchantMatch || typeMatch || codeMatch || orderMatch || locationMatch;
  }

  /**
   * 商家名称过滤
   */
  private static filterByMerchant(
    tickets: Ticket[],
    merchantName: string
  ): Ticket[] {
    const name = merchantName.toLowerCase();
    const filtered: Ticket[] = [];

    for (const ticket of tickets) {
      if (ticket.merchantName.toLowerCase().includes(name)) {
        filtered.push(ticket);
      }
    }

    return filtered;
  }

  /**
   * 金额范围过滤
   */
  private static filterByAmount(
    tickets: Ticket[],
    minAmount: number,
    maxAmount: number
  ): Ticket[] {
    const filtered: Ticket[] = [];

    for (const ticket of tickets) {
      let match = true;
      if (minAmount > 0 && ticket.amount < minAmount) {
        match = false;
      }
      if (maxAmount > 0 && ticket.amount > maxAmount) {
        match = false;
      }
      if (match) {
        filtered.push(ticket);
      }
    }

    return filtered;
  }

  /**
   * 日期范围过滤
   */
  private static filterByDate(
    tickets: Ticket[],
    startDate: number,
    endDate: number
  ): Ticket[] {
    const filtered: Ticket[] = [];

    for (const ticket of tickets) {
      let match = true;
      if (startDate > 0 && ticket.date < startDate) {
        match = false;
      }
      if (endDate > 0 && ticket.date > endDate) {
        match = false;
      }
      if (match) {
        filtered.push(ticket);
      }
    }

    return filtered;
  }

  /**
   * 类型过滤
   */
  private static filterByTypes(
    tickets: Ticket[],
    types: TicketType[]
  ): Ticket[] {
    const filtered: Ticket[] = [];
    const typeSet = new Set<string>();
    for (const t of types) {
      typeSet.add(t);
    }

    for (const ticket of tickets) {
      if (typeSet.has(ticket.type)) {
        filtered.push(ticket);
      }
    }

    return filtered;
  }

  /**
   * 创建默认过滤条件
   */
  static createDefaultFilter(): TicketSearchFilter {
    return {
      keyword: '',
      merchantName: '',
      minAmount: 0,
      maxAmount: 0,
      startDate: 0,
      endDate: 0,
      types: []
    };
  }
}