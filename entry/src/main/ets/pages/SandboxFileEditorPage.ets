import { SandboxFileUtil } from '../common/utils/sandbox/SandboxFileUtil';

@Entry
@Component
struct SandboxFileEditorPage {
  @State filePath: string = '';
  @State fileName: string = '';
  @State content: string = '';

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

  build() {
    Stack() {
      Image($r('app.media.background'))
        .width('100%')
        .height('100%')
        .objectFit(ImageFit.Cover)

      Column() {
        Row() {
          Text(this.fileName)
            .fontSize(18)
            .fontWeight(700)
            .layoutWeight(1)
          Button({
            type: ButtonType.Normal
          }) {
            Text('保存')
              .fontColor($r('app.color.button_text_color'))
              .fontSize(16)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
            .backgroundColor($r('app.color.button_background'))
            .width(96)
            .height(44)
            .borderRadius(22)
            .onClick(() => {
              if (this.filePath.length > 0) {
                SandboxFileUtil.writeTextFile(this.filePath, this.content);
              }
              this.getUIContext().getRouter().back();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 44, bottom: 12 })

        TextArea({ text: this.content })
          .onChange((value: string) => {
            this.content = value;
          })
          .enableKeyboardOnFocus(true)
          .width('100%')
          .layoutWeight(1)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(12)
          .margin({ left: 16, right: 16, bottom: 16 })
      }
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
  }
}
