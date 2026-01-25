import photoAccessHelper from "@ohos:file.photoAccessHelper";
import type { BusinessError } from "@ohos:base";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
// Defines a URI array, which is used to receive the URI returned by PhotoViewPicker for selecting images.
let uris: Array<string> = [];
/**
 * photoPickerGetUri.
 * Returns the URI of the selected file based on the select method of PhotoViewPicker.
 * @return Promise<string>.
 */
export async function photoPickerGetUri(): Promise<string> {
    try {
        let PhotoSelectOptions = new photoAccessHelper.PhotoSelectOptions();
        PhotoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE;
        PhotoSelectOptions.maxSelectNumber = 1;
        let photoPicker = new photoAccessHelper.PhotoViewPicker();
        await photoPicker.select(PhotoSelectOptions).then((PhotoSelectResult: photoAccessHelper.PhotoSelectResult) => {
            Logger.info('PhotoViewPicker.select successfully, PhotoSelectResult uri: ' + JSON.stringify(PhotoSelectResult));
            uris = PhotoSelectResult.photoUris;
        }).catch((err: BusinessError) => {
            Logger.error('PhotoViewPicker.select failed with err: ' + JSON.stringify(err));
        });
    }
    catch (error) {
        let err = error as BusinessError;
        Logger.error('PhotoViewPicker failed with err: ' + err.message);
    }
    return uris[0].toString();
}
