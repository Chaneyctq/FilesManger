import http from "@ohos:net.http";
import buffer from "@ohos:buffer";
import cryptoFramework from "@ohos:security.cryptoFramework";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
/**
 * OCR识别结果
 */
export interface OCRResult {
    success: boolean;
    text: string;
    errorMsg: string;
    details: OCRTextItem[];
}
/**
 * 单个文字区域
 */
export interface OCRTextItem {
    text: string;
    confidence: number;
}
/**
 * 腾讯云OCR配置
 */
export interface TencentOCRConfig {
    secretId: string;
    secretKey: string;
    region: string;
}
/**
 * 腾讯云通用OCR工具类
 */
export class TencentOCR {
    private static readonly TAG: string = 'TencentOCR';
    private static readonly SERVICE: string = 'ocr';
    private static readonly HOST: string = 'ocr.tencentcloudapi.com';
    private static readonly VERSION: string = '2018-11-19';
    private config: TencentOCRConfig;
    constructor(config: TencentOCRConfig) {
        this.config = config;
    }
    /**
     * 识别Base64编码的图片
     */
    async recognizeBase64(imageBase64: string): Promise<OCRResult> {
        try {
            const body = JSON.stringify({
                ImageBase64: imageBase64
            });
            return await this.doRequest(body, 'GeneralBasicOCR');
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'recognizeBase64 error: ' + JSON.stringify(error));
            return {
                success: false,
                text: '',
                errorMsg: '识别失败: ' + JSON.stringify(error),
                details: []
            };
        }
    }
    /**
     * 识别PDF文件（Base64编码）
     */
    async recognizePdfBase64(pdfBase64: string, pageNumber: number = 1): Promise<OCRResult> {
        try {
            const body = JSON.stringify({
                ImageBase64: pdfBase64,
                IsPdf: true,
                PdfPageNumber: pageNumber
            });
            return await this.doRequest(body, 'GeneralAccurateOCR');
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'recognizePdfBase64 error: ' + JSON.stringify(error));
            return {
                success: false,
                text: '',
                errorMsg: '识别失败: ' + JSON.stringify(error),
                details: []
            };
        }
    }
    /**
     * 识别图片URL
     */
    async recognizeUrl(imageUrl: string): Promise<OCRResult> {
        try {
            const body = JSON.stringify({
                ImageUrl: imageUrl
            });
            return await this.doRequest(body, 'GeneralBasicOCR');
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'recognizeUrl error: ' + JSON.stringify(error));
            return {
                success: false,
                text: '',
                errorMsg: '识别失败: ' + JSON.stringify(error),
                details: []
            };
        }
    }
    /**
     * 发送请求到腾讯云
     */
    private async doRequest(body: string, action: string): Promise<OCRResult> {
        Logger.info(TencentOCR.TAG, '[OCR] 开始请求, Action: ' + action);
        Logger.info(TencentOCR.TAG, '[OCR] 请求体长度: ' + body.length);
        const timestamp = Math.floor(Date.now() / 1000);
        const date = this.getUTCDate(timestamp);
        const headers = await this.buildHeaders(body, timestamp, date, action);
        Logger.info(TencentOCR.TAG, '[OCR] 请求头构建完成');
        const httpRequest = http.createHttp();
        try {
            Logger.info(TencentOCR.TAG, '[OCR] 发送HTTP请求...');
            const response = await httpRequest.request('https://' + TencentOCR.HOST, {
                method: http.RequestMethod.POST,
                header: headers,
                extraData: body,
                connectTimeout: 30000,
                readTimeout: 30000
            });
            Logger.info(TencentOCR.TAG, '[OCR] HTTP响应码: ' + response.responseCode);
            if (response.responseCode === 200) {
                const resultStr = response.result as string;
                Logger.info(TencentOCR.TAG, '[OCR] 响应内容长度: ' + resultStr.length);
                Logger.info(TencentOCR.TAG, '[OCR] 响应内容: ' + resultStr.substring(0, 500));
                return this.parseResponse(resultStr);
            }
            else {
                Logger.error(TencentOCR.TAG, '[OCR] HTTP错误: ' + response.responseCode);
                return {
                    success: false,
                    text: '',
                    errorMsg: 'HTTP错误: ' + response.responseCode,
                    details: []
                };
            }
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, '[OCR] 请求异常: ' + JSON.stringify(error));
            return {
                success: false,
                text: '',
                errorMsg: '请求异常: ' + JSON.stringify(error),
                details: []
            };
        }
        finally {
            httpRequest.destroy();
        }
    }
    /**
     * 构建请求头
     */
    private async buildHeaders(body: string, timestamp: number, date: string, action: string): Promise<Record<string, string>> {
        const authorization = await this.generateAuthorization(body, timestamp, date, action);
        return {
            'Content-Type': 'application/json',
            'Host': TencentOCR.HOST,
            'X-TC-Action': action,
            'X-TC-Version': TencentOCR.VERSION,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Region': this.config.region,
            'Authorization': authorization
        };
    }
    /**
     * 生成签名授权
     */
    private async generateAuthorization(body: string, timestamp: number, date: string, action: string): Promise<string> {
        const algorithm = 'TC3-HMAC-SHA256';
        const service = TencentOCR.SERVICE;
        // 1. 拼接规范请求串
        const httpRequestMethod = 'POST';
        const canonicalUri = '/';
        const canonicalQueryString = '';
        const canonicalHeaders = 'content-type:application/json\nhost:' + TencentOCR.HOST + '\n';
        const signedHeaders = 'content-type;host';
        const hashedRequestPayload = await this.sha256Hex(body);
        const canonicalRequest = httpRequestMethod + '\n' +
            canonicalUri + '\n' +
            canonicalQueryString + '\n' +
            canonicalHeaders + '\n' +
            signedHeaders + '\n' +
            hashedRequestPayload;
        // 2. 拼接待签名字符串
        const credentialScope = date + '/' + service + '/tc3_request';
        const hashedCanonicalRequest = await this.sha256Hex(canonicalRequest);
        const stringToSign = algorithm + '\n' +
            timestamp + '\n' +
            credentialScope + '\n' +
            hashedCanonicalRequest;
        // 3. 计算签名
        const secretDate = await this.hmacSha256('TC3' + this.config.secretKey, date);
        const secretService = await this.hmacSha256Raw(secretDate, service);
        const secretSigning = await this.hmacSha256Raw(secretService, 'tc3_request');
        const signature = await this.hmacSha256HexRaw(secretSigning, stringToSign);
        // 4. 拼接Authorization
        return algorithm + ' ' +
            'Credential=' + this.config.secretId + '/' + credentialScope + ', ' +
            'SignedHeaders=' + signedHeaders + ', ' +
            'Signature=' + signature;
    }
    /**
     * SHA256哈希（返回十六进制字符串）
     */
    private async sha256Hex(message: string): Promise<string> {
        try {
            const md = cryptoFramework.createMd('SHA256');
            const msgBlob: cryptoFramework.DataBlob = {
                data: new Uint8Array(buffer.from(message, 'utf-8').buffer)
            };
            await md.update(msgBlob);
            const result = await md.digest();
            return this.uint8ArrayToHex(result.data);
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'sha256Hex error: ' + JSON.stringify(error));
            return '';
        }
    }
    /**
     * HMAC-SHA256（字符串密钥，返回Uint8Array）
     */
    private async hmacSha256(key: string, message: string): Promise<Uint8Array> {
        try {
            const mac = cryptoFramework.createMac('SHA256');
            const keyBlob: cryptoFramework.DataBlob = {
                data: new Uint8Array(buffer.from(key, 'utf-8').buffer)
            };
            const symKeyGenerator = cryptoFramework.createSymKeyGenerator('HMAC');
            const symKey = await symKeyGenerator.convertKey(keyBlob);
            await mac.init(symKey);
            const msgBlob: cryptoFramework.DataBlob = {
                data: new Uint8Array(buffer.from(message, 'utf-8').buffer)
            };
            await mac.update(msgBlob);
            const result = await mac.doFinal();
            return result.data;
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'hmacSha256 error: ' + JSON.stringify(error));
            return new Uint8Array(0);
        }
    }
    /**
     * HMAC-SHA256（Uint8Array密钥，返回Uint8Array）
     */
    private async hmacSha256Raw(key: Uint8Array, message: string): Promise<Uint8Array> {
        try {
            const mac = cryptoFramework.createMac('SHA256');
            const keyBlob: cryptoFramework.DataBlob = { data: key };
            const symKeyGenerator = cryptoFramework.createSymKeyGenerator('HMAC');
            const symKey = await symKeyGenerator.convertKey(keyBlob);
            await mac.init(symKey);
            const msgBlob: cryptoFramework.DataBlob = {
                data: new Uint8Array(buffer.from(message, 'utf-8').buffer)
            };
            await mac.update(msgBlob);
            const result = await mac.doFinal();
            return result.data;
        }
        catch (error) {
            Logger.error(TencentOCR.TAG, 'hmacSha256Raw error: ' + JSON.stringify(error));
            return new Uint8Array(0);
        }
    }
    /**
     * HMAC-SHA256（Uint8Array密钥，返回十六进制字符串）
     */
    private async hmacSha256HexRaw(key: Uint8Array, message: string): Promise<string> {
        const result = await this.hmacSha256Raw(key, message);
        return this.uint8ArrayToHex(result);
    }
    /**
     * Uint8Array转十六进制字符串
     */
    private uint8ArrayToHex(arr: Uint8Array): string {
        let hex = '';
        for (let i = 0; i < arr.length; i++) {
            const byte = arr[i];
            hex += byte < 16 ? '0' + byte.toString(16) : byte.toString(16);
        }
        return hex;
    }
    /**
     * 获取UTC日期字符串
     */
    private getUTCDate(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const monthStr = month < 10 ? '0' + month : '' + month;
        const dayStr = day < 10 ? '0' + day : '' + day;
        return year + '-' + monthStr + '-' + dayStr;
    }
    /**
     * 解析响应
     */
    private parseResponse(responseStr: string): OCRResult {
        try {
            const response = JSON.parse(responseStr) as OCRResponse;
            if (response.Response.Error) {
                return {
                    success: false,
                    text: '',
                    errorMsg: response.Response.Error.Message,
                    details: []
                };
            }
            const textItems: OCRTextItem[] = [];
            let fullText = '';
            if (response.Response.TextDetections) {
                for (const item of response.Response.TextDetections) {
                    textItems.push({
                        text: item.DetectedText,
                        confidence: item.Confidence
                    });
                    fullText += item.DetectedText + '\n';
                }
            }
            return {
                success: true,
                text: fullText.trim(),
                errorMsg: '',
                details: textItems
            };
        }
        catch (error) {
            return {
                success: false,
                text: '',
                errorMsg: '解析响应失败: ' + JSON.stringify(error),
                details: []
            };
        }
    }
}
/**
 * 腾讯云OCR响应结构
 */
interface OCRResponse {
    Response: OCRResponseBody;
}
interface OCRResponseBody {
    TextDetections?: TextDetection[];
    Error?: OCRError;
    RequestId: string;
}
interface OCRError {
    Code: string;
    Message: string;
}
interface TextDetection {
    DetectedText: string;
    Confidence: number;
    Polygon: Point[];
    ItemPolygon: ItemPolygon;
    Words: Word[];
}
interface Point {
    X: number;
    Y: number;
}
interface ItemPolygon {
    X: number;
    Y: number;
    Width: number;
    Height: number;
}
interface Word {
    DetectedText: string;
    Confidence: number;
}
