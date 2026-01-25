/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License,Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TicketListTab } from '../view/TicketListTab';
import { ReportTab } from '../view/ReportTab';
import { SandboxFilesTab } from '../view/SandboxFilesTab';

@Entry
@Component
struct HomePage {
  build() {
    Stack() {
      Image($r('app.media.background'))
        .width('100%')
        .height('100%')
        .objectFit(ImageFit.Cover)

      Column() {
        Column() {
          Text("智能票据助手")
            .width($r('app.float.default_312'))
            .height($r('app.float.default_41'))
            .textAlign(TextAlign.Start)
            .fontSize($r('app.float.default_30'))
            .fontFamily('HarmonyHeiTi-Bold')
            .fontColor($r('app.color.text_color'))
            .lineHeight($r('app.float.default_41'))
            .fontWeight(700)
            .margin({
              top: $r('app.float.default_7'),
              bottom: $r('app.float.default_8'),
              left: $r('app.float.default_24'),
              right: $r('app.float.default_24')
            })
        }
        .width($r('app.float.default_360'))
        .height($r('app.float.default_56'))

        Tabs({ barPosition: BarPosition.End }) {
          TabContent() {
            TicketListTab()
          }
          .tabBar(new SubTabBarStyle('票据归集')
            .indicator({ marginTop: $r('app.float.default_8') })
            .labelStyle({ font: { size: $r('app.float.default_12') } })
          )

          TabContent() {
            ReportTab()
          }
          .tabBar(new SubTabBarStyle('智能报表')
            .indicator({ marginTop: $r('app.float.default_8') })
            .labelStyle({ font: { size: $r('app.float.default_12') } })
          )

          TabContent() {
            SandboxFilesTab()
          }
          .tabBar(new SubTabBarStyle('文件管理')
            .indicator({ marginTop: $r('app.float.default_8') })
            .labelStyle({ font: { size: $r('app.float.default_12') } })
          )
        }
        .barWidth('100%')
        .barHeight($r('app.float.default_56'))
        .width('100%')
        .layoutWeight(1)
      }
      .justifyContent(FlexAlign.Center)
      .width('100%')
      .padding({ top: $r('app.float.default_48') })
    }
    .width('100%')
    .height('100%')
  }
}
