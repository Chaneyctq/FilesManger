import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
import buffer from "@ohos:buffer";
import hilog from "@ohos:hilog";
const uiContext: UIContext | undefined = AppStorage.get('uiContext');
// Obtaining the Application File Path
let context = uiContext!.getHostContext() as common.UIAbilityContext;
let filesDir = context.filesDir;
let res: string = '';
/**
 * readFile.
 * Reads the contents of a file and returns a string.
 * @return string.
 */
export function readFile(): string {
    try {
        let filePath = filesDir + '/test.txt';
        let stat = fileIo.statSync(filePath);
        let size = stat.size;
        let buf = new ArrayBuffer(size);
        // Open a file stream based on the file path.
        let fileStream = fileIo.createStreamSync(filePath, "r+");
        // File stream reading information
        fileStream.readSync(buf);
        // Converts the read information to the string type and returns the string type.
        let con = buffer.from(buf, 0);
        res = con.toString();
        fileStream.close();
        return res;
    }
    catch (error) {
        hilog.error(0x0000, 'readFile', `readFile catch error, code: ${error.code}, message: ${error.message}`);
        return '';
    }
}
