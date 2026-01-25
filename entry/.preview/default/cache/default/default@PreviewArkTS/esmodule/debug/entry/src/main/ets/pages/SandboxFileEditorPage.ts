if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SandboxFileEditorPage_Params {
    filePath?: string;
    fileName?: string;
    content?: string;
}
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
class SandboxFileEditorPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__filePath = new ObservedPropertySimplePU('', this, "filePath");
        this.__fileName = new ObservedPropertySimplePU('', this, "fileName");
        this.__content = new ObservedPropertySimplePU('', this, "content");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SandboxFileEditorPage_Params) {
        if (params.filePath !== undefined) {
            this.filePath = params.filePath;
        }
        if (params.fileName !== undefined) {
            this.fileName = params.fileName;
        }
        if (params.content !== undefined) {
            this.content = params.content;
        }
    }
    updateStateVars(params: SandboxFileEditorPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__filePath.purgeDependencyOnElmtId(rmElmtId);
        this.__fileName.purgeDependencyOnElmtId(rmElmtId);
        this.__content.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__filePath.aboutToBeDeleted();
        this.__fileName.aboutToBeDeleted();
        this.__content.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __filePath: ObservedPropertySimplePU<string>;
    get filePath() {
        return this.__filePath.get();
    }
    set filePath(newValue: string) {
        this.__filePath.set(newValue);
    }
    private __fileName: ObservedPropertySimplePU<string>;
    get fileName() {
        return this.__fileName.get();
    }
    set fileName(newValue: string) {
        this.__fileName.set(newValue);
    }
    private __content: ObservedPropertySimplePU<string>;
    get content() {
        return this.__content.get();
    }
    set content(newValue: string) {
        this.__content.set(newValue);
    }
    aboutToAppear(): void {
        const params: Record<string, Object> = this.getUIContext().getRouter().getParams() as Record<string, Object>;
        const pathObj: Object | undefined = params['path'];
        const nameObj: Object | undefined = params['name'];
        this.filePath = typeof pathObj === 'string' ? (pathObj as string) : '';
        this.fileName = typeof nameObj === 'string' ? (nameObj as string) : '';
        if (this.filePath.length > 0) {
            this.content = SandboxFileUtil.readTextFile(this.filePath);
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(22:5)", "entry");
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777269, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(23:7)", "entry");
            Image.width('100%');
            Image.height('100%');
            Image.objectFit(ImageFit.Cover);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(28:7)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(29:9)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 44, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.fileName);
            Text.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(30:11)", "entry");
            Text.fontSize(18);
            Text.fontWeight(700);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({
                type: ButtonType.Normal
            });
            Button.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(34:11)", "entry");
            Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.width(96);
            Button.height(44);
            Button.borderRadius(22);
            Button.onClick(() => {
                if (this.filePath.length > 0) {
                    SandboxFileUtil.writeTextFile(this.filePath, this.content);
                }
                this.getUIContext().getRouter().back();
            });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('保存');
            Text.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(37:13)", "entry");
            Text.fontColor({ "id": 16777271, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontSize(16);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ text: this.content });
            TextArea.debugLine("entry/src/main/ets/pages/SandboxFileEditorPage.ets(57:9)", "entry");
            TextArea.onChange((value: string) => {
                this.content = value;
            });
            TextArea.enableKeyboardOnFocus(true);
            TextArea.width('100%');
            TextArea.layoutWeight(1);
            TextArea.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextArea.borderRadius(12);
            TextArea.margin({ left: 16, right: 16, bottom: 16 });
        }, TextArea);
        Column.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "SandboxFileEditorPage";
    }
}
registerNamedRoute(() => new SandboxFileEditorPage(undefined, {}), "", { bundleName: "com.example.filesmanger", moduleName: "entry", pagePath: "pages/SandboxFileEditorPage", pageFullPath: "entry/src/main/ets/pages/SandboxFileEditorPage", integratedHsp: "false", moduleType: "followWithHap" });
