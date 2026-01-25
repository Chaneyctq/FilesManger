if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TicketListTab_Params {
    tickets?: Ticket[];
    keyword?: string;
    duplicateIds?: string[];
}
import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import { TicketUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TicketUtil";
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import { SandboxFileItemType } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
export class TicketListTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__tickets = new ObservedPropertyObjectPU([], this, "tickets");
        this.__keyword = new ObservedPropertySimplePU('', this, "keyword");
        this.__duplicateIds = new ObservedPropertyObjectPU([], this, "duplicateIds");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TicketListTab_Params) {
        if (params.tickets !== undefined) {
            this.tickets = params.tickets;
        }
        if (params.keyword !== undefined) {
            this.keyword = params.keyword;
        }
        if (params.duplicateIds !== undefined) {
            this.duplicateIds = params.duplicateIds;
        }
    }
    updateStateVars(params: TicketListTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__tickets.purgeDependencyOnElmtId(rmElmtId);
        this.__keyword.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateIds.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__tickets.aboutToBeDeleted();
        this.__keyword.aboutToBeDeleted();
        this.__duplicateIds.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __tickets: ObservedPropertyObjectPU<Ticket[]>;
    get tickets() {
        return this.__tickets.get();
    }
    set tickets(newValue: Ticket[]) {
        this.__tickets.set(newValue);
    }
    private __keyword: ObservedPropertySimplePU<string>;
    get keyword() {
        return this.__keyword.get();
    }
    set keyword(newValue: string) {
        this.__keyword.set(newValue);
    }
    private __duplicateIds: ObservedPropertyObjectPU<string[]>; // Store IDs of duplicate tickets
    get duplicateIds() {
        return this.__duplicateIds.get();
    }
    set duplicateIds(newValue: string[]) {
        this.__duplicateIds.set(newValue);
    }
    aboutToAppear() {
        // Ensure mock data exists if empty
        const root = SandboxFileUtil.getSandboxRootDir();
        const files = SandboxFileUtil.listChildren(root);
        if (files.length === 0) {
            SandboxFileUtil.initMockDataToSandbox();
        }
        this.loadTickets();
    }
    private loadTickets() {
        const rootDir = SandboxFileUtil.getSandboxRootDir();
        const files = SandboxFileUtil.listChildren(rootDir);
        const allTickets: Ticket[] = [];
        files.forEach(file => {
            if (file.type === SandboxFileItemType.FILE) {
                allTickets.push(TicketUtil.processFile(file));
            }
        });
        // Filter
        let filtered = allTickets;
        if (this.keyword.trim().length > 0) {
            const k = this.keyword.trim().toLowerCase();
            filtered = allTickets.filter(t => t.merchantName.toLowerCase().includes(k) ||
                t.type.toLowerCase().includes(k) ||
                t.invoiceCode?.toLowerCase().includes(k));
        }
        this.tickets = filtered;
        // Check duplicates
        const dups = TicketUtil.findDuplicates(this.tickets);
        this.duplicateIds = dups.map(d => d.id);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/TicketListTab.ets(53:5)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Search Bar
            Row.create();
            Row.debugLine("entry/src/main/ets/view/TicketListTab.ets(55:7)", "entry");
            // Search Bar
            Row.width('100%');
            // Search Bar
            Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索商家、类型或发票号', text: this.keyword });
            TextInput.debugLine("entry/src/main/ets/view/TicketListTab.ets(56:9)", "entry");
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.borderRadius(12);
            TextInput.onChange((value: string) => {
                this.keyword = value;
                this.loadTickets();
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('刷新');
            Button.debugLine("entry/src/main/ets/view/TicketListTab.ets(66:9)", "entry");
            Button.fontColor('#000000');
            Button.height(40);
            Button.margin({ left: 8 });
            Button.backgroundColor({ "id": 16777270, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                this.loadTickets();
            });
        }, Button);
        Button.pop();
        // Search Bar
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // List
            if (this.tickets.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/view/TicketListTab.ets(80:9)", "entry");
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无票据');
                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(81:11)", "entry");
                        Text.fontSize(16);
                        Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Text.opacity(0.6);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.debugLine("entry/src/main/ets/view/TicketListTab.ets(89:9)", "entry");
                        List.width('100%');
                        List.layoutWeight(1);
                        List.padding({ left: 16, right: 16 });
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
                                    ListItem.debugLine("entry/src/main/ets/view/TicketListTab.ets(91:13)", "entry");
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/TicketListTab.ets(92:15)", "entry");
                                        Row.width('100%');
                                        Row.padding(12);
                                        Row.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                        Row.borderRadius(12);
                                        Row.margin({ bottom: 8 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Icon based on type
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/TicketListTab.ets(94:17)", "entry");
                                        // Icon based on type
                                        Column.width(40);
                                        // Icon based on type
                                        Column.height(40);
                                        // Icon based on type
                                        Column.borderRadius(20);
                                        // Icon based on type
                                        Column.backgroundColor(this.getTypeColor(item.type));
                                        // Icon based on type
                                        Column.justifyContent(FlexAlign.Center);
                                        // Icon based on type
                                        Column.alignItems(HorizontalAlign.Center);
                                        // Icon based on type
                                        Column.margin({ right: 12 });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.type.charAt(0));
                                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(95:19)", "entry");
                                        Text.fontSize(18);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor(Color.White);
                                    }, Text);
                                    Text.pop();
                                    // Icon based on type
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Info
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/TicketListTab.ets(109:17)", "entry");
                                        // Info
                                        Column.layoutWeight(1);
                                        // Info
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.merchantName);
                                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(110:19)", "entry");
                                        Text.fontSize(16);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.debugLine("entry/src/main/ets/view/TicketListTab.ets(115:19)", "entry");
                                        Row.margin({ top: 4 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.type);
                                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(116:21)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#666666');
                                        Text.margin({ right: 8 });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(new Date(item.date * 1000).toLocaleDateString());
                                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(121:21)", "entry");
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    // Info
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        // Amount & Warning
                                        Column.create();
                                        Column.debugLine("entry/src/main/ets/view/TicketListTab.ets(131:17)", "entry");
                                        // Amount & Warning
                                        Column.alignItems(HorizontalAlign.End);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('¥' + item.amount.toFixed(2));
                                        Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(132:19)", "entry");
                                        Text.fontSize(16);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor({ "id": 16777264, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (this.duplicateIds.includes(item.id)) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('重复报销');
                                                    Text.debugLine("entry/src/main/ets/view/TicketListTab.ets(138:21)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor(Color.Red);
                                                    Text.margin({ top: 4 });
                                                    Text.backgroundColor('#FFE5E5');
                                                    Text.padding({ left: 4, right: 4, top: 2, bottom: 2 });
                                                    Text.borderRadius(4);
                                                }, Text);
                                                Text.pop();
                                            });
                                        }
                                        else {
                                            this.ifElseBranchUpdateFunction(1, () => {
                                            });
                                        }
                                    }, If);
                                    If.pop();
                                    // Amount & Warning
                                    Column.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.tickets, forEachItemGenFunction, (item: Ticket) => item.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    private getTypeColor(type: TicketType): string {
        switch (type) {
            case TicketType.CATERING: return '#FF9800'; // Orange
            case TicketType.TRANSPORT: return '#2196F3'; // Blue
            case TicketType.HOTEL: return '#9C27B0'; // Purple
            default: return '#757575'; // Grey
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
}
