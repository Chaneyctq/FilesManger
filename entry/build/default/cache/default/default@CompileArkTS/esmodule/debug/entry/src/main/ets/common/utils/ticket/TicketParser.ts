import fileIo from "@ohos:file.fs";
import buffer from "@ohos:buffer";
import zlib from "@ohos:zlib";
import type { BusinessError } from "@ohos:base";
import { TicketType, TicketFileFormat } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { SandboxFileItem } from '../../model/SandboxFileItem';
import { TencentOCR } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ocr/TencentOCR";
import { OCRConfig } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ocr/OCRConfig";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
/**
 * 票据内容解析结果
 */
export interface ParsedTicketContent {
    invoiceCode: string;
    orderNumber: string;
    amount: number;
    date: number;
    merchantName: string;
    itemDescription: string; // 具体购买的商品或服务描述
    location: string;
    rawContent: string;
    ticketType: TicketType;
}
/**
 * 票据解析器 - 支持txt/pdf/ofd格式
 */
export class TicketParser {
    private static readonly TAG: string = 'TicketParser';
    /**
     * 根据文件扩展名获取票据格式
     */
    static getFileFormat(fileName: string): TicketFileFormat {
        const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (ext) {
            case 'txt':
                return TicketFileFormat.TXT;
            case 'pdf':
                return TicketFileFormat.PDF;
            case 'ofd':
                return TicketFileFormat.OFD;
            default:
                return TicketFileFormat.UNKNOWN;
        }
    }
    /**
     * 解析票据文件
     */
    static parseTicketFile(file: SandboxFileItem): Ticket {
        const format = TicketParser.getFileFormat(file.name);
        let content: ParsedTicketContent;
        switch (format) {
            case TicketFileFormat.TXT:
                content = TicketParser.parseTxtFile(file.path);
                break;
            case TicketFileFormat.PDF:
                content = TicketParser.parsePdfFile(file.path);
                break;
            case TicketFileFormat.OFD:
                content = TicketParser.parseOfdFile(file.path);
                break;
            default:
                content = TicketParser.createDefaultContent(file);
                break;
        }
        const ticket: Ticket = {
            id: file.path,
            file: file,
            fileFormat: format,
            invoiceCode: content.invoiceCode,
            orderNumber: content.orderNumber,
            amount: content.amount,
            date: content.date,
            type: content.ticketType,
            merchantName: content.merchantName,
            itemDescription: content.itemDescription,
            location: content.location,
            rawContent: content.rawContent,
            isDuplicate: false,
            eventId: ''
        };
        return ticket;
    }
    /**
     * 异步解析票据文件（支持PDF压缩流解析）
     */
    static async parseTicketFileAsync(file: SandboxFileItem): Promise<Ticket> {
        const format = TicketParser.getFileFormat(file.name);
        let content: ParsedTicketContent;
        switch (format) {
            case TicketFileFormat.TXT:
                content = TicketParser.parseTxtFile(file.path);
                break;
            case TicketFileFormat.PDF:
                content = await TicketParser.parsePdfFileAsync(file.path);
                break;
            case TicketFileFormat.OFD:
                content = TicketParser.parseOfdFile(file.path);
                break;
            default:
                content = TicketParser.createDefaultContent(file);
                break;
        }
        const ticket: Ticket = {
            id: file.path,
            file: file,
            fileFormat: format,
            invoiceCode: content.invoiceCode,
            orderNumber: content.orderNumber,
            amount: content.amount,
            date: content.date,
            type: content.ticketType,
            merchantName: content.merchantName,
            itemDescription: content.itemDescription,
            location: content.location,
            rawContent: content.rawContent,
            isDuplicate: false,
            eventId: ''
        };
        return ticket;
    }
    /**
     * 读取文件文本内容
     */
    private static readFileContent(filePath: string): string {
        try {
            const fd = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(filePath);
            const buf = new ArrayBuffer(stat.size);
            fileIo.readSync(fd.fd, buf);
            fileIo.closeSync(fd);
            const content = buffer.from(buf).toString('utf-8');
            return content;
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketParser.TAG, 'Read file failed: ' + err.message);
            return '';
        }
    }
    /**
     * 创建默认内容（用于未知格式）
     */
    private static createDefaultContent(file: SandboxFileItem): ParsedTicketContent {
        return {
            invoiceCode: '',
            orderNumber: '',
            amount: parseFloat((file.size / 100).toFixed(2)) + 100,
            date: file.modifiedTime,
            merchantName: '未知商家',
            itemDescription: '',
            location: '',
            rawContent: '',
            ticketType: TicketType.OTHER
        };
    }
    /**
     * 解析TXT格式票据
     */
    private static parseTxtFile(filePath: string): ParsedTicketContent {
        const content = TicketParser.readFileContent(filePath);
        return TicketParser.parseTextContent(content, filePath);
    }
    /**
     * 解析PDF格式票据（提取文本层）
     */
    private static parsePdfFile(filePath: string): ParsedTicketContent {
        // PDF解析：读取文件并尝试提取文本内容
        const content = TicketParser.extractPdfText(filePath);
        return TicketParser.parseTextContent(content, filePath);
    }
    /**
     * 异步解析PDF格式票据（支持压缩流解压）
     */
    private static async parsePdfFileAsync(filePath: string): Promise<ParsedTicketContent> {
        const content = await TicketParser.extractPdfTextAsync(filePath);
        return TicketParser.parseTextContent(content, filePath);
    }
    /**
     * 解析OFD格式票据（电子发票标准格式）
     */
    private static parseOfdFile(filePath: string): ParsedTicketContent {
        // OFD是基于XML的压缩包格式，提取XML内容
        const content = TicketParser.extractOfdText(filePath);
        return TicketParser.parseTextContent(content, filePath);
    }
    /**
     * 从PDF文件提取文本
     */
    private static extractPdfText(filePath: string): string {
        try {
            const fd = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(filePath);
            const buf = new ArrayBuffer(stat.size);
            fileIo.readSync(fd.fd, buf);
            fileIo.closeSync(fd);
            // 先尝试直接作为文本读取（适用于模拟PDF）
            const directText = buffer.from(buf).toString('utf-8');
            if (directText.indexOf('InvoiceCode') >= 0 || directText.indexOf('发票代码') >= 0) {
                return directText;
            }
            const bytes = new Uint8Array(buf);
            let text = '';
            // 方法1: 查找PDF文本流 (stream...endstream)
            text = TicketParser.extractPdfStreams(bytes);
            // 方法2: 如果流提取失败，尝试提取括号内的字符串
            if (text.length < 20) {
                text = TicketParser.extractPdfStrings(bytes);
            }
            // 方法3: 提取所有可读文本
            if (text.length < 20) {
                text = TicketParser.extractReadableText(bytes);
            }
            return text;
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketParser.TAG, 'Extract PDF text failed: ' + err.message);
            return '';
        }
    }
    /**
     * 异步从PDF文件提取文本（支持压缩流解压和OCR识别）
     */
    private static async extractPdfTextAsync(filePath: string): Promise<string> {
        try {
            Logger.info(TicketParser.TAG, '[PDF] 开始解析文件: ' + filePath);
            const fd = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(filePath);
            const buf = new ArrayBuffer(stat.size);
            fileIo.readSync(fd.fd, buf);
            fileIo.closeSync(fd);
            Logger.info(TicketParser.TAG, '[PDF] 文件大小: ' + stat.size + ' bytes');
            // 先尝试直接作为文本读取（适用于模拟PDF）
            const directText = buffer.from(buf).toString('utf-8');
            if (directText.indexOf('InvoiceCode') >= 0 || directText.indexOf('发票代码') >= 0) {
                Logger.info(TicketParser.TAG, '[PDF] 直接文本读取成功');
                return directText;
            }
            const bytes = new Uint8Array(buf);
            let text = '';
            // 方法1: 异步解压并提取PDF文本流
            text = await TicketParser.extractPdfStreamsAsync(bytes);
            Logger.info(TicketParser.TAG, '[PDF] 方法1-流提取结果长度: ' + text.length);
            // 方法2: 如果流提取失败，尝试提取括号内的字符串
            if (!TicketParser.isValidTicketText(text)) {
                text = TicketParser.extractPdfStrings(bytes);
                Logger.info(TicketParser.TAG, '[PDF] 方法2-字符串提取结果长度: ' + text.length);
            }
            // 方法3: 提取所有可读文本
            if (!TicketParser.isValidTicketText(text)) {
                text = TicketParser.extractReadableText(bytes);
                Logger.info(TicketParser.TAG, '[PDF] 方法3-可读文本结果长度: ' + text.length);
            }
            // 方法4: 如果本地解析失败或内容无效，尝试使用OCR识别
            const configValid = OCRConfig.isConfigValid();
            const textValid = TicketParser.isValidTicketText(text);
            Logger.info(TicketParser.TAG, '[PDF] OCR配置有效: ' + configValid + ', 文本有效: ' + textValid);
            if (!textValid && configValid) {
                Logger.info(TicketParser.TAG, '[PDF] 开始调用OCR识别...');
                text = await TicketParser.recognizePdfWithOCR(buf);
                Logger.info(TicketParser.TAG, '[PDF] OCR识别结果长度: ' + text.length);
            }
            return text;
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketParser.TAG, '[PDF] 解析失败: ' + err.message);
            return '';
        }
    }
    /**
     * 检查提取的文本是否为有效的票据内容
     */
    private static isValidTicketText(text: string): boolean {
        if (text.length < 20) {
            return false;
        }
        // 先检查中文字符数量（真实票据必须有中文）
        let chineseCount = 0;
        for (let i = 0; i < text.length && i < 2000; i++) {
            const code = text.charCodeAt(i);
            if (code >= 0x4E00 && code <= 0x9FFF) {
                chineseCount++;
            }
        }
        Logger.info(TicketParser.TAG, '[PDF] 中文字符数: ' + chineseCount);
        // 必须有足够的中文字符才认为是有效内容
        if (chineseCount < 5) {
            Logger.info(TicketParser.TAG, '[PDF] 文本无效，中文字符太少');
            return false;
        }
        // 检查是否包含票据相关中文关键字
        const chineseKeywords = [
            '发票', '票据', '金额', '合计', '税', '商户', '商家',
            '订单', '消费', '支付', '收款', '日期', '时间', '价税'
        ];
        for (const keyword of chineseKeywords) {
            if (text.indexOf(keyword) >= 0) {
                Logger.info(TicketParser.TAG, '[PDF] 找到中文关键字: ' + keyword);
                return true;
            }
        }
        // 有中文但没有关键字，可能是有效内容
        if (chineseCount >= 20) {
            Logger.info(TicketParser.TAG, '[PDF] 包含较多中文，认为有效');
            return true;
        }
        Logger.info(TicketParser.TAG, '[PDF] 文本无效，无中文关键字');
        return false;
    }
    /**
     * 使用腾讯云OCR识别PDF内容
     */
    private static async recognizePdfWithOCR(pdfBuffer: ArrayBuffer): Promise<string> {
        try {
            Logger.info(TicketParser.TAG, 'Starting OCR recognition for PDF');
            // 将PDF转为Base64
            const base64 = TicketParser.arrayBufferToBase64(pdfBuffer);
            // 调用腾讯云OCR（使用PDF专用接口）
            const ocr = new TencentOCR(OCRConfig.getTencentConfig());
            const result = await ocr.recognizePdfBase64(base64, 1);
            if (result.success) {
                Logger.info(TicketParser.TAG, 'OCR recognition success');
                return result.text;
            }
            else {
                Logger.error(TicketParser.TAG, 'OCR recognition failed: ' + result.errorMsg);
                return '';
            }
        }
        catch (error) {
            Logger.error(TicketParser.TAG, 'OCR error: ' + JSON.stringify(error));
            return '';
        }
    }
    /**
     * ArrayBuffer转Base64
     */
    private static arrayBufferToBase64(buf: ArrayBuffer): string {
        const bytes = new Uint8Array(buf);
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;
        while (i < bytes.length) {
            const b1 = bytes[i++];
            const b2 = i < bytes.length ? bytes[i++] : 0;
            const b3 = i < bytes.length ? bytes[i++] : 0;
            const triplet = (b1 << 16) | (b2 << 8) | b3;
            result += base64Chars.charAt((triplet >> 18) & 0x3F);
            result += base64Chars.charAt((triplet >> 12) & 0x3F);
            result += i > bytes.length + 1 ? '=' : base64Chars.charAt((triplet >> 6) & 0x3F);
            result += i > bytes.length ? '=' : base64Chars.charAt(triplet & 0x3F);
        }
        return result;
    }
    /**
     * 尝试解码UTF-8字符
     */
    private static tryDecodeUtf8(bytes: Uint8Array, index: number): string {
        if (index + 2 >= bytes.length) {
            return '';
        }
        const b1 = bytes[index];
        const b2 = bytes[index + 1];
        const b3 = bytes[index + 2];
        // 检查是否是有效的3字节UTF-8序列
        if ((b1 & 0xF0) === 0xE0 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
            const codePoint = ((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F);
            return String.fromCharCode(codePoint);
        }
        return '';
    }
    /**
     * 提取PDF文本流内容
     */
    private static extractPdfStreams(bytes: Uint8Array): string {
        let text = '';
        const streamMarker = [115, 116, 114, 101, 97, 109]; // "stream"
        const endMarker = [101, 110, 100, 115, 116, 114, 101, 97, 109]; // "endstream"
        let i = 0;
        while (i < bytes.length - 10) {
            if (TicketParser.matchBytes(bytes, i, streamMarker)) {
                // 检查是否是FlateDecode压缩
                const isFlate = TicketParser.checkFlateDecode(bytes, i);
                let start = i + 6;
                while (start < bytes.length && (bytes[start] === 10 || bytes[start] === 13)) {
                    start++;
                }
                let endPos = TicketParser.findBytes(bytes, start, endMarker);
                if (endPos > start) {
                    const streamData = bytes.slice(start, endPos);
                    let streamText = '';
                    if (isFlate) {
                        streamText = TicketParser.inflateAndDecode(streamData);
                    }
                    else {
                        streamText = TicketParser.decodeStreamContent(bytes, start, endPos);
                    }
                    text += streamText + ' ';
                }
                i = endPos > start ? endPos : i + 1;
            }
            else {
                i++;
            }
        }
        return text;
    }
    /**
     * 异步提取PDF文本流内容（支持zlib解压）
     */
    private static async extractPdfStreamsAsync(bytes: Uint8Array): Promise<string> {
        let text = '';
        const streamMarker = [115, 116, 114, 101, 97, 109]; // "stream"
        const endMarker = [101, 110, 100, 115, 116, 114, 101, 97, 109]; // "endstream"
        let i = 0;
        while (i < bytes.length - 10) {
            if (TicketParser.matchBytes(bytes, i, streamMarker)) {
                const isFlate = TicketParser.checkFlateDecode(bytes, i);
                let start = i + 6;
                while (start < bytes.length && (bytes[start] === 10 || bytes[start] === 13)) {
                    start++;
                }
                let endPos = TicketParser.findBytes(bytes, start, endMarker);
                if (endPos > start) {
                    const streamData = bytes.slice(start, endPos);
                    let streamText = '';
                    if (isFlate) {
                        streamText = await TicketParser.inflateAndDecodeAsync(streamData);
                    }
                    else {
                        streamText = TicketParser.decodeStreamContent(bytes, start, endPos);
                    }
                    text += streamText + ' ';
                }
                i = endPos > start ? endPos : i + 1;
            }
            else {
                i++;
            }
        }
        return text;
    }
    /**
     * 检查流是否使用FlateDecode压缩
     */
    private static checkFlateDecode(bytes: Uint8Array, streamPos: number): boolean {
        const searchStart = streamPos > 200 ? streamPos - 200 : 0;
        const chunk = bytes.slice(searchStart, streamPos);
        const str = String.fromCharCode(...chunk);
        return str.indexOf('FlateDecode') >= 0 || str.indexOf('Fl') >= 0;
    }
    /**
     * 解压FlateDecode流并解码
     */
    private static inflateAndDecode(data: Uint8Array): string {
        try {
            const decompressed = TicketParser.inflateRaw(data);
            if (decompressed.length > 0) {
                return TicketParser.decodePdfContent(decompressed);
            }
        }
        catch (e) {
            // 解压失败，尝试直接解码
        }
        return TicketParser.decodeStreamContent(data, 0, data.length);
    }
    /**
     * 异步解压FlateDecode流并解码（使用HarmonyOS zlib API）
     */
    private static async inflateAndDecodeAsync(data: Uint8Array): Promise<string> {
        try {
            const decompressed = await TicketParser.inflateAsync(data);
            if (decompressed.length > 0) {
                return TicketParser.decodePdfContent(decompressed);
            }
        }
        catch (e) {
            Logger.error(TicketParser.TAG, 'Async inflate failed, trying sync');
        }
        // 回退到同步方式
        return TicketParser.inflateAndDecode(data);
    }
    /**
     * 使用HarmonyOS zlib API异步解压
     */
    private static async inflateAsync(data: Uint8Array): Promise<Uint8Array> {
        try {
            const zip = zlib.createZipSync();
            // 预估解压后大小（通常是压缩数据的10倍左右）
            const estimatedSize = data.length * 20;
            const destBuffer = new ArrayBuffer(estimatedSize);
            const sourceBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
            const result = await zip.uncompress(destBuffer, sourceBuffer);
            if (result.status === zlib.ReturnStatus.OK && result.destLen > 0) {
                return new Uint8Array(destBuffer, 0, result.destLen);
            }
        }
        catch (e) {
            const err = e as BusinessError;
            Logger.error(TicketParser.TAG, 'zlib uncompress failed: ' + err.message);
        }
        return new Uint8Array(0);
    }
    /**
     * 简单的inflate解压（处理zlib/deflate格式）
     */
    private static inflateRaw(data: Uint8Array): Uint8Array {
        try {
            // 检查zlib头 (78 9C 或 78 DA 或 78 01)
            let startOffset = 0;
            if (data.length > 2 && data[0] === 0x78) {
                startOffset = 2; // 跳过zlib头
            }
            // 尝试使用简单的解压方式
            return TicketParser.inflateDeflate(data, startOffset);
        }
        catch (e) {
            return new Uint8Array(0);
        }
    }
    /**
     * 简化的deflate解压实现
     */
    private static inflateDeflate(data: Uint8Array, offset: number): Uint8Array {
        const output: number[] = [];
        let pos = offset;
        while (pos < data.length - 4) {
            const blockHeader = data[pos];
            const isFinal = (blockHeader & 0x01) !== 0;
            const blockType = (blockHeader >> 1) & 0x03;
            if (blockType === 0) {
                // 无压缩块
                pos++;
                if (pos + 4 > data.length)
                    break;
                const len = data[pos] | (data[pos + 1] << 8);
                pos += 4;
                for (let i = 0; i < len && pos < data.length; i++) {
                    output.push(data[pos++]);
                }
            }
            else {
                // 压缩块 - 跳过，直接提取可读内容
                break;
            }
            if (isFinal)
                break;
        }
        // 如果解压失败，返回空数组
        if (output.length === 0) {
            return new Uint8Array(0);
        }
        return new Uint8Array(output);
    }
    /**
     * 解码PDF内容流
     */
    private static decodePdfContent(data: Uint8Array): string {
        let text = '';
        // 提取Tj/TJ操作符中的文本
        text += TicketParser.extractTextOperators(data);
        // 提取可读文本
        if (text.length < 10) {
            for (let i = 0; i < data.length; i++) {
                if (data[i] >= 0xE4 && i + 2 < data.length) {
                    const char = TicketParser.tryDecodeUtf8(data, i);
                    if (char.length > 0) {
                        text += char;
                        i += 2;
                        continue;
                    }
                }
                if (data[i] >= 0x20 && data[i] <= 0x7E) {
                    text += String.fromCharCode(data[i]);
                }
            }
        }
        return text;
    }
    /**
     * 提取PDF文本操作符中的内容
     */
    private static extractTextOperators(data: Uint8Array): string {
        let text = '';
        const str = String.fromCharCode(...data);
        // 匹配 (text)Tj 模式
        const tjPattern = /\(([^)]*)\)\s*Tj/g;
        let match = tjPattern.exec(str);
        while (match !== null) {
            text += match[1] + ' ';
            match = tjPattern.exec(str);
        }
        // 匹配 <hex>Tj 模式
        const hexPattern = /<([0-9A-Fa-f]+)>\s*Tj/g;
        match = hexPattern.exec(str);
        while (match !== null) {
            text += TicketParser.hexToText(match[1]) + ' ';
            match = hexPattern.exec(str);
        }
        return text;
    }
    /**
     * 十六进制转文本
     */
    private static hexToText(hex: string): string {
        let text = '';
        for (let i = 0; i < hex.length; i += 4) {
            if (i + 4 <= hex.length) {
                const code = parseInt(hex.substring(i, i + 4), 16);
                if (code > 0) {
                    text += String.fromCharCode(code);
                }
            }
        }
        return text;
    }
    /**
     * 从PDF提取括号内的字符串
     */
    private static extractPdfStrings(bytes: Uint8Array): string {
        let text = '';
        let i = 0;
        while (i < bytes.length) {
            if (bytes[i] === 40) { // '('
                let depth = 1;
                let j = i + 1;
                let str = '';
                while (j < bytes.length && depth > 0) {
                    if (bytes[j] === 40 && bytes[j - 1] !== 92) {
                        depth++;
                    }
                    else if (bytes[j] === 41 && bytes[j - 1] !== 92) {
                        depth--;
                    }
                    if (depth > 0) {
                        str += String.fromCharCode(bytes[j]);
                    }
                    j++;
                }
                if (str.length > 0 && TicketParser.isReadableString(str)) {
                    text += str + ' ';
                }
                i = j;
            }
            else {
                i++;
            }
        }
        return text;
    }
    /**
     * 提取所有可读文本
     */
    private static extractReadableText(bytes: Uint8Array): string {
        let text = '';
        let i = 0;
        while (i < bytes.length) {
            if (bytes[i] >= 0xE4 && i + 2 < bytes.length) {
                const char = TicketParser.tryDecodeUtf8(bytes, i);
                if (char.length > 0) {
                    text += char;
                    i += 3;
                    continue;
                }
            }
            if (bytes[i] >= 0x20 && bytes[i] <= 0x7E) {
                text += String.fromCharCode(bytes[i]);
            }
            i++;
        }
        return text;
    }
    private static matchBytes(bytes: Uint8Array, pos: number, pattern: number[]): boolean {
        if (pos + pattern.length > bytes.length) {
            return false;
        }
        for (let i = 0; i < pattern.length; i++) {
            if (bytes[pos + i] !== pattern[i]) {
                return false;
            }
        }
        return true;
    }
    private static findBytes(bytes: Uint8Array, start: number, pattern: number[]): number {
        for (let i = start; i < bytes.length - pattern.length; i++) {
            if (TicketParser.matchBytes(bytes, i, pattern)) {
                return i;
            }
        }
        return -1;
    }
    private static decodeStreamContent(bytes: Uint8Array, start: number, end: number): string {
        let text = '';
        for (let i = start; i < end; i++) {
            if (bytes[i] >= 0xE4 && i + 2 < end) {
                const char = TicketParser.tryDecodeUtf8(bytes, i);
                if (char.length > 0) {
                    text += char;
                    i += 2;
                    continue;
                }
            }
            if (bytes[i] >= 0x20 && bytes[i] <= 0x7E) {
                text += String.fromCharCode(bytes[i]);
            }
        }
        return text;
    }
    private static isReadableString(str: string): boolean {
        if (str.length < 2) {
            return false;
        }
        let readable = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if ((code >= 0x4E00 && code <= 0x9FFF) ||
                (code >= 0x30 && code <= 0x39) ||
                (code >= 0x41 && code <= 0x5A) ||
                (code >= 0x61 && code <= 0x7A)) {
                readable++;
            }
        }
        return readable > str.length * 0.3;
    }
    /**
     * 从OFD文件提取文本
     */
    private static extractOfdText(filePath: string): string {
        try {
            // OFD是ZIP格式，包含XML文件
            // 简化处理：直接读取并查找XML标签内容
            const fd = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(filePath);
            const buf = new ArrayBuffer(stat.size);
            fileIo.readSync(fd.fd, buf);
            fileIo.closeSync(fd);
            const content = buffer.from(buf).toString('utf-8');
            // 提取XML标签之间的文本
            return TicketParser.extractXmlText(content);
        }
        catch (error) {
            const err = error as BusinessError;
            Logger.error(TicketParser.TAG, 'Extract OFD text failed: ' + err.message);
            return '';
        }
    }
    /**
     * 从XML内容提取纯文本
     */
    private static extractXmlText(xmlContent: string): string {
        // 保留原始XML内容用于正则匹配，同时提取纯文本
        let text = xmlContent;
        // 不移除标签，保留完整内容供正则匹配
        return text;
    }
    /**
     * 解析文本内容提取票据信息
     */
    private static parseTextContent(content: string, filePath: string): ParsedTicketContent {
        const result: ParsedTicketContent = {
            invoiceCode: '',
            orderNumber: '',
            amount: 0,
            date: Date.now(),
            merchantName: '',
            itemDescription: '',
            location: '',
            rawContent: content,
            ticketType: TicketType.OTHER
        };
        if (content.length === 0) {
            return result;
        }
        // 打印OCR识别的原始内容（前500字符）
        Logger.info(TicketParser.TAG, '[解析] 原始内容: ' + content.substring(0, 500));
        // 提取发票代码
        result.invoiceCode = TicketParser.extractInvoiceCode(content);
        // 提取订单号
        result.orderNumber = TicketParser.extractOrderNumber(content);
        // 提取金额
        result.amount = TicketParser.extractAmount(content);
        // 提取日期
        result.date = TicketParser.extractDate(content);
        // 提取商家名称
        result.merchantName = TicketParser.extractMerchantName(content, filePath);
        // 提取地点
        result.location = TicketParser.extractLocation(content);
        // 识别票据类型
        result.ticketType = TicketParser.classifyTicketType(content, result.merchantName);
        // 提取商品/服务描述
        result.itemDescription = TicketParser.extractItemDescription(content, result.ticketType);
        Logger.info(TicketParser.TAG, '[解析] 商家: ' + result.merchantName +
            ', 项目: ' + result.itemDescription +
            ', 金额: ' + result.amount + ', 类型: ' + result.ticketType);
        return result;
    }
    /**
     * 提取发票代码
     */
    static extractInvoiceCode(content: string, filePath: string = ''): string {
        // 匹配发票代码模式
        const patterns: string[] = [
            '发票代码[：:]*\\s*(\\d{10,12})',
            '票据代码[：:]*\\s*(\\d{10,12})',
            'InvoiceCode[=：:]*\\s*([A-Za-z0-9\\-]+)',
            '<ofd:InvoiceCode>([A-Za-z0-9\\-]+)</ofd:InvoiceCode>',
            'Invoice Code[：:]*\\s*(\\d{10,12})',
            '代码[：:]*\\s*(\\d{10,12})'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern, 'i');
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }
    /**
     * 提取订单号
     */
    static extractOrderNumber(content: string): string {
        const patterns: string[] = [
            '订单号[：:]*\\s*([A-Za-z0-9\\-]+)',
            '订单编号[：:]*\\s*([A-Za-z0-9\\-]+)',
            'OrderNumber[=：:]*\\s*([A-Za-z0-9\\-]+)',
            '<ofd:OrderNumber>([A-Za-z0-9\\-]+)</ofd:OrderNumber>',
            'Order No[.：:]*\\s*([A-Za-z0-9\\-]+)',
            '流水号[：:]*\\s*([A-Za-z0-9\\-]+)'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern, 'i');
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }
    /**
     * 提取金额
     */
    static extractAmount(content: string): number {
        const patterns: string[] = [
            '金额[（(]?小写[)）]?[：:]*\\s*[¥￥]?\\s*([\\d,]+\\.?\\d*)',
            '合计[：:]*\\s*[¥￥]?\\s*([\\d,]+\\.?\\d*)',
            '总额[：:]*\\s*[¥￥]?\\s*([\\d,]+\\.?\\d*)',
            '实付[：:]*\\s*[¥￥]?\\s*([\\d,]+\\.?\\d*)',
            'Amount[=：:]*\\s*[¥￥$]?\\s*([\\d,]+\\.?\\d*)',
            '<ofd:Amount>([\\d,]+\\.?\\d*)</ofd:Amount>',
            '[¥￥]\\s*([\\d,]+\\.\\d{2})'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern, 'i');
            const match = content.match(regex);
            if (match && match[1]) {
                const amountStr = match[1].replace(/,/g, '');
                const amount = parseFloat(amountStr);
                if (!isNaN(amount) && amount > 0) {
                    return amount;
                }
            }
        }
        return 0;
    }
    /**
     * 提取日期
     */
    static extractDate(content: string): number {
        const patterns: string[] = [
            '(\\d{4})[年\\-/](\\d{1,2})[月\\-/](\\d{1,2})',
            '日期[：:]*\\s*(\\d{4})[\\-/](\\d{1,2})[\\-/](\\d{1,2})'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern);
            const match = content.match(regex);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const day = parseInt(match[3]);
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return Math.floor(date.getTime() / 1000);
                }
            }
        }
        return Math.floor(Date.now() / 1000);
    }
    /**
     * 提取商家名称
     */
    static extractMerchantName(content: string, filePath: string): string {
        // 方法1: 从电子发票格式提取销售方名称
        const invoiceName = TicketParser.extractInvoiceSeller(content);
        if (invoiceName.length > 0) {
            return invoiceName;
        }
        // 方法2: 通用模式匹配
        const patterns: string[] = [
            '销售方[：:]*\\s*([^\\n\\r]{2,30})',
            '商户名称[：:]*\\s*([^\\n\\r]{2,30})',
            '商家[：:]*\\s*([^\\n\\r]{2,30})',
            '店名[：:]*\\s*([^\\n\\r]{2,30})'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern);
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        // 方法3: 从文件名提取
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        if (nameWithoutExt.length > 0) {
            return nameWithoutExt;
        }
        return '未知商家';
    }
    /**
     * 从电子发票中提取销售方名称
     * OCR识别电子发票时，购买方和销售方信息可能并排显示，被识别为：
     * 购买方信息
     * 销售方信息
     * 名称:购买方名称
     * 名称:销售方名称
     * 所以需要取第二个"名称:"的值
     */
    private static extractInvoiceSeller(content: string): string {
        const lines = content.split(/[\n\r]+/);
        // 检查是否是并排格式（购买方信息和销售方信息相邻）
        let hasBuyerSellerAdjacent = false;
        for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            const nextLine = lines[i + 1].trim();
            if ((line.indexOf('购买方信息') >= 0 || line === '购买方') &&
                (nextLine.indexOf('销售方信息') >= 0 || nextLine === '销售方')) {
                hasBuyerSellerAdjacent = true;
                break;
            }
        }
        if (hasBuyerSellerAdjacent) {
            // 并排格式：找到所有"名称:"行，第二个是销售方
            const nameLines: string[] = [];
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.indexOf('名称') >= 0) {
                    const nameMatch = trimmed.match(/名称[：:]\s*(.+)/);
                    if (nameMatch && nameMatch[1]) {
                        const name = nameMatch[1].trim();
                        if (name.length > 0 && name !== '名称') {
                            nameLines.push(name);
                        }
                    }
                }
            }
            // 第二个名称是销售方
            if (nameLines.length >= 2) {
                Logger.info(TicketParser.TAG, '[提取销售方] 并排格式，取第二个名称: ' + nameLines[1]);
                return nameLines[1];
            }
        }
        // 非并排格式：按区块查找
        let sellerStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.indexOf('销售方信息') >= 0 || line === '销售方') {
                sellerStartIndex = i;
                break;
            }
        }
        if (sellerStartIndex < 0) {
            return '';
        }
        for (let i = sellerStartIndex + 1; i < lines.length && i < sellerStartIndex + 10; i++) {
            const line = lines[i].trim();
            if (line.indexOf('购买方信息') >= 0 ||
                line.indexOf('备注') >= 0 ||
                line.indexOf('价税合计') >= 0 ||
                line.indexOf('开票人') >= 0) {
                break;
            }
            if (line.indexOf('名称') >= 0) {
                const nameMatch = line.match(/名称[：:]\s*(.+)/);
                if (nameMatch && nameMatch[1]) {
                    const name = nameMatch[1].trim();
                    if (name.length > 0 && name !== '名称') {
                        return name;
                    }
                }
            }
        }
        return '';
    }
    /**
     * 提取地点
     */
    static extractLocation(content: string): string {
        const patterns: string[] = [
            '地址[：:]*\\s*([^\\n\\r]{5,50})',
            '地点[：:]*\\s*([^\\n\\r]{2,30})',
            '([北上广深杭成武西南重天][京海州圳州都汉安京庆津][市]?[^\\n\\r]{2,20})'
        ];
        for (const pattern of patterns) {
            const regex = new RegExp(pattern);
            const match = content.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return '';
    }
    /**
     * 提取商品/服务描述
     */
    static extractItemDescription(content: string, ticketType: TicketType): string {
        let description = '';
        // 方法1: 查找表格中项目名称列的内容
        // 电子发票OCR识别后，项目名称通常在"项目名称"或"货物或应税劳务"后面的行
        description = TicketParser.extractInvoiceItemName(content);
        // 方法2: 通用商品名称提取模式
        if (description.length === 0) {
            const itemPatterns: string[] = [
                '商品名称[：:]*\\s*([^\\n\\r]{2,30})',
                '服务内容[：:]*\\s*([^\\n\\r]{2,30})',
                '消费项目[：:]*\\s*([^\\n\\r]{2,30})',
                '品名[：:]*\\s*([^\\n\\r]{2,20})'
            ];
            for (const pattern of itemPatterns) {
                const regex = new RegExp(pattern);
                const match = content.match(regex);
                if (match && match[1]) {
                    description = match[1].trim();
                    break;
                }
            }
        }
        // 方法3: 根据类型特定提取
        if (description.length === 0) {
            description = TicketParser.extractTypeSpecificItem(content, ticketType);
        }
        return description;
    }
    /**
     * 从电子发票中提取项目名称
     * OCR识别格式：表头字段分行显示，内容在后面
     */
    private static extractInvoiceItemName(content: string): string {
        // 按行分割
        const lines = content.split(/[\n\r]+/);
        // 方法1: 直接查找 *分类*名称 格式
        for (const line of lines) {
            const trimmed = line.trim();
            // 匹配 *信息技术服务*游戏 这种格式
            const starPattern = /\*([^\*]+)\*([^\s\d￥¥]+)/;
            const starMatch = trimmed.match(starPattern);
            if (starMatch && starMatch[2]) {
                return starMatch[2];
            }
        }
        // 方法2: 查找"项目名称"表头后的内容
        let foundHeader = false;
        let skipCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '项目名称' || line.indexOf('货物或应税劳务') >= 0) {
                foundHeader = true;
                skipCount = 0;
                continue;
            }
            if (foundHeader) {
                // 跳过其他表头字段
                if (line === '规格型号' || line === '单位' || line === '数量' ||
                    line === '单价' || line === '金额' || line === '税率/征收率' ||
                    line === '税额' || line === '税率' || line === '征收率') {
                    skipCount++;
                    continue;
                }
                // 跳过空行
                if (line.length < 2) {
                    continue;
                }
                // 找到内容行
                if (skipCount >= 3) {
                    const itemName = TicketParser.parseItemNameFromLine(line);
                    if (itemName.length > 0) {
                        return itemName;
                    }
                }
            }
        }
        return '';
    }
    /**
     * 从单行文本中解析项目名称
     */
    private static parseItemNameFromLine(line: string): string {
        // 模式1: *分类*具体名称 格式，如 *信息技术服务*游戏
        const starPattern = /\*([^\*]+)\*([^\s\d￥¥]+)/;
        const starMatch = line.match(starPattern);
        if (starMatch && starMatch[2]) {
            return starMatch[2];
        }
        // 模式2: 排除干扰词后提取中文
        const excludeWords = ['规格', '型号', '单位', '数量', '单价', '金额', '税率', '税额', '合计', '价税', '备注'];
        for (const word of excludeWords) {
            if (line.indexOf(word) >= 0) {
                return '';
            }
        }
        // 排除纯数字行
        if (/^[\d\.\s￥¥%]+$/.test(line)) {
            return '';
        }
        // 提取连续的中文字符作为项目名称
        const chinesePattern = /([\u4e00-\u9fa5]{2,20})/;
        const chineseMatch = line.match(chinesePattern);
        if (chineseMatch && chineseMatch[1]) {
            const name = chineseMatch[1];
            // 排除常见的非项目名称词
            const invalidNames = ['发票', '增值税', '电子', '普通', '专用', '购买方', '销售方',
                '名称', '纳税人', '开票', '国家税务', '信用代码', '识别号'];
            for (const invalid of invalidNames) {
                if (name.indexOf(invalid) >= 0) {
                    return '';
                }
            }
            return name;
        }
        return '';
    }
    /**
     * 根据票据类型提取特定商品/服务描述
     */
    private static extractTypeSpecificItem(content: string, ticketType: TicketType): string {
        switch (ticketType) {
            case TicketType.CATERING:
                return TicketParser.extractCateringItem(content);
            case TicketType.TRANSPORT:
                return TicketParser.extractTransportItem(content);
            case TicketType.HOTEL:
                return TicketParser.extractHotelItem(content);
            case TicketType.SHOPPING:
                return TicketParser.extractShoppingItem(content);
            case TicketType.ENTERTAINMENT:
                return TicketParser.extractEntertainmentItem(content);
            default:
                return '';
        }
    }
    /**
     * 提取餐饮项目
     */
    private static extractCateringItem(content: string): string {
        const patterns: string[] = [
            '([\\u4e00-\\u9fa5]{2,8}(?:套餐|饭|面|粉|汤|饮料|咖啡|奶茶))',
            '((?:早|午|晚)餐)',
            '(外卖|堂食)'
        ];
        for (const p of patterns) {
            const m = content.match(new RegExp(p));
            if (m && m[1]) {
                return m[1];
            }
        }
        return '餐饮消费';
    }
    /**
     * 提取交通项目
     */
    private static extractTransportItem(content: string): string {
        const routePatterns: string[] = [
            '([\\u4e00-\\u9fa5]{2,6})[-—至到]([\\u4e00-\\u9fa5]{2,6})',
            '(机票|火车票|高铁票|打车|网约车)'
        ];
        for (const p of routePatterns) {
            const m = content.match(new RegExp(p));
            if (m) {
                if (m[2]) {
                    return m[1] + '-' + m[2];
                }
                return m[1];
            }
        }
        return '交通出行';
    }
    /**
     * 提取酒店项目
     */
    private static extractHotelItem(content: string): string {
        const patterns: string[] = [
            '房型[：:]*\\s*([^\\n\\r]{2,15})',
            '((?:标准|大床|双床|豪华|商务)[^\\n\\r]{0,5}(?:房|间))',
            '入住(\\d+)晚'
        ];
        for (const p of patterns) {
            const m = content.match(new RegExp(p));
            if (m && m[1]) {
                return m[1];
            }
        }
        return '酒店住宿';
    }
    /**
     * 提取购物项目
     */
    private static extractShoppingItem(content: string): string {
        const patterns: string[] = [
            '商品[：:]*\\s*([^\\n\\r]{2,20})',
            '([\\u4e00-\\u9fa5]{2,10}(?:手机|电脑|耳机|服装))'
        ];
        for (const p of patterns) {
            const m = content.match(new RegExp(p));
            if (m && m[1]) {
                return m[1];
            }
        }
        return '购物消费';
    }
    /**
     * 提取娱乐项目
     */
    private static extractEntertainmentItem(content: string): string {
        const patterns: string[] = [
            '影片[：:]*\\s*([^\\n\\r]{2,15})',
            '([《][^》]{2,15}[》])',
            '(电影票|演出票|门票)'
        ];
        for (const p of patterns) {
            const m = content.match(new RegExp(p));
            if (m && m[1]) {
                return m[1];
            }
        }
        return '休闲娱乐';
    }
    /**
     * 智能分类票据类型
     * 注意：检查顺序很重要，优先检查复合词（如"酒店"）再检查单字（如"酒"）
     */
    static classifyTicketType(content: string, merchantName: string): TicketType {
        const text = (content + ' ' + merchantName).toLowerCase();
        // 酒店住宿关键词 - 优先检查，避免"酒店"被"酒"误匹配为餐饮
        const hotelKeywords = ['酒店', '宾馆', '旅馆', '民宿', '住宿', '客房',
            'hotel', 'inn', 'motel', '如家', '汉庭', '希尔顿', '万豪', '携程', '去哪儿',
            '七天', '锦江', '华住', '亚朵', '全季', '维也纳'];
        // 交通出行关键词
        const transportKeywords = ['机票', '火车', '高铁', '动车', '汽车票', '地铁',
            '公交', '出租', '滴滴', '打车', '航空', '铁路', '客运', 'flight', 'train',
            'taxi', 'uber', '加油', '停车', '过路费', '通行费'];
        // 餐饮美食关键词 - 与食物相关的都算餐饮
        const cateringKeywords = ['餐厅', '餐馆', '饭店', '饭馆', '食堂', '咖啡', '茶馆',
            '酒吧', '酒楼', '菜馆', '面馆', '粉店', '烧烤', '火锅', '外卖', '美团', '饿了么',
            'restaurant', 'food', 'cafe', 'starbucks', 'kfc', 'mcdonald',
            '肯德基', '麦当劳', '必胜客', '海底捞', '西贝', '奶茶', '甜品',
            '早餐', '午餐', '晚餐', '夜宵', '小吃', '零食', '饮料', '水果', '蔬菜',
            '面包', '蛋糕', '糕点', '快餐', '便当', '盒饭', '食品', '餐饮',
            '牛肉', '猪肉', '鸡肉', '羊肉', '海鲜', '鱼', '虾', '蟹',
            '米饭', '面条', '饺子', '包子', '馒头', '粥', '汤',
            '炒菜', '凉菜', '热菜', '主食', '配菜', '调料'];
        // 购物消费关键词 - 买物件都算购物
        const shoppingKeywords = ['超市', '商场', '百货', '购物', '淘宝', '京东',
            '天猫', '拼多多', '商店', 'shop', 'store', 'mall',
            '手机', '电脑', '笔记本', '平板', '耳机', '音箱', '相机',
            '电视', '冰箱', '洗衣机', '空调', '家电', '数码', '电子',
            '服装', '衣服', '裤子', '鞋子', '帽子', '包包', '箱包',
            '化妆品', '护肤品', '香水', '首饰', '珠宝', '手表',
            '家具', '床', '沙发', '桌子', '椅子', '柜子',
            '日用品', '生活用品', '文具', '办公用品', '图书', '书籍',
            '租赁', '出租', '服饰'];
        // 休闲娱乐关键词 - 看电影、娱乐活动
        const entertainmentKeywords = ['电影', '影院', '影城', '影票', '电影票',
            'ktv', '卡拉ok', '游戏', '网吧', '游戏厅', '电玩',
            '健身', '健身房', '游泳', '瑜伽', '运动', '球馆', '球场',
            '景区', '景点', '门票', '公园', '动物园', '植物园', '博物馆', '展览',
            '演出', '音乐会', '演唱会', '话剧', '歌剧', '舞台剧',
            '游乐园', '游乐场', '密室', '剧本杀', '桌游',
            'imax', '3d', '巨幕', '杜比'];
        // 优先检查酒店（避免"酒店"被餐饮的"酒"误匹配）
        for (const keyword of hotelKeywords) {
            if (text.includes(keyword)) {
                return TicketType.HOTEL;
            }
        }
        for (const keyword of transportKeywords) {
            if (text.includes(keyword)) {
                return TicketType.TRANSPORT;
            }
        }
        // 休闲娱乐优先于购物检查（避免"电影"等被误分类）
        for (const keyword of entertainmentKeywords) {
            if (text.includes(keyword)) {
                return TicketType.ENTERTAINMENT;
            }
        }
        for (const keyword of cateringKeywords) {
            if (text.includes(keyword)) {
                return TicketType.CATERING;
            }
        }
        for (const keyword of shoppingKeywords) {
            if (text.includes(keyword)) {
                return TicketType.SHOPPING;
            }
        }
        return TicketType.OTHER;
    }
}
