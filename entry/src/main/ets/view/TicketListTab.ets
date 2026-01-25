import { Ticket, TicketType, TicketFileFormat, TicketSearchFilter, DuplicateGroup } from '../common/model/Ticket';
import { ConsumptionEvent } from '../common/model/ConsumptionEvent';
import { TicketUtil } from '../common/utils/TicketUtil';
import { TicketGenerateParams } from '../common/utils/ticket/TicketGenerator';
import { SandboxFileUtil } from '../common/utils/sandbox/SandboxFileUtil';
import { SandboxFileItem, SandboxFileItemType } from '../common/model/SandboxFileItem';
import { promptAction } from '@kit.ArkUI';
import { picker, fileIo } from '@kit.CoreFileKit';

@Component
export struct TicketListTab {
  @State tickets: Ticket[] = [];
  @State keyword: string = '';
  @State duplicateIds: string[] = [];
  @State duplicateGroups: DuplicateGroup[] = [];
  @State expandedGroupIds: string[] = [];
  @State showDuplicateGroups: boolean = false;
  @State minAmount: string = '';
  @State maxAmount: string = '';
  @State showAdvancedSearch: boolean = false;
  // 高级搜索新增状态
  @State searchMerchant: string = '';
  @State searchStartDate: string = '';
  @State searchEndDate: string = '';
  @State selectedTypes: TicketType[] = [];
  @State sortBy: string = 'date';
  @State sortAsc: boolean = false;
  // 事件分组状态
  @State consumptionEvents: ConsumptionEvent[] = [];
  @State expandedEventIds: string[] = [];
  @State viewMode: string = 'list';  // 'list' | 'events' | 'duplicates'
  @State showCreateDialog: boolean = false;
  @State selectedTicket: Ticket | null = null;
  @State showTicketDetail: boolean = false;
  @State ticketContent: string = '';

  // 文件夹导航状态
  @State currentPath: string = '';
  @State pathHistory: string[] = [];
  @State folders: SandboxFileItem[] = [];
  @State isRecursiveMode: boolean = true;

  // 自定义票据表单状态
  @State formMerchant: string = '';
  @State formAmount: string = '';
  @State formInvoiceCode: string = '';
  @State formOrderNumber: string = '';
  @State formLocation: string = '';
  @State formRemark: string = '';
  @State formType: TicketType = TicketType.CATERING;
  @State formFormat: TicketFileFormat = TicketFileFormat.TXT;

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
    } else {
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

  build() {
    Column() {
      // 搜索栏
      Row() {
        TextInput({ placeholder: '搜索商家、类型或发票号', text: this.keyword })
          .layoutWeight(1)
          .height(40)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(12)
          .onChange((value: string) => {
            this.keyword = value;
            this.loadTicketsAsync();
          })

        Button('高级')
          .fontColor('#007DFF')
          .height(40)
          .margin({ left: 8 })
          .backgroundColor($r('app.color.button_background'))
          .onClick(() => {
            this.showAdvancedSearch = !this.showAdvancedSearch;
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })

      // 路径导航栏
      this.buildPathNavigation()

      // 文件夹列表
      if (this.folders.length > 0 && !this.isRecursiveMode) {
        this.buildFolderList()
      }

      // 高级搜索面板
      if (this.showAdvancedSearch) {
        this.buildAdvancedSearchPanel()
      }

      // 视图切换栏
      this.buildViewModeSelector()

      // 内容区域
      if (this.tickets.length === 0) {
        Column() {
          Text('暂无票据')
            .fontSize(16)
            .fontColor($r('app.color.text_color'))
            .opacity(0.6)
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else if (this.viewMode === 'events') {
        // 事件分组视图
        this.buildEventsList()
      } else if (this.viewMode === 'duplicates') {
        // 重复票据视图
        this.buildDuplicatesList()
      } else {
        // 普通列表视图
        this.buildMixedList()
      }

      // 底部操作按钮
      Row() {
        Button('生成票据')
          .layoutWeight(1)
          .height(44)
          .backgroundColor('#007DFF')
          .onClick(() => {
            this.showCreateDialog = true;
          })

        Button('上传票据')
          .layoutWeight(1)
          .height(44)
          .margin({ left: 8 })
          .backgroundColor('#4CAF50')
          .onClick(() => {
            this.uploadTicket();
          })

        Button('测试数据')
          .layoutWeight(1)
          .height(44)
          .margin({ left: 8 })
          .backgroundColor('#FF9800')
          .onClick(() => {
            this.generateTestData();
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 16, top: 8 })

      // 创建票据对话框
      if (this.showCreateDialog) {
        this.buildCreateDialog()
      }

      // 票据详情弹窗
      if (this.showTicketDetail) {
        this.buildTicketDetailDialog()
      }
    }
    .width('100%')
    .height('100%')
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
      } else if (this.sortBy === 'amount') {
        cmp = a.amount - b.amount;
      } else if (this.sortBy === 'merchant') {
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
    } else {
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
    } catch (error) {
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
      } catch (e) {
        // 继续处理下一个文件
      }
    }

    if (successCount > 0) {
      promptAction.showToast({
        message: '成功上传 ' + successCount + ' 个文件，正在分类...'
      });
    } else {
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
    } catch (e) {
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

      const destFile = fileIo.openSync(destPath,
        fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY);
      fileIo.writeSync(destFile.fd, buf);
      fileIo.closeSync(destFile);
      return true;
    } catch (e) {
      return false;
    }
  }

  @Builder
  buildCreateDialog() {
    Column() {
      Column() {
        // 标题
        Text('创建票据')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 16 })

        // 表单内容
        Scroll() {
          Column() {
            this.buildFormInput('商户名称', '请输入商户名称', this.formMerchant, (v: string) => {
              this.formMerchant = v;
            })
            this.buildFormInput('金额', '请输入金额', this.formAmount, (v: string) => {
              this.formAmount = v;
            }, InputType.Number)
            this.buildFormInput('发票代码', '请输入发票代码', this.formInvoiceCode, (v: string) => {
              this.formInvoiceCode = v;
            })
            this.buildFormInput('订单号', '请输入订单号', this.formOrderNumber, (v: string) => {
              this.formOrderNumber = v;
            })
            this.buildFormInput('消费地点', '请输入消费地点', this.formLocation, (v: string) => {
              this.formLocation = v;
            })
            this.buildTypeSelector()
            this.buildFormatSelector()
            this.buildRemarkInput()
          }
          .width('100%')
          .padding({ bottom: 12 })
        }
        .height(320)

        // 按钮
        this.buildDialogButtons()
      }
      .width('90%')
      .padding(20)
      .padding({ bottom: 28 })
      .backgroundColor(Color.White)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('rgba(0,0,0,0.5)')
    .justifyContent(FlexAlign.Start)
    .padding({ top: 48 })
    .onClick(() => {
      this.showCreateDialog = false;
    })
  }

  @Builder
  buildFormInput(label: string, placeholder: string, value: string,
    onChange: (v: string) => void, inputType: InputType = InputType.Normal) {
    Column() {
      Text(label)
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: placeholder, text: value })
        .height(40)
        .width('100%')
        .type(inputType)
        .margin({ top: 4 })
        .onChange(onChange)
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildTypeSelector() {
    Column() {
      Text('消费类型')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
        .margin({ bottom: 8 })
      Flex({ wrap: FlexWrap.Wrap }) {
        ForEach(this.getTypeOptions(), (type: TicketType) => {
          Text(type)
            .fontSize(12)
            .fontColor(this.formType === type ? Color.White : '#333333')
            .backgroundColor(this.formType === type ? '#007DFF' : '#F5F5F5')
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .borderRadius(16)
            .margin({ right: 8, bottom: 8 })
            .onClick(() => {
              this.formType = type;
            })
        })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildFormatSelector() {
    Column() {
      Text('保存格式')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
        .margin({ bottom: 8 })
      Row() {
        ForEach(this.getFormatOptions(), (format: TicketFileFormat) => {
          Text(format.toUpperCase())
            .fontSize(12)
            .fontColor(this.formFormat === format ? Color.White : '#333333')
            .backgroundColor(this.formFormat === format ? '#4CAF50' : '#F5F5F5')
            .padding({ left: 16, right: 16, top: 8, bottom: 8 })
            .borderRadius(8)
            .margin({ right: 12 })
            .onClick(() => {
              this.formFormat = format;
            })
        })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildRemarkInput() {
    Column() {
      Text('备注')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextArea({ placeholder: '请输入备注信息', text: this.formRemark })
        .height(60)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.formRemark = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildDialogButtons() {
    Row() {
      Button('取消')
        .layoutWeight(1)
        .height(40)
        .backgroundColor('#F5F5F5')
        .fontColor('#666666')
        .onClick(() => {
          this.showCreateDialog = false;
          this.resetForm();
        })

      Button('创建')
        .layoutWeight(1)
        .height(40)
        .margin({ left: 12 })
        .backgroundColor('#007DFF')
        .onClick(() => {
          this.handleCreateTicket();
        })
    }
    .width('100%')
    .margin({ top: 16 })
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
    } catch (error) {
      promptAction.showToast({ message: '导出失败' });
    }
  }

  @Builder
  buildAdvancedSearchPanel() {
    Column() {
      // 商家名称搜索
      Row() {
        Text('商家名称：')
          .fontSize(14)
          .width(80)
        TextInput({ placeholder: '输入商家名称', text: this.searchMerchant })
          .layoutWeight(1)
          .height(36)
          .onChange((v: string) => {
            this.searchMerchant = v;
          })
      }
      .width('100%')
      .margin({ bottom: 10 })

      // 金额范围
      Row() {
        Text('金额范围：')
          .fontSize(14)
          .width(80)
        TextInput({ placeholder: '最小', text: this.minAmount })
          .layoutWeight(1)
          .height(36)
          .type(InputType.Number)
          .onChange((v: string) => {
            this.minAmount = v;
          })
        Text(' - ')
          .margin({ left: 8, right: 8 })
        TextInput({ placeholder: '最大', text: this.maxAmount })
          .layoutWeight(1)
          .height(36)
          .type(InputType.Number)
          .onChange((v: string) => {
            this.maxAmount = v;
          })
      }
      .width('100%')
      .margin({ bottom: 10 })

      // 日期范围
      Row() {
        Text('日期范围：')
          .fontSize(14)
          .width(80)
        TextInput({ placeholder: 'YYYY-MM-DD', text: this.searchStartDate })
          .layoutWeight(1)
          .height(36)
          .onChange((v: string) => {
            this.searchStartDate = v;
          })
        Text(' - ')
          .margin({ left: 8, right: 8 })
        TextInput({ placeholder: 'YYYY-MM-DD', text: this.searchEndDate })
          .layoutWeight(1)
          .height(36)
          .onChange((v: string) => {
            this.searchEndDate = v;
          })
      }
      .width('100%')
      .margin({ bottom: 10 })

      // 快捷日期选择
      this.buildQuickDateButtons()

      // 类型筛选
      this.buildTypeFilter()

      // 排序选项
      this.buildSortOptions()

      // 操作按钮
      this.buildSearchButtons()
    }
    .padding(16)
    .backgroundColor('#F5F5F5')
    .borderRadius(8)
    .margin({ left: 16, right: 16, bottom: 8 })
  }

  @Builder
  buildQuickDateButtons() {
    Row() {
      Text('快捷：')
        .fontSize(14)
        .width(80)
      Text('今天')
        .fontSize(12)
        .fontColor('#007DFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .backgroundColor('#E3F2FD')
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          const today = this.formatDate(new Date());
          this.searchStartDate = today;
          this.searchEndDate = today;
        })
      Text('本周')
        .fontSize(12)
        .fontColor('#007DFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .backgroundColor('#E3F2FD')
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          const now = new Date();
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(now);
          monday.setDate(now.getDate() - diff);
          this.searchStartDate = this.formatDate(monday);
          this.searchEndDate = this.formatDate(now);
        })
      Text('本月')
        .fontSize(12)
        .fontColor('#007DFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .backgroundColor('#E3F2FD')
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          this.searchStartDate = this.formatDate(firstDay);
          this.searchEndDate = this.formatDate(now);
        })
      Text('近30天')
        .fontSize(12)
        .fontColor('#007DFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .backgroundColor('#E3F2FD')
        .borderRadius(12)
        .onClick(() => {
          const now = new Date();
          const past = new Date(now);
          past.setDate(now.getDate() - 30);
          this.searchStartDate = this.formatDate(past);
          this.searchEndDate = this.formatDate(now);
        })
    }
    .width('100%')
    .margin({ bottom: 10 })
  }

  @Builder
  buildTypeFilter() {
    Column() {
      Text('消费类型：')
        .fontSize(14)
        .width('100%')
        .margin({ bottom: 6 })
      Flex({ wrap: FlexWrap.Wrap }) {
        ForEach(this.getTypeOptions(), (type: TicketType) => {
          Text(type)
            .fontSize(12)
            .fontColor(this.selectedTypes.includes(type) ? Color.White : '#333333')
            .backgroundColor(this.selectedTypes.includes(type) ? '#007DFF' : '#FFFFFF')
            .padding({ left: 10, right: 10, top: 5, bottom: 5 })
            .borderRadius(14)
            .border({ width: 1, color: this.selectedTypes.includes(type) ? '#007DFF' : '#DDDDDD' })
            .margin({ right: 8, bottom: 6 })
            .onClick(() => {
              this.toggleTypeSelection(type);
            })
        })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ bottom: 10 })
  }

  @Builder
  buildSortOptions() {
    Row() {
      Text('排序：')
        .fontSize(14)
        .width(80)
      Text('日期')
        .fontSize(12)
        .fontColor(this.sortBy === 'date' ? Color.White : '#333333')
        .backgroundColor(this.sortBy === 'date' ? '#4CAF50' : '#FFFFFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          if (this.sortBy === 'date') {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortBy = 'date';
            this.sortAsc = false;
          }
        })
      Text('金额')
        .fontSize(12)
        .fontColor(this.sortBy === 'amount' ? Color.White : '#333333')
        .backgroundColor(this.sortBy === 'amount' ? '#4CAF50' : '#FFFFFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          if (this.sortBy === 'amount') {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortBy = 'amount';
            this.sortAsc = false;
          }
        })
      Text('商家')
        .fontSize(12)
        .fontColor(this.sortBy === 'merchant' ? Color.White : '#333333')
        .backgroundColor(this.sortBy === 'merchant' ? '#4CAF50' : '#FFFFFF')
        .padding({ left: 10, right: 10, top: 4, bottom: 4 })
        .borderRadius(12)
        .margin({ right: 8 })
        .onClick(() => {
          if (this.sortBy === 'merchant') {
            this.sortAsc = !this.sortAsc;
          } else {
            this.sortBy = 'merchant';
            this.sortAsc = true;
          }
        })
      Text(this.sortAsc ? '↑升序' : '↓降序')
        .fontSize(12)
        .fontColor('#666666')
    }
    .width('100%')
    .margin({ bottom: 10 })
  }

  @Builder
  buildSearchButtons() {
    Row() {
      Button('搜索')
        .height(36)
        .layoutWeight(1)
        .backgroundColor('#007DFF')
        .onClick(() => {
          this.loadTicketsAsync();
        })
      Button('重置')
        .height(36)
        .layoutWeight(1)
        .margin({ left: 12 })
        .backgroundColor('#999999')
        .onClick(() => {
          this.resetSearch();
        })
    }
    .width('100%')
    .margin({ top: 6 })
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthStr = month < 10 ? '0' + month : '' + month;
    const dayStr = day < 10 ? '0' + day : '' + day;
    return year + '-' + monthStr + '-' + dayStr;
  }

  @Builder
  buildViewModeSelector() {
    Row() {
      Text('列表')
        .fontSize(13)
        .fontColor(this.viewMode === 'list' ? Color.White : '#333333')
        .backgroundColor(this.viewMode === 'list' ? '#007DFF' : '#F0F0F0')
        .padding({ left: 14, right: 14, top: 6, bottom: 6 })
        .borderRadius(16)
        .onClick(() => { this.viewMode = 'list'; })

      Text('事件(' + this.consumptionEvents.length + ')')
        .fontSize(13)
        .fontColor(this.viewMode === 'events' ? Color.White : '#333333')
        .backgroundColor(this.viewMode === 'events' ? '#FF9800' : '#F0F0F0')
        .padding({ left: 14, right: 14, top: 6, bottom: 6 })
        .borderRadius(16)
        .margin({ left: 8 })
        .onClick(() => { this.viewMode = 'events'; })

      Text('重复(' + this.duplicateGroups.length + ')')
        .fontSize(13)
        .fontColor(this.viewMode === 'duplicates' ? Color.White : '#333333')
        .backgroundColor(this.viewMode === 'duplicates' ? '#F44336' : '#F0F0F0')
        .padding({ left: 14, right: 14, top: 6, bottom: 6 })
        .borderRadius(16)
        .margin({ left: 8 })
        .onClick(() => { this.viewMode = 'duplicates'; })

      Blank()

      Text(this.tickets.length + '张')
        .fontSize(12)
        .fontColor('#999999')
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 8, bottom: 8 })
  }

  @Builder
  buildEventsList() {
    List() {
      ForEach(this.consumptionEvents, (event: ConsumptionEvent, index: number) => {
        ListItem() {
          Column() {
            this.buildEventHeader(event, index)
            if (this.expandedEventIds.includes(event.id)) {
              this.buildEventTickets(event)
            }
          }
          .width('100%')
        }
      }, (event: ConsumptionEvent) => event.id)
    }
    .width('100%')
    .layoutWeight(1)
    .padding({ left: 16, right: 16 })
  }

  @Builder
  buildEventHeader(event: ConsumptionEvent, index: number) {
    Row() {
      Column() {
        Text((index + 1).toString())
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
      .width(32)
      .height(32)
      .borderRadius(16)
      .backgroundColor(this.getEventColor(event.eventType))
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .margin({ right: 12 })

      Column() {
        Text(event.name)
          .fontSize(15)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
        Text(event.associationReason)
          .fontSize(12)
          .fontColor('#FF9800')
          .margin({ top: 4 })
        Row() {
          Text(event.tickets.length + '张票据')
            .fontSize(12)
            .fontColor('#999999')
          if (event.location.length > 0) {
            Text(' · ' + event.location)
              .fontSize(12)
              .fontColor('#999999')
          }
        }
        .margin({ top: 2 })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      Column() {
        Text('¥' + event.totalAmount.toFixed(2))
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF9800')
        Text(this.expandedEventIds.includes(event.id) ? '收起' : '展开')
          .fontSize(12)
          .fontColor('#007DFF')
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.End)
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#FFF8E1')
    .borderRadius(12)
    .margin({ bottom: 8 })
    .onClick(() => {
      this.toggleEventExpand(event.id);
    })
  }

  @Builder
  buildEventTickets(event: ConsumptionEvent) {
    Column() {
      ForEach(event.tickets, (ticket: Ticket, idx: number) => {
        Row() {
          Text((idx + 1).toString())
            .fontSize(12)
            .fontColor('#999999')
            .width(20)
          Column() {
            Text(ticket.itemDescription.length > 0 ? ticket.itemDescription : ticket.merchantName)
              .fontSize(14)
              .fontColor('#333333')
            Text(ticket.merchantName + ' · ' + new Date(ticket.date * 1000).toLocaleDateString())
              .fontSize(11)
              .fontColor('#999999')
              .margin({ top: 2 })
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Start)
          .margin({ left: 8 })
          Text('¥' + ticket.amount.toFixed(2))
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
        }
        .width('100%')
        .padding({ left: 12, right: 12, top: 8, bottom: 8 })
        .backgroundColor('#FFFDE7')
        .borderRadius(8)
        .margin({ bottom: 4, left: 16 })
        .onClick(() => {
          this.viewTicketDetail(ticket);
        })
      }, (ticket: Ticket) => ticket.id)
    }
    .width('100%')
    .margin({ bottom: 8 })
  }

  @Builder
  buildDuplicatesList() {
    List() {
      ForEach(this.duplicateGroups, (group: DuplicateGroup, index: number) => {
        ListItem() {
          Column() {
            this.buildGroupHeader(group, index)
            if (this.isGroupExpanded(group.groupId)) {
              this.buildGroupTicketsWithClick(group)
            }
          }
          .width('100%')
        }
      }, (group: DuplicateGroup) => group.groupId)
    }
    .width('100%')
    .layoutWeight(1)
    .padding({ left: 16, right: 16 })
  }

  private getEventColor(eventType: string): string {
    if (eventType === '差旅出行') {
      return '#2196F3';
    } else if (eventType === '聚餐活动') {
      return '#FF9800';
    } else if (eventType === '休闲娱乐') {
      return '#E91E63';
    } else if (eventType === '购物消费') {
      return '#4CAF50';
    } else {
      return '#9C27B0';
    }
  }

  private toggleEventExpand(eventId: string): void {
    if (this.expandedEventIds.includes(eventId)) {
      this.expandedEventIds = this.expandedEventIds.filter(id => id !== eventId);
    } else {
      this.expandedEventIds = this.expandedEventIds.concat([eventId]);
    }
  }

  @Builder
  buildPathNavigation() {
    Column() {
      Row() {
        // 返回按钮
        if (this.pathHistory.length > 0) {
          Text('<')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#007DFF')
            .padding({ left: 8, right: 8 })
            .onClick(() => {
              this.goBack();
            })
        }

        // 当前路径显示
        Text(this.getDisplayPath())
          .fontSize(13)
          .fontColor('#666666')
          .layoutWeight(1)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        // 递归模式切换
        Row() {
          Text(this.isRecursiveMode ? '全部' : '当前')
            .fontSize(12)
            .fontColor(this.isRecursiveMode ? Color.White : '#007DFF')
            .backgroundColor(this.isRecursiveMode ? '#007DFF' : '#E3F2FD')
            .padding({ left: 8, right: 8, top: 4, bottom: 4 })
            .borderRadius(12)
            .onClick(() => {
              this.isRecursiveMode = !this.isRecursiveMode;
              this.loadTicketsAsync();
            })
        }
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 4, bottom: 4 })
    }
  }

  @Builder
  buildFolderList() {
    List() {
      ForEach(this.folders, (folder: SandboxFileItem) => {
        ListItem() {
          Row() {
            Text('📁')
              .fontSize(20)
              .margin({ right: 8 })
            Text(folder.name)
              .fontSize(14)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('>')
              .fontSize(14)
              .fontColor('#999999')
          }
          .width('100%')
          .padding(12)
          .backgroundColor('#F5F5F5')
          .borderRadius(8)
          .margin({ bottom: 4 })
          .onClick(() => {
            this.enterFolder(folder);
          })
        }
      })
    }
    .width('100%')
    .layoutWeight(1)
    .constraintSize({ maxHeight: 280 })
    .padding({ left: 16, right: 16 })
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
    } else {
      this.expandedGroupIds = this.expandedGroupIds.concat([groupId]);
    }
  }

  @Builder
  buildGroupHeader(group: DuplicateGroup, index: number) {
    Row() {
      // 分组图标
      Column() {
        Text((index + 1).toString())
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
      .width(32)
      .height(32)
      .borderRadius(16)
      .backgroundColor('#FF5722')
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .margin({ right: 12 })

      // 分组信息
      Column() {
        Text('重复组 #' + (index + 1))
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
        Row() {
          Text(group.reason)
            .fontSize(12)
            .fontColor('#FF5722')
            .margin({ right: 8 })
          Text(group.tickets.length + ' 张票据')
            .fontSize(12)
            .fontColor('#999999')
        }
        .margin({ top: 4 })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      // 金额和展开按钮
      Column() {
        Text('¥' + group.totalAmount.toFixed(2))
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF5722')
        Text(this.isGroupExpanded(group.groupId) ? '收起' : '展开')
          .fontSize(12)
          .fontColor('#007DFF')
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.End)
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#FFF8E1')
    .borderRadius(12)
    .margin({ bottom: 8 })
    .onClick(() => {
      this.toggleGroupExpand(group.groupId);
    })
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

  @Builder
  buildMixedList() {
    List() {
      // 先显示重复分组
      ForEach(this.duplicateGroups, (group: DuplicateGroup, index: number) => {
        ListItem() {
          Column() {
            this.buildGroupHeader(group, index)
            if (this.isGroupExpanded(group.groupId)) {
              this.buildGroupTicketsWithClick(group)
            }
          }
          .width('100%')
        }
      }, (group: DuplicateGroup) => group.groupId)

      // 再显示非重复票据
      ForEach(this.getNonDuplicateTickets(), (item: Ticket) => {
        ListItem() {
          this.buildTicketItem(item)
        }
      }, (item: Ticket) => item.id)
    }
    .width('100%')
    .layoutWeight(1)
    .padding({ left: 16, right: 16 })
  }

  @Builder
  buildTicketItem(item: Ticket) {
    Row() {
      Column() {
        Text(item.type.charAt(0))
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
      .width(40)
      .height(40)
      .borderRadius(20)
      .backgroundColor(this.getTypeColor(item.type))
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .margin({ right: 12 })

      Column() {
        Text(item.itemDescription.length > 0 ? item.itemDescription : item.merchantName)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor($r('app.color.text_color'))
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Row() {
          Text(item.merchantName)
            .fontSize(12)
            .fontColor('#666666')
            .margin({ right: 8 })
          Text(new Date(item.date * 1000).toLocaleDateString())
            .fontSize(12)
            .fontColor('#999999')
        }
        .margin({ top: 4 })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      Text('¥' + item.amount.toFixed(2))
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.text_color'))
    }
    .width('100%')
    .padding(12)
    .backgroundColor($r('app.color.start_window_background'))
    .borderRadius(12)
    .margin({ bottom: 8 })
    .onClick(() => {
      this.viewTicketDetail(item);
    })
  }

  @Builder
  buildGroupTicketsWithClick(group: DuplicateGroup) {
    Column() {
      ForEach(group.tickets, (ticket: Ticket, idx: number) => {
        Row() {
          Text((idx + 1).toString())
            .fontSize(12)
            .fontColor('#999999')
            .width(20)

          Column() {
            Text(ticket.itemDescription.length > 0 ? ticket.itemDescription : ticket.merchantName)
              .fontSize(14)
              .fontColor('#333333')
            Text(ticket.merchantName + ' · ' + new Date(ticket.date * 1000).toLocaleDateString())
              .fontSize(11)
              .fontColor('#999999')
              .margin({ top: 2 })
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Start)
          .margin({ left: 8 })

          Text('¥' + ticket.amount.toFixed(2))
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF5722')
        }
        .width('100%')
        .padding({ left: 12, right: 12, top: 8, bottom: 8 })
        .backgroundColor('#FFFDE7')
        .borderRadius(8)
        .margin({ bottom: 4, left: 16 })
        .onClick(() => {
          this.viewTicketDetail(ticket);
        })
      }, (ticket: Ticket) => ticket.id)
    }
    .width('100%')
    .margin({ bottom: 8 })
  }

  @Builder
  buildTicketDetailDialog() {
    Column() {
      Column() {
        // 标题栏
        Row() {
          Text('票据详情')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .layoutWeight(1)
          Text('X')
            .fontSize(18)
            .fontColor('#999999')
            .onClick(() => {
              this.showTicketDetail = false;
              this.selectedTicket = null;
              this.ticketContent = '';
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 16, bottom: 12 })

        // 票据基本信息
        if (this.selectedTicket !== null) {
          this.buildTicketInfo()
        }

        // 文件内容
        this.buildFileContent()

        // 关闭按钮
        Button('关闭')
          .width('90%')
          .height(44)
          .margin({ top: 16, bottom: 16 })
          .backgroundColor('#007DFF')
          .onClick(() => {
            this.showTicketDetail = false;
            this.selectedTicket = null;
            this.ticketContent = '';
          })
      }
      .width('90%')
      .backgroundColor(Color.White)
      .borderRadius(16)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('rgba(0,0,0,0.5)')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  buildTicketInfo() {
    Column() {
      Row() {
        Text('项目：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text(this.selectedTicket!.itemDescription.length > 0 ?
          this.selectedTicket!.itemDescription : '未识别')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .layoutWeight(1)
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('商户：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text(this.selectedTicket!.merchantName)
          .fontSize(14)
          .fontColor('#333333')
          .layoutWeight(1)
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('金额：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text('¥' + this.selectedTicket!.amount.toFixed(2))
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF5722')
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('类型：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text(this.selectedTicket!.type)
          .fontSize(14)
          .fontColor('#333333')
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('日期：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text(new Date(this.selectedTicket!.date * 1000).toLocaleDateString())
          .fontSize(14)
          .fontColor('#333333')
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('文件：')
          .fontSize(14)
          .fontColor('#666666')
          .width(70)
        Text(this.selectedTicket!.file.name)
          .fontSize(14)
          .fontColor('#333333')
          .layoutWeight(1)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .width('100%')
    }
    .width('100%')
    .padding({ left: 16, right: 16 })
  }

  @Builder
  buildFileContent() {
    Column() {
      Text('文件内容')
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
        .width('100%')
        .margin({ bottom: 8 })

      Scroll() {
        Text(this.ticketContent.length > 0 ? this.ticketContent : '无法读取文件内容')
          .fontSize(12)
          .fontColor('#666666')
          .width('100%')
      }
      .height(200)
      .width('100%')
      .backgroundColor('#F5F5F5')
      .borderRadius(8)
      .padding(12)
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 12 })
  }
}