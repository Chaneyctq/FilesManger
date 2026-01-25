import { SandboxFileItem, SandboxFileItemType } from '../common/model/SandboxFileItem';
import { SandboxFileUtil } from '../common/utils/sandbox/SandboxFileUtil';
import { promptAction } from '@kit.ArkUI';

@Component
export struct SandboxFilesTab {
  @State keyword: string = '';
  @State contentKeyword: string = '';
  @State files: SandboxFileItem[] = [];
  @State currentDir: string = '';
  @State rootDir: string = '';
  @State selectedPath: string = '';
  @State selectedName: string = '';
  @State showMoreDialog: boolean = false;
  @State showDeleteDialog: boolean = false;
  @State showRenameDialog: boolean = false;
  @State renameValue: string = '';
  @State showCreateDialog: boolean = false;
  @State createType: number = 0; // 0: dir, 1: file
  @State createName: string = '';

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
    } else {
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
    } catch (e) {
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
    } else {
      success = SandboxFileUtil.createFile(path);
    }

    if (success) {
      this.showCreateDialog = false;
      this.loadFiles();
    }
  }

  aboutToAppear(): void {
    this.loadFiles();
  }

  build() {
    Stack() {
      Image($r('app.media.background'))
        .width('100%')
        .height('100%')
        .objectFit(ImageFit.Cover)

      Column() {
        Row() {
          if (this.rootDir.length > 0 && this.currentDir != this.rootDir) {
            Button('返回')
              .fontColor('#000000')
              .height(40)
              .margin({ right: 8 })
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                this.goBack();
              })
          }
          TextInput({ placeholder: '按文件名关键字搜索', text: this.keyword })
            .layoutWeight(1)
            .height(40)
            .backgroundColor($r('app.color.start_window_background'))
            .borderRadius(12)
            .onChange((value: string) => {
              this.keyword = value;
              this.loadFiles();
            })
          Button('刷新')
            .fontColor('#000000')
            .height(40)
            .margin({ left: 8 })
            .backgroundColor($r('app.color.button_background'))
            .onClick(() => {
              this.loadFiles();
            })
          Button('+')
            .fontColor('#000000')
            .height(40)
            .margin({ left: 8 })
            .backgroundColor($r('app.color.button_background'))
            .onClick(() => {
              this.showCreateOptions();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 12, bottom: 12 })

        Row() {
          TextInput({ placeholder: '按文件内容关键字搜索', text: this.contentKeyword })
            .layoutWeight(1)
            .height(40)
            .backgroundColor($r('app.color.start_window_background'))
            .borderRadius(12)
            .onChange((value: string) => {
              this.contentKeyword = value;
              this.loadFiles();
            })
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 12 })

        if (this.files.length == 0) {
          Column() {
            Text('暂无匹配文件')
              .fontSize(16)
              .fontColor($r('app.color.text_color'))
          }
          .width('100%')
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        } else {
          List() {
            ForEach(this.files, (item: SandboxFileItem) => {
              ListItem() {
                Row() {
                  Column() {
                    Text(item.name)
                      .fontSize(16)
                      .fontWeight(600)
                      .fontColor($r('app.color.text_color'))
                    Text(item.type == SandboxFileItemType.DIRECTORY ? '目录' : (item.size + ' B'))
                      .fontSize(12)
                      .opacity(0.6)
                  }
                  .layoutWeight(1)

                  Text('...')
                    .fontSize(18)
                    .fontWeight(700)
                    .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                    .onClick(() => {
                      this.showMore(item);
                    })
                }
                .padding({ left: 16, right: 16, top: 12, bottom: 12 })
                .backgroundColor($r('app.color.start_window_background'))
                .borderRadius(16)
                .onClick(() => {
                  this.openItem(item);
                })
              }
              .margin({ left: 16, right: 16, top: 8 })
            }, (item: SandboxFileItem) => item.path)
          }
          .scrollBar(BarState.Auto)
          .width('100%')
          .layoutWeight(1)
        }
      }
      .width('100%')
      .height('100%')

      if (this.showMoreDialog) {
        Column() {
          Column() {
            Text(this.selectedName)
              .fontSize(16)
              .fontWeight(600)
              .margin({ bottom: 6 })
            Text(this.selectedPath)
              .fontSize(11)
              .opacity(0.6)
              .margin({ bottom: 12 })

            Button('编辑(文本)')
              .fontColor('#000000')
              .width('100%')
              .height(40)
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                const item: SandboxFileItem = {
                  path: this.selectedPath,
                  name: this.selectedName,
                  type: SandboxFileItemType.FILE,
                  size: 0,
                  modifiedTime: 0
                };
                this.showMoreDialog = false;
                this.openEditor(item);
              })
              .margin({ bottom: 8 })

            Button('重命名')
              .fontColor('#000000')
              .width('100%')
              .height(40)
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                this.showRenameDialog = true;
              })
              .margin({ bottom: 8 })

            Button('删除')
              .fontColor('#000000')
              .width('100%')
              .height(40)
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                this.showDeleteDialog = true;
              })
              .margin({ bottom: 8 })

            Button('取消')
              .fontColor('#000000')
              .width('100%')
              .height(40)
              .backgroundColor($r('app.color.button_background'))
              .onClick(() => {
                this.showMoreDialog = false;
                this.showDeleteDialog = false;
                this.showRenameDialog = false;
              })
          }
          .width('86%')
          .padding(16)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .backgroundColor('#66000000')
        .onClick(() => {
          this.showMoreDialog = false;
          this.showDeleteDialog = false;
          this.showRenameDialog = false;
        })
      }

      if (this.showMoreDialog && this.showDeleteDialog) {
        Column() {
          Column() {
            Text('确认删除')
              .fontSize(16)
              .fontWeight(600)
              .margin({ bottom: 10 })
            Text('删除后不可恢复')
              .fontSize(13)
              .opacity(0.6)
              .margin({ bottom: 16 })
            Row() {
              Button('取消')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .backgroundColor($r('app.color.button_background'))
                .backgroundColor($r('app.color.button_background'))
                .onClick(() => {
                  this.showDeleteDialog = false;
                })
              Button('删除')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .backgroundColor($r('app.color.button_background'))
                .margin({ left: 10 })
                .onClick(() => {
                  this.doDelete();
                })
            }
          }
          .width('86%')
          .padding(16)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .backgroundColor('#66000000')
      }

      if (this.showMoreDialog && this.showRenameDialog) {
        Column() {
          Column() {
            Text('重命名')
              .fontSize(16)
              .fontWeight(600)
              .margin({ bottom: 10 })
            TextInput({ text: this.renameValue })
              .onChange((value: string) => {
                this.renameValue = value;
              })
              .height(40)
              .backgroundColor('#ffffff')
              .borderRadius(10)
              .margin({ bottom: 16 })
            Row() {
              Button('取消')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .onClick(() => {
                  this.showRenameDialog = false;
                })
              Button('确定')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .backgroundColor($r('app.color.button_background'))
                .margin({ left: 10 })
                .onClick(() => {
                  this.doRename();
                })
            }
          }
          .width('86%')
          .padding(16)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .backgroundColor('#66000000')
      }

      if (this.showCreateDialog) {
        Column() {
          Column() {
            Text(this.createType == 0 ? '新建文件夹' : '新建文件')
              .fontSize(16)
              .fontWeight(600)
              .margin({ bottom: 10 })
            TextInput({ placeholder: '请输入名称', text: this.createName })
              .onChange((value: string) => {
                this.createName = value;
              })
              .height(40)
              .backgroundColor('#ffffff')
              .borderRadius(10)
              .margin({ bottom: 16 })
            Row() {
              Button('取消')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .backgroundColor($r('app.color.button_background'))
                .onClick(() => {
                  this.showCreateDialog = false;
                })
              Button('确定')
                .fontColor('#000000')
                .layoutWeight(1)
                .height(40)
                .backgroundColor($r('app.color.button_background'))
                .margin({ left: 10 })
                .onClick(() => {
                  this.doCreate();
                })
            }
          }
          .width('86%')
          .padding(16)
          .backgroundColor($r('app.color.start_window_background'))
          .borderRadius(16)
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .backgroundColor('#66000000')
      }
    }
    .width('100%')
    .height('100%')
  }
}
