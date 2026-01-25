if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ReportTab_Params {
    totalAmount?: number;
    totalCount?: number;
    reportList?: ReportItem[];
    eventCount?: number;
    duplicateCount?: number;
    duplicateAmount?: number;
    events?: ConsumptionEvent[];
    isLoading?: boolean;
    allTickets?: Ticket[];
    currentPath?: string;
    pathHistory?: string[];
    folders?: SandboxFileItem[];
    isRecursiveMode?: boolean;
    showFolderPicker?: boolean;
}
import { TicketType } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket, ReportItem } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { ConsumptionEvent } from '../common/model/ConsumptionEvent';
import { TicketUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TicketUtil";
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import { SandboxFileItemType } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import type { SandboxFileItem } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import promptAction from "@ohos:promptAction";
import fileIo from "@ohos:file.fs";
import buffer from "@ohos:buffer";
export class ReportTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__totalAmount = new ObservedPropertySimplePU(0, this, "totalAmount");
        this.__totalCount = new ObservedPropertySimplePU(0, this, "totalCount");
        this.__reportList = new ObservedPropertyObjectPU([], this, "reportList");
        this.__eventCount = new ObservedPropertySimplePU(0, this, "eventCount");
        this.__duplicateCount = new ObservedPropertySimplePU(0, this, "duplicateCount");
        this.__duplicateAmount = new ObservedPropertySimplePU(0, this, "duplicateAmount");
        this.__events = new ObservedPropertyObjectPU([], this, "events");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__allTickets = new ObservedPropertyObjectPU([], this, "allTickets");
        this.__currentPath = new ObservedPropertySimplePU('', this, "currentPath");
        this.__pathHistory = new ObservedPropertyObjectPU([], this, "pathHistory");
        this.__folders = new ObservedPropertyObjectPU([], this, "folders");
        this.__isRecursiveMode = new ObservedPropertySimplePU(true, this, "isRecursiveMode");
        this.__showFolderPicker = new ObservedPropertySimplePU(false, this, "showFolderPicker");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ReportTab_Params) {
        if (params.totalAmount !== undefined) {
            this.totalAmount = params.totalAmount;
        }
        if (params.totalCount !== undefined) {
            this.totalCount = params.totalCount;
        }
        if (params.reportList !== undefined) {
            this.reportList = params.reportList;
        }
        if (params.eventCount !== undefined) {
            this.eventCount = params.eventCount;
        }
        if (params.duplicateCount !== undefined) {
            this.duplicateCount = params.duplicateCount;
        }
        if (params.duplicateAmount !== undefined) {
            this.duplicateAmount = params.duplicateAmount;
        }
        if (params.events !== undefined) {
            this.events = params.events;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.allTickets !== undefined) {
            this.allTickets = params.allTickets;
        }
        if (params.currentPath !== undefined) {
            this.currentPath = params.currentPath;
        }
        if (params.pathHistory !== undefined) {
            this.pathHistory = params.pathHistory;
        }
        if (params.folders !== undefined) {
            this.folders = params.folders;
        }
        if (params.isRecursiveMode !== undefined) {
            this.isRecursiveMode = params.isRecursiveMode;
        }
        if (params.showFolderPicker !== undefined) {
            this.showFolderPicker = params.showFolderPicker;
        }
    }
    updateStateVars(params: ReportTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__totalAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__totalCount.purgeDependencyOnElmtId(rmElmtId);
        this.__reportList.purgeDependencyOnElmtId(rmElmtId);
        this.__eventCount.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateCount.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__events.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__allTickets.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPath.purgeDependencyOnElmtId(rmElmtId);
        this.__pathHistory.purgeDependencyOnElmtId(rmElmtId);
        this.__folders.purgeDependencyOnElmtId(rmElmtId);
        this.__isRecursiveMode.purgeDependencyOnElmtId(rmElmtId);
        this.__showFolderPicker.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__totalAmount.aboutToBeDeleted();
        this.__totalCount.aboutToBeDeleted();
        this.__reportList.aboutToBeDeleted();
        this.__eventCount.aboutToBeDeleted();
        this.__duplicateCount.aboutToBeDeleted();
        this.__duplicateAmount.aboutToBeDeleted();
        this.__events.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__allTickets.aboutToBeDeleted();
        this.__currentPath.aboutToBeDeleted();
        this.__pathHistory.aboutToBeDeleted();
        this.__folders.aboutToBeDeleted();
        this.__isRecursiveMode.aboutToBeDeleted();
        this.__showFolderPicker.aboutToBeDeleted();
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
    private __totalCount: ObservedPropertySimplePU<number>;
    get totalCount() {
        return this.__totalCount.get();
    }
    set totalCount(newValue: number) {
        this.__totalCount.set(newValue);
    }
    private __reportList: ObservedPropertyObjectPU<ReportItem[]>;
    get reportList() {
        return this.__reportList.get();
    }
    set reportList(newValue: ReportItem[]) {
        this.__reportList.set(newValue);
    }
    private __eventCount: ObservedPropertySimplePU<number>;
    get eventCount() {
        return this.__eventCount.get();
    }
    set eventCount(newValue: number) {
        this.__eventCount.set(newValue);
    }
    private __duplicateCount: ObservedPropertySimplePU<number>;
    get duplicateCount() {
        return this.__duplicateCount.get();
    }
    set duplicateCount(newValue: number) {
        this.__duplicateCount.set(newValue);
    }
    private __duplicateAmount: ObservedPropertySimplePU<number>;
    get duplicateAmount() {
        return this.__duplicateAmount.get();
    }
    set duplicateAmount(newValue: number) {
        this.__duplicateAmount.set(newValue);
    }
    private __events: ObservedPropertyObjectPU<ConsumptionEvent[]>;
    get events() {
        return this.__events.get();
    }
    set events(newValue: ConsumptionEvent[]) {
        this.__events.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __allTickets: ObservedPropertyObjectPU<Ticket[]>; // 保存所有票据用于生成报销单
    get allTickets() {
        return this.__allTickets.get();
    }
    set allTickets(newValue: Ticket[]) {
        this.__allTickets.set(newValue);
    }
    // 目录选择状态
    private __currentPath: ObservedPropertySimplePU<string>;
    get currentPath() {
        return this.__currentPath.get();
    }
    set currentPath(newValue: string) {
        this.__currentPath.set(newValue);
    }
    private __pathHistory: ObservedPropertyObjectPU<string[]>;
    get pathHistory() {
        return this.__pathHistory.get();
    }
    set pathHistory(newValue: string[]) {
        this.__pathHistory.set(newValue);
    }
    private __folders: ObservedPropertyObjectPU<SandboxFileItem[]>;
    get folders() {
        return this.__folders.get();
    }
    set folders(newValue: SandboxFileItem[]) {
        this.__folders.set(newValue);
    }
    private __isRecursiveMode: ObservedPropertySimplePU<boolean>;
    get isRecursiveMode() {
        return this.__isRecursiveMode.get();
    }
    set isRecursiveMode(newValue: boolean) {
        this.__isRecursiveMode.set(newValue);
    }
    private __showFolderPicker: ObservedPropertySimplePU<boolean>;
    get showFolderPicker() {
        return this.__showFolderPicker.get();
    }
    set showFolderPicker(newValue: boolean) {
        this.__showFolderPicker.set(newValue);
    }
    aboutToAppear() {
        this.currentPath = SandboxFileUtil.getSandboxRootDir();
        this.loadFolders();
        this.generateReport();
    }
    private loadFolders(): void {
        const children = SandboxFileUtil.listChildren(this.currentPath);
        this.folders = children.filter(item => item.type === SandboxFileItemType.DIRECTORY);
    }
    private async generateReport(): Promise<void> {
        this.isLoading = true;
        const searchDir = this.currentPath.length > 0 ? this.currentPath : SandboxFileUtil.getSandboxRootDir();
        let files: SandboxFileItem[] = [];
        if (this.isRecursiveMode) {
            files = SandboxFileUtil.listAllFilesRecursive(searchDir);
        }
        else {
            const children = SandboxFileUtil.listChildren(searchDir);
            files = children.filter(item => item.type === SandboxFileItemType.FILE);
        }
        const tickets: Ticket[] = [];
        for (const file of files) {
            tickets.push(TicketUtil.processFile(file));
        }
        this.allTickets = tickets; // 保存票据列表
        // 使用多线程生成报表
        const summary = await TicketUtil.generateReportAsync(tickets);
        this.totalAmount = summary.totalAmount;
        this.totalCount = summary.totalCount;
        this.reportList = summary.categoryBreakdown;
        this.duplicateCount = summary.duplicateCount;
        this.duplicateAmount = summary.duplicateAmount;
        // 关联消费事件
        this.events = TicketUtil.associateEvents(tickets);
        this.eventCount = this.events.length;
        this.isLoading = false;
    }
    private getTypeColor(type: TicketType): string {
        switch (type) {
            case TicketType.CATERING: return '#FF9800';
            case TicketType.TRANSPORT: return '#2196F3';
            case TicketType.HOTEL: return '#9C27B0';
            case TicketType.SHOPPING: return '#4CAF50';
            case TicketType.ENTERTAINMENT: return '#E91E63';
            default: return '#757575';
        }
    }
    private exportReport(): void {
        const content = this.generateReportContent();
        const filePath = this.saveReportToFile(content);
        if (filePath.length > 0) {
            promptAction.showToast({ message: '报销单已保存' });
        }
        else {
            promptAction.showToast({ message: '保存失败' });
        }
    }
    private generateReportContent(): string {
        const now = new Date();
        const dateStr = this.formatDateTime(now);
        const W = 50;
        let content = '';
        content += this.repeatChar('=', W) + '\n';
        content += this.centerText('报 销 统 计 清 单', W) + '\n';
        content += this.repeatChar('=', W) + '\n\n';
        content += '生成时间: ' + dateStr + '\n';
        content += '统计目录: ' + this.getDisplayPath() + '\n';
        content += this.repeatChar('-', W) + '\n\n';
        content += this.generateSummarySection();
        content += this.generateCategorySection();
        content += this.generateEventSection();
        content += this.generateTicketDetailSection();
        content += this.generateFooter();
        return content;
    }
    private generateSummarySection(): string {
        const W = 50;
        let section = '';
        section += '[ 汇总信息 ]\n';
        section += this.repeatChar('-', W) + '\n';
        section += '  票据总数: ' + this.totalCount + ' 张\n';
        section += '  报销总额: ' + this.totalAmount.toFixed(2) + ' 元\n';
        if (this.duplicateCount > 0) {
            section += '  [!] 重复票据: ' + this.duplicateCount + ' 张\n';
            section += '  [!] 重复金额: ' + this.duplicateAmount.toFixed(2) + ' 元\n';
        }
        section += '\n';
        return section;
    }
    private generateCategorySection(): string {
        const W = 50;
        let section = '';
        section += '[ 分类明细 ]\n';
        section += this.repeatChar('-', W) + '\n';
        section += this.padRight('  类型', 16) + this.padRight('数量', 12) + '金额\n';
        section += this.repeatChar('-', W) + '\n';
        for (const item of this.reportList) {
            const typeStr = this.padRight('  ' + item.type, 16);
            const countStr = this.padRight(item.count + ' 张', 12);
            const amountStr = item.amount.toFixed(2) + ' 元';
            section += typeStr + countStr + amountStr + '\n';
        }
        section += '\n';
        return section;
    }
    private generateEventSection(): string {
        if (this.events.length === 0) {
            return '';
        }
        const W = 50;
        let section = '';
        section += '[ 消费事件 ]\n';
        section += this.repeatChar('-', W) + '\n';
        for (let i = 0; i < this.events.length; i++) {
            const event = this.events[i];
            section += '  ' + (i + 1) + '. ' + event.name + '\n';
            section += '     原因: ' + event.associationReason + '\n';
            section += '     票据: ' + event.tickets.length + ' 张';
            section += '  金额: ' + event.totalAmount.toFixed(2) + ' 元\n';
            if (i < this.events.length - 1) {
                section += '\n';
            }
        }
        section += '\n';
        return section;
    }
    private generateTicketDetailSection(): string {
        const W = 50;
        let section = '';
        section += '[ 票据明细 ]\n';
        section += this.repeatChar('-', W) + '\n';
        section += this.padRight('  序号', 8);
        section += this.padRight('商家', 14);
        section += this.padRight('日期', 14);
        section += '金额\n';
        section += this.repeatChar('-', W) + '\n';
        for (let i = 0; i < this.allTickets.length; i++) {
            const ticket = this.allTickets[i];
            const idx = this.padRight('  ' + (i + 1), 8);
            const merchant = this.padRight(this.truncateStr(ticket.merchantName, 12), 14);
            const dateStr = this.padRight(this.formatTicketDate(ticket.date), 14);
            const amount = ticket.amount.toFixed(2) + ' 元';
            section += idx + merchant + dateStr + amount + '\n';
        }
        section += this.repeatChar('-', W) + '\n';
        section += '\n';
        return section;
    }
    private generateFooter(): string {
        const W = 50;
        let footer = '';
        footer += this.repeatChar('=', W) + '\n';
        footer += this.centerText('*** 报销单结束 ***', W) + '\n';
        footer += this.centerText('由 FilesManger 自动生成', W) + '\n';
        footer += this.repeatChar('=', W) + '\n';
        return footer;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F1F3F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('报销统计');
            // 标题
            Text.fontSize(24);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.margin({ top: 20, bottom: 8 });
        }, Text);
        // 标题
        Text.pop();
        // 目录选择栏
        this.buildPathSelector.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 总金额卡片
            Column.create();
            // 总金额卡片
            Column.width('90%');
            // 总金额卡片
            Column.height(120);
            // 总金额卡片
            Column.backgroundColor('#007DFF');
            // 总金额卡片
            Column.borderRadius(16);
            // 总金额卡片
            Column.justifyContent(FlexAlign.Center);
            // 总金额卡片
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('总报销金额');
            Text.fontSize(14);
            Text.fontColor(Color.White);
            Text.opacity(0.8);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + this.totalAmount.toFixed(2));
            Text.fontSize(32);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.totalCount + ' 张票据');
            Text.fontSize(12);
            Text.fontColor(Color.White);
            Text.opacity(0.7);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        // 总金额卡片
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 重复报销预警
            if (this.duplicateCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('90%');
                        Row.padding(12);
                        Row.backgroundColor('#FFF3E0');
                        Row.borderRadius(8);
                        Row.margin({ top: 16 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('⚠');
                        Text.fontSize(16);
                        Text.fontColor('#FF5722');
                        Text.margin({ right: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('发现 ' + this.duplicateCount + ' 张重复票据');
                        Text.fontSize(14);
                        Text.fontColor('#FF5722');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                    }, Blank);
                    Blank.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('¥' + this.duplicateAmount.toFixed(2));
                        Text.fontSize(14);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FF5722');
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            // 消费事件统计
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 消费事件统计
            if (this.eventCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('90%');
                        Row.padding(12);
                        Row.backgroundColor('#E3F2FD');
                        Row.borderRadius(8);
                        Row.margin({ top: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('已关联 ' + this.eventCount + ' 个消费事件');
                        Text.fontSize(14);
                        Text.fontColor('#1976D2');
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            // Breakdown
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Breakdown
            Text.create('分类统计');
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
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.width('100%');
                            Row.padding(16);
                            Row.backgroundColor({ "id": 16777235, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                            Row.borderRadius(12);
                            Row.margin({ bottom: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            // Color dot
                            Circle.create({ width: 12, height: 12 });
                            // Color dot
                            Circle.fill(item.color);
                            // Color dot
                            Circle.margin({ right: 12 });
                        }, Circle);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.alignItems(HorizontalAlign.Start);
                            Column.layoutWeight(1);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.type);
                            Text.fontSize(16);
                            Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.count + ' 张');
                            Text.fontSize(12);
                            Text.fontColor('#999999');
                            Text.margin({ top: 2 });
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('¥' + item.amount.toFixed(2));
                            Text.fontSize(16);
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
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
            Button.width('90%');
            Button.height(48);
            Button.margin({ bottom: 24 });
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.exportReport();
            });
        }, Button);
        Button.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文件夹选择弹窗
            if (this.showFolderPicker) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildFolderPicker.bind(this)();
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
    buildPathSelector(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('90%');
            Row.margin({ bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 当前路径
            Text.create(this.getDisplayPath());
            // 当前路径
            Text.fontSize(13);
            // 当前路径
            Text.fontColor('#666666');
            // 当前路径
            Text.layoutWeight(1);
            // 当前路径
            Text.maxLines(1);
            // 当前路径
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        // 当前路径
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 选择目录按钮
            Button.createWithLabel('选择目录');
            // 选择目录按钮
            Button.fontSize(12);
            // 选择目录按钮
            Button.height(28);
            // 选择目录按钮
            Button.backgroundColor('#E3F2FD');
            // 选择目录按钮
            Button.fontColor('#007DFF');
            // 选择目录按钮
            Button.onClick(() => {
                this.showFolderPicker = true;
            });
        }, Button);
        // 选择目录按钮
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 递归模式
            Text.create(this.isRecursiveMode ? '全部' : '当前');
            // 递归模式
            Text.fontSize(12);
            // 递归模式
            Text.fontColor(this.isRecursiveMode ? Color.White : '#007DFF');
            // 递归模式
            Text.backgroundColor(this.isRecursiveMode ? '#007DFF' : '#E3F2FD');
            // 递归模式
            Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            // 递归模式
            Text.borderRadius(12);
            // 递归模式
            Text.margin({ left: 8 });
            // 递归模式
            Text.onClick(() => {
                this.isRecursiveMode = !this.isRecursiveMode;
                this.generateReport();
            });
        }, Text);
        // 递归模式
        Text.pop();
        Row.pop();
    }
    buildFolderPicker(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('rgba(0,0,0,0.5)');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('90%');
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题栏
            Row.create();
            // 标题栏
            Row.width('100%');
            // 标题栏
            Row.padding(16);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pathHistory.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('<');
                        Text.fontSize(18);
                        Text.fontColor('#007DFF');
                        Text.onClick(() => { this.goBack(); });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择目录');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('X');
            Text.fontSize(18);
            Text.fontColor('#999999');
            Text.onClick(() => { this.showFolderPicker = false; });
        }, Text);
        Text.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 当前路径
            Text.create(this.getDisplayPath());
            // 当前路径
            Text.fontSize(12);
            // 当前路径
            Text.fontColor('#666666');
            // 当前路径
            Text.width('100%');
            // 当前路径
            Text.padding({ left: 16, right: 16, bottom: 8 });
        }, Text);
        // 当前路径
        Text.pop();
        // 文件夹列表
        this.buildFolderListContent.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 确认按钮
            Button.createWithLabel('选择此目录');
            // 确认按钮
            Button.width('90%');
            // 确认按钮
            Button.height(44);
            // 确认按钮
            Button.margin(16);
            // 确认按钮
            Button.backgroundColor('#007DFF');
            // 确认按钮
            Button.onClick(() => {
                this.showFolderPicker = false;
                this.generateReport();
            });
        }, Button);
        // 确认按钮
        Button.pop();
        Column.pop();
        Column.pop();
    }
    buildFolderListContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.height(200);
            List.padding({ left: 16, right: 16 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const folder = _item;
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
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.width('100%');
                            Row.padding(12);
                            Row.onClick(() => {
                                this.enterFolder(folder);
                            });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('📁');
                            Text.fontSize(20);
                            Text.margin({ right: 8 });
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(folder.name);
                            Text.fontSize(14);
                            Text.layoutWeight(1);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('>');
                            Text.fontSize(14);
                            Text.fontColor('#999999');
                        }, Text);
                        Text.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.folders, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
    }
    private getDisplayPath(): string {
        const root = SandboxFileUtil.getSandboxRootDir();
        if (this.currentPath === root) {
            return '根目录';
        }
        const relativePath = this.currentPath.replace(root, '');
        return '根目录' + relativePath.replace(/\//g, ' > ');
    }
    private enterFolder(folder: SandboxFileItem): void {
        this.pathHistory.push(this.currentPath);
        this.currentPath = folder.path;
        this.loadFolders();
    }
    private goBack(): void {
        if (this.pathHistory.length > 0) {
            const prev = this.pathHistory.pop();
            if (prev !== undefined) {
                this.currentPath = prev;
                this.loadFolders();
            }
        }
    }
    /**
     * 保存报销单到文件
     */
    private saveReportToFile(content: string): string {
        try {
            const reportsDir = SandboxFileUtil.getSandboxRootDir() + '/reports';
            SandboxFileUtil.createDir(reportsDir);
            const now = new Date();
            const fileName = 'report_' + now.getFullYear() +
                this.padZero(now.getMonth() + 1) +
                this.padZero(now.getDate()) + '_' +
                this.padZero(now.getHours()) +
                this.padZero(now.getMinutes()) +
                this.padZero(now.getSeconds()) + '.txt';
            const filePath = reportsDir + '/' + fileName;
            const file = fileIo.openSync(filePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
            const buf = buffer.from(content, 'utf-8');
            fileIo.writeSync(file.fd, buf.buffer);
            fileIo.closeSync(file);
            return filePath;
        }
        catch (error) {
            return '';
        }
    }
    /**
     * 格式化日期时间
     */
    private formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = this.padZero(date.getMonth() + 1);
        const day = this.padZero(date.getDate());
        const hour = this.padZero(date.getHours());
        const minute = this.padZero(date.getMinutes());
        const second = this.padZero(date.getSeconds());
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
    /**
     * 数字补零
     */
    private padZero(num: number): string {
        return num < 10 ? '0' + num : '' + num;
    }
    /**
     * 右填充字符串
     */
    private padRight(str: string, len: number): string {
        let result = str;
        while (result.length < len) {
            result = result + ' ';
        }
        return result;
    }
    /**
     * 居中填充字符串
     */
    private padCenter(str: string, len: number): string {
        if (str.length >= len) {
            return str.substring(0, len);
        }
        const totalPad = len - str.length;
        const leftPad = Math.floor(totalPad / 2);
        const rightPad = totalPad - leftPad;
        let result = '';
        for (let i = 0; i < leftPad; i++) {
            result = result + ' ';
        }
        result = result + str;
        for (let i = 0; i < rightPad; i++) {
            result = result + ' ';
        }
        return result;
    }
    /**
     * 截断字符串
     */
    private truncateStr(str: string, maxLen: number): string {
        if (str.length <= maxLen) {
            return str;
        }
        return str.substring(0, maxLen - 2) + '..';
    }
    /**
     * 格式化票据日期
     */
    private formatTicketDate(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = this.padZero(date.getMonth() + 1);
        const day = this.padZero(date.getDate());
        return year + '-' + month + '-' + day;
    }
    /**
     * 重复字符
     */
    private repeatChar(char: string, count: number): string {
        let result = '';
        for (let i = 0; i < count; i++) {
            result += char;
        }
        return result;
    }
    /**
     * 居中文本
     */
    private centerText(text: string, width: number): string {
        if (text.length >= width) {
            return text;
        }
        const totalPad = width - text.length;
        const leftPad = Math.floor(totalPad / 2);
        return this.repeatChar(' ', leftPad) + text;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
