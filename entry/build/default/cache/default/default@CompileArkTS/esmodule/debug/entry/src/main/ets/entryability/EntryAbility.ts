import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
import type { BusinessError } from "@ohos:base";
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');
    }
    onDestroy(): void {
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        // Main window is created, set main page for this ability
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageCreate');
        windowStage.getMainWindow().then(windowClass => {
            hilog.info(0x0000, 'testTag', '%{public}s', 'Succeeded in obtaining the main window. Data: ' + JSON.stringify(windowClass));
            windowClass.setWindowLayoutFullScreen(true).then(() => {
                hilog.info(0x0000, 'testTag', '%{public}s', 'Succeeded in setting the window layout to full-screen mode.');
            }).catch((e: BusinessError) => {
                hilog.error(0x0000, 'testTag', '%{public}s', 'Failed to set the window layout to full-screen mode. Cause:' + JSON.stringify(e));
            });
        }).catch((err: BusinessError) => {
            hilog.error(0x0000, 'testTag', '%{public}s', 'Failed to obtain the main window. Cause: ' + JSON.stringify(err));
        });
        windowStage.loadContent('pages/HomePage', (err, data) => {
            if (err.code) {
                hilog.error(0x0000, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
                return;
            }
            hilog.info(0x0000, 'testTag', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');
            try {
                AppStorage.setOrCreate('uiContext', windowStage.getMainWindowSync().getUIContext());
            }
            catch (error) {
                hilog.error(0x0000, 'testTag', `getMainWindowSync catch error, code: ${error.code}, message: ${error.message}`);
            }
        });
    }
    onWindowStageDestroy(): void {
        // Main window is destroyed, release UI related resources
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
    }
    onForeground(): void {
        // Ability has brought to foreground
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onForeground');
    }
    onBackground(): void {
        // Ability has back to background
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onBackground');
    }
}
