if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TicketListTab_Params {
    tickets?: Ticket[];
    keyword?: string;
    duplicateIds?: string[];
    duplicateGroups?: DuplicateGroup[];
    expandedGroupIds?: string[];
    showDuplicateGroups?: boolean;
    minAmount?: string;
    maxAmount?: string;
    showAdvancedSearch?: boolean;
    searchMerchant?: string;
    searchStartDate?: string;
    searchEndDate?: string;
    selectedTypes?: TicketType[];
    sortBy?: string;
    sortAsc?: boolean;
    consumptionEvents?: ConsumptionEvent[];
    expandedEventIds?: string[];
    viewMode?: string;
    showCreateDialog?: boolean;
    selectedTicket?: Ticket | null;
    showTicketDetail?: boolean;
    ticketContent?: string;
    currentPath?: string;
    pathHistory?: string[];
    folders?: SandboxFileItem[];
    isRecursiveMode?: boolean;
    formMerchant?: string;
    formAmount?: string;
    formInvoiceCode?: string;
    formOrderNumber?: string;
    formLocation?: string;
    formRemark?: string;
    formType?: TicketType;
    formFormat?: TicketFileFormat;
}
import { TicketType, TicketFileFormat } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { Ticket, TicketSearchFilter, DuplicateGroup } from "@bundle:com.example.filesmanger/entry/ets/common/model/Ticket";
import type { ConsumptionEvent } from '../common/model/ConsumptionEvent';
import { TicketUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/TicketUtil";
import type { TicketGenerateParams } from '../common/utils/ticket/TicketGenerator';
import { SandboxFileUtil } from "@bundle:com.example.filesmanger/entry/ets/common/utils/sandbox/SandboxFileUtil";
import { SandboxFileItemType } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import type { SandboxFileItem } from "@bundle:com.example.filesmanger/entry/ets/common/model/SandboxFileItem";
import promptAction from "@ohos:promptAction";
import picker from "@ohos:file.picker";
import fileIo from "@ohos:file.fs";
export class TicketListTab extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__tickets = new ObservedPropertyObjectPU([], this, "tickets");
        this.__keyword = new ObservedPropertySimplePU('', this, "keyword");
        this.__duplicateIds = new ObservedPropertyObjectPU([], this, "duplicateIds");
        this.__duplicateGroups = new ObservedPropertyObjectPU([], this, "duplicateGroups");
        this.__expandedGroupIds = new ObservedPropertyObjectPU([], this, "expandedGroupIds");
        this.__showDuplicateGroups = new ObservedPropertySimplePU(false, this, "showDuplicateGroups");
        this.__minAmount = new ObservedPropertySimplePU('', this, "minAmount");
        this.__maxAmount = new ObservedPropertySimplePU('', this, "maxAmount");
        this.__showAdvancedSearch = new ObservedPropertySimplePU(false, this, "showAdvancedSearch");
        this.__searchMerchant = new ObservedPropertySimplePU('', this, "searchMerchant");
        this.__searchStartDate = new ObservedPropertySimplePU('', this, "searchStartDate");
        this.__searchEndDate = new ObservedPropertySimplePU('', this, "searchEndDate");
        this.__selectedTypes = new ObservedPropertyObjectPU([], this, "selectedTypes");
        this.__sortBy = new ObservedPropertySimplePU('date', this, "sortBy");
        this.__sortAsc = new ObservedPropertySimplePU(false, this, "sortAsc");
        this.__consumptionEvents = new ObservedPropertyObjectPU([], this, "consumptionEvents");
        this.__expandedEventIds = new ObservedPropertyObjectPU([], this, "expandedEventIds");
        this.__viewMode = new ObservedPropertySimplePU('list', this, "viewMode");
        this.__showCreateDialog = new ObservedPropertySimplePU(false, this, "showCreateDialog");
        this.__selectedTicket = new ObservedPropertyObjectPU(null, this, "selectedTicket");
        this.__showTicketDetail = new ObservedPropertySimplePU(false, this, "showTicketDetail");
        this.__ticketContent = new ObservedPropertySimplePU('', this, "ticketContent");
        this.__currentPath = new ObservedPropertySimplePU('', this, "currentPath");
        this.__pathHistory = new ObservedPropertyObjectPU([], this, "pathHistory");
        this.__folders = new ObservedPropertyObjectPU([], this, "folders");
        this.__isRecursiveMode = new ObservedPropertySimplePU(true, this, "isRecursiveMode");
        this.__formMerchant = new ObservedPropertySimplePU('', this, "formMerchant");
        this.__formAmount = new ObservedPropertySimplePU('', this, "formAmount");
        this.__formInvoiceCode = new ObservedPropertySimplePU('', this, "formInvoiceCode");
        this.__formOrderNumber = new ObservedPropertySimplePU('', this, "formOrderNumber");
        this.__formLocation = new ObservedPropertySimplePU('', this, "formLocation");
        this.__formRemark = new ObservedPropertySimplePU('', this, "formRemark");
        this.__formType = new ObservedPropertySimplePU(TicketType.CATERING, this, "formType");
        this.__formFormat = new ObservedPropertySimplePU(TicketFileFormat.TXT, this, "formFormat");
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
        if (params.duplicateGroups !== undefined) {
            this.duplicateGroups = params.duplicateGroups;
        }
        if (params.expandedGroupIds !== undefined) {
            this.expandedGroupIds = params.expandedGroupIds;
        }
        if (params.showDuplicateGroups !== undefined) {
            this.showDuplicateGroups = params.showDuplicateGroups;
        }
        if (params.minAmount !== undefined) {
            this.minAmount = params.minAmount;
        }
        if (params.maxAmount !== undefined) {
            this.maxAmount = params.maxAmount;
        }
        if (params.showAdvancedSearch !== undefined) {
            this.showAdvancedSearch = params.showAdvancedSearch;
        }
        if (params.searchMerchant !== undefined) {
            this.searchMerchant = params.searchMerchant;
        }
        if (params.searchStartDate !== undefined) {
            this.searchStartDate = params.searchStartDate;
        }
        if (params.searchEndDate !== undefined) {
            this.searchEndDate = params.searchEndDate;
        }
        if (params.selectedTypes !== undefined) {
            this.selectedTypes = params.selectedTypes;
        }
        if (params.sortBy !== undefined) {
            this.sortBy = params.sortBy;
        }
        if (params.sortAsc !== undefined) {
            this.sortAsc = params.sortAsc;
        }
        if (params.consumptionEvents !== undefined) {
            this.consumptionEvents = params.consumptionEvents;
        }
        if (params.expandedEventIds !== undefined) {
            this.expandedEventIds = params.expandedEventIds;
        }
        if (params.viewMode !== undefined) {
            this.viewMode = params.viewMode;
        }
        if (params.showCreateDialog !== undefined) {
            this.showCreateDialog = params.showCreateDialog;
        }
        if (params.selectedTicket !== undefined) {
            this.selectedTicket = params.selectedTicket;
        }
        if (params.showTicketDetail !== undefined) {
            this.showTicketDetail = params.showTicketDetail;
        }
        if (params.ticketContent !== undefined) {
            this.ticketContent = params.ticketContent;
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
        if (params.formMerchant !== undefined) {
            this.formMerchant = params.formMerchant;
        }
        if (params.formAmount !== undefined) {
            this.formAmount = params.formAmount;
        }
        if (params.formInvoiceCode !== undefined) {
            this.formInvoiceCode = params.formInvoiceCode;
        }
        if (params.formOrderNumber !== undefined) {
            this.formOrderNumber = params.formOrderNumber;
        }
        if (params.formLocation !== undefined) {
            this.formLocation = params.formLocation;
        }
        if (params.formRemark !== undefined) {
            this.formRemark = params.formRemark;
        }
        if (params.formType !== undefined) {
            this.formType = params.formType;
        }
        if (params.formFormat !== undefined) {
            this.formFormat = params.formFormat;
        }
    }
    updateStateVars(params: TicketListTab_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__tickets.purgeDependencyOnElmtId(rmElmtId);
        this.__keyword.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateIds.purgeDependencyOnElmtId(rmElmtId);
        this.__duplicateGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__expandedGroupIds.purgeDependencyOnElmtId(rmElmtId);
        this.__showDuplicateGroups.purgeDependencyOnElmtId(rmElmtId);
        this.__minAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__maxAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__showAdvancedSearch.purgeDependencyOnElmtId(rmElmtId);
        this.__searchMerchant.purgeDependencyOnElmtId(rmElmtId);
        this.__searchStartDate.purgeDependencyOnElmtId(rmElmtId);
        this.__searchEndDate.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedTypes.purgeDependencyOnElmtId(rmElmtId);
        this.__sortBy.purgeDependencyOnElmtId(rmElmtId);
        this.__sortAsc.purgeDependencyOnElmtId(rmElmtId);
        this.__consumptionEvents.purgeDependencyOnElmtId(rmElmtId);
        this.__expandedEventIds.purgeDependencyOnElmtId(rmElmtId);
        this.__viewMode.purgeDependencyOnElmtId(rmElmtId);
        this.__showCreateDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedTicket.purgeDependencyOnElmtId(rmElmtId);
        this.__showTicketDetail.purgeDependencyOnElmtId(rmElmtId);
        this.__ticketContent.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPath.purgeDependencyOnElmtId(rmElmtId);
        this.__pathHistory.purgeDependencyOnElmtId(rmElmtId);
        this.__folders.purgeDependencyOnElmtId(rmElmtId);
        this.__isRecursiveMode.purgeDependencyOnElmtId(rmElmtId);
        this.__formMerchant.purgeDependencyOnElmtId(rmElmtId);
        this.__formAmount.purgeDependencyOnElmtId(rmElmtId);
        this.__formInvoiceCode.purgeDependencyOnElmtId(rmElmtId);
        this.__formOrderNumber.purgeDependencyOnElmtId(rmElmtId);
        this.__formLocation.purgeDependencyOnElmtId(rmElmtId);
        this.__formRemark.purgeDependencyOnElmtId(rmElmtId);
        this.__formType.purgeDependencyOnElmtId(rmElmtId);
        this.__formFormat.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__tickets.aboutToBeDeleted();
        this.__keyword.aboutToBeDeleted();
        this.__duplicateIds.aboutToBeDeleted();
        this.__duplicateGroups.aboutToBeDeleted();
        this.__expandedGroupIds.aboutToBeDeleted();
        this.__showDuplicateGroups.aboutToBeDeleted();
        this.__minAmount.aboutToBeDeleted();
        this.__maxAmount.aboutToBeDeleted();
        this.__showAdvancedSearch.aboutToBeDeleted();
        this.__searchMerchant.aboutToBeDeleted();
        this.__searchStartDate.aboutToBeDeleted();
        this.__searchEndDate.aboutToBeDeleted();
        this.__selectedTypes.aboutToBeDeleted();
        this.__sortBy.aboutToBeDeleted();
        this.__sortAsc.aboutToBeDeleted();
        this.__consumptionEvents.aboutToBeDeleted();
        this.__expandedEventIds.aboutToBeDeleted();
        this.__viewMode.aboutToBeDeleted();
        this.__showCreateDialog.aboutToBeDeleted();
        this.__selectedTicket.aboutToBeDeleted();
        this.__showTicketDetail.aboutToBeDeleted();
        this.__ticketContent.aboutToBeDeleted();
        this.__currentPath.aboutToBeDeleted();
        this.__pathHistory.aboutToBeDeleted();
        this.__folders.aboutToBeDeleted();
        this.__isRecursiveMode.aboutToBeDeleted();
        this.__formMerchant.aboutToBeDeleted();
        this.__formAmount.aboutToBeDeleted();
        this.__formInvoiceCode.aboutToBeDeleted();
        this.__formOrderNumber.aboutToBeDeleted();
        this.__formLocation.aboutToBeDeleted();
        this.__formRemark.aboutToBeDeleted();
        this.__formType.aboutToBeDeleted();
        this.__formFormat.aboutToBeDeleted();
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
    private __duplicateIds: ObservedPropertyObjectPU<string[]>;
    get duplicateIds() {
        return this.__duplicateIds.get();
    }
    set duplicateIds(newValue: string[]) {
        this.__duplicateIds.set(newValue);
    }
    private __duplicateGroups: ObservedPropertyObjectPU<DuplicateGroup[]>;
    get duplicateGroups() {
        return this.__duplicateGroups.get();
    }
    set duplicateGroups(newValue: DuplicateGroup[]) {
        this.__duplicateGroups.set(newValue);
    }
    private __expandedGroupIds: ObservedPropertyObjectPU<string[]>;
    get expandedGroupIds() {
        return this.__expandedGroupIds.get();
    }
    set expandedGroupIds(newValue: string[]) {
        this.__expandedGroupIds.set(newValue);
    }
    private __showDuplicateGroups: ObservedPropertySimplePU<boolean>;
    get showDuplicateGroups() {
        return this.__showDuplicateGroups.get();
    }
    set showDuplicateGroups(newValue: boolean) {
        this.__showDuplicateGroups.set(newValue);
    }
    private __minAmount: ObservedPropertySimplePU<string>;
    get minAmount() {
        return this.__minAmount.get();
    }
    set minAmount(newValue: string) {
        this.__minAmount.set(newValue);
    }
    private __maxAmount: ObservedPropertySimplePU<string>;
    get maxAmount() {
        return this.__maxAmount.get();
    }
    set maxAmount(newValue: string) {
        this.__maxAmount.set(newValue);
    }
    private __showAdvancedSearch: ObservedPropertySimplePU<boolean>;
    get showAdvancedSearch() {
        return this.__showAdvancedSearch.get();
    }
    set showAdvancedSearch(newValue: boolean) {
        this.__showAdvancedSearch.set(newValue);
    }
    // 高级搜索新增状态
    private __searchMerchant: ObservedPropertySimplePU<string>;
    get searchMerchant() {
        return this.__searchMerchant.get();
    }
    set searchMerchant(newValue: string) {
        this.__searchMerchant.set(newValue);
    }
    private __searchStartDate: ObservedPropertySimplePU<string>;
    get searchStartDate() {
        return this.__searchStartDate.get();
    }
    set searchStartDate(newValue: string) {
        this.__searchStartDate.set(newValue);
    }
    private __searchEndDate: ObservedPropertySimplePU<string>;
    get searchEndDate() {
        return this.__searchEndDate.get();
    }
    set searchEndDate(newValue: string) {
        this.__searchEndDate.set(newValue);
    }
    private __selectedTypes: ObservedPropertyObjectPU<TicketType[]>;
    get selectedTypes() {
        return this.__selectedTypes.get();
    }
    set selectedTypes(newValue: TicketType[]) {
        this.__selectedTypes.set(newValue);
    }
    private __sortBy: ObservedPropertySimplePU<string>;
    get sortBy() {
        return this.__sortBy.get();
    }
    set sortBy(newValue: string) {
        this.__sortBy.set(newValue);
    }
    private __sortAsc: ObservedPropertySimplePU<boolean>;
    get sortAsc() {
        return this.__sortAsc.get();
    }
    set sortAsc(newValue: boolean) {
        this.__sortAsc.set(newValue);
    }
    // 事件分组状态
    private __consumptionEvents: ObservedPropertyObjectPU<ConsumptionEvent[]>;
    get consumptionEvents() {
        return this.__consumptionEvents.get();
    }
    set consumptionEvents(newValue: ConsumptionEvent[]) {
        this.__consumptionEvents.set(newValue);
    }
    private __expandedEventIds: ObservedPropertyObjectPU<string[]>;
    get expandedEventIds() {
        return this.__expandedEventIds.get();
    }
    set expandedEventIds(newValue: string[]) {
        this.__expandedEventIds.set(newValue);
    }
    private __viewMode: ObservedPropertySimplePU<string>; // 'list' | 'events' | 'duplicates'
    get viewMode() {
        return this.__viewMode.get();
    }
    set viewMode(newValue: string) {
        this.__viewMode.set(newValue);
    }
    private __showCreateDialog: ObservedPropertySimplePU<boolean>;
    get showCreateDialog() {
        return this.__showCreateDialog.get();
    }
    set showCreateDialog(newValue: boolean) {
        this.__showCreateDialog.set(newValue);
    }
    private __selectedTicket: ObservedPropertyObjectPU<Ticket | null>;
    get selectedTicket() {
        return this.__selectedTicket.get();
    }
    set selectedTicket(newValue: Ticket | null) {
        this.__selectedTicket.set(newValue);
    }
    private __showTicketDetail: ObservedPropertySimplePU<boolean>;
    get showTicketDetail() {
        return this.__showTicketDetail.get();
    }
    set showTicketDetail(newValue: boolean) {
        this.__showTicketDetail.set(newValue);
    }
    private __ticketContent: ObservedPropertySimplePU<string>;
    get ticketContent() {
        return this.__ticketContent.get();
    }
    set ticketContent(newValue: string) {
        this.__ticketContent.set(newValue);
    }
    // 文件夹导航状态
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
    // 自定义票据表单状态
    private __formMerchant: ObservedPropertySimplePU<string>;
    get formMerchant() {
        return this.__formMerchant.get();
    }
    set formMerchant(newValue: string) {
        this.__formMerchant.set(newValue);
    }
    private __formAmount: ObservedPropertySimplePU<string>;
    get formAmount() {
        return this.__formAmount.get();
    }
    set formAmount(newValue: string) {
        this.__formAmount.set(newValue);
    }
    private __formInvoiceCode: ObservedPropertySimplePU<string>;
    get formInvoiceCode() {
        return this.__formInvoiceCode.get();
    }
    set formInvoiceCode(newValue: string) {
        this.__formInvoiceCode.set(newValue);
    }
    private __formOrderNumber: ObservedPropertySimplePU<string>;
    get formOrderNumber() {
        return this.__formOrderNumber.get();
    }
    set formOrderNumber(newValue: string) {
        this.__formOrderNumber.set(newValue);
    }
    private __formLocation: ObservedPropertySimplePU<string>;
    get formLocation() {
        return this.__formLocation.get();
    }
    set formLocation(newValue: string) {
        this.__formLocation.set(newValue);
    }
    private __formRemark: ObservedPropertySimplePU<string>;
    get formRemark() {
        return this.__formRemark.get();
    }
    set formRemark(newValue: string) {
        this.__formRemark.set(newValue);
    }
    private __formType: ObservedPropertySimplePU<TicketType>;
    get formType() {
        return this.__formType.get();
    }
    set formType(newValue: TicketType) {
        this.__formType.set(newValue);
    }
    private __formFormat: ObservedPropertySimplePU<TicketFileFormat>;
    get formFormat() {
        return this.__formFormat.get();
    }
    set formFormat(newValue: TicketFileFormat) {
        this.__formFormat.set(newValue);
    }
    aboutToAppear() {
        const root = SandboxFileUtil.getSandboxRootDir();
        this.currentPath = root;
        const files = SandboxFileUtil.listChildren(root);
        if (files.length === 0) {
            SandboxFileUtil.initMockDataToSandbox();
        }
        this.loadTicketsAsync();
    }
    private loadTicketsAsync() {
        const searchDir = this.currentPath.length > 0 ? this.currentPath : SandboxFileUtil.getSandboxRootDir();
        // 获取当前目录的文件夹列表
        const children = SandboxFileUtil.listChildren(searchDir);
        this.folders = children.filter(item => item.type === SandboxFileItemType.DIRECTORY);
        // 根据模式获取文件
        let files: SandboxFileItem[] = [];
        if (this.isRecursiveMode) {
            files = SandboxFileUtil.listAllFilesRecursive(searchDir);
        }
        else {
            files = children.filter(item => item.type === SandboxFileItemType.FILE);
        }
        // 异步处理所有文件
        this.processFilesAsync(files);
    }
    private async processFilesAsync(files: SandboxFileItem[]): Promise<void> {
        const allTickets: Ticket[] = [];
        for (const file of files) {
            const ticket = await TicketUtil.processFileAsync(file);
            allTickets.push(ticket);
        }
        // 整理票据到分类目录
        TicketUtil.organizeTickets(allTickets);
        // 使用高级搜索过滤
        const filter: TicketSearchFilter = {
            keyword: this.keyword.trim(),
            merchantName: this.searchMerchant.trim(),
            minAmount: this.minAmount ? parseFloat(this.minAmount) : 0,
            maxAmount: this.maxAmount ? parseFloat(this.maxAmount) : 0,
            startDate: this.parseDate(this.searchStartDate),
            endDate: this.parseDate(this.searchEndDate, true),
            types: this.selectedTypes
        };
        let results = TicketUtil.searchTickets(allTickets, filter);
        // 排序
        results = this.sortTickets(results);
        this.tickets = results;
        const dups = TicketUtil.findDuplicates(this.tickets);
        this.duplicateIds = dups.map(d => d.id);
        this.duplicateGroups = TicketUtil.getDuplicateGroups(this.tickets);
        // 计算事件关联
        this.consumptionEvents = TicketUtil.associateEvents(this.tickets);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索栏
            Row.create();
            // 搜索栏
            Row.width('100%');
            // 搜索栏
            Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '搜索商家、类型或发票号', text: this.keyword });
            TextInput.layoutWeight(1);
            TextInput.height(40);
            TextInput.backgroundColor({ "id": 16777235, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            TextInput.borderRadius(12);
            TextInput.onChange((value: string) => {
                this.keyword = value;
                this.loadTicketsAsync();
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('高级');
            Button.fontColor('#007DFF');
            Button.height(40);
            Button.margin({ left: 8 });
            Button.backgroundColor({ "id": 16777232, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Button.onClick(() => {
                this.showAdvancedSearch = !this.showAdvancedSearch;
            });
        }, Button);
        Button.pop();
        // 搜索栏
        Row.pop();
        // 路径导航栏
        this.buildPathNavigation.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 文件夹列表
            if (this.folders.length > 0 && !this.isRecursiveMode) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildFolderList.bind(this)();
                });
            }
            // 高级搜索面板
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 高级搜索面板
            if (this.showAdvancedSearch) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildAdvancedSearchPanel.bind(this)();
                });
            }
            // 视图切换栏
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 视图切换栏
        this.buildViewModeSelector.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 内容区域
            if (this.tickets.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无票据');
                        Text.fontSize(16);
                        Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
                        Text.opacity(0.6);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.viewMode === 'events') {
                this.ifElseBranchUpdateFunction(1, () => {
                    // 事件分组视图
                    this.buildEventsList.bind(this)();
                });
            }
            else if (this.viewMode === 'duplicates') {
                this.ifElseBranchUpdateFunction(2, () => {
                    // 重复票据视图
                    this.buildDuplicatesList.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                    // 普通列表视图
                    this.buildMixedList.bind(this)();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 底部操作按钮
            Row.create();
            // 底部操作按钮
            Row.width('100%');
            // 底部操作按钮
            Row.padding({ left: 16, right: 16, bottom: 16, top: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('生成票据');
            Button.layoutWeight(1);
            Button.height(44);
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.showCreateDialog = true;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('上传票据');
            Button.layoutWeight(1);
            Button.height(44);
            Button.margin({ left: 8 });
            Button.backgroundColor('#4CAF50');
            Button.onClick(() => {
                this.uploadTicket();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('测试数据');
            Button.layoutWeight(1);
            Button.height(44);
            Button.margin({ left: 8 });
            Button.backgroundColor('#FF9800');
            Button.onClick(() => {
                this.generateTestData();
            });
        }, Button);
        Button.pop();
        // 底部操作按钮
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 创建票据对话框
            if (this.showCreateDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildCreateDialog.bind(this)();
                });
            }
            // 票据详情弹窗
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 票据详情弹窗
            if (this.showTicketDetail) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildTicketDetailDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
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
    private createMockTicket(): void {
        const types = [
            TicketType.CATERING,
            TicketType.TRANSPORT,
            TicketType.HOTEL,
            TicketType.SHOPPING
        ];
        const merchants = ['星巴克', '滴滴出行', '如家酒店', '京东商城', '美团外卖'];
        const locations = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomAmount = Math.floor(Math.random() * 500) + 50;
        const params: TicketGenerateParams = {
            merchantName: randomMerchant,
            amount: randomAmount,
            date: Math.floor(Date.now() / 1000),
            type: randomType,
            invoiceCode: 'INV' + Date.now(),
            orderNumber: 'ORD' + Date.now(),
            location: randomLocation,
            format: TicketFileFormat.TXT,
            remark: ''
        };
        TicketUtil.generateTicket(params);
        promptAction.showToast({ message: '票据已生成' });
        this.loadTicketsAsync();
    }
    private generateTestData(): void {
        TicketUtil.generateTestTickets();
        promptAction.showToast({ message: '测试数据已生成' });
        this.loadTicketsAsync();
    }
    /**
     * 解析日期字符串为时间戳
     */
    private parseDate(dateStr: string, isEndOfDay: boolean = false): number {
        if (dateStr.length === 0) {
            return 0;
        }
        const parts = dateStr.split('-');
        if (parts.length !== 3) {
            return 0;
        }
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return 0;
        }
        const date = new Date(year, month, day);
        if (isEndOfDay) {
            date.setHours(23, 59, 59, 999);
        }
        return Math.floor(date.getTime() / 1000);
    }
    /**
     * 排序票据
     */
    private sortTickets(tickets: Ticket[]): Ticket[] {
        const sorted = tickets.slice();
        sorted.sort((a: Ticket, b: Ticket) => {
            let cmp = 0;
            if (this.sortBy === 'date') {
                cmp = a.date - b.date;
            }
            else if (this.sortBy === 'amount') {
                cmp = a.amount - b.amount;
            }
            else if (this.sortBy === 'merchant') {
                cmp = a.merchantName.localeCompare(b.merchantName);
            }
            return this.sortAsc ? cmp : -cmp;
        });
        return sorted;
    }
    /**
     * 切换类型选择
     */
    private toggleTypeSelection(type: TicketType): void {
        const index = this.selectedTypes.indexOf(type);
        if (index >= 0) {
            this.selectedTypes = this.selectedTypes.filter(t => t !== type);
        }
        else {
            this.selectedTypes = this.selectedTypes.concat([type]);
        }
    }
    /**
     * 重置搜索条件
     */
    private resetSearch(): void {
        this.keyword = '';
        this.searchMerchant = '';
        this.minAmount = '';
        this.maxAmount = '';
        this.searchStartDate = '';
        this.searchEndDate = '';
        this.selectedTypes = [];
        this.sortBy = 'date';
        this.sortAsc = false;
        this.loadTicketsAsync();
    }
    private uploadTicket(): void {
        try {
            const documentPicker = new picker.DocumentViewPicker();
            documentPicker.select({
                maxSelectNumber: 5,
                fileSuffixFilters: ['.txt', '.pdf', '.ofd']
            }).then((uris: string[]) => {
                if (uris.length > 0) {
                    this.copyFilesToSandbox(uris);
                }
            }).catch(() => {
                promptAction.showToast({ message: '选择文件失败' });
            });
        }
        catch (error) {
            promptAction.showToast({ message: '上传失败' });
        }
    }
    private copyFilesToSandbox(uris: string[]): void {
        // 先复制到临时目录，解析后再移动到分类目录
        const tempDir = SandboxFileUtil.getSandboxRootDir() + '/tickets/temp';
        SandboxFileUtil.createDir(tempDir);
        let successCount: number = 0;
        for (const uri of uris) {
            try {
                const fileName = this.getFileNameFromUri(uri);
                const tempPath = tempDir + '/' + fileName;
                const success = this.copyFileFromUri(uri, tempPath);
                if (success) {
                    // 异步解析并移动到分类目录
                    this.parseAndMoveFile(tempPath, fileName);
                    successCount = successCount + 1;
                }
            }
            catch (e) {
                // 继续处理下一个文件
            }
        }
        if (successCount > 0) {
            promptAction.showToast({
                message: '成功上传 ' + successCount + ' 个文件，正在分类...'
            });
        }
        else {
            promptAction.showToast({ message: '上传失败' });
        }
    }
    private async parseAndMoveFile(filePath: string, fileName: string): Promise<void> {
        try {
            // 创建临时文件项
            const tempFile: SandboxFileItem = {
                path: filePath,
                name: fileName,
                type: SandboxFileItemType.FILE,
                size: 0,
                modifiedTime: Math.floor(Date.now() / 1000)
            };
            // 异步解析票据获取类型
            const ticket = await TicketUtil.processFileAsync(tempFile);
            // 移动到对应分类目录
            TicketUtil.moveTicketToTypedDir(ticket);
            // 刷新列表
            this.loadTicketsAsync();
        }
        catch (e) {
            // 解析失败，保留在临时目录
        }
    }
    private getFileNameFromUri(uri: string): string {
        const parts = uri.split('/');
        let name = parts[parts.length - 1];
        if (name.indexOf('.') < 0) {
            name = 'ticket_' + Date.now() + '.txt';
        }
        return name;
    }
    private copyFileFromUri(uri: string, destPath: string): boolean {
        try {
            const file = fileIo.openSync(uri, fileIo.OpenMode.READ_ONLY);
            const stat = fileIo.statSync(uri);
            const buf = new ArrayBuffer(stat.size);
            fileIo.readSync(file.fd, buf);
            fileIo.closeSync(file);
            const destFile = fileIo.openSync(destPath, fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY);
            fileIo.writeSync(destFile.fd, buf);
            fileIo.closeSync(destFile);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    buildCreateDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('rgba(0,0,0,0.5)');
            Column.justifyContent(FlexAlign.Start);
            Column.padding({ top: 48 });
            Column.onClick(() => {
                this.showCreateDialog = false;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('90%');
            Column.padding(20);
            Column.padding({ bottom: 28 });
            Column.backgroundColor(Color.White);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 标题
            Text.create('创建票据');
            // 标题
            Text.fontSize(20);
            // 标题
            Text.fontWeight(FontWeight.Bold);
            // 标题
            Text.margin({ bottom: 16 });
        }, Text);
        // 标题
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 表单内容
            Scroll.create();
            // 表单内容
            Scroll.height(320);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ bottom: 12 });
        }, Column);
        this.buildFormInput.bind(this)('商户名称', '请输入商户名称', this.formMerchant, (v: string) => {
            this.formMerchant = v;
        });
        this.buildFormInput.bind(this)('金额', '请输入金额', this.formAmount, (v: string) => {
            this.formAmount = v;
        }, InputType.Number);
        this.buildFormInput.bind(this)('发票代码', '请输入发票代码', this.formInvoiceCode, (v: string) => {
            this.formInvoiceCode = v;
        });
        this.buildFormInput.bind(this)('订单号', '请输入订单号', this.formOrderNumber, (v: string) => {
            this.formOrderNumber = v;
        });
        this.buildFormInput.bind(this)('消费地点', '请输入消费地点', this.formLocation, (v: string) => {
            this.formLocation = v;
        });
        this.buildTypeSelector.bind(this)();
        this.buildFormatSelector.bind(this)();
        this.buildRemarkInput.bind(this)();
        Column.pop();
        // 表单内容
        Scroll.pop();
        // 按钮
        this.buildDialogButtons.bind(this)();
        Column.pop();
        Column.pop();
    }
    buildFormInput(label: string, placeholder: string, value: string, onChange: (v: string) => void, inputType: InputType = InputType.Normal, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: placeholder, text: value });
            TextInput.height(40);
            TextInput.width('100%');
            TextInput.type(inputType);
            TextInput.margin({ top: 4 });
            TextInput.onChange(onChange);
        }, TextInput);
        Column.pop();
    }
    buildTypeSelector(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('消费类型');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const type = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(type);
                    Text.fontSize(12);
                    Text.fontColor(this.formType === type ? Color.White : '#333333');
                    Text.backgroundColor(this.formType === type ? '#007DFF' : '#F5F5F5');
                    Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                    Text.borderRadius(16);
                    Text.margin({ right: 8, bottom: 8 });
                    Text.onClick(() => {
                        this.formType = type;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.getTypeOptions(), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
    }
    buildFormatSelector(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('保存格式');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const format = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(format.toUpperCase());
                    Text.fontSize(12);
                    Text.fontColor(this.formFormat === format ? Color.White : '#333333');
                    Text.backgroundColor(this.formFormat === format ? '#4CAF50' : '#F5F5F5');
                    Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                    Text.borderRadius(8);
                    Text.margin({ right: 12 });
                    Text.onClick(() => {
                        this.formFormat = format;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.getFormatOptions(), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Column.pop();
    }
    buildRemarkInput(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('备注');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextArea.create({ placeholder: '请输入备注信息', text: this.formRemark });
            TextArea.height(60);
            TextArea.width('100%');
            TextArea.margin({ top: 4 });
            TextArea.onChange((value: string) => {
                this.formRemark = value;
            });
        }, TextArea);
        Column.pop();
    }
    buildDialogButtons(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(40);
            Button.backgroundColor('#F5F5F5');
            Button.fontColor('#666666');
            Button.onClick(() => {
                this.showCreateDialog = false;
                this.resetForm();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('创建');
            Button.layoutWeight(1);
            Button.height(40);
            Button.margin({ left: 12 });
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.handleCreateTicket();
            });
        }, Button);
        Button.pop();
        Row.pop();
    }
    private getTypeOptions(): TicketType[] {
        return [
            TicketType.CATERING,
            TicketType.TRANSPORT,
            TicketType.HOTEL,
            TicketType.SHOPPING,
            TicketType.ENTERTAINMENT,
            TicketType.OTHER
        ];
    }
    private getFormatOptions(): TicketFileFormat[] {
        return [
            TicketFileFormat.TXT,
            TicketFileFormat.PDF,
            TicketFileFormat.OFD
        ];
    }
    private resetForm(): void {
        this.formMerchant = '';
        this.formAmount = '';
        this.formInvoiceCode = '';
        this.formOrderNumber = '';
        this.formLocation = '';
        this.formRemark = '';
        this.formType = TicketType.CATERING;
        this.formFormat = TicketFileFormat.TXT;
    }
    private handleCreateTicket(): void {
        const params: TicketGenerateParams = {
            merchantName: this.formMerchant.length > 0 ? this.formMerchant : '未知商户',
            amount: this.formAmount.length > 0 ? parseFloat(this.formAmount) : 0,
            date: Math.floor(Date.now() / 1000),
            type: this.formType,
            invoiceCode: this.formInvoiceCode.length > 0 ? this.formInvoiceCode : 'INV' + Date.now(),
            orderNumber: this.formOrderNumber.length > 0 ? this.formOrderNumber : 'ORD' + Date.now(),
            location: this.formLocation.length > 0 ? this.formLocation : '未知地点',
            format: this.formFormat,
            remark: this.formRemark
        };
        TicketUtil.generateTicket(params);
        promptAction.showToast({ message: '票据已创建：' + this.formFormat.toUpperCase() + '格式' });
        this.showCreateDialog = false;
        this.resetForm();
        this.loadTicketsAsync();
    }
    private exportTicket(ticket: Ticket): void {
        try {
            const documentPicker = new picker.DocumentViewPicker();
            documentPicker.save({
                newFileNames: [ticket.file.name]
            }).then((result: string[]) => {
                if (result.length > 0) {
                    promptAction.showToast({ message: '票据已导出' });
                }
            });
        }
        catch (error) {
            promptAction.showToast({ message: '导出失败' });
        }
    }
    buildAdvancedSearchPanel(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding(16);
            Column.backgroundColor('#F5F5F5');
            Column.borderRadius(8);
            Column.margin({ left: 16, right: 16, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 商家名称搜索
            Row.create();
            // 商家名称搜索
            Row.width('100%');
            // 商家名称搜索
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('商家名称：');
            Text.fontSize(14);
            Text.width(80);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入商家名称', text: this.searchMerchant });
            TextInput.layoutWeight(1);
            TextInput.height(36);
            TextInput.onChange((v: string) => {
                this.searchMerchant = v;
            });
        }, TextInput);
        // 商家名称搜索
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 金额范围
            Row.create();
            // 金额范围
            Row.width('100%');
            // 金额范围
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('金额范围：');
            Text.fontSize(14);
            Text.width(80);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '最小', text: this.minAmount });
            TextInput.layoutWeight(1);
            TextInput.height(36);
            TextInput.type(InputType.Number);
            TextInput.onChange((v: string) => {
                this.minAmount = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(' - ');
            Text.margin({ left: 8, right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '最大', text: this.maxAmount });
            TextInput.layoutWeight(1);
            TextInput.height(36);
            TextInput.type(InputType.Number);
            TextInput.onChange((v: string) => {
                this.maxAmount = v;
            });
        }, TextInput);
        // 金额范围
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 日期范围
            Row.create();
            // 日期范围
            Row.width('100%');
            // 日期范围
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('日期范围：');
            Text.fontSize(14);
            Text.width(80);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: 'YYYY-MM-DD', text: this.searchStartDate });
            TextInput.layoutWeight(1);
            TextInput.height(36);
            TextInput.onChange((v: string) => {
                this.searchStartDate = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(' - ');
            Text.margin({ left: 8, right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: 'YYYY-MM-DD', text: this.searchEndDate });
            TextInput.layoutWeight(1);
            TextInput.height(36);
            TextInput.onChange((v: string) => {
                this.searchEndDate = v;
            });
        }, TextInput);
        // 日期范围
        Row.pop();
        // 快捷日期选择
        this.buildQuickDateButtons.bind(this)();
        // 类型筛选
        this.buildTypeFilter.bind(this)();
        // 排序选项
        this.buildSortOptions.bind(this)();
        // 操作按钮
        this.buildSearchButtons.bind(this)();
        Column.pop();
    }
    buildQuickDateButtons(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('快捷：');
            Text.fontSize(14);
            Text.width(80);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('今天');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.backgroundColor('#E3F2FD');
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                const today = this.formatDate(new Date());
                this.searchStartDate = today;
                this.searchEndDate = today;
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本周');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.backgroundColor('#E3F2FD');
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                const now = new Date();
                const dayOfWeek = now.getDay();
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const monday = new Date(now);
                monday.setDate(now.getDate() - diff);
                this.searchStartDate = this.formatDate(monday);
                this.searchEndDate = this.formatDate(now);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本月');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.backgroundColor('#E3F2FD');
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                this.searchStartDate = this.formatDate(firstDay);
                this.searchEndDate = this.formatDate(now);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('近30天');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.backgroundColor('#E3F2FD');
            Text.borderRadius(12);
            Text.onClick(() => {
                const now = new Date();
                const past = new Date(now);
                past.setDate(now.getDate() - 30);
                this.searchStartDate = this.formatDate(past);
                this.searchEndDate = this.formatDate(now);
            });
        }, Text);
        Text.pop();
        Row.pop();
    }
    buildTypeFilter(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('消费类型：');
            Text.fontSize(14);
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const type = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(type);
                    Text.fontSize(12);
                    Text.fontColor(this.selectedTypes.includes(type) ? Color.White : '#333333');
                    Text.backgroundColor(this.selectedTypes.includes(type) ? '#007DFF' : '#FFFFFF');
                    Text.padding({ left: 10, right: 10, top: 5, bottom: 5 });
                    Text.borderRadius(14);
                    Text.border({ width: 1, color: this.selectedTypes.includes(type) ? '#007DFF' : '#DDDDDD' });
                    Text.margin({ right: 8, bottom: 6 });
                    Text.onClick(() => {
                        this.toggleTypeSelection(type);
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.getTypeOptions(), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
    }
    buildSortOptions(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('排序：');
            Text.fontSize(14);
            Text.width(80);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('日期');
            Text.fontSize(12);
            Text.fontColor(this.sortBy === 'date' ? Color.White : '#333333');
            Text.backgroundColor(this.sortBy === 'date' ? '#4CAF50' : '#FFFFFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                if (this.sortBy === 'date') {
                    this.sortAsc = !this.sortAsc;
                }
                else {
                    this.sortBy = 'date';
                    this.sortAsc = false;
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('金额');
            Text.fontSize(12);
            Text.fontColor(this.sortBy === 'amount' ? Color.White : '#333333');
            Text.backgroundColor(this.sortBy === 'amount' ? '#4CAF50' : '#FFFFFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                if (this.sortBy === 'amount') {
                    this.sortAsc = !this.sortAsc;
                }
                else {
                    this.sortBy = 'amount';
                    this.sortAsc = false;
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('商家');
            Text.fontSize(12);
            Text.fontColor(this.sortBy === 'merchant' ? Color.White : '#333333');
            Text.backgroundColor(this.sortBy === 'merchant' ? '#4CAF50' : '#FFFFFF');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(12);
            Text.margin({ right: 8 });
            Text.onClick(() => {
                if (this.sortBy === 'merchant') {
                    this.sortAsc = !this.sortAsc;
                }
                else {
                    this.sortBy = 'merchant';
                    this.sortAsc = true;
                }
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.sortAsc ? '↑升序' : '↓降序');
            Text.fontSize(12);
            Text.fontColor('#666666');
        }, Text);
        Text.pop();
        Row.pop();
    }
    buildSearchButtons(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 6 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('搜索');
            Button.height(36);
            Button.layoutWeight(1);
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.loadTicketsAsync();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('重置');
            Button.height(36);
            Button.layoutWeight(1);
            Button.margin({ left: 12 });
            Button.backgroundColor('#999999');
            Button.onClick(() => {
                this.resetSearch();
            });
        }, Button);
        Button.pop();
        Row.pop();
    }
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const monthStr = month < 10 ? '0' + month : '' + month;
        const dayStr = day < 10 ? '0' + day : '' + day;
        return year + '-' + monthStr + '-' + dayStr;
    }
    buildViewModeSelector(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('列表');
            Text.fontSize(13);
            Text.fontColor(this.viewMode === 'list' ? Color.White : '#333333');
            Text.backgroundColor(this.viewMode === 'list' ? '#007DFF' : '#F0F0F0');
            Text.padding({ left: 14, right: 14, top: 6, bottom: 6 });
            Text.borderRadius(16);
            Text.onClick(() => { this.viewMode = 'list'; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('事件(' + this.consumptionEvents.length + ')');
            Text.fontSize(13);
            Text.fontColor(this.viewMode === 'events' ? Color.White : '#333333');
            Text.backgroundColor(this.viewMode === 'events' ? '#FF9800' : '#F0F0F0');
            Text.padding({ left: 14, right: 14, top: 6, bottom: 6 });
            Text.borderRadius(16);
            Text.margin({ left: 8 });
            Text.onClick(() => { this.viewMode = 'events'; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('重复(' + this.duplicateGroups.length + ')');
            Text.fontSize(13);
            Text.fontColor(this.viewMode === 'duplicates' ? Color.White : '#333333');
            Text.backgroundColor(this.viewMode === 'duplicates' ? '#F44336' : '#F0F0F0');
            Text.padding({ left: 14, right: 14, top: 6, bottom: 6 });
            Text.borderRadius(16);
            Text.margin({ left: 8 });
            Text.onClick(() => { this.viewMode = 'duplicates'; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.tickets.length + '张');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
    }
    buildEventsList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.layoutWeight(1);
            List.padding({ left: 16, right: 16 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const event = _item;
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
                            Column.create();
                            Column.width('100%');
                        }, Column);
                        this.buildEventHeader.bind(this)(event, index);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (this.expandedEventIds.includes(event.id)) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.buildEventTickets.bind(this)(event);
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                });
                            }
                        }, If);
                        If.pop();
                        Column.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.consumptionEvents, forEachItemGenFunction, (event: ConsumptionEvent) => event.id, true, false);
        }, ForEach);
        ForEach.pop();
        List.pop();
    }
    buildEventHeader(event: ConsumptionEvent, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor('#FFF8E1');
            Row.borderRadius(12);
            Row.margin({ bottom: 8 });
            Row.onClick(() => {
                this.toggleEventExpand(event.id);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(32);
            Column.height(32);
            Column.borderRadius(16);
            Column.backgroundColor(this.getEventColor(event.eventType));
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.margin({ right: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((index + 1).toString());
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(event.name);
            Text.fontSize(15);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(event.associationReason);
            Text.fontSize(12);
            Text.fontColor('#FF9800');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 2 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(event.tickets.length + '张票据');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (event.location.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(' · ' + event.location);
                        Text.fontSize(12);
                        Text.fontColor('#999999');
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
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + event.totalAmount.toFixed(2));
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FF9800');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.expandedEventIds.includes(event.id) ? '收起' : '展开');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    buildEventTickets(event: ConsumptionEvent, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const ticket = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                    Row.backgroundColor('#FFFDE7');
                    Row.borderRadius(8);
                    Row.margin({ bottom: 4, left: 16 });
                    Row.onClick(() => {
                        this.viewTicketDetail(ticket);
                    });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create((idx + 1).toString());
                    Text.fontSize(12);
                    Text.fontColor('#999999');
                    Text.width(20);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.alignItems(HorizontalAlign.Start);
                    Column.margin({ left: 8 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(ticket.itemDescription.length > 0 ? ticket.itemDescription : ticket.merchantName);
                    Text.fontSize(14);
                    Text.fontColor('#333333');
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(ticket.merchantName + ' · ' + new Date(ticket.date * 1000).toLocaleDateString());
                    Text.fontSize(11);
                    Text.fontColor('#999999');
                    Text.margin({ top: 2 });
                }, Text);
                Text.pop();
                Column.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('¥' + ticket.amount.toFixed(2));
                    Text.fontSize(14);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor('#FF9800');
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, event.tickets, forEachItemGenFunction, (ticket: Ticket) => ticket.id, true, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    buildDuplicatesList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.layoutWeight(1);
            List.padding({ left: 16, right: 16 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const group = _item;
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
                            Column.create();
                            Column.width('100%');
                        }, Column);
                        this.buildGroupHeader.bind(this)(group, index);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (this.isGroupExpanded(group.groupId)) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.buildGroupTicketsWithClick.bind(this)(group);
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                });
                            }
                        }, If);
                        If.pop();
                        Column.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.duplicateGroups, forEachItemGenFunction, (group: DuplicateGroup) => group.groupId, true, false);
        }, ForEach);
        ForEach.pop();
        List.pop();
    }
    private getEventColor(eventType: string): string {
        if (eventType === '差旅出行') {
            return '#2196F3';
        }
        else if (eventType === '聚餐活动') {
            return '#FF9800';
        }
        else if (eventType === '休闲娱乐') {
            return '#E91E63';
        }
        else if (eventType === '购物消费') {
            return '#4CAF50';
        }
        else {
            return '#9C27B0';
        }
    }
    private toggleEventExpand(eventId: string): void {
        if (this.expandedEventIds.includes(eventId)) {
            this.expandedEventIds = this.expandedEventIds.filter(id => id !== eventId);
        }
        else {
            this.expandedEventIds = this.expandedEventIds.concat([eventId]);
        }
    }
    buildPathNavigation(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 4, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 返回按钮
            if (this.pathHistory.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('<');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#007DFF');
                        Text.padding({ left: 8, right: 8 });
                        Text.onClick(() => {
                            this.goBack();
                        });
                    }, Text);
                    Text.pop();
                });
            }
            // 当前路径显示
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 当前路径显示
            Text.create(this.getDisplayPath());
            // 当前路径显示
            Text.fontSize(13);
            // 当前路径显示
            Text.fontColor('#666666');
            // 当前路径显示
            Text.layoutWeight(1);
            // 当前路径显示
            Text.maxLines(1);
            // 当前路径显示
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        // 当前路径显示
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 递归模式切换
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isRecursiveMode ? '全部' : '当前');
            Text.fontSize(12);
            Text.fontColor(this.isRecursiveMode ? Color.White : '#007DFF');
            Text.backgroundColor(this.isRecursiveMode ? '#007DFF' : '#E3F2FD');
            Text.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Text.borderRadius(12);
            Text.onClick(() => {
                this.isRecursiveMode = !this.isRecursiveMode;
                this.loadTicketsAsync();
            });
        }, Text);
        Text.pop();
        // 递归模式切换
        Row.pop();
        Row.pop();
        Column.pop();
    }
    buildFolderList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.layoutWeight(1);
            List.constraintSize({ maxHeight: 280 });
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
                            Row.backgroundColor('#F5F5F5');
                            Row.borderRadius(8);
                            Row.margin({ bottom: 4 });
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
                            Text.fontColor('#333333');
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
        this.loadTicketsAsync();
    }
    private goBack(): void {
        if (this.pathHistory.length > 0) {
            const prev = this.pathHistory.pop();
            if (prev !== undefined) {
                this.currentPath = prev;
                this.loadTicketsAsync();
            }
        }
    }
    private isGroupExpanded(groupId: string): boolean {
        return this.expandedGroupIds.includes(groupId);
    }
    private toggleGroupExpand(groupId: string): void {
        if (this.isGroupExpanded(groupId)) {
            this.expandedGroupIds = this.expandedGroupIds.filter(id => id !== groupId);
        }
        else {
            this.expandedGroupIds = this.expandedGroupIds.concat([groupId]);
        }
    }
    buildGroupHeader(group: DuplicateGroup, index: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor('#FFF8E1');
            Row.borderRadius(12);
            Row.margin({ bottom: 8 });
            Row.onClick(() => {
                this.toggleGroupExpand(group.groupId);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 分组图标
            Column.create();
            // 分组图标
            Column.width(32);
            // 分组图标
            Column.height(32);
            // 分组图标
            Column.borderRadius(16);
            // 分组图标
            Column.backgroundColor('#FF5722');
            // 分组图标
            Column.justifyContent(FlexAlign.Center);
            // 分组图标
            Column.alignItems(HorizontalAlign.Center);
            // 分组图标
            Column.margin({ right: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((index + 1).toString());
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        // 分组图标
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 分组信息
            Column.create();
            // 分组信息
            Column.layoutWeight(1);
            // 分组信息
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('重复组 #' + (index + 1));
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(group.reason);
            Text.fontSize(12);
            Text.fontColor('#FF5722');
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(group.tickets.length + ' 张票据');
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
        // 分组信息
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 金额和展开按钮
            Column.create();
            // 金额和展开按钮
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + group.totalAmount.toFixed(2));
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FF5722');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isGroupExpanded(group.groupId) ? '收起' : '展开');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        // 金额和展开按钮
        Column.pop();
        Row.pop();
    }
    private getNonDuplicateTickets(): Ticket[] {
        const duplicateTicketIds = new Set<string>();
        for (const group of this.duplicateGroups) {
            for (const ticket of group.tickets) {
                duplicateTicketIds.add(ticket.id);
            }
        }
        return this.tickets.filter(t => !duplicateTicketIds.has(t.id));
    }
    private viewTicketDetail(ticket: Ticket): void {
        this.selectedTicket = ticket;
        this.ticketContent = SandboxFileUtil.readTextFile(ticket.file.path);
        this.showTicketDetail = true;
    }
    buildMixedList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.layoutWeight(1);
            List.padding({ left: 16, right: 16 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 先显示重复分组
            ForEach.create();
            const forEachItemGenFunction = (_item, index: number) => {
                const group = _item;
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
                            Column.create();
                            Column.width('100%');
                        }, Column);
                        this.buildGroupHeader.bind(this)(group, index);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (this.isGroupExpanded(group.groupId)) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.buildGroupTicketsWithClick.bind(this)(group);
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                });
                            }
                        }, If);
                        If.pop();
                        Column.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.duplicateGroups, forEachItemGenFunction, (group: DuplicateGroup) => group.groupId, true, false);
        }, ForEach);
        // 先显示重复分组
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 再显示非重复票据
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
                        this.buildTicketItem.bind(this)(item);
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.getNonDuplicateTickets(), forEachItemGenFunction, (item: Ticket) => item.id, false, false);
        }, ForEach);
        // 再显示非重复票据
        ForEach.pop();
        List.pop();
    }
    buildTicketItem(item: Ticket, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor({ "id": 16777235, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Row.borderRadius(12);
            Row.margin({ bottom: 8 });
            Row.onClick(() => {
                this.viewTicketDetail(item);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(40);
            Column.height(40);
            Column.borderRadius(20);
            Column.backgroundColor(this.getTypeColor(item.type));
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.margin({ right: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.type.charAt(0));
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.itemDescription.length > 0 ? item.itemDescription : item.merchantName);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(item.merchantName);
            Text.fontSize(12);
            Text.fontColor('#666666');
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(new Date(item.date * 1000).toLocaleDateString());
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + item.amount.toFixed(2));
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Text);
        Text.pop();
        Row.pop();
    }
    buildGroupTicketsWithClick(group: DuplicateGroup, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const ticket = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create();
                    Row.width('100%');
                    Row.padding({ left: 12, right: 12, top: 8, bottom: 8 });
                    Row.backgroundColor('#FFFDE7');
                    Row.borderRadius(8);
                    Row.margin({ bottom: 4, left: 16 });
                    Row.onClick(() => {
                        this.viewTicketDetail(ticket);
                    });
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create((idx + 1).toString());
                    Text.fontSize(12);
                    Text.fontColor('#999999');
                    Text.width(20);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.alignItems(HorizontalAlign.Start);
                    Column.margin({ left: 8 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(ticket.itemDescription.length > 0 ? ticket.itemDescription : ticket.merchantName);
                    Text.fontSize(14);
                    Text.fontColor('#333333');
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(ticket.merchantName + ' · ' + new Date(ticket.date * 1000).toLocaleDateString());
                    Text.fontSize(11);
                    Text.fontColor('#999999');
                    Text.margin({ top: 2 });
                }, Text);
                Text.pop();
                Column.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('¥' + ticket.amount.toFixed(2));
                    Text.fontSize(14);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor('#FF5722');
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, group.tickets, forEachItemGenFunction, (ticket: Ticket) => ticket.id, true, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    buildTicketDetailDialog(parent = null) {
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
            Row.padding({ left: 16, right: 16, top: 16, bottom: 12 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('票据详情');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('X');
            Text.fontSize(18);
            Text.fontColor('#999999');
            Text.onClick(() => {
                this.showTicketDetail = false;
                this.selectedTicket = null;
                this.ticketContent = '';
            });
        }, Text);
        Text.pop();
        // 标题栏
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 票据基本信息
            if (this.selectedTicket !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.buildTicketInfo.bind(this)();
                });
            }
            // 文件内容
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // 文件内容
        this.buildFileContent.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 关闭按钮
            Button.createWithLabel('关闭');
            // 关闭按钮
            Button.width('90%');
            // 关闭按钮
            Button.height(44);
            // 关闭按钮
            Button.margin({ top: 16, bottom: 16 });
            // 关闭按钮
            Button.backgroundColor('#007DFF');
            // 关闭按钮
            Button.onClick(() => {
                this.showTicketDetail = false;
                this.selectedTicket = null;
                this.ticketContent = '';
            });
        }, Button);
        // 关闭按钮
        Button.pop();
        Column.pop();
        Column.pop();
    }
    buildTicketInfo(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('项目：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.selectedTicket!.itemDescription.length > 0 ?
                this.selectedTicket!.itemDescription : '未识别');
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('商户：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.selectedTicket!.merchantName);
            Text.fontSize(14);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('金额：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('¥' + this.selectedTicket!.amount.toFixed(2));
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FF5722');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('类型：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.selectedTicket!.type);
            Text.fontSize(14);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('日期：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(new Date(this.selectedTicket!.date * 1000).toLocaleDateString());
            Text.fontSize(14);
            Text.fontColor('#333333');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件：');
            Text.fontSize(14);
            Text.fontColor('#666666');
            Text.width(70);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.selectedTicket!.file.name);
            Text.fontSize(14);
            Text.fontColor('#333333');
            Text.layoutWeight(1);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    buildFileContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('文件内容');
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#333333');
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.height(200);
            Scroll.width('100%');
            Scroll.backgroundColor('#F5F5F5');
            Scroll.borderRadius(8);
            Scroll.padding(12);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.ticketContent.length > 0 ? this.ticketContent : '无法读取文件内容');
            Text.fontSize(12);
            Text.fontColor('#666666');
            Text.width('100%');
        }, Text);
        Text.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
