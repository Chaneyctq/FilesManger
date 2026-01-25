if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SandboxFilesTab_Params {
    keyword?: string;
    contentKeyword?: string;
    files?: SandboxFileItem[];
    currentDir?: string;
    rootDir?: string;
    selectedPath?: string;
    selectedName?: string;
    showMoreDialog?: boolean;
    showDeleteDialog?: boolean;
    showRenameDialog?: boolean;
    renameValue?: string;
    showCreateDialog?: boolean;
    createType?: number;
    createName?: string;
}
import { SandboxFileItemType } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import type { SandboxFileItem } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import promptAction from "@ohos:promptAction";
export class SandboxFilesTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__keyword = new ObservedPropertySimplePU('', this, "keyword");
        this.__contentKeyword = new ObservedPropertySimplePU('', this, "contentKeyword");
        this.__files = new ObservedPropertyObjectPU([], this, "files");
        this.__currentDir = new ObservedPropertySimplePU('', this, "currentDir");
        this.__rootDir = new ObservedPropertySimplePU('', this, "rootDir");
        this.__selectedPath = new ObservedPropertySimplePU('', this, "selectedPath");
        this.__selectedName = new ObservedPropertySimplePU('', this, "selectedName");
        this.__showMoreDialog = new ObservedPropertySimplePU(false, this, "showMoreDialog");
        this.__showDeleteDialog = new ObservedPropertySimplePU(false, this, "showDeleteDialog");
        this.__showRenameDialog = new ObservedPropertySimplePU(false, this, "showRenameDialog");
        this.__renameValue = new ObservedPropertySimplePU('', this, "renameValue");
        this.__showCreateDialog = new ObservedPropertySimplePU(false, this, "showCreateDialog");
        this.__createType = new ObservedPropertySimplePU(0, this, "createType");
        this.__createName = new ObservedPropertySimplePU('', this, "createName");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SandboxFilesTab_Params) {
        if (params.keyword !== undefined) {
            this.keyword = params.keyword;
        }
        if (params.contentKeyword !== undefined) {
            this.contentKeyword = params.contentKeyword;
        }
        if (params.files !== undefined) {
            this.files = params.files;
        }
        if (params.currentDir !== undefined) {
            this.currentDir = params.currentDir;
        }
        if (params.rootDir !== undefined) {
            this.rootDir = params.rootDir;
        }
        if (params.selectedPath !== undefined) {
            this.selectedPath = params.selectedPath;
        }
        if (params.selectedName !== undefined) {
            this.selectedName = params.selectedName;
        }
        if (params.showMoreDialog !== undefined) {
            this.showMoreDialog = params.showMoreDialog;
        }
        if (params.showDeleteDialog !== undefined) {
            this.showDeleteDialog = params.showDeleteDialog;
        }
        if (params.showRenameDialog !== undefined) {
            this.showRenameDialog = params.showRenameDialog;
        }
        if (params.renameValue !== undefined) {
            this.renameValue = params.renameValue;
        }
        if (params.showCreateDialog !== undefined) {
            this.showCreateDialog = params.showCreateDialog;
        }
        if (params.createType !== undefined) {
            this.createType = params.createType;
        }
        if (params.createName !== undefined) {
            this.createName = params.createName;
        }
    }
    updateStateVars(params: SandboxFilesTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__keyword.purgeDependencyOnElmtId(rmElmtId);
        this.__contentKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__files.purgeDependencyOnElmtId(rmElmtId);
        this.__currentDir.purgeDependencyOnElmtId(rmElmtId);
        this.__rootDir.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPath.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedName.purgeDependencyOnElmtId(rmElmtId);
        this.__showMoreDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showDeleteDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showRenameDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__renameValue.purgeDependencyOnElmtId(rmElmtId);
        this.__showCreateDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__createType.purgeDependencyOnElmtId(rmElmtId);
        this.__createName.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__keyword.aboutToBeDeleted();
        this.__contentKeyword.aboutToBeDeleted();
        this.__files.aboutToBeDeleted();
        this.__currentDir.aboutToBeDeleted();
        this.__rootDir.aboutToBeDeleted();
        this.__selectedPath.aboutToBeDeleted();
        this.__selectedName.aboutToBeDeleted();
        this.__showMoreDialog.aboutToBeDeleted();
        this.__showDeleteDialog.aboutToBeDeleted();
        this.__showRenameDialog.aboutToBeDeleted();
        this.__renameValue.aboutToBeDeleted();
        this.__showCreateDialog.aboutToBeDeleted();
        this.__createType.aboutToBeDeleted();
        this.__createName.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __keyword: ObservedPropertySimplePU<string>;
    get keyword() {
        return this.__keyword.get();
    }
    set keyword(newValue: string) {
        this.__keyword.set(newValue);
    }
    private __contentKeyword: ObservedPropertySimplePU<string>;
    get contentKeyword() {
        return this.__contentKeyword.get();
    }
    set contentKeyword(newValue: string) {
        this.__contentKeyword.set(newValue);
    }
    private __files: ObservedPropertyObjectPU<SandboxFileItem[]>;
    get files() {
        return this.__files.get();
    }
    set files(newValue: SandboxFileItem[]) {
        this.__files.set(newValue);
    }
    private __currentDir: ObservedPropertySimplePU<string>;
    get currentDir() {
        return this.__currentDir.get();
    }
    set currentDir(newValue: string) {
        this.__currentDir.set(newValue);
    }
    private __rootDir: ObservedPropertySimplePU<string>;
    get rootDir() {
        return this.__rootDir.get();
    }
    set rootDir(newValue: string) {
        this.__rootDir.set(newValue);
    }
    private __selectedPath: ObservedPropertySimplePU<string>;
    get selectedPath() {
        return this.__selectedPath.get();
    }
    set selectedPath(newValue: string) {
        this.__selectedPath.set(newValue);
    }
    private __selectedName: ObservedPropertySimplePU<string>;
    get selectedName() {
        return this.__selectedName.get();
    }
    set selectedName(newValue: string) {
        this.__selectedName.set(newValue);
    }
    private __showMoreDialog: ObservedPropertySimplePU<boolean>;
    get showMoreDialog() {
        return this.__showMoreDialog.get();
    }
    set showMoreDialog(newValue: boolean) {
        this.__showMoreDialog.set(newValue);
    }
    private __showDeleteDialog: ObservedPropertySimplePU<boolean>;
    get showDeleteDialog() {
        return this.__showDeleteDialog.get();
    }
    set showDeleteDialog(newValue: boolean) {
        this.__showDeleteDialog.set(newValue);
    }
    private __showRenameDialog: ObservedPropertySimplePU<boolean>;
    get showRenameDialog() {
        return this.__showRenameDialog.get();
    }
    set showRenameDialog(newValue: boolean) {
        this.__showRenameDialog.set(newValue);
    }
    private __renameValue: ObservedPropertySimplePU<string>;
    get renameValue() {
        return this.__renameValue.get();
    }
    set renameValue(newValue: string) {
        this.__renameValue.set(newValue);
    }
    private __showCreateDialog: ObservedPropertySimplePU<boolean>;
    get showCreateDialog() {
        return this.__showCreateDialog.get();
    }
    set showCreateDialog(newValue: boolean) {
        this.__showCreateDialog.set(newValue);
    }
    private __createType: ObservedPropertySimplePU<number>; // 0: dir, 1: file
    get createType() {
        return this.__createType.get();
    }
    set createType(newValue: number) {
        this.__createType.set(newValue);
    }
    private __createName: ObservedPropertySimplePU<string>;
    get createName() {
        return this.__createName.get();
    }
    set createName(newValue: string) {
        this.__createName.set(newValue);
    }
    private refreshCurrentDir(): void {
        if (this.rootDir.length == 0) {
            this.rootDir = SandboxFileUtil.getSandboxRootDir();
            this.currentDir = this.rootDir;
        }
        const nameKey: string = this.keyword.trim();
        const contentKey: string = this.contentKeyword.trim();
        if (nameKey.length == 0 && contentKey.length == 0) {
            this.files = SandboxFileUtil.listChildren(this.currentDir);
            return;
        }
        if (contentKey.length == 0) {
            this.files = SandboxFileUtil.listChildrenByKeyword(this.currentDir, nameKey);
            return;
        }
        this.files = SandboxFileUtil.listChildrenByKeywordAndContent(this.currentDir, nameKey, contentKey);
    }
    private loadFiles(): void {
        const nameKey: string = this.keyword.trim();
        const contentKey: string = this.contentKeyword.trim();
        if (this.rootDir.length == 0) {
            this.rootDir = SandboxFileUtil.getSandboxRootDir();
            this.currentDir = this.rootDir;
        }
        if (this.currentDir.length > 0 && this.currentDir != this.rootDir) {
            if (nameKey.length == 0 && contentKey.length == 0) {
                this.files = SandboxFileUtil.listChildren(this.currentDir);
                return;
            }
            if (contentKey.length == 0) {
                this.files = SandboxFileUtil.listChildrenByKeyword(this.currentDir, nameKey);
                return;
            }
            this.files = SandboxFileUtil.listChildrenByKeywordAndContent(this.currentDir, nameKey, contentKey);
            return;
        }
        if (nameKey.length == 0 && contentKey.length == 0) {
            this.files = SandboxFileUtil.listFilesByKeyword('');
            return;
        }
        if (contentKey.length == 0) {
            this.files = SandboxFileUtil.listFilesByKeyword(nameKey);
            return;
        }
        this.files = SandboxFileUtil.listFilesByKeywordAndContent(nameKey, contentKey);
    }
    private openItem(item: SandboxFileItem): void {
        if (item.type == SandboxFileItemType.DIRECTORY) {
            this.keyword = '';
            this.contentKeyword = '';
            this.currentDir = item.path;
            this.refreshCurrentDir();
            return;
        }
        this.openEditor(item);
    }
    private goBack(): void {
        if (this.rootDir.length == 0) {
            this.rootDir = SandboxFileUtil.getSandboxRootDir();
            this.currentDir = this.rootDir;
            this.loadFiles();
            return;
        }
        if (this.currentDir == this.rootDir) {
            return;
        }
        const lastSlash: number = this.currentDir.lastIndexOf('/');
        if (lastSlash <= 0) {
            this.currentDir = this.rootDir;
        }
        else {
            const parentDir: string = this.currentDir.substring(0, lastSlash);
            this.currentDir = parentDir.length > 0 ? parentDir : this.rootDir;
        }
        if (this.currentDir.indexOf(this.rootDir) != 0) {
            this.currentDir = this.rootDir;
        }
        this.refreshCurrentDir();
    }
    private openEditor(item: SandboxFileItem): void {
        this.getUIContext().getRouter().pushUrl({
            url: 'pages/SandboxFileEditorPage',
            params: {
                path: item.path,
                name: item.name
            }
        });
    }
    private startRename(item: SandboxFileItem): void {
        this.selectedPath = item.path;
        this.selectedName = item.name;
        this.renameValue = item.name;
        this.showRenameDialog = true;
    }
    private showMore(item: SandboxFileItem): void {
        this.selectedPath = item.path;
        this.selectedName = item.name;
        this.renameValue = item.name;
        this.showMoreDialog = true;
    }
    private doRename(): void {
        SandboxFileUtil.renameFile(this.selectedPath, this.renameValue);
        this.showRenameDialog = false;
        this.showMoreDialog = false;
        this.loadFiles();
    }
    private doDelete(): void {
        SandboxFileUtil.deleteFile(this.selectedPath);
        this.showDeleteDialog = false;
        this.showMoreDialog = false;
        this.loadFiles();
    }
    private showCreateOptions(): void {
        try {
            promptAction.showActionMenu({
                title: '新建',
                buttons: [
                    { text: '新建文件夹', color: '#000000' },
                    { text: '新建文件', color: '#000000' }
                ]
            }).then((data) => {
                this.createType = data.index;
                this.createName = '';
                this.showCreateDialog = true;
            }).catch((err: Error) => {
                // cancel
            });
        }
        catch (e) {
            // ignore
        }
    }
    private doCreate(): void {
        const name: string = this.createName.trim();
        if (name.length == 0) {
            return;
        }
        const path: string = this.currentDir + '/' + name;
        let success: boolean = false;
        if (this.createType == 0) {
            success = SandboxFileUtil.createDir(path);
        }
        else {
            success = SandboxFileUtil.createFile(path);
        }
        if (success) {
            this.showCreateDialog = false;
            this.loadFiles();
        }
    }
    private generateMockData(): void {
        SandboxFileUtil.initMockDataToSandbox(true);
        this.loadFiles();
        try {
            promptAction.showToast({ message: '测试数据已生成' });
        }
        catch (e) {
            // ignore
        }
    }
    aboutToAppear(): void {
        SandboxFileUtil.initMockDataToSandbox();
        this.loadFiles();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(200:5)", "entry");
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777269, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(201:7)", "entry");
            Image.width('100%');
            Image.height('100%');
            Image.objectFit(ImageFit.Cover);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(206:7)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(207:9)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.rootDir.length > 0 && this.currentDir != this.rootDir) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('返回');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(209:13)", "entry");
                        Button.fontColor('#000000');
                        Button.height(40);
                        Button.margin({ right: 8 });
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.goBack();
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '按文件名关键字搜索', text: this.keyword });
            TextInput.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(218:11)", "entry");
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.borderRadius(12);
            TextInput.onChange((value: string) => {
                this.keyword = value;
                this.loadFiles();
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('刷新');
            Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(227:11)", "entry");
            Button.fontColor('#000000');
            Button.height(40);
            Button.margin({ left: 8 });
            Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                this.loadFiles();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('生成');
            Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(235:11)", "entry");
            Button.fontColor('#000000');
            Button.height(40);
            Button.margin({ left: 8 });
            Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                this.generateMockData();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('+');
            Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(243:11)", "entry");
            Button.fontColor('#000000');
            Button.height(40);
            Button.margin({ left: 8 });
            Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                this.showCreateOptions();
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(255:9)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '按文件内容关键字搜索', text: this.contentKeyword });
            TextInput.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(256:11)", "entry");
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.borderRadius(12);
            TextInput.onChange((value: string) => {
                this.contentKeyword = value;
                this.loadFiles();
            });
        }, TextInput);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.files.length == 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(270:11)", "entry");
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无匹配文件');
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(271:13)", "entry");
                        Text.fontSize(16);
                        Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(280:11)", "entry");
                        List.scrollBar(BarState.Auto);
                        List.width('100%');
                        List.layoutWeight(1);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                    ListItem.margin({ left: 16, right: 16, top: 8 });
                                    ListItem.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(282:15)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(283:17)", "entry");
                                        Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
                                        Row.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                        Row.borderRadius(16);
                                        Row.onClick(() => {
                                            this.openItem(item);
                                        });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(284:19)", "entry");
                                        Column.layoutWeight(1);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.name);
                                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(285:21)", "entry");
                                        Text.fontSize(16);
                                        Text.fontWeight(600);
                                        Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.type == SandboxFileItemType.DIRECTORY ? '目录' : (item.size + ' B'));
                                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(289:21)", "entry");
                                        Text.fontSize(12);
                                        Text.opacity(0.6);
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('...');
                                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(295:19)", "entry");
                                        Text.fontSize(18);
                                        Text.fontWeight(700);
                                        Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                                        Text.onClick(() => {
                                            this.showMore(item);
                                        });
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.files, forEachItemGenFunction, (item: SandboxFileItem) => item.path, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showMoreDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(322:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.backgroundColor('#66000000');
                        Column.onClick(() => {
                            this.showMoreDialog = false;
                            this.showDeleteDialog = false;
                            this.showRenameDialog = false;
                        });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(323:11)", "entry");
                        Column.width('86%');
                        Column.padding(16);
                        Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedName);
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(324:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(600);
                        Text.margin({ bottom: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedPath);
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(328:13)", "entry");
                        Text.fontSize(11);
                        Text.opacity(0.6);
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('编辑(文本)');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(333:13)", "entry");
                        Button.fontColor('#000000');
                        Button.width('100%');
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            const item: SandboxFileItem = {
                                path: this.selectedPath,
                                name: this.selectedName,
                                type: SandboxFileItemType.FILE,
                                size: 0,
                                modifiedTime: 0
                            };
                            this.showMoreDialog = false;
                            this.openEditor(item);
                        });
                        Button.margin({ bottom: 8 });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('重命名');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(351:13)", "entry");
                        Button.fontColor('#000000');
                        Button.width('100%');
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.showRenameDialog = true;
                        });
                        Button.margin({ bottom: 8 });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('删除');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(361:13)", "entry");
                        Button.fontColor('#000000');
                        Button.width('100%');
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.showDeleteDialog = true;
                        });
                        Button.margin({ bottom: 8 });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(371:13)", "entry");
                        Button.fontColor('#000000');
                        Button.width('100%');
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.showMoreDialog = false;
                            this.showDeleteDialog = false;
                            this.showRenameDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showMoreDialog && this.showDeleteDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(400:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.backgroundColor('#66000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(401:11)", "entry");
                        Column.width('86%');
                        Column.padding(16);
                        Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('确认删除');
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(402:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(600);
                        Text.margin({ bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('删除后不可恢复');
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(406:13)", "entry");
                        Text.fontSize(13);
                        Text.opacity(0.6);
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(410:13)", "entry");
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(411:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.showDeleteDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('删除');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(420:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.margin({ left: 10 });
                        Button.onClick(() => {
                            this.doDelete();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showMoreDialog && this.showRenameDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(444:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.backgroundColor('#66000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(445:11)", "entry");
                        Column.width('86%');
                        Column.padding(16);
                        Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('重命名');
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(446:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(600);
                        Text.margin({ bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ text: this.renameValue });
                        TextInput.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(450:13)", "entry");
                        TextInput.onChange((value: string) => {
                            this.renameValue = value;
                        });
                        TextInput.height(40);
                        TextInput.backgroundColor('#ffffff');
                        TextInput.borderRadius(10);
                        TextInput.margin({ bottom: 16 });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(458:13)", "entry");
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(459:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.onClick(() => {
                            this.showRenameDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确定');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(466:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.margin({ left: 10 });
                        Button.onClick(() => {
                            this.doRename();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showCreateDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(490:9)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.backgroundColor('#66000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(491:11)", "entry");
                        Column.width('86%');
                        Column.padding(16);
                        Column.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Column.borderRadius(16);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.createType == 0 ? '新建文件夹' : '新建文件');
                        Text.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(492:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(600);
                        Text.margin({ bottom: 10 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: '请输入名称', text: this.createName });
                        TextInput.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(496:13)", "entry");
                        TextInput.onChange((value: string) => {
                            this.createName = value;
                        });
                        TextInput.height(40);
                        TextInput.backgroundColor('#ffffff');
                        TextInput.borderRadius(10);
                        TextInput.margin({ bottom: 16 });
                    }, TextInput);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(504:13)", "entry");
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('取消');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(505:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.onClick(() => {
                            this.showCreateDialog = false;
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确定');
                        Button.debugLine("entry/src/main/ets/view/SandboxFilesTab.ets(513:15)", "entry");
                        Button.fontColor('#000000');
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Button.margin({ left: 10 });
                        Button.onClick(() => {
                            this.doCreate();
                        });
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
