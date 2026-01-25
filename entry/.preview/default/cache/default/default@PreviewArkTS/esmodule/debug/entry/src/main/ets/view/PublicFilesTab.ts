if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface publicFilesTab_Params {
    picture?: string;
    flag?: Boolean;
    message?: string;
    content?: string;
    isInput?: Boolean;
    saveButtonOptions?: SaveButtonOptions;
}
import photoAccessHelper from "@ohos:file.photoAccessHelper";
import fileIo from "@ohos:file.fs";
import Logger from "@bundle:com.example.filesmanger/entry/ets/common/utils/Logger";
import { readUserFile, saveToUser } from "@bundle:com.example.filesmanger/entry/ets/common/utils/SavingAndSelectUserFile";
import { photoPickerGetUri } from "@bundle:com.example.filesmanger/entry/ets/common/utils/PictureSaving";
export class publicFilesTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__picture = new ObservedPropertySimplePU('', this, "picture");
        this.__flag = new ObservedPropertyObjectPU(false, this, "flag");
        this.__message = new ObservedPropertySimplePU('', this, "message");
        this.__content = new ObservedPropertySimplePU('', this, "content");
        this.__isInput = new ObservedPropertyObjectPU(false, this, "isInput");
        this.__saveButtonOptions = new ObservedPropertyObjectPU({
            icon: SaveIconStyle.FULL_FILLED,
            text: SaveDescription.SAVE_IMAGE,
            buttonType: ButtonType.Capsule
        }, this, "saveButtonOptions");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: publicFilesTab_Params) {
        if (params.picture !== undefined) {
            this.picture = params.picture;
        }
        if (params.flag !== undefined) {
            this.flag = params.flag;
        }
        if (params.message !== undefined) {
            this.message = params.message;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
        if (params.isInput !== undefined) {
            this.isInput = params.isInput;
        }
        if (params.saveButtonOptions !== undefined) {
            this.saveButtonOptions = params.saveButtonOptions;
        }
    }
    updateStateVars(params: publicFilesTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__picture.purgeDependencyOnElmtId(rmElmtId);
        this.__flag.purgeDependencyOnElmtId(rmElmtId);
        this.__message.purgeDependencyOnElmtId(rmElmtId);
        this.__content.purgeDependencyOnElmtId(rmElmtId);
        this.__isInput.purgeDependencyOnElmtId(rmElmtId);
        this.__saveButtonOptions.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__picture.aboutToBeDeleted();
        this.__flag.aboutToBeDeleted();
        this.__message.aboutToBeDeleted();
        this.__content.aboutToBeDeleted();
        this.__isInput.aboutToBeDeleted();
        this.__saveButtonOptions.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __picture: ObservedPropertySimplePU<string>;
    get picture() {
        return this.__picture.get();
    }
    set picture(newValue: string) {
        this.__picture.set(newValue);
    }
    private __flag: ObservedPropertyObjectPU<Boolean>;
    get flag() {
        return this.__flag.get();
    }
    set flag(newValue: Boolean) {
        this.__flag.set(newValue);
    }
    private __message: ObservedPropertySimplePU<string>;
    get message() {
        return this.__message.get();
    }
    set message(newValue: string) {
        this.__message.set(newValue);
    }
    private __content: ObservedPropertySimplePU<string>;
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    private __isInput: ObservedPropertyObjectPU<Boolean>;
    get isInput() {
        return this.__isInput.get();
    }
    set isInput(newValue: Boolean) {
        this.__isInput.set(newValue);
    }
    // Setting the button properties of a security control
    private __saveButtonOptions: ObservedPropertyObjectPU<SaveButtonOptions>;
    get saveButtonOptions() {
        return this.__saveButtonOptions.get();
    }
    set saveButtonOptions(newValue: SaveButtonOptions) {
        this.__saveButtonOptions.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(37:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(38:7)", "entry");
            Column.margin({ bottom: { "id": 16777233, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
            Column.width({ "id": 16777252, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777245, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.justifyContent(FlexAlign.SpaceAround);
            Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777218, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(39:9)", "entry");
            Image.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.height({ "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Create Security Control Button
            SaveButton.create(this.saveButtonOptions);
            SaveButton.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(44:9)", "entry");
            // Create Security Control Button
            SaveButton.onClick(async (event, result: SaveButtonOnClickResult) => {
                if (result == SaveButtonOnClickResult.SUCCESS) {
                    try {
                        Logger.info('createAsset successfully, event: ' + event);
                        let context = this.getUIContext().getHostContext();
                        let phAccessHelper = photoAccessHelper.getPhotoAccessHelper(context);
                        // Creating a Media File
                        let uri = await phAccessHelper.createAsset(photoAccessHelper.PhotoType.IMAGE, 'jpg')
                            .catch((error: BusinessError<Error>) => {
                            Logger.error(`createAsset catch error, code: ${error.code}, message: ${error.message}`);
                            return '';
                        });
                        Logger.info('createAsset successfully, uri: ' + uri);
                        // Open the created media file and read the local file and convert it to ArrayBuffer for easy filling.
                        let file = await fileIo.open(uri, fileIo.OpenMode.READ_WRITE);
                        let buffer = context!.resourceManager.getMediaContentSync({ "id": 16777218, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }.id);
                        // Write the read ArrayBuffer to the new media file.
                        let writeLen = await fileIo.write(file.fd, buffer.buffer);
                        Logger.info('write success,len=' + writeLen);
                        await fileIo.close(file);
                    }
                    catch (err) {
                        Logger.error('createAsset failed, message = ', err);
                    }
                }
                else {
                    Logger.error('SaveButtonOnClickResult createAsset failed');
                }
            });
        }, SaveButton);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(80:7)", "entry");
            Column.margin({ bottom: { "id": 16777233, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
            Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.width({ "id": 16777252, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777243, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777229, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(81:9)", "entry");
            Text.width({ "id": 16777250, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777256, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Medium');
            Text.fontSize({ "id": 16777240, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(500);
            Text.textAlign(TextAlign.Start);
            Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(90:9)", "entry");
            Column.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.borderRadius({ "id": 16777240, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.backgroundColor({ "id": 16777262, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.onClick(async () => {
                await photoPickerGetUri().then(value => {
                    this.flag = true;
                    this.picture = value;
                });
            });
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.flag) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 16777261, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Image.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(92:13)", "entry");
                        Image.width({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Image.height({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Image.objectFit(ImageFit.Contain);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(this.picture);
                        Image.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(97:13)", "entry");
                        Image.width('100%');
                        Image.height('100%');
                        Image.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                    }, Image);
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(122:7)", "entry");
            Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.width({ "id": 16777252, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height('251');
            Column.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.margin({ bottom: { "id": 16777234, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: { "id": 16777231, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }, text: this.isInput ? this.content : this.message });
            TextArea.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(123:9)", "entry");
            TextArea.onChange((value: string) => {
                this.content = value;
            });
            TextArea.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.height({ "id": 16777236, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.margin({ top: { "id": 16777233, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }, bottom: { "id": 16777233, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
            TextArea.enableKeyboardOnFocus(false);
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777225, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(131:9)", "entry");
            Button.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.height({ "id": 16777254, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                saveToUser(this.content);
                this.content = '';
                this.isInput = true;
            });
            Button.margin({ bottom: { "id": 16777233, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777226, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.debugLine("entry/src/main/ets/view/PublicFilesTab.ets(140:9)", "entry");
            Button.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.height({ "id": 16777254, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(async () => {
                await readUserFile().then((value: string) => {
                    this.message = value;
                    this.isInput = false;
                });
            });
        }, Button);
        Button.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
