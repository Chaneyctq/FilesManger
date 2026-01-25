import { Ticket, TicketType, ReportItem, ReportSummary } from '../common/model/Ticket';
import { ConsumptionEvent } from '../common/model/ConsumptionEvent';
import { TicketUtil } from '../common/utils/TicketUtil';
import { SandboxFileUtil } from '../common/utils/sandbox/SandboxFileUtil';
import { SandboxFileItem, SandboxFileItemType } from '../common/model/SandboxFileItem';
import { promptAction } from '@kit.ArkUI';
import { fileIo } from '@kit.CoreFileKit';
import { buffer } from '@kit.ArkTS';

@Component
export struct ReportTab {
  @State totalAmount: number = 0;
  @State totalCount: number = 0;
  @State reportList: ReportItem[] = [];
  @State eventCount: number = 0;
  @State duplicateCount: number = 0;
  @State duplicateAmount: number = 0;
  @State events: ConsumptionEvent[] = [];
  @State isLoading: boolean = false;
  @State allTickets: Ticket[] = [];  // 保存所有票据用于生成报销单

  // 目录选择状态
  @State currentPath: string = '';
  @State pathHistory: string[] = [];
  @State folders: SandboxFileItem[] = [];
  @State isRecursiveMode: boolean = true;
  @State showFolderPicker: boolean = false;

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
    } else {
      const children = SandboxFileUtil.listChildren(searchDir);
      files = children.filter(item => item.type === SandboxFileItemType.FILE);
    }

    const tickets: Ticket[] = [];
    for (const file of files) {
      tickets.push(TicketUtil.processFile(file));
    }
    this.allTickets = tickets;  // 保存票据列表

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
    } else {
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

  build() {
    Stack() {
      Column() {
        // 标题
        Text('报销统计')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin({ top: 20, bottom: 8 })

        // 目录选择栏
        this.buildPathSelector()

        // 总金额卡片
        Column() {
          Text('总报销金额')
            .fontSize(14)
            .fontColor(Color.White)
            .opacity(0.8)
          Text('¥' + this.totalAmount.toFixed(2))
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
            .margin({ top: 8 })
          Text(this.totalCount + ' 张票据')
            .fontSize(12)
            .fontColor(Color.White)
            .opacity(0.7)
            .margin({ top: 4 })
        }
        .width('90%')
        .height(120)
        .backgroundColor('#007DFF')
        .borderRadius(16)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)

        // 重复报销预警
        if (this.duplicateCount > 0) {
          Row() {
            Text('⚠')
              .fontSize(16)
              .fontColor('#FF5722')
              .margin({ right: 8 })
            Text('发现 ' + this.duplicateCount + ' 张重复票据')
              .fontSize(14)
              .fontColor('#FF5722')
            Blank()
            Text('¥' + this.duplicateAmount.toFixed(2))
              .fontSize(14)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF5722')
          }
          .width('90%')
          .padding(12)
          .backgroundColor('#FFF3E0')
          .borderRadius(8)
          .margin({ top: 16 })
        }

        // 消费事件统计
        if (this.eventCount > 0) {
          Row() {
            Text('已关联 ' + this.eventCount + ' 个消费事件')
              .fontSize(14)
              .fontColor('#1976D2')
          }
          .width('90%')
          .padding(12)
          .backgroundColor('#E3F2FD')
          .borderRadius(8)
          .margin({ top: 12 })
        }

        // Breakdown
        Text('分类统计')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .width('90%')
          .margin({ top: 24, bottom: 12 })

        List() {
          ForEach(this.reportList, (item: ReportItem) => {
            ListItem() {
              Row() {
                // Color dot
                Circle({ width: 12, height: 12 })
                  .fill(item.color)
                  .margin({ right: 12 })

                Column() {
                  Text(item.type)
                    .fontSize(16)
                    .fontColor($r('app.color.text_color'))
                  Text(item.count + ' 张')
                    .fontSize(12)
                    .fontColor('#999999')
                    .margin({ top: 2 })
                }
                .alignItems(HorizontalAlign.Start)
                .layoutWeight(1)

                Text('¥' + item.amount.toFixed(2))
                  .fontSize(16)
                  .fontWeight(FontWeight.Bold)
                  .fontColor($r('app.color.text_color'))
              }
              .width('100%')
              .padding(16)
              .backgroundColor($r('app.color.start_window_background'))
              .borderRadius(12)
              .margin({ bottom: 8 })
            }
          })
        }
        .width('90%')
        .layoutWeight(1)

        Button('生成报销单')
          .width('90%')
          .height(48)
          .margin({ bottom: 24 })
          .backgroundColor('#007DFF')
          .onClick(() => {
            this.exportReport();
          })
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#F1F3F5')

      // 文件夹选择弹窗
      if (this.showFolderPicker) {
        this.buildFolderPicker()
      }
    }
  }

  @Builder
  buildPathSelector() {
    Row() {
      // 当前路径
      Text(this.getDisplayPath())
        .fontSize(13)
        .fontColor('#666666')
        .layoutWeight(1)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })

      // 选择目录按钮
      Button('选择目录')
        .fontSize(12)
        .height(28)
        .backgroundColor('#E3F2FD')
        .fontColor('#007DFF')
        .onClick(() => {
          this.showFolderPicker = true;
        })

      // 递归模式
      Text(this.isRecursiveMode ? '全部' : '当前')
        .fontSize(12)
        .fontColor(this.isRecursiveMode ? Color.White : '#007DFF')
        .backgroundColor(this.isRecursiveMode ? '#007DFF' : '#E3F2FD')
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .borderRadius(12)
        .margin({ left: 8 })
        .onClick(() => {
          this.isRecursiveMode = !this.isRecursiveMode;
          this.generateReport();
        })
    }
    .width('90%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildFolderPicker() {
    Column() {
      Column() {
        // 标题栏
        Row() {
          if (this.pathHistory.length > 0) {
            Text('<')
              .fontSize(18)
              .fontColor('#007DFF')
              .onClick(() => { this.goBack(); })
          }
          Text('选择目录')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .layoutWeight(1)
            .textAlign(TextAlign.Center)
          Text('X')
            .fontSize(18)
            .fontColor('#999999')
            .onClick(() => { this.showFolderPicker = false; })
        }
        .width('100%')
        .padding(16)

        // 当前路径
        Text(this.getDisplayPath())
          .fontSize(12)
          .fontColor('#666666')
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 8 })

        // 文件夹列表
        this.buildFolderListContent()

        // 确认按钮
        Button('选择此目录')
          .width('90%')
          .height(44)
          .margin(16)
          .backgroundColor('#007DFF')
          .onClick(() => {
            this.showFolderPicker = false;
            this.generateReport();
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
  buildFolderListContent() {
    List() {
      ForEach(this.folders, (folder: SandboxFileItem) => {
        ListItem() {
          Row() {
            Text('📁')
              .fontSize(20)
              .margin({ right: 8 })
            Text(folder.name)
              .fontSize(14)
              .layoutWeight(1)
            Text('>')
              .fontSize(14)
              .fontColor('#999999')
          }
          .width('100%')
          .padding(12)
          .onClick(() => {
            this.enterFolder(folder);
          })
        }
      })
    }
    .width('100%')
    .height(200)
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

      const file = fileIo.openSync(filePath,
        fileIo.OpenMode.CREATE | fileIo.OpenMode.WRITE_ONLY | fileIo.OpenMode.TRUNC);
      const buf = buffer.from(content, 'utf-8');
      fileIo.writeSync(file.fd, buf.buffer);
      fileIo.closeSync(file);

      return filePath;
    } catch (error) {
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
}
