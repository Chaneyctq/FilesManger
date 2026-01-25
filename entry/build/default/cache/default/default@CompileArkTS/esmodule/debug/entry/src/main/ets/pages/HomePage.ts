if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
}
import { TicketListTab } from "@bundle:com.example.filesmanger/entry/ets/view/TicketListTab";
import { ReportTab } from "@bundle:com.example.filesmanger/entry/ets/view/ReportTab";
import { SandboxFilesTab } from "@bundle:com.example.filesmanger/entry/ets/view/SandboxFilesTab";
class HomePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HomePage_Params) {
    }
    updateStateVars(params: HomePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 16777265, "type": 20000, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Image.width('100%');
            Image.height('100%');
            Image.objectFit(ImageFit.Cover);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.justifyContent(FlexAlign.Center);
            Column.width('100%');
            Column.padding({ top: { "id": 16777260, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width({ "id": 16777257, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Column.height({ "id": 16777261, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("智能票据助手");
            Text.width({ "id": 16777255, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.height({ "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.textAlign(TextAlign.Start);
            Text.fontSize({ "id": 16777253, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontFamily('HarmonyHeiTi-Bold');
            Text.fontColor({ "id": 16777236, "type": 10001, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.lineHeight({ "id": 16777259, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Text.fontWeight(700);
            Text.margin({
                top: { "id": 16777263, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                bottom: { "id": 16777264, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                left: { "id": 16777250, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" },
                right: { "id": 16777250, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" }
            });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.End });
            Tabs.barWidth('100%');
            Tabs.barHeight({ "id": 16777261, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" });
            Tabs.width('100%');
            Tabs.layoutWeight(1);
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new TicketListTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 53, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "TicketListTab" });
                }
            });
            TabContent.tabBar(new SubTabBarStyle('票据归集')
                .indicator({ marginTop: { "id": 16777264, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ReportTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 61, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "ReportTab" });
                }
            });
            TabContent.tabBar(new SubTabBarStyle('智能报表')
                .indicator({ marginTop: { "id": 16777264, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new SandboxFilesTab(this, {}, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 69, col: 13 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "SandboxFilesTab" });
                }
            });
            TabContent.tabBar(new SubTabBarStyle('文件管理')
                .indicator({ marginTop: { "id": 16777264, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } })
                .labelStyle({ font: { size: { "id": 16777239, "type": 10002, params: [], "bundleName": "com.example.filesmanger", "moduleName": "entry" } } }));
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "HomePage";
    }
}
registerNamedRoute(() => new HomePage(undefined, {}), "", { bundleName: "com.example.filesmanger", moduleName: "entry", pagePath: "pages/HomePage", pageFullPath: "entry/src/main/ets/pages/HomePage", integratedHsp: "false", moduleType: "followWithHap" });
