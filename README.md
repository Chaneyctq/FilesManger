# 智能票据助手 - HarmonyOS 文件管理应用

## 简介

本示例是一款基于 HarmonyOS 5.0+ 的智能票据管理与文件管理综合应用。除了基础文件操作外，还提供了票据智能归集、报销报表生成、AI 消费事件关联、重复文件检测与清理等高级功能，帮助用户高效管理个人票据和文件。

## 主要功能模块

### 1. 票据归集
智能识别和管理各类消费票据，支持自动分类与关联分析：

- **票据解析**：自动解析 TXT、PDF、OFD 格式的票据文件，提取商户、金额、日期、发票号等关键信息；对于 PDF 采用"本地提取 + 腾讯云 OCR 兜底"的多层解析策略
- **智能分类**：按消费类型自动分类（餐饮美食、交通出行、酒店住宿、购物消费、休闲娱乐）
- **高级搜索**：支持按商家名称、金额范围、日期范围、消费类型等多维度组合筛选
- **重复检测**：自动识别重复票据，避免重复报销
- **AI 智能关联**：基于 DeepSeek AI 大模型，智能分析票据间的关联性，自动聚类消费事件（如"差旅出行"、"聚餐活动"等）
- **文件夹导航**：支持在沙箱目录中浏览不同文件夹的票据
- **票据创建**：手动创建自定义票据，支持多种格式（TXT/PDF/OFD）
- **文件上传**：通过系统文件选择器上传外部票据文件，自动解析并分类

### 2. 智能报表
一键生成报销统计报表，数据一目了然：

- **金额统计**：自动汇总报销总金额、票据总数量
- **分类明细**：按消费类型展示数量和金额占比
- **重复预警**：高亮显示重复票据数量和涉及金额
- **事件统计**：展示 AI 关联的消费事件数量
- **报销单导出**：生成格式化文本报销单，保存至应用目录
- **目录选择**：可选择统计范围（全部子目录或仅当前目录）

### 3. 文件管理
增强的沙箱文件管理器：

- **目录浏览**：支持多级目录导航，返回上级目录
- **双维度搜索**：
  - 按文件名关键字搜索
  - 按文件内容关键字搜索
  - 支持递归搜索和当前目录搜索切换
- **文件操作**：创建文件/文件夹、重命名、删除
- **文本编辑**：内置文本编辑器，可直接编辑文本文件

### 4. 重复文件检测（Worker 多线程）
高性能重复文件查找与清理工具：

- **全量扫描**：彻底扫描指定目录下所有文件
- **增量扫描**：基于目录修改时间指纹，仅扫描变更文件，大幅提升二次扫描速度
- **智能哈希算法**：
  - 第一阶段：按文件大小快速筛选（相同大小才有可能是重复文件）
  - 第二阶段：计算 MD5/SHA256 哈希指纹（大文件采用头尾混合采样优化）
  - 第三阶段：实时流式反馈，发现一个上报一个
- **多种清理方式**：
  - 一键去重：每组保留第一个文件，自动删除其余
  - 手动选择：勾选特定文件进行删除
  - 安全保护：禁止删除组内最后一个文件
- **回收站机制**：删除的文件先移入回收站，支持随时恢复，防止误删
- **实时进度**：扫描过程中显示进度百分比和当前处理文件

### 5. 用户文件（基础功能）
- 保存图片至系统图库
- 从图库选择图片
- 在用户目录读写文本文件

## 项目架构

```
entry/src/main/ets/
├── entryability/          # 应用入口 Ability
├── pages/                 # 页面级组件
│   ├── HomePage.ets       # 主页面（底部 Tab 导航）
│   └── SandboxFileEditorPage.ets  # 文本编辑器页面
├── view/                  # 功能 Tab 组件
│   ├── TicketListTab.ets  # 票据归集
│   ├── ReportTab.ets      # 智能报表
│   ├── SandboxFilesTab.ets        # 文件管理
│   ├── DuplicateFilesTab.ets      # 重复文件检测
│   ├── PublicFilesTab.ets         # 用户文件
│   └── TicketCreateDialog.ets     # 创建票据弹窗
├── components/            # 通用 UI 组件
├── workers/               # Worker 线程
│   └── DuplicateScanWorker.ets    # 重复文件扫描 Worker
└── common/
    ├── model/             # 数据模型
    │   ├── Ticket.ets     # 票据/报表/搜索模型
    │   ├── DuplicateModels.ets    # 重复文件检测模型
    │   ├── SandboxFileItem.ets    # 文件项模型
    │   └── ConsumptionEvent.ets   # 消费事件模型
    └── utils/             # 工具类
        ├── TicketUtil.ets         # 票据处理核心逻辑
        ├── sandbox/
        │   └── SandboxFileUtil.ets    # 沙箱文件操作
        ├── duplicate/
        │   ├── DuplicateScannerUtil.ets   # 重复扫描工具
        │   ├── FileHashUtil.ets           # 文件哈希计算
        │   └── RecycleBinUtil.ets         # 回收站管理
        ├── ai/
        │   ├── DeepSeekAPI.ets        # DeepSeek AI 接口
        │   └── AIEventAssociator.ets  # AI 事件关联
        ├── ocr/
        │   ├── TencentOCR.ets         # 腾讯云 OCR 通用文字识别
        │   └── OCRConfig.ets          # OCR 密钥配置
        ├── ticket/            # 票据子工具
        │   ├── TicketGenerator.ets    # 票据生成器
        │   ├── TicketParser.ets       # 票据解析器
        │   ├── TicketSearcher.ets     # 票据搜索器
        │   └── ReportGenerator.ets    # 报表生成器
        ├── Logger.ets         # 日志工具
        ├── ReadFile.ets       # 文件读取
        ├── WriteFile.ets      # 文件写入
        ├── PictureSaving.ets  # 图片保存
        └── SavingAndSelectUserFile.ets    # 用户文件操作
```

## 核心特性

| 特性 | 说明 |
|------|------|
| **Worker 多线程扫描** | 重复文件检测在独立 Worker 线程执行，避免阻塞 UI |
| **增量扫描** | 基于目录 mtime 指纹的增量扫描，二次扫描速度提升数十倍 |
| **流式实时反馈** | 扫描过程中实时显示发现的重复组，无需等待全部完成 |
| **AI 智能分析** | 集成 DeepSeek 大模型 API，智能理解消费场景并聚类事件 |
| **安全回收站** | 删除操作采用"移动至回收站"而非直接删除，支持一键恢复 |
| **多格式支持** | 票据支持 TXT、PDF、OFD 格式识别与生成 |
| **腾讯云 OCR 兜底** | PDF 本地解析失败时自动调用腾讯云通用印刷体识别 API，提升解析成功率 |

## 相关技术

- [Core File Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-file-fs)：基础文件操作 API，提供文件读写、目录管理、流式操作等能力（`@kit.CoreFileKit`）
- [File Picker](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-file-picker)：文件选择器，支持 DocumentViewPicker 等选择与保存能力（`@kit.CoreFileKit`）
- [Photo Access Helper](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-photoaccesshelper)：相册管理模块，支持创建相册及访问、修改媒体数据（`@kit.MediaLibraryKit`）
- [Worker](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-concurrent-optimization-worker)：多线程 Worker，用于后台执行耗时任务（`@kit.ArkTS`）
- [DeepSeek API](https://platform.deepseek.com/)：AI 大模型接口，用于智能消费事件关联分析
- [腾讯云 OCR API](https://cloud.tencent.com/document/product/866)：通用印刷体识别接口，用于 PDF 票据图像化内容的文字提取（`@kit.NetworkKit` + `@kit.CryptoArchitectureKit`）

## 相关权限

```json
{
  "name": "ohos.permission.INTERNET"
}
```

> 应用需要联网权限以调用 DeepSeek AI API 和腾讯云 OCR API。若不需要 AI 和 OCR 功能，可关闭该权限。

## 使用说明

### 票据归集
1. 进入"票据归集"页面，应用会自动加载沙箱目录中的票据文件
2. 点击底部"生成票据"可手动创建新票据
3. 点击"上传票据"可从系统选择外部票据文件（支持 TXT/PDF/OFD）
4. 点击"测试数据"快速生成模拟票据用于体验功能
5. 使用搜索栏和"高级"按钮进行多维度筛选
6. 开启"AI 智能关联"开关（需配置 DeepSeek API Key），系统自动分析消费事件
7. 切换"列表"/"事件"/"重复"三种视图模式查看不同维度数据

### 智能报表
1. 进入"智能报表"页面，自动统计当前目录下所有票据
2. 查看总报销金额、票据数量、分类明细
3. 如有重复票据，页面会显示橙色预警卡片
4. 点击"生成报销单"导出格式化文本报告
5. 可开启"AI 智能分组"获得更智能的消费事件分析

### 文件管理
1. 进入"文件管理"页面浏览沙箱文件
2. 点击文件夹进入子目录，点击"返回"回到上级
3. 在搜索框输入关键字按文件名或内容搜索
4. 切换"当前"/"全部"控制搜索范围
5. 点击"+"按钮创建新文件或文件夹
6. 点击文件右侧"..."进行重命名、删除或编辑

### 重复文件检测
1. 进入"文件管理"页面（注：重复检测功能集成在文件管理相关流程中）
2. 点击"全量扫描"进行彻底检查，或"增量扫描"基于上次结果快速检测
3. 扫描过程中实时查看进度和发现的重复组
4. 展开重复组，勾选要删除的文件（或点击"全选"）
5. 点击"删除选中"或"一键去重"清理重复文件
6. 误删的文件可在"回收站"中一键恢复

## 技术实现详解

### 腾讯云 OCR 文字识别实现

本项目集成了**腾讯云通用印刷体识别（GeneralBasicOCR / GeneralAccurateOCR）**作为 PDF 票据解析的兜底方案。当本地文本提取无法获得有效内容时，自动将 PDF 转为 Base64 并调用腾讯云 OCR API 进行识别。

#### 1. 在票据解析流程中的定位

`TicketParser.ets` 对 PDF 采用**四层降级解析策略**：

```
PDF 文件
  ├── 方法1: 异步解压提取 PDF 文本流 (extractPdfStreamsAsync)
  ├── 方法2: 提取括号内的参数字符串 (extractPdfStrings)
  ├── 方法3: 提取所有可读文本 (extractReadableText)
  └── 方法4: 腾讯云 OCR 识别 (recognizePdfWithOCR)  ← 兜底方案
```

- 前三层为**本地纯文本提取**，速度快、无需联网
- 第四层为**云端 OCR 识别**，仅在本地提取结果无效（中文字符不足或缺少票据关键字）时触发

#### 2. 签名鉴权机制（TC3-HMAC-SHA256）

腾讯云 API 要求每个请求都携带经过 TC3-HMAC-SHA256 算法签名的 `Authorization` 头部。`TencentOCR.ets` 在设备端完整实现了该签名流程：

**步骤一：拼接规范请求串（Canonical Request）**
```
HTTPMethod + '\n' +
CanonicalURI + '\n' +
CanonicalQueryString + '\n' +
CanonicalHeaders + '\n' +
SignedHeaders + '\n' +
HashedRequestPayload
```
- `HashedRequestPayload`：对请求体 JSON 进行 SHA256 哈希

**步骤二：拼接待签名字符串（String to Sign）**
```
Algorithm + '\n' +
Timestamp + '\n' +
CredentialScope + '\n' +
HashedCanonicalRequest
```
- `CredentialScope`：格式为 `Date/Service/tc3_request`

**步骤三：计算签名（Signature）**
```
SecretDate    = HMAC_SHA256("TC3" + SecretKey, Date)
SecretService = HMAC_SHA256(SecretDate, Service)
SecretSigning = HMAC_SHA256(SecretService, "tc3_request")
Signature     = HMAC_SHA256_Hex(SecretSigning, StringToSign)
```

**步骤四：拼接 Authorization**
```
TC3-HMAC-SHA256 Credential=SecretId/CredentialScope,
SignedHeaders=content-type;host, Signature=...
```

> 实现依赖 HarmonyOS 的 `@kit.CryptoArchitectureKit` 提供 SHA256 和 HMAC-SHA256 计算能力。

#### 3. 请求与响应流程

**请求构建（`doRequest`）**：
| 头部字段 | 说明 |
|---------|------|
| `Content-Type` | `application/json` |
| `Host` | `ocr.tencentcloudapi.com` |
| `X-TC-Action` | `GeneralBasicOCR` 或 `GeneralAccurateOCR` |
| `X-TC-Version` | `2018-11-19` |
| `X-TC-Timestamp` | 当前 Unix 时间戳 |
| `X-TC-Region` | 用户配置的腾讯云地域（如 `ap-guangzhou`） |
| `Authorization` | TC3-HMAC-SHA256 签名结果 |

**请求体**：
```json
{
  "ImageBase64": "iVBORw0KGgoAAAA...",
  "IsPdf": true,
  "PdfPageNumber": 1
}
```

**响应解析**：
```json
{
  "Response": {
    "TextDetections": [
      { "DetectedText": "餐饮费", "Confidence": 99 },
      { "DetectedText": "¥128.00", "Confidence": 98 }
    ],
    "RequestId": "xxx"
  }
}
```
- 将 `TextDetections` 数组中的文字按行拼接，即为提取到的完整票据文本
- 同时返回 `Confidence` 置信度，可用于后续判断识别质量

#### 4. 支持的识别接口

`TencentOCR` 类封装了三种调用方式：

| 方法 | 接口 | 适用场景 |
|------|------|---------|
| `recognizeBase64(imageBase64)` | `GeneralBasicOCR` | 识别图片 Base64（如拍照的纸质发票） |
| `recognizePdfBase64(pdfBase64, pageNumber)` | `GeneralAccurateOCR` | 识别 PDF 文件的指定页（项目中主要使用） |
| `recognizeUrl(imageUrl)` | `GeneralBasicOCR` | 识别网络图片 URL |

#### 5. 配置方式

在 `entry/src/main/ets/common/utils/ocr/OCRConfig.ets` 中配置你的腾讯云密钥：

```typescript
private static readonly SECRET_ID: string = 'YOUR_SECRET_ID';
private static readonly SECRET_KEY: string = 'YOUR_SECRET_KEY';
private static readonly REGION: string = 'ap-guangzhou';
```

> ⚠️ 注意：SecretId 和 SecretKey 为空或为占位值时，OCR 功能自动跳过，不影响其他本地解析功能。

## 约束与限制

1. **运行设备**：支持华为手机、平板及 2in1 设备（标准系统）
2. **HarmonyOS 版本**：HarmonyOS 5.0.5 Release 及以上
3. **DevEco Studio 版本**：DevEco Studio 6.0.0 Release 及以上
4. **HarmonyOS SDK 版本**：HarmonyOS SDK 5.0.5(17) - 6.0.0(20)
5. **AI 功能**：需要用户自行配置 DeepSeek API Key，应用本身不提供内置 AI 服务
6. **OCR 功能**：需要用户自行配置腾讯云 SecretId 和 SecretKey（在 `entry/src/main/ets/common/utils/ocr/OCRConfig.ets` 中配置）
7. **文件格式**：票据解析目前对 TXT 格式支持最完善，PDF/OFD 为基础支持；PDF 解析在本地提取失败时会自动降级到腾讯云 OCR

## 开发构建

```bash
# 构建 HAP（调试模式）
hvigorw assembleHap --mode module -p product=default -p buildMode=debug

# 构建 HAP（发布模式）
hvigorw assembleHap --mode module -p product=default -p buildMode=release

# 清理构建产物
hvigorw clean

# 同步项目依赖
hvigorw sync
```

## 开源协议

本项目基于 [Apache License 2.0](LICENSE) 开源协议。
