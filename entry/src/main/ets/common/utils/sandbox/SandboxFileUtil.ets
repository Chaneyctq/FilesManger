import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { buffer } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';
import Logger from '../Logger';
import { SandboxFileItem, SandboxFileItemType } from '../../model/SandboxFileItem';

const UI_CONTEXT_KEY: string = 'uiContext';
const CONTENT_SEARCH_MAX_BYTES: number = 256 * 1024;
const MOCK_DATA_DIR_NAME: string = 'mock_data';
const MOCK_DATA_INIT_COUNT: number = 200;
const MOCK_DATA_VERSION_FILE: string = '.mock_data_version';
const MOCK_DATA_VERSION: string = 'v4';
const MOCK_DATA_MIN_SIZE_BYTES: number = 500;
const MOCK_DATA_DUPLICATE_RATE: number = 0.4;

export class SandboxFileUtil {
  static getSandboxRootDir(): string {
    const uiContext: UIContext | undefined = AppStorage.get(UI_CONTEXT_KEY);
    const context: common.UIAbilityContext = uiContext!.getHostContext() as common.UIAbilityContext;
    return context.filesDir;
  }

  private static ensureDirExists(dirPath: string): boolean {
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (stat.isDirectory()) {
        return true;
      }
      return false;
    } catch (error) {
      try {
        fileIo.mkdirSync(dirPath);
        return true;
      } catch (e) {
        const err: BusinessError = e as BusinessError;
        Logger.error('mkdir failed, code=' + err.code + ', message=' + err.message);
        return false;
      }
    }
  }

  private static isMockDataReady(mockDir: string): boolean {
    try {
      const stat: fileIo.Stat = fileIo.statSync(mockDir);
      if (!stat.isDirectory()) {
        return false;
      }
      const versionPath: string = mockDir + '/' + MOCK_DATA_VERSION_FILE;
      const version: string = SandboxFileUtil.readTextFile(versionPath).trim();
      if (version != MOCK_DATA_VERSION) {
        return false;
      }
      const names: string[] = fileIo.listFileSync(mockDir) as string[];
      return names.length > 0;
    } catch (error) {
      return false;
    }
  }

  private static deleteDirChildren(dirPath: string): void {
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (!stat.isDirectory()) {
        return;
      }
      const names: string[] = fileIo.listFileSync(dirPath) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        const childPath: string = dirPath + '/' + name;
        try {
          const childStat: fileIo.Stat = fileIo.statSync(childPath);
          if (childStat.isDirectory()) {
            SandboxFileUtil.deleteDirChildren(childPath);
            fileIo.rmdirSync(childPath);
          } else {
            fileIo.unlinkSync(childPath);
          }
        } catch (e) {
          // ignore
        }
        idx = idx + 1;
      }
    } catch (error) {
      // ignore
    }
  }

  private static buildRepeatedBlock(token: string, minSize: number): string {
    let content: string = '';
    while (content.length < minSize) {
      content = content + token;
    }
    return content;
  }

  private static writeTextFileInternal(path: string, content: string): boolean {
    try {
      const fileStream: fileIo.Stream = fileIo.createStreamSync(path, 'w+');
      fileStream.writeSync(content);
      fileStream.close();
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('write text file failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  static initMockDataToSandbox(force: boolean = false): void {
    const rootDir: string = SandboxFileUtil.getSandboxRootDir();
    const mockDir: string = rootDir + '/' + MOCK_DATA_DIR_NAME;
    if (!force && SandboxFileUtil.isMockDataReady(mockDir)) {
      return;
    }
    if (!SandboxFileUtil.ensureDirExists(mockDir)) {
      return;
    }

    // 如果强制或者是第一次，先清理
    SandboxFileUtil.deleteDirChildren(mockDir);

    const duplicateFileCount: number = Math.floor(MOCK_DATA_INIT_COUNT * MOCK_DATA_DUPLICATE_RATE);
    const pairCount: number = Math.floor(duplicateFileCount / 2);
    const uniqueCount: number = MOCK_DATA_INIT_COUNT - (pairCount * 2);
    const actualDuplicateRate: number = (pairCount * 2) / MOCK_DATA_INIT_COUNT;
    if (actualDuplicateRate < 0.3 || actualDuplicateRate > 0.5) {
      Logger.error('mock data duplicate rate out of range: ' + actualDuplicateRate);
    }

    const contents: string[] = [];

    let u: number = 0;
    while (u < uniqueCount) {
      const token: string = 'MOCK_UNIQUE_' + u + '_';
      const content: string = SandboxFileUtil.buildRepeatedBlock(token, MOCK_DATA_MIN_SIZE_BYTES);
      contents.push(content);
      u = u + 1;
    }

    let p: number = 0;
    while (p < pairCount) {
      const token: string = 'MOCK_DUP_PAIR_' + p + '_';
      const content: string = SandboxFileUtil.buildRepeatedBlock(token, MOCK_DATA_MIN_SIZE_BYTES);
      contents.push(content);
      contents.push(content);
      p = p + 1;
    }

    let idx: number = 0;
    while (idx < MOCK_DATA_INIT_COUNT) {
      const name: string = idx < 10 ? ('file_00' + idx) : (idx < 100 ? ('file_0' + idx) : ('file_' + idx));
      const path: string = mockDir + '/' + name + '.txt';

      const content: string = contents[idx];
      SandboxFileUtil.writeTextFileInternal(path, content);
      idx = idx + 1;
    }

    const versionPath: string = mockDir + '/' + MOCK_DATA_VERSION_FILE;
    SandboxFileUtil.writeTextFileInternal(versionPath, MOCK_DATA_VERSION);
  }

  private static readTextFileForSearch(path: string, maxBytes: number): string {
    try {
      const stat: fileIo.Stat = fileIo.statSync(path);
      let size: number = stat.size;
      if (size > maxBytes) {
        size = maxBytes;
      }
      const buf: ArrayBuffer = new ArrayBuffer(size);
      const fileStream: fileIo.Stream = fileIo.createStreamSync(path, 'r+');
      fileStream.readSync(buf);
      const con: buffer.Buffer = buffer.from(buf, 0);
      fileStream.close();
      return con.toString();
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('read text file for search failed, code=' + err.code + ', message=' + err.message);
      return '';
    }
  }

  static listFilesByKeyword(keyword: string): SandboxFileItem[] {
    const rootDir: string = SandboxFileUtil.getSandboxRootDir();
    const items: SandboxFileItem[] = [];
    try {
      const lowerKeyword: string = keyword.trim().toLowerCase();
      const names: string[] = fileIo.listFileSync(rootDir) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        const path: string = rootDir + '/' + name;
        let needAdd: boolean = true;
        if (lowerKeyword.length > 0) {
          needAdd = name.toLowerCase().indexOf(lowerKeyword) >= 0;
        }
        if (needAdd) {
          let stat: fileIo.Stat | null = null;
          try {
            stat = fileIo.statSync(path);
          } catch (e) {
            stat = null;
          }
          const size: number = stat ? stat.size : 0;
          const mtime: number = stat ? stat.mtime : 0;
          const type: SandboxFileItemType = (stat != null && stat.isDirectory()) ? SandboxFileItemType.DIRECTORY : SandboxFileItemType.FILE;
          items.push({
            path: path,
            name: name,
            type: type,
            size: size,
            modifiedTime: mtime
          });
        }
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('list sandbox files failed, code=' + err.code + ', message=' + err.message);
    }

    items.sort((a: SandboxFileItem, b: SandboxFileItem) => {
      if (a.type != b.type) {
        return a.type - b.type;
      }
      return b.modifiedTime - a.modifiedTime;
    });

    return items;
  }

  static listChildrenByKeyword(dirPath: string, keyword: string): SandboxFileItem[] {
    const lowerKeyword: string = keyword.trim().toLowerCase();
    if (lowerKeyword.length == 0) {
      return SandboxFileUtil.listChildren(dirPath);
    }
    const items: SandboxFileItem[] = [];
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (!stat.isDirectory()) {
        return items;
      }
      const names: string[] = fileIo.listFileSync(dirPath) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        if (name.toLowerCase().indexOf(lowerKeyword) < 0) {
          idx = idx + 1;
          continue;
        }
        const path: string = dirPath + '/' + name;
        let childStat: fileIo.Stat | null = null;
        try {
          childStat = fileIo.statSync(path);
        } catch (e) {
          childStat = null;
        }
        const size: number = childStat ? childStat.size : 0;
        const mtime: number = childStat ? childStat.mtime : 0;
        const type: SandboxFileItemType = (childStat != null && childStat.isDirectory()) ? SandboxFileItemType.DIRECTORY : SandboxFileItemType.FILE;
        items.push({
          path: path,
          name: name,
          type: type,
          size: size,
          modifiedTime: mtime
        });
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('list children by keyword failed, code=' + err.code + ', message=' + err.message);
    }

    items.sort((a: SandboxFileItem, b: SandboxFileItem) => {
      if (a.type != b.type) {
        return a.type - b.type;
      }
      return b.modifiedTime - a.modifiedTime;
    });
    return items;
  }

  static listChildrenByKeywordAndContent(dirPath: string, nameKeyword: string, contentKeyword: string): SandboxFileItem[] {
    const lowerNameKeyword: string = nameKeyword.trim().toLowerCase();
    const lowerContentKeyword: string = contentKeyword.trim().toLowerCase();
    if (lowerNameKeyword.length == 0 && lowerContentKeyword.length == 0) {
      return SandboxFileUtil.listChildren(dirPath);
    }
    if (lowerContentKeyword.length == 0) {
      return SandboxFileUtil.listChildrenByKeyword(dirPath, lowerNameKeyword);
    }
    const items: SandboxFileItem[] = [];
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (!stat.isDirectory()) {
        return items;
      }
      const names: string[] = fileIo.listFileSync(dirPath) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        if (lowerNameKeyword.length > 0 && name.toLowerCase().indexOf(lowerNameKeyword) < 0) {
          idx = idx + 1;
          continue;
        }
        const path: string = dirPath + '/' + name;
        let childStat: fileIo.Stat | null = null;
        try {
          childStat = fileIo.statSync(path);
        } catch (e) {
          childStat = null;
        }
        const type: SandboxFileItemType = (childStat != null && childStat.isDirectory()) ? SandboxFileItemType.DIRECTORY : SandboxFileItemType.FILE;
        if (type != SandboxFileItemType.FILE) {
          idx = idx + 1;
          continue;
        }
        const text: string = SandboxFileUtil.readTextFileForSearch(path, CONTENT_SEARCH_MAX_BYTES);
        if (text.toLowerCase().indexOf(lowerContentKeyword) >= 0) {
          const size: number = childStat ? childStat.size : 0;
          const mtime: number = childStat ? childStat.mtime : 0;
          items.push({
            path: path,
            name: name,
            type: type,
            size: size,
            modifiedTime: mtime
          });
        }
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('list children by keyword+content failed, code=' + err.code + ', message=' + err.message);
    }

    items.sort((a: SandboxFileItem, b: SandboxFileItem) => {
      if (a.type != b.type) {
        return a.type - b.type;
      }
      return b.modifiedTime - a.modifiedTime;
    });

    return items;
  }

  static listChildren(dirPath: string): SandboxFileItem[] {
    const items: SandboxFileItem[] = [];
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (!stat.isDirectory()) {
        return items;
      }
      const names: string[] = fileIo.listFileSync(dirPath) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        const path: string = dirPath + '/' + name;
        let childStat: fileIo.Stat | null = null;
        try {
          childStat = fileIo.statSync(path);
        } catch (e) {
          childStat = null;
        }
        const size: number = childStat ? childStat.size : 0;
        const mtime: number = childStat ? childStat.mtime : 0;
        const type: SandboxFileItemType = (childStat != null && childStat.isDirectory()) ? SandboxFileItemType.DIRECTORY : SandboxFileItemType.FILE;
        items.push({
          path: path,
          name: name,
          type: type,
          size: size,
          modifiedTime: mtime
        });
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('list children failed, code=' + err.code + ', message=' + err.message);
    }

    items.sort((a: SandboxFileItem, b: SandboxFileItem) => {
      if (a.type != b.type) {
        return a.type - b.type;
      }
      return b.modifiedTime - a.modifiedTime;
    });

    return items;
  }

  static listFilesByKeywordAndContent(nameKeyword: string, contentKeyword: string): SandboxFileItem[] {
    const rootDir: string = SandboxFileUtil.getSandboxRootDir();
    const items: SandboxFileItem[] = [];
    try {
      const lowerNameKeyword: string = nameKeyword.trim().toLowerCase();
      const lowerContentKeyword: string = contentKeyword.trim().toLowerCase();
      const names: string[] = fileIo.listFileSync(rootDir) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        const path: string = rootDir + '/' + name;
        let stat: fileIo.Stat | null = null;
        try {
          stat = fileIo.statSync(path);
        } catch (e) {
          stat = null;
        }

        const size: number = stat ? stat.size : 0;
        const mtime: number = stat ? stat.mtime : 0;
        const type: SandboxFileItemType = (stat != null && stat.isDirectory()) ? SandboxFileItemType.DIRECTORY : SandboxFileItemType.FILE;

        let nameMatched: boolean = true;
        if (lowerNameKeyword.length > 0) {
          nameMatched = name.toLowerCase().indexOf(lowerNameKeyword) >= 0;
        }

        let contentMatched: boolean = true;
        if (lowerContentKeyword.length > 0) {
          if (type != SandboxFileItemType.FILE) {
            contentMatched = false;
          } else {
            const text: string = SandboxFileUtil.readTextFileForSearch(path, CONTENT_SEARCH_MAX_BYTES);
            contentMatched = text.toLowerCase().indexOf(lowerContentKeyword) >= 0;
          }
        }

        if (nameMatched && contentMatched) {
          items.push({
            path: path,
            name: name,
            type: type,
            size: size,
            modifiedTime: mtime
          });
        }
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('list sandbox files by keyword+content failed, code=' + err.code + ', message=' + err.message);
    }

    items.sort((a: SandboxFileItem, b: SandboxFileItem) => {
      if (a.type != b.type) {
        return a.type - b.type;
      }
      return b.modifiedTime - a.modifiedTime;
    });

    return items;
  }

  static deleteFile(path: string): boolean {
    try {
      const stat: fileIo.Stat = fileIo.statSync(path);
      if (stat.isDirectory()) {
        fileIo.rmdirSync(path);
      } else {
        fileIo.unlinkSync(path);
      }
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('delete file failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  static renameFile(oldPath: string, newName: string): string {
    const rootDir: string = SandboxFileUtil.getSandboxRootDir();
    const safeName: string = newName.trim();
    const newPath: string = rootDir + '/' + safeName;
    try {
      fileIo.renameSync(oldPath, newPath);
      return newPath;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('rename file failed, code=' + err.code + ', message=' + err.message);
      return '';
    }
  }

  static readTextFile(path: string): string {
    try {
      const stat: fileIo.Stat = fileIo.statSync(path);
      const size: number = stat.size;
      const buf: ArrayBuffer = new ArrayBuffer(size);
      const fileStream: fileIo.Stream = fileIo.createStreamSync(path, 'r+');
      fileStream.readSync(buf);
      const con: buffer.Buffer = buffer.from(buf, 0);
      fileStream.close();
      return con.toString();
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('read text file failed, code=' + err.code + ', message=' + err.message);
      return '';
    }
  }

  static writeTextFile(path: string, content: string): boolean {
    return SandboxFileUtil.writeTextFileInternal(path, content);
  }

  static createDir(path: string): boolean {
    try {
      fileIo.mkdirSync(path);
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('create dir failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  static createFile(path: string): boolean {
    try {
      const file = fileIo.openSync(path, fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE);
      fileIo.closeSync(file);
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('create file failed, code=' + err.code + ', message=' + err.message);
      return false;
    }
  }

  /**
   * 递归列出目录下所有文件（包括子目录中的文件）
   */
  static listAllFilesRecursive(dirPath: string): SandboxFileItem[] {
    const items: SandboxFileItem[] = [];
    SandboxFileUtil.collectFilesRecursive(dirPath, items);
    return items;
  }

  /**
   * 递归收集文件
   */
  private static collectFilesRecursive(dirPath: string, items: SandboxFileItem[]): void {
    try {
      const stat: fileIo.Stat = fileIo.statSync(dirPath);
      if (!stat.isDirectory()) {
        return;
      }
      const names: string[] = fileIo.listFileSync(dirPath) as string[];
      let idx: number = 0;
      while (idx < names.length) {
        const name: string = names[idx];
        const path: string = dirPath + '/' + name;
        let childStat: fileIo.Stat | null = null;
        try {
          childStat = fileIo.statSync(path);
        } catch (e) {
          childStat = null;
        }
        if (childStat !== null) {
          if (childStat.isDirectory()) {
            SandboxFileUtil.collectFilesRecursive(path, items);
          } else {
            const size: number = childStat.size;
            const mtime: number = childStat.mtime;
            items.push({
              path: path,
              name: name,
              type: SandboxFileItemType.FILE,
              size: size,
              modifiedTime: mtime
            });
          }
        }
        idx = idx + 1;
      }
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('collect files recursive failed, code=' + err.code);
    }
  }
}
