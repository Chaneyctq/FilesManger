import fileIo from "@ohos:file.fs";
import buffer from "@ohos:buffer";
import type { BusinessError } from "@ohos:base";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
const HASH_CHUNK_SIZE: number = 64 * 1024; // 64KB chunks for reading
/**
 * 文件哈希工具类
 * 用于计算文件的哈希值以识别重复文件
 */
export class FileHashUtil {
    /**
     * 计算文件内容的简单哈希值
     * 使用文件大小 + 首部内容 + 尾部内容的组合哈希
     * @param filePath 文件路径
     * @returns 哈希字符串，失败返回空字符串
     */
    static calculateFileHash(filePath: string): string {
        try {
            const stat: fileIo.Stat = fileIo.statSync(filePath);
            const fileSize: number = stat.size;
            if (fileSize === 0) {
                return 'empty_file_' + filePath.length.toString();
            }
            // 对于小文件，读取全部内容计算哈希
            if (fileSize <= HASH_CHUNK_SIZE * 2) {
                return FileHashUtil.calculateFullHash(filePath, fileSize);
            }
            // 对于大文件，只读取首部和尾部
            return FileHashUtil.calculatePartialHash(filePath, fileSize);
        }
        catch (error) {
            const err: BusinessError = error as BusinessError;
            Logger.error('calculateFileHash failed, code=' + err.code + ', message=' + err.message);
            return '';
        }
    }
    /**
     * 计算小文件的完整哈希
     */
    private static calculateFullHash(filePath: string, fileSize: number): string {
        try {
            const buf: ArrayBuffer = new ArrayBuffer(fileSize);
            const fd: number = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY).fd;
            fileIo.readSync(fd, buf);
            fileIo.closeSync(fd);
            const content: buffer.Buffer = buffer.from(buf);
            const hashValue: number = FileHashUtil.simpleHash(content.toString('base64'));
            return fileSize.toString() + '_' + hashValue.toString(16);
        }
        catch (error) {
            const err: BusinessError = error as BusinessError;
            Logger.error('calculateFullHash failed, code=' + err.code + ', message=' + err.message);
            return '';
        }
    }
    /**
     * 计算大文件的部分哈希（首部 + 尾部）
     */
    private static calculatePartialHash(filePath: string, fileSize: number): string {
        try {
            const fd: number = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY).fd;
            // 读取首部
            const headBuf: ArrayBuffer = new ArrayBuffer(HASH_CHUNK_SIZE);
            fileIo.readSync(fd, headBuf, { offset: 0 });
            // 读取尾部
            const tailBuf: ArrayBuffer = new ArrayBuffer(HASH_CHUNK_SIZE);
            const tailOffset: number = fileSize - HASH_CHUNK_SIZE;
            fileIo.readSync(fd, tailBuf, { offset: tailOffset });
            fileIo.closeSync(fd);
            const headContent: buffer.Buffer = buffer.from(headBuf);
            const tailContent: buffer.Buffer = buffer.from(tailBuf);
            const headHash: number = FileHashUtil.simpleHash(headContent.toString('base64'));
            const tailHash: number = FileHashUtil.simpleHash(tailContent.toString('base64'));
            return fileSize.toString() + '_' + headHash.toString(16) + '_' + tailHash.toString(16);
        }
        catch (error) {
            const err: BusinessError = error as BusinessError;
            Logger.error('calculatePartialHash failed, code=' + err.code + ', message=' + err.message);
            return '';
        }
    }
    /**
     * 简单的字符串哈希算法 (DJB2)
     */
    private static simpleHash(str: string): number {
        let hash: number = 5381;
        let i: number = 0;
        while (i < str.length) {
            const char: number = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
            hash = hash & 0x7FFFFFFF; // 保持为正整数
            i = i + 1;
        }
        return hash;
    }
    /**
     * 比较两个文件是否相同
     * 先比较大小和哈希，如果相同再比较完整内容
     * @param path1 第一个文件路径
     * @param path2 第二个文件路径
     * @returns 是否相同
     */
    static areFilesIdentical(path1: string, path2: string): boolean {
        try {
            const stat1: fileIo.Stat = fileIo.statSync(path1);
            const stat2: fileIo.Stat = fileIo.statSync(path2);
            // 大小不同肯定不同
            if (stat1.size !== stat2.size) {
                return false;
            }
            // 空文件都相同
            if (stat1.size === 0) {
                return true;
            }
            // 比较哈希
            const hash1: string = FileHashUtil.calculateFileHash(path1);
            const hash2: string = FileHashUtil.calculateFileHash(path2);
            if (hash1 !== hash2) {
                return false;
            }
            // 对于小文件，哈希相同即可认为相同
            if (stat1.size <= HASH_CHUNK_SIZE * 2) {
                return true;
            }
            // 对于大文件，进行更详细的内容比较
            return FileHashUtil.compareFileContents(path1, path2, stat1.size);
        }
        catch (error) {
            const err: BusinessError = error as BusinessError;
            Logger.error('areFilesIdentical failed, code=' + err.code + ', message=' + err.message);
            return false;
        }
    }
    /**
     * 逐块比较两个文件的内容
     */
    private static compareFileContents(path1: string, path2: string, fileSize: number): boolean {
        try {
            const fd1: number = fileIo.openSync(path1, fileIo.OpenMode.READ_ONLY).fd;
            const fd2: number = fileIo.openSync(path2, fileIo.OpenMode.READ_ONLY).fd;
            let offset: number = 0;
            let isIdentical: boolean = true;
            while (offset < fileSize && isIdentical) {
                const chunkSize: number = Math.min(HASH_CHUNK_SIZE, fileSize - offset);
                const buf1: ArrayBuffer = new ArrayBuffer(chunkSize);
                const buf2: ArrayBuffer = new ArrayBuffer(chunkSize);
                fileIo.readSync(fd1, buf1, { offset: offset });
                fileIo.readSync(fd2, buf2, { offset: offset });
                const content1: buffer.Buffer = buffer.from(buf1);
                const content2: buffer.Buffer = buffer.from(buf2);
                if (content1.toString('base64') !== content2.toString('base64')) {
                    isIdentical = false;
                }
                offset = offset + chunkSize;
            }
            fileIo.closeSync(fd1);
            fileIo.closeSync(fd2);
            return isIdentical;
        }
        catch (error) {
            const err: BusinessError = error as BusinessError;
            Logger.error('compareFileContents failed, code=' + err.code + ', message=' + err.message);
            return false;
        }
    }
    /**
     * 生成唯一ID
     */
    static generateUniqueId(): string {
        const timestamp: number = Date.now();
        const random: number = Math.floor(Math.random() * 1000000);
        return timestamp.toString(36) + '_' + random.toString(36);
    }
}
