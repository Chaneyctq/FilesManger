if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ApplicationFileTab_Params {
    message?: string;
    content?: string;
}
import { readFile } from "@bundle:com.example.filesmanger/entry/ets/common/utils/ReadFile";
import { writeFile } from "@bundle:com.example.filesmanger/entry/ets/common/utils/WriteFile";
export class ApplicationFileTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message = new ObservedPropertySimplePU('', this, "message");
        this.__content = new ObservedPropertySimplePU('', this, "content");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ApplicationFileTab_Params) {
        if (params.message !== undefined) {
            this.message = params.message;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    updateStateVars(params: ApplicationFileTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message.purgeDependencyOnElmtId(rmElmtId);
        this.__content.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message.aboutToBeDeleted();
        this.__content.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // Used to record the read content.
    private __message: ObservedPropertySimplePU<string>;
    get message() {
        return this.__message.get();
    }
    set message(newValue: string) {
        this.__message.set(newValue);
    }
    // Used to record the contents of a text box.
    private __content: ObservedPropertySimplePU<string>;
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(27:5)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777230, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(28:7)", "entry");
            Text.width({ "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(500);
            Text.fontSize({ "id": 16777240, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Medium');
            Text.lineHeight({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.margin({
                top: { "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777260, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ text: this.content });
            TextArea.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(42:7)", "entry");
            TextArea.width({ "id": 16777252, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.height({ "id": 16777238, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.enableKeyboardOnFocus(false);
            TextArea.onChange((value: string) => {
                this.content = value;
            });
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create({ "id": 16777227, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(51:7)", "entry");
            Text.width({ "id": 16777248, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontSize({ "id": 16777240, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777244, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(500);
            Text.margin({
                top: { "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777237, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777260, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ text: this.message });
            TextArea.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(62:7)", "entry");
            TextArea.enableKeyboardOnFocus(false);
            TextArea.width({ "id": 16777252, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.height({ "id": 16777238, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.borderRadius({ "id": 16777246, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, TextArea);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(69:7)", "entry");
            Column.width('100%');
            Column.margin({ top: { "id": 16777234, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777223, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(70:9)", "entry");
            Button.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.height({ "id": 16777254, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                writeFile(this.content);
                this.content = '';
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel({ "id": 16777224, "type": 10003, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.debugLine("entry/src/main/ets/view/ApplicationFileTab.ets(78:9)", "entry");
            Button.width({ "id": 16777251, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.height({ "id": 16777254, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.margin({ top: { "id": 16777235, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }, bottom: { "id": 16777234, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
            Button.onClick(() => {
                this.message = readFile();
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
