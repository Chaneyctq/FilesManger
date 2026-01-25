import type { BusinessError } from "@ohos:base";
import picker from "@ohos:file.picker";
import fileIo from "@ohos:file.fs";
import buffer from "@ohos:buffer";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
let uri: string = '';
// Obtaining the Application File Path
let message: string = '';
/**
 * saveToUser.
 * Save content to user directory file
 * @param content Contents saved to a user directory file
 */
export async function saveToUser(content: string) {
    try {
        let DocumentSaveOptions = new picker.DocumentSaveOptions();
        DocumentSaveOptions.newFileNames = ['test.txt'];
        let documentPicker = new picker.DocumentViewPicker();
        documentPicker.save(DocumentSaveOptions).then((DocumentSaveResult: Array<string>) => {
            Logger.info('DocumentViewPicker.save successfully, uri: ' + JSON.stringify(DocumentSaveResult));
            uri = DocumentSaveResult[0];
            let file = fileIo.openSync(uri, fileIo.OpenMode.READ_WRITE);
            // Open a file stream based on the file path.
            fileIo.writeSync(file.fd, content);
        }).catch((err: BusinessError) => {
            Logger.error('DocumentViewPicker.save failed with err: ' + JSON.stringify(err));
        });
    }
    catch (error) {
        let err: BusinessError = error as BusinessError;
        Logger.error('DocumentViewPicker failed with err: ' + err.message);
    }
}
/**
 * readUserFile.
 * Reads the contents of a user directory file.
 * @return Promise<string>.
 */
export async function readUserFile(): Promise<string> {
    try {
        let DocumentSelectOptions = new picker.DocumentSelectOptions();
        let documentPicker = new picker.DocumentViewPicker();
        await documentPicker.select(DocumentSelectOptions).then((DocumentSelectResult: Array<string>) => {
            Logger.info('DocumentViewPicker.select successfully, uri: ' + JSON.stringify(DocumentSelectResult));
            uri = DocumentSelectResult[0];
            let file = fileIo.openSync(uri, fileIo.OpenMode.READ_WRITE);
            let stat = fileIo.statSync(file.fd);
            let size = stat.size;
            let buf = new ArrayBuffer(size);
            fileIo.readSync(file.fd, buf);
            let con = buffer.from(buf, 0);
            message = con.toString();
            Logger.info('DocumentViewPicker.select successfully, message: ' + message);
            return message;
        }).catch((err: BusinessError) => {
            Logger.error('DocumentViewPicker.select failed with err: ' + JSON.stringify(err));
        });
    }
    catch (error) {
        let err = error as BusinessError;
        Logger.error('DocumentViewPicker.select failed with err: ' + err.message);
    }
    return message;
}
