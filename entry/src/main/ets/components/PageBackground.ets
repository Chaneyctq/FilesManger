@Component
export struct PageBackground {
  @BuilderParam contentBuilder: () => void

  build() {
    Stack() {
      Image($r('app.media.background'))
        .width('100%')
        .height('100%')
        .objectFit(ImageFit.Cover)

      Column() {
        this.contentBuilder()
      }
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
  }
}
