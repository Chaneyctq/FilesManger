if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ReportTab_Params {
    totalAmount?: number;
    reportList?: {
        type: TicketType;
        amount: number;
        color: string;
    }[];
    eventCount?: number;
}
import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import { TicketUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TicketUtil";
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import { SandboxFileItemType } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
export class ReportTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__totalAmount = new ObservedPropertySimplePU(0, this, "totalAmount");
        this.__reportList = new ObservedPropertyObjectPU([], this, "reportList");
        this.__eventCount = new ObservedPropertySimplePU(0, this, "eventCount");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ReportTab_Params) {
        if (params.totalAmount !== undefined) {
            this.totalAmount = params.totalAmount;
        }
        if (params.reportList !== undefined) {
            this.reportList = params.reportList;
        }
        if (params.eventCount !== undefined) {
            this.eventCount = params.eventCount;
        }
    }
    updateStateVars(params: ReportTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__totalAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__reportList.purgeDependencyOnElmtId(rmElmtId);
        this.__eventCount.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__totalAmount.aboutToBeDeleted();
        this.__reportList.aboutToBeDeleted();
        this.__eventCount.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __totalAmount: ObservedPropertySimplePU<number>;
    get totalAmount() {
        return this.__totalAmount.get();
    }
    set totalAmount(newValue: number) {
        this.__totalAmount.set(newValue);
    }
    // ArkTS Maps in @State can be tricky, using array for simple iteration in UI
    private __reportList: ObservedPropertyObjectPU<{
        type: TicketType;
        amount: number;
        color: string;
    }[]>;
    get reportList() {
        return this.__reportList.get();
    }
    set reportList(newValue: {
        type: TicketType;
        amount: number;
        color: string;
    }[]) {
        this.__reportList.set(newValue);
    }
    private __eventCount: ObservedPropertySimplePU<number>;
    get eventCount() {
        return this.__eventCount.get();
    }
    set eventCount(newValue: number) {
        this.__eventCount.set(newValue);
    }
    aboutToAppear() {
        this.generateReport();
    }
    private generateReport() {
        const rootDir = SandboxFileUtil.getSandboxRootDir();
        const files = SandboxFileUtil.listChildren(rootDir);
        const tickets: Ticket[] = [];
        files.forEach(file => {
            if (file.type === SandboxFileItemType.FILE) {
                tickets.push(TicketUtil.processFile(file));
            }
        });
        this.totalAmount = TicketUtil.calculateTotal(tickets);
        const map = TicketUtil.generateReport(tickets);
        this.reportList = [];
        map.forEach((amount, type) => {
            this.reportList.push({
                type: type,
                amount: amount,
                color: this.getTypeColor(type)
            });
        });
        // Mock event detection count
        // Real logic would associate tickets by date/location
        this.eventCount = Math.floor(tickets.length / 3);
    }
    private getTypeColor(type: TicketType): string {
        switch (type) {
            case TicketType.CATERING: return '#FF9800';
            case TicketType.TRANSPORT: return '#2196F3';
            case TicketType.HOTEL: return '#9C27B0';
            default: return '#757575';
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ReportTab.ets(55:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F1F3F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Header
            Text.create('报销统计');
            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(57:7)", "entry");
            // Header
            Text.fontSize(24);
            // Header
            Text.fontWeight(FontWeight.Bold);
            // Header
            Text.margin({ top: 20, bottom: 20 });
        }, Text);
        // Header
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Total Card
            Column.create();
            Column.debugLine("entry/src/main/ets/view/ReportTab.ets(63:7)", "entry");
            // Total Card
            Column.width('90%');
            // Total Card
            Column.height(120);
            // Total Card
            Column.backgroundColor('#007DFF');
            // Total Card
            Column.borderRadius(16);
            // Total Card
            Column.justifyContent(FlexAlign.Center);
            // Total Card
            Column.alignItems(HorizontalAlign.Center);
            // Total Card
            Column.shadow({ radius: 10, color: '#40007DFF', offsetY: 5 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('总报销金额');
            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(64:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(Color.White);
            Text.opacity(0.8);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + this.totalAmount.toFixed(2));
            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(68:9)", "entry");
            Text.fontSize(32);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        // Total Card
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Breakdown
            Text.create('分类统计');
            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(83:7)", "entry");
            // Breakdown
            Text.fontSize(18);
            // Breakdown
            Text.fontWeight(FontWeight.Bold);
            // Breakdown
            Text.width('90%');
            // Breakdown
            Text.margin({ top: 24, bottom: 12 });
        }, Text);
        // Breakdown
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.debugLine("entry/src/main/ets/view/ReportTab.ets(89:7)", "entry");
            List.width('90%');
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
                        ListItem.debugLine("entry/src/main/ets/view/ReportTab.ets(91:11)", "entry");
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.debugLine("entry/src/main/ets/view/ReportTab.ets(92:13)", "entry");
                            Row.width('100%');
                            Row.padding(16);
                            Row.backgroundColor({ "id": 16777263, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                            Row.borderRadius(12);
                            Row.margin({ bottom: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // Color dot
                            Circle.create({ width: 12, height: 12 });
                            Circle.debugLine("entry/src/main/ets/view/ReportTab.ets(94:15)", "entry");
                            // Color dot
                            Circle.fill(item.color);
                            // Color dot
                            Circle.margin({ right: 12 });
                        }, Circle);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.type);
                            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(98:15)", "entry");
                            Text.fontSize(16);
                            Text.layoutWeight(1);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('¥' + item.amount.toFixed(2));
                            Text.debugLine("entry/src/main/ets/view/ReportTab.ets(102:15)", "entry");
                            Text.fontSize(16);
                            Text.fontWeight(FontWeight.Bold);
                        }, Text);
                        Text.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.reportList, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('生成报销单');
            Button.debugLine("entry/src/main/ets/view/ReportTab.ets(117:7)", "entry");
            Button.width('90%');
            Button.height(48);
            Button.margin({ bottom: 24 });
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                // Action to export or print
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
