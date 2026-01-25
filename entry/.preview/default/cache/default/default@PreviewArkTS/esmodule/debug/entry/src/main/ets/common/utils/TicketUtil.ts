import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { SandboxFileItem } from '../model/SandboxFileItem';
export class TicketUtil {
    static processFile(file: SandboxFileItem): Ticket {
        // Simple heuristic or random for classification since no OCR
        let type = TicketType.OTHER;
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('food') || lowerName.includes('餐') || lowerName.includes('饭')) {
            type = TicketType.CATERING;
        }
        else if (lowerName.includes('hotel') || lowerName.includes('住') || lowerName.includes('房')) {
            type = TicketType.HOTEL;
        }
        else if (lowerName.includes('flight') || lowerName.includes('train') || lowerName.includes('票') || lowerName.includes('行')) {
            type = TicketType.TRANSPORT;
        }
        else {
            // Randomly assign if no keyword found, for demonstration of features
            const types = [TicketType.CATERING, TicketType.TRANSPORT, TicketType.HOTEL, TicketType.OTHER];
            type = types[Math.floor(file.size % 4)];
        }
        // Mock amount based on size or random
        const amount = parseFloat((file.size / 100).toFixed(2)) + 100;
        // Mock merchant
        const merchants = ['Starbucks', 'KFC', 'Hilton', 'Air China', 'Subway', 'Local Taxi'];
        const merchant = merchants[file.size % merchants.length];
        // Mock invoice code (simulating duplicate detection capability)
        // We make it deterministic based on size for testing duplicate detection
        // If size is same, code is same -> duplicate
        const code = 'INV-' + file.size;
        return {
            id: file.path,
            file: file,
            amount: amount,
            date: file.modifiedTime,
            type: type,
            merchantName: merchant,
            invoiceCode: code,
            orderNumber: 'ORD-' + file.modifiedTime
        };
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
        const seen = new Set<string>();
        const duplicates: Ticket[] = [];
        for (const t of tickets) {
            if (t.invoiceCode && seen.has(t.invoiceCode)) {
                duplicates.push(t);
            }
            else if (t.invoiceCode) {
                seen.add(t.invoiceCode);
            }
        }
        return duplicates;
    }
}
