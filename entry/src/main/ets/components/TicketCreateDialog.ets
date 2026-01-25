/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import { TicketType, TicketFileFormat } from '../common/model/Ticket';

/**
 * 票据创建参数
 */
export interface TicketCreateParams {
  merchantName: string;
  amount: number;
  date: number;
  type: TicketType;
  invoiceCode: string;
  orderNumber: string;
  location: string;
  format: TicketFileFormat;
  remark: string;
}

@CustomDialog
export struct TicketCreateDialog {
  controller: CustomDialogController;
  onConfirm: (params: TicketCreateParams) => void = () => {};

  @State merchantName: string = '';
  @State amount: string = '';
  @State invoiceCode: string = '';
  @State orderNumber: string = '';
  @State location: string = '';
  @State remark: string = '';
  @State selectedType: TicketType = TicketType.CATERING;
  @State selectedFormat: TicketFileFormat = TicketFileFormat.TXT;

  private typeOptions: TicketType[] = [
    TicketType.CATERING,
    TicketType.TRANSPORT,
    TicketType.HOTEL,
    TicketType.SHOPPING,
    TicketType.ENTERTAINMENT,
    TicketType.OTHER
  ];

  private formatOptions: TicketFileFormat[] = [
    TicketFileFormat.TXT,
    TicketFileFormat.PDF,
    TicketFileFormat.OFD
  ];

  build() {
    Column() {
      // 标题
      Text('创建票据')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })

      // 滚动区域
      Scroll() {
        Column() {
          // 商户名称
          this.buildInputRow('商户名称', '请输入商户名称')

          // 金额
          this.buildAmountRow()

          // 发票代码
          this.buildInvoiceCodeRow()

          // 订单号
          this.buildOrderNumberRow()

          // 消费地点
          this.buildLocationRow()

          // 消费类型
          this.buildTypeSelector()

          // 保存格式
          this.buildFormatSelector()

          // 备注
          this.buildRemarkRow()
        }
        .width('100%')
        .padding({ bottom: 12 })
      }
      .height(360)
      .scrollBar(BarState.Auto)

      // 按钮区域
      this.buildButtons()
    }
    .width('90%')
    .padding(20)
    .padding({ bottom: 28 })
    .backgroundColor(Color.White)
    .borderRadius(16)
    .justifyContent(FlexAlign.Start)
    .padding({ top: 48 })
  }

  @Builder
  buildInputRow(label: string, placeholder: string) {
    Column() {
      Text(label)
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: placeholder, text: this.merchantName })
        .height(40)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.merchantName = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildAmountRow() {
    Column() {
      Text('金额')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: '请输入金额', text: this.amount })
        .height(40)
        .width('100%')
        .type(InputType.Number)
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.amount = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildInvoiceCodeRow() {
    Column() {
      Text('发票代码')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: '请输入发票代码', text: this.invoiceCode })
        .height(40)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.invoiceCode = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildOrderNumberRow() {
    Column() {
      Text('订单号')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: '请输入订单号', text: this.orderNumber })
        .height(40)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.orderNumber = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildLocationRow() {
    Column() {
      Text('消费地点')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextInput({ placeholder: '请输入消费地点', text: this.location })
        .height(40)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.location = value;
        })
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
        ForEach(this.typeOptions, (type: TicketType) => {
          Text(type)
            .fontSize(12)
            .fontColor(this.selectedType === type ? Color.White : '#333333')
            .backgroundColor(this.selectedType === type ? '#007DFF' : '#F5F5F5')
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .borderRadius(16)
            .margin({ right: 8, bottom: 8 })
            .onClick(() => {
              this.selectedType = type;
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
        ForEach(this.formatOptions, (format: TicketFileFormat) => {
          Text(format.toUpperCase())
            .fontSize(12)
            .fontColor(this.selectedFormat === format ? Color.White : '#333333')
            .backgroundColor(this.selectedFormat === format ? '#4CAF50' : '#F5F5F5')
            .padding({ left: 16, right: 16, top: 8, bottom: 8 })
            .borderRadius(8)
            .margin({ right: 12 })
            .onClick(() => {
              this.selectedFormat = format;
            })
        })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildRemarkRow() {
    Column() {
      Text('备注')
        .fontSize(14)
        .fontColor('#666666')
        .width('100%')
      TextArea({ placeholder: '请输入备注信息', text: this.remark })
        .height(60)
        .width('100%')
        .margin({ top: 4 })
        .onChange((value: string) => {
          this.remark = value;
        })
    }
    .width('100%')
    .margin({ bottom: 12 })
  }

  @Builder
  buildButtons() {
    Row() {
      Button('取消')
        .layoutWeight(1)
        .height(40)
        .backgroundColor('#F5F5F5')
        .fontColor('#666666')
        .onClick(() => {
          this.controller.close();
        })

      Button('创建')
        .layoutWeight(1)
        .height(40)
        .margin({ left: 12 })
        .backgroundColor('#007DFF')
        .onClick(() => {
          this.handleConfirm();
        })
    }
    .width('100%')
    .margin({ top: 16 })
  }

  private handleConfirm(): void {
    const params: TicketCreateParams = {
      merchantName: this.merchantName.length > 0 ? this.merchantName : '未知商户',
      amount: this.amount.length > 0 ? parseFloat(this.amount) : 0,
      date: Math.floor(Date.now() / 1000),
      type: this.selectedType,
      invoiceCode: this.invoiceCode.length > 0 ? this.invoiceCode : 'INV' + Date.now(),
      orderNumber: this.orderNumber.length > 0 ? this.orderNumber : 'ORD' + Date.now(),
      location: this.location.length > 0 ? this.location : '未知地点',
      format: this.selectedFormat,
      remark: this.remark
    };
    this.onConfirm(params);
    this.controller.close();
  }
}
