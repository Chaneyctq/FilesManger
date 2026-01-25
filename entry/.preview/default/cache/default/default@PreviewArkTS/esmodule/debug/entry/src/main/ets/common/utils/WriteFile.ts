import fileIo from "@ohos:file.fs";
import type common from "@ohos:app.ability.common";
import hilog from "@ohos:hilog";
const uiContext: UIContext | undefined = AppStorage.get('uiContext');
let context = uiContext!.getHostContext() as common.UIAbilityContext;
let filesDir = context.filesDir;
/**
 * writeFile.
 * Write content to a file
 * @param content Contents to be written to the file
 */
export function writeFile(content: string): void {
    try {
        let filePath = filesDir + '/test.txt';
        // Open a file stream based on the file path.
        let fileStream = fileIo.createStreamSync(filePath, "w+");
        fileStream.writeSync(content);
        fileStream.close();
    }
    catch (error) {
        hilog.error(0x0000, 'readFile', `readFile catch error, code: ${error.code}, message: ${error.message}`);
    }
}
