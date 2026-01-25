import fileIo from "@ohos:file.fs";
import buffer from "@ohos:buffer";
import type { BusinessError } from "@ohos:base";
import { TicketType, TicketFileFormat } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
/**
 * 票据生成参数
 */
export interface TicketGenerateParams {
    merchantName: string;
    amount: number;
    date: number;
    type: TicketType;
    invoiceCode: string;
    orderNumber: string;
    location: string;
    format: TicketFileFormat;
    remark: string;
}
/**
 * 测试数据项
 */
interface TestDataItem {
    merchant: string;
    item: string;
    amount: number;
}
/**
 * 票据生成器
 */
export class TicketGenerator {
    private static readonly TAG: string = 'TicketGenerator';
    private static readonly TICKETS_DIR: string = 'tickets';
    /**
     * 生成票据文件
     */
    static generateTicket(params: TicketGenerateParams): string {
        const dir = TicketGenerator.ensureTypedDir(params.type);
        const fileName = TicketGenerator.generateFileName(params);
        const filePath = dir + '/' + fileName;
        const content = TicketGenerator.generateContent(params);
        TicketGenerator.writeFile(filePath, content);
        return filePath;
    }
    /**
     * 确保票据目录存在
     */
    private static ensureTicketsDir(): string {
        const root = SandboxFileUtil.getSandboxRootDir();
        const dir = root + '/' + TicketGenerator.TICKETS_DIR;
        SandboxFileUtil.createDir(dir);
        return dir;
    }
    /**
     * 根据票据类型获取对应的文件夹名称
     */
    private static getTypeFolderName(type: TicketType): string {
        switch (type) {
            case TicketType.CATERING:
                return '餐饮美食';
            case TicketType.TRANSPORT:
                return '交通出行';
            case TicketType.HOTEL:
                return '酒店住宿';
            case TicketType.SHOPPING:
                return '购物消费';
            case TicketType.ENTERTAINMENT:
                return '休闲娱乐';
            default:
                return '其他';
        }
    }
    /**
     * 确保分类目录存在
     */
    private static ensureTypedDir(type: TicketType): string {
        const ticketsDir = TicketGenerator.ensureTicketsDir();
        const typeFolderName = TicketGenerator.getTypeFolderName(type);
        const typedDir = ticketsDir + '/' + typeFolderName;
        SandboxFileUtil.createDir(typedDir);
        return typedDir;
    }
    /**
     * 生成文件名
     */
    private static generateFileName(params: TicketGenerateParams): string {
        const date = new Date(params.date * 1000);
        const dateStr = date.getFullYear() + '' +
            (date.getMonth() + 1) + '' + date.getDate();
        const ext = params.format === TicketFileFormat.UNKNOWN ? 'txt' : params.format;
        return params.merchantName + '_' + dateStr + '_' + Date.now() + '.' + ext;
    }
    /**
     * 生成票据内容
     */
    private static generateContent(params: TicketGenerateParams): string {
        switch (params.format) {
            case TicketFileFormat.PDF:
                return TicketGenerator.generatePdfContent(params);
            case TicketFileFormat.OFD:
                return TicketGenerator.generateOfdContent(params);
            default:
                return TicketGenerator.generateTxtContent(params);
        }
    }
    /**
     * 生成TXT格式内容
     */
    private static generateTxtContent(params: TicketGenerateParams): string {
        const date = new Date(params.date * 1000);
        const dateStr = date.getFullYear() + '年' +
            (date.getMonth() + 1) + '月' + date.getDate() + '日';
        let content = '========== 电子票据 ==========\n\n';
        content += '发票代码：' + params.invoiceCode + '\n';
        content += '订单号：' + params.orderNumber + '\n';
        content += '商户名称：' + params.merchantName + '\n';
        content += '消费类型：' + params.type + '\n';
        content += '消费日期：' + dateStr + '\n';
        content += '消费地点：' + params.location + '\n';
        content += '\n';
        content += '金额（小写）：¥' + params.amount.toFixed(2) + '\n';
        if (params.remark.length > 0) {
            content += '\n备注：' + params.remark + '\n';
        }
        content += '\n================================\n';
        return content;
    }
    /**
     * 生成PDF格式内容（模拟）
     */
    private static generatePdfContent(params: TicketGenerateParams): string {
        const date = new Date(params.date * 1000);
        const dateStr = date.getFullYear() + '-' +
            TicketGenerator.padZero(date.getMonth() + 1) + '-' +
            TicketGenerator.padZero(date.getDate());
        let content = '%PDF-1.4\n';
        content += '% 电子发票 PDF 格式\n\n';
        content += '[Document Info]\n';
        content += 'Title: 电子发票\n';
        content += 'Creator: FilesManger\n';
        content += 'CreationDate: ' + new Date().toISOString() + '\n\n';
        content += '[Invoice Data]\n';
        content += 'InvoiceCode=' + params.invoiceCode + '\n';
        content += 'OrderNumber=' + params.orderNumber + '\n';
        content += 'MerchantName=' + params.merchantName + '\n';
        content += 'Type=' + params.type + '\n';
        content += 'Date=' + dateStr + '\n';
        content += 'Location=' + params.location + '\n';
        content += 'Amount=' + params.amount.toFixed(2) + '\n';
        if (params.remark.length > 0) {
            content += 'Remark=' + params.remark + '\n';
        }
        content += '\n%%EOF\n';
        return content;
    }
    /**
     * 生成OFD格式内容（模拟）
     */
    private static generateOfdContent(params: TicketGenerateParams): string {
        const date = new Date(params.date * 1000);
        const dateStr = date.getFullYear() + '-' +
            TicketGenerator.padZero(date.getMonth() + 1) + '-' +
            TicketGenerator.padZero(date.getDate());
        let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
        content += '<ofd:OFD xmlns:ofd="http://www.ofdspec.org">\n';
        content += '  <ofd:DocBody>\n';
        content += '    <ofd:Invoice>\n';
        content += '      <ofd:InvoiceCode>' + params.invoiceCode + '</ofd:InvoiceCode>\n';
        content += '      <ofd:OrderNumber>' + params.orderNumber + '</ofd:OrderNumber>\n';
        content += '      <ofd:MerchantName>' + params.merchantName + '</ofd:MerchantName>\n';
        content += '      <ofd:Type>' + params.type + '</ofd:Type>\n';
        content += '      <ofd:Date>' + dateStr + '</ofd:Date>\n';
        content += '      <ofd:Location>' + params.location + '</ofd:Location>\n';
        content += '      <ofd:Amount>' + params.amount.toFixed(2) + '</ofd:Amount>\n';
        if (params.remark.length > 0) {
            content += '      <ofd:Remark>' + params.remark + '</ofd:Remark>\n';
        }
        content += '    </ofd:Invoice>\n';
        content += '  </ofd:DocBody>\n';
        content += '</ofd:OFD>\n';
        return content;
    }
    /**
     * 数字补零
     */
    private static padZero(num: number): string {
        return num < 10 ? '0' + num : '' + num;
    }
    /**
     * 写入文件
     */
    private static writeFile(filePath: string, content: string): void {
        try {
            const fd = fileIo.openSync(filePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY);
            const buf = buffer.from(content, 'utf-8');
            fileIo.writeSync(fd.fd, buf.buffer);
            fileIo.closeSync(fd);
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketGenerator.TAG, 'Write failed: ' + err.message);
        }
    }
    /**
     * 获取票据文件内容用于导出
     */
    static getTicketContent(filePath: string): string {
        return SandboxFileUtil.readTextFile(filePath);
    }
    /**
     * 复制票据到指定路径
     */
    static copyTicketTo(sourcePath: string, destPath: string): boolean {
        try {
            fileIo.copyFileSync(sourcePath, destPath);
            return true;
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketGenerator.TAG, 'Copy failed: ' + err.message);
            return false;
        }
    }
    /**
     * 将票据移动到对应分类目录
     */
    static moveTicketToTypedDir(filePath: string, type: TicketType): string {
        try {
            const typedDir = TicketGenerator.ensureTypedDir(type);
            const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
            const destPath = typedDir + '/' + fileName;
            // 如果已经在正确的目录下，不需要移动
            if (filePath.indexOf(typedDir) === 0) {
                return filePath;
            }
            // 移动文件
            fileIo.moveFileSync(filePath, destPath);
            return destPath;
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketGenerator.TAG, 'Move failed: ' + err.message);
            return filePath;
        }
    }
    /**
     * 获取分类目录路径
     */
    static getTypedDirPath(type: TicketType): string {
        return TicketGenerator.ensureTypedDir(type);
    }
    /**
     * 生成测试票据数据
     */
    static generateTestTickets(): void {
        // 清空现有票据目录
        TicketGenerator.clearTicketsDir();
        // 生成各类型票据
        TicketGenerator.generateCateringTickets();
        TicketGenerator.generateTransportTickets();
        TicketGenerator.generateHotelTickets();
        TicketGenerator.generateShoppingTickets();
        TicketGenerator.generateEntertainmentTickets();
        TicketGenerator.generateOtherTickets();
    }
    /**
     * 清空票据目录
     */
    private static clearTicketsDir(): void {
        try {
            const root = SandboxFileUtil.getSandboxRootDir();
            const ticketsDir = root + '/' + TicketGenerator.TICKETS_DIR;
            if (fileIo.accessSync(ticketsDir)) {
                TicketGenerator.deleteDirRecursive(ticketsDir);
            }
        }
        catch (e) {
            // 忽略错误
        }
    }
    /**
     * 递归删除目录
     */
    private static deleteDirRecursive(dirPath: string): void {
        try {
            const items = fileIo.listFileSync(dirPath);
            for (const item of items) {
                const fullPath = dirPath + '/' + item;
                const stat = fileIo.statSync(fullPath);
                if (stat.isDirectory()) {
                    TicketGenerator.deleteDirRecursive(fullPath);
                }
                else {
                    fileIo.unlinkSync(fullPath);
                }
            }
            fileIo.rmdirSync(dirPath);
        }
        catch (e) {
            // 忽略错误
        }
    }
    /**
     * 生成餐饮票据 - 与食物相关
     */
    private static generateCateringTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '星巴克咖啡', item: '拿铁咖啡', amount: 38 } as TestDataItem,
            { merchant: '麦当劳', item: '巨无霸套餐', amount: 45 } as TestDataItem,
            { merchant: '海底捞火锅', item: '火锅套餐', amount: 268 } as TestDataItem,
            { merchant: '肯德基', item: '全家桶', amount: 89 } as TestDataItem,
            { merchant: '喜茶', item: '多肉葡萄', amount: 32 } as TestDataItem,
            { merchant: '外婆家', item: '午餐', amount: 156 } as TestDataItem,
            { merchant: '西贝莜面村', item: '莜面鱼鱼', amount: 128 } as TestDataItem
        ];
        const locations = ['北京市朝阳区', '上海市浦东新区', '广州市天河区'];
        const formats: TicketFileFormat[] = [TicketFileFormat.TXT, TicketFileFormat.PDF, TicketFileFormat.OFD];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400,
                type: TicketType.CATERING,
                invoiceCode: 'INV-FOOD-' + (1000 + i),
                orderNumber: 'ORD-FOOD-' + (2000 + i),
                location: locations[i % 3],
                format: formats[i % 3],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
        // 生成重复票据（相同发票代码）
        const dupParams1: TicketGenerateParams = {
            merchantName: '星巴克咖啡',
            amount: 88,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.CATERING,
            invoiceCode: 'INV-DUP-001',
            orderNumber: 'ORD-DUP-A1',
            location: '北京市朝阳区',
            format: TicketFileFormat.TXT,
            remark: '美式咖啡x2'
        };
        TicketGenerator.generateTicket(dupParams1);
        const dupParams2: TicketGenerateParams = {
            merchantName: '星巴克咖啡',
            amount: 88,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.CATERING,
            invoiceCode: 'INV-DUP-001',
            orderNumber: 'ORD-DUP-A2',
            location: '北京市朝阳区',
            format: TicketFileFormat.PDF,
            remark: '美式咖啡x2（重复）'
        };
        TicketGenerator.generateTicket(dupParams2);
    }
    /**
     * 生成交通票据 - 出行相关
     */
    private static generateTransportTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '滴滴出行', item: '快车-北京南站', amount: 56 } as TestDataItem,
            { merchant: '中国国航', item: '北京-上海机票', amount: 1280 } as TestDataItem,
            { merchant: '12306铁路', item: '高铁票G1234', amount: 553 } as TestDataItem,
            { merchant: '首汽约车', item: '专车-首都机场', amount: 186 } as TestDataItem,
            { merchant: '中国石化', item: '加油95号', amount: 400 } as TestDataItem,
            { merchant: '北京地铁', item: '地铁充值', amount: 100 } as TestDataItem
        ];
        const locations = ['北京首都机场', '上海虹桥站', '广州南站'];
        const formats: TicketFileFormat[] = [TicketFileFormat.TXT, TicketFileFormat.PDF, TicketFileFormat.OFD];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400 * 2,
                type: TicketType.TRANSPORT,
                invoiceCode: 'INV-TRANS-' + (3000 + i),
                orderNumber: 'ORD-TRANS-' + (4000 + i),
                location: locations[i % 3],
                format: formats[i % 3],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
        // 生成重复票据（相同订单号）
        const transDup1: TicketGenerateParams = {
            merchantName: '滴滴出行',
            amount: 156,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.TRANSPORT,
            invoiceCode: 'INV-TRANS-DUP-1',
            orderNumber: 'ORD-DUP-002',
            location: '北京市海淀区',
            format: TicketFileFormat.TXT,
            remark: '快车-中关村到望京'
        };
        TicketGenerator.generateTicket(transDup1);
        const transDup2: TicketGenerateParams = {
            merchantName: '滴滴出行',
            amount: 156,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.TRANSPORT,
            invoiceCode: 'INV-TRANS-DUP-2',
            orderNumber: 'ORD-DUP-002',
            location: '北京市海淀区',
            format: TicketFileFormat.OFD,
            remark: '快车-中关村到望京（重复）'
        };
        TicketGenerator.generateTicket(transDup2);
    }
    /**
     * 生成酒店票据 - 住宿相关
     */
    private static generateHotelTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '如家酒店', item: '标准间1晚', amount: 268 } as TestDataItem,
            { merchant: '汉庭酒店', item: '大床房2晚', amount: 456 } as TestDataItem,
            { merchant: '希尔顿酒店', item: '豪华套房', amount: 1580 } as TestDataItem,
            { merchant: '亚朵酒店', item: '商务房1晚', amount: 398 } as TestDataItem,
            { merchant: '全季酒店', item: '双床房1晚', amount: 328 } as TestDataItem
        ];
        const locations = ['北京市东城区', '上海市静安区', '深圳市南山区'];
        const formats: TicketFileFormat[] = [TicketFileFormat.TXT, TicketFileFormat.PDF, TicketFileFormat.OFD];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400 * 3,
                type: TicketType.HOTEL,
                invoiceCode: 'INV-HOTEL-' + (5000 + i),
                orderNumber: 'ORD-HOTEL-' + (6000 + i),
                location: locations[i % 3],
                format: formats[i % 3],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
    }
    /**
     * 生成购物票据 - 买物件相关
     */
    private static generateShoppingTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '京东商城', item: 'iPhone手机', amount: 6999 } as TestDataItem,
            { merchant: '天猫超市', item: '日用品', amount: 156 } as TestDataItem,
            { merchant: '华为商城', item: 'MatePad平板', amount: 2999 } as TestDataItem,
            { merchant: '苏宁易购', item: '美的空调', amount: 3599 } as TestDataItem,
            { merchant: '优衣库', item: '羽绒服', amount: 599 } as TestDataItem,
            { merchant: '宜家家居', item: '办公椅', amount: 899 } as TestDataItem
        ];
        const locations = ['北京市', '杭州市', '南京市'];
        const formats: TicketFileFormat[] = [TicketFileFormat.TXT, TicketFileFormat.PDF, TicketFileFormat.OFD];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400 * 4,
                type: TicketType.SHOPPING,
                invoiceCode: 'INV-SHOP-' + (7000 + i),
                orderNumber: 'ORD-SHOP-' + (8000 + i),
                location: locations[i % 3],
                format: formats[i % 3],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
        // 生成重复票据
        const shopDup1: TicketGenerateParams = {
            merchantName: '京东商城',
            amount: 999,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.SHOPPING,
            invoiceCode: 'INV-DUP-003',
            orderNumber: 'ORD-DUP-003',
            location: '北京市',
            format: TicketFileFormat.PDF,
            remark: '蓝牙耳机'
        };
        TicketGenerator.generateTicket(shopDup1);
        const shopDup2: TicketGenerateParams = {
            merchantName: '京东商城',
            amount: 999,
            date: Math.floor(Date.now() / 1000),
            type: TicketType.SHOPPING,
            invoiceCode: 'INV-DUP-003',
            orderNumber: 'ORD-DUP-003',
            location: '北京市',
            format: TicketFileFormat.TXT,
            remark: '蓝牙耳机（重复）'
        };
        TicketGenerator.generateTicket(shopDup2);
    }
    /**
     * 生成休闲娱乐票据 - 电影、娱乐活动
     */
    private static generateEntertainmentTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '万达影城', item: '《流浪地球3》电影票', amount: 78 } as TestDataItem,
            { merchant: '猫眼电影', item: 'IMAX电影票x2', amount: 156 } as TestDataItem,
            { merchant: '大麦网', item: '周杰伦演唱会', amount: 1280 } as TestDataItem,
            { merchant: '威尔士健身', item: '月卡会员', amount: 399 } as TestDataItem,
            { merchant: '欢乐谷', item: '门票', amount: 230 } as TestDataItem,
            { merchant: '唱吧KTV', item: '包厢3小时', amount: 288 } as TestDataItem
        ];
        const locations = ['北京市朝阳区', '上海市徐汇区', '成都市锦江区'];
        const formats: TicketFileFormat[] = [TicketFileFormat.TXT, TicketFileFormat.PDF, TicketFileFormat.OFD];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400 * 5,
                type: TicketType.ENTERTAINMENT,
                invoiceCode: 'INV-ENT-' + (9000 + i),
                orderNumber: 'ORD-ENT-' + (9500 + i),
                location: locations[i % 3],
                format: formats[i % 3],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
    }
    /**
     * 生成其他类型票据 - 无法归类的
     */
    private static generateOtherTickets(): void {
        const testData: TestDataItem[] = [
            { merchant: '顺丰快递', item: '快递费', amount: 23 } as TestDataItem,
            { merchant: '打印店', item: '文件打印', amount: 15 } as TestDataItem,
            { merchant: '物业公司', item: '物业费', amount: 1200 } as TestDataItem
        ];
        const locations = ['北京市', '上海市', '广州市'];
        const formats: TicketFileFormat[] = [
            TicketFileFormat.TXT,
            TicketFileFormat.PDF,
            TicketFileFormat.OFD
        ];
        for (let i = 0; i < testData.length; i++) {
            const data = testData[i];
            const params: TicketGenerateParams = {
                merchantName: data.merchant,
                amount: data.amount,
                date: Math.floor(Date.now() / 1000) - i * 86400 * 6,
                type: TicketType.OTHER,
                invoiceCode: 'INV-OTHER-' + (10000 + i),
                orderNumber: 'ORD-OTHER-' + (10500 + i),
                location: locations[i],
                format: formats[i],
                remark: data.item
            };
            TicketGenerator.generateTicket(params);
        }
    }
}
