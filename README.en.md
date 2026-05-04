# Smart Ticket Assistant - HarmonyOS File Manager

## Introduction

This is a comprehensive HarmonyOS 5.0+ application that combines intelligent ticket/receipt management with advanced file management capabilities. Beyond basic file operations, it offers smart ticket collection, expense report generation, AI-powered consumption event association, duplicate file detection and cleanup, and more.

## Main Feature Modules

### 1. Ticket Collection
Intelligently recognize and manage various consumption tickets/receipts with automatic categorization and association analysis:

- **Ticket Parsing**: Automatically parse TXT, PDF, and OFD format ticket files, extracting merchant name, amount, date, invoice number, and other key information; for PDFs, a "local extraction + Tencent Cloud OCR fallback" multi-layer parsing strategy is used
- **Smart Categorization**: Auto-classify by consumption type (Catering, Transportation, Hotel, Shopping, Entertainment)
- **Advanced Search**: Multi-dimensional combined filtering by merchant name, amount range, date range, and consumption type
- **Duplicate Detection**: Automatically identify duplicate tickets to prevent duplicate reimbursement
- **AI Smart Association**: Based on DeepSeek AI large model, intelligently analyze relationships between tickets and automatically cluster consumption events (e.g., "Business Trip", "Group Dinner")
- **Folder Navigation**: Browse tickets in different folders within the sandbox directory
- **Ticket Creation**: Manually create custom tickets with support for multiple formats (TXT/PDF/OFD)
- **File Upload**: Upload external ticket files via system file picker, with automatic parsing and categorization

### 2. Smart Reports
One-click generation of expense reimbursement statistics reports:

- **Amount Statistics**: Automatically summarize total reimbursement amount and ticket count
- **Category Breakdown**: Display quantity and amount proportion by consumption type
- **Duplicate Alert**: Highlight duplicate ticket count and involved amount
- **Event Statistics**: Show the number of AI-associated consumption events
- **Report Export**: Generate formatted text reimbursement reports and save to app directory
- **Directory Selection**: Choose statistics scope (all subdirectories or current directory only)

### 3. File Manager
Enhanced sandbox file manager:

- **Directory Browsing**: Support multi-level directory navigation with back-to-parent
- **Dual-dimension Search**:
  - Search by file name keyword
  - Search by file content keyword
  - Toggle between recursive and current-directory search
- **File Operations**: Create files/folders, rename, delete
- **Text Editor**: Built-in text editor for direct text file editing

### 4. Duplicate File Detection (Worker Multi-threading)
High-performance duplicate file finder and cleanup tool:

- **Full Scan**: Thoroughly scan all files in the specified directory
- **Incremental Scan**: Based on directory modification time fingerprint, only scan changed files, significantly improving second scan speed
- **Smart Hash Algorithm**:
  - Phase 1: Quick filter by file size (only same-sized files can be duplicates)
  - Phase 2: Calculate MD5/SHA256 hash fingerprint (large files use head-tail mixed sampling optimization)
  - Phase 3: Real-time streaming feedback, report duplicates as soon as found
- **Multiple Cleanup Modes**:
  - One-click deduplication: Keep the first file in each group, auto-delete the rest
  - Manual selection: Check specific files to delete
  - Safety protection: Prevent deletion of the last file in a group
- **Recycle Bin**: Deleted files are moved to recycle bin instead of permanent deletion, with support for restore at any time
- **Real-time Progress**: Display progress percentage and current processing file during scanning

### 5. User Files (Basic Features)
- Save images to system gallery
- Select images from gallery
- Read and write text files in user directories

## Project Architecture

```
entry/src/main/ets/
├── entryability/          # Application entry Ability
├── pages/                 # Page-level components
│   ├── HomePage.ets       # Main page (bottom Tab navigation)
│   └── SandboxFileEditorPage.ets  # Text editor page
├── view/                  # Feature Tab components
│   ├── TicketListTab.ets  # Ticket collection
│   ├── ReportTab.ets      # Smart reports
│   ├── SandboxFilesTab.ets        # File manager
│   ├── DuplicateFilesTab.ets      # Duplicate file detection
│   ├── PublicFilesTab.ets         # User files
│   └── TicketCreateDialog.ets     # Create ticket dialog
├── components/            # Common UI components
├── workers/               # Worker threads
│   └── DuplicateScanWorker.ets    # Duplicate file scan worker
└── common/
    ├── model/             # Data models
    │   ├── Ticket.ets     # Ticket/report/search models
    │   ├── DuplicateModels.ets    # Duplicate detection models
    │   ├── SandboxFileItem.ets    # File item model
    │   └── ConsumptionEvent.ets   # Consumption event model
    └── utils/             # Utility classes
        ├── TicketUtil.ets         # Core ticket processing logic
        ├── sandbox/
        │   └── SandboxFileUtil.ets    # Sandbox file operations
        ├── duplicate/
        │   ├── DuplicateScannerUtil.ets   # Duplicate scan utility
        │   ├── FileHashUtil.ets           # File hash calculation
        │   └── RecycleBinUtil.ets         # Recycle bin management
        ├── ai/
        │   ├── DeepSeekAPI.ets        # DeepSeek AI interface
        │   └── AIEventAssociator.ets  # AI event association
        ├── ocr/
        │   ├── TencentOCR.ets         # Tencent Cloud OCR general text recognition
        │   └── OCRConfig.ets          # OCR credential configuration
        ├── ticket/            # Ticket sub-utilities
        │   ├── TicketGenerator.ets    # Ticket generator
        │   ├── TicketParser.ets       # Ticket parser
        │   ├── TicketSearcher.ets     # Ticket searcher
        │   └── ReportGenerator.ets    # Report generator
        ├── Logger.ets         # Logging utility
        ├── ReadFile.ets       # File reading
        ├── WriteFile.ets      # File writing
        ├── PictureSaving.ets  # Image saving
        └── SavingAndSelectUserFile.ets    # User file operations
```

## Core Features

| Feature | Description |
|---------|-------------|
| **Worker Multi-threading** | Duplicate file detection runs in an independent Worker thread to avoid blocking UI |
| **Incremental Scan** | Directory mtime fingerprint-based incremental scanning, second scan speed improved by orders of magnitude |
| **Streaming Real-time Feedback** | Display discovered duplicate groups during scanning without waiting for completion |
| **AI Smart Analysis** | Integrated DeepSeek large model API for intelligent consumption scenario understanding and event clustering |
| **Safe Recycle Bin** | Delete operations use "move to recycle bin" instead of permanent deletion, with one-click restore support |
| **Multi-format Support** | Ticket recognition and generation support TXT, PDF, and OFD formats |
| **Tencent Cloud OCR Fallback** | Automatically call Tencent Cloud General Printed Character Recognition API when local PDF parsing fails, improving parsing success rate |

## Related Technologies

- [Core File Kit](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-fs): Basic file operation APIs, providing file read/write, directory management, streaming operations (`@kit.CoreFileKit`)
- [File Picker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-picker): File picker supporting DocumentViewPicker and other selection/save capabilities (`@kit.CoreFileKit`)
- [Photo Access Helper](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-photoaccesshelper): Photo management module supporting album creation and media data access/modification (`@kit.MediaLibraryKit`)
- [Worker](https://developer.huawei.com/consumer/en/doc/harmonyos-guides/arkts-concurrent-optimization-worker): Multi-threading Worker for background time-consuming tasks (`@kit.ArkTS`)
- [DeepSeek API](https://platform.deepseek.com/): AI large model interface for intelligent consumption event association analysis
- [Tencent Cloud OCR API](https://cloud.tencent.com/document/product/866): General printed character recognition interface for text extraction from image-based PDF ticket content (`@kit.NetworkKit` + `@kit.CryptoArchitectureKit`)

## Permissions

```json
{
  "name": "ohos.permission.INTERNET"
}
```

> The app requires internet permission to call the DeepSeek AI API and Tencent Cloud OCR API. You can disable AI and OCR features if this permission is not granted.

## Usage Instructions

### Ticket Collection
1. Enter the "Ticket Collection" page, the app will automatically load ticket files from the sandbox directory
2. Tap "Generate Ticket" at the bottom to manually create a new ticket
3. Tap "Upload Ticket" to select external ticket files from the system (supports TXT/PDF/OFD)
4. Tap "Test Data" to quickly generate mock tickets for feature exploration
5. Use the search bar and "Advanced" button for multi-dimensional filtering
6. Enable "AI Smart Association" switch (requires DeepSeek API Key configuration) for automatic consumption event analysis
7. Switch between "List", "Events", and "Duplicates" view modes for different perspectives

### Smart Reports
1. Enter the "Smart Reports" page to automatically statistics all tickets in the current directory
2. View total reimbursement amount, ticket count, and category breakdown
3. If duplicate tickets exist, an orange warning card will be displayed
4. Tap "Generate Report" to export a formatted text report
5. Enable "AI Smart Grouping" for more intelligent consumption event analysis

### File Manager
1. Enter the "File Manager" page to browse sandbox files
2. Tap folders to enter subdirectories, tap "Back" to return to parent
3. Enter keywords in the search box to search by file name or content
4. Toggle "Current"/"All" to control search scope
5. Tap "+" button to create new files or folders
6. Tap "..." on the right side of a file to rename, delete, or edit

### Duplicate File Detection
1. Enter the "File Manager" page (note: duplicate detection is integrated in related file management flows)
2. Tap "Full Scan" for thorough checking, or "Incremental Scan" for quick detection based on previous results
3. View progress and discovered duplicate groups in real-time during scanning
4. Expand duplicate groups, check files to delete (or tap "Select All")
5. Tap "Delete Selected" or "One-click Deduplication" to clean up duplicate files
6. Accidentally deleted files can be restored from the "Recycle Bin"

## Technical Implementation Details

### Tencent Cloud OCR Text Recognition

This project integrates **Tencent Cloud General Printed Character Recognition (GeneralBasicOCR / GeneralAccurateOCR)** as a fallback solution for PDF ticket parsing. When local text extraction fails to obtain valid content, the PDF is automatically converted to Base64 and sent to the Tencent Cloud OCR API for recognition.

#### 1. Role in the Ticket Parsing Pipeline

`TicketParser.ets` uses a **four-layer degraded parsing strategy** for PDFs:

```
PDF File
  ├── Method 1: Async decompression to extract PDF text streams (extractPdfStreamsAsync)
  ├── Method 2: Extract parenthesized parameter strings (extractPdfStrings)
  ├── Method 3: Extract all readable text (extractReadableText)
  └── Method 4: Tencent Cloud OCR recognition (recognizePdfWithOCR)  ← Fallback
```

- The first three layers are **local pure-text extraction**, fast and network-free
- The fourth layer is **cloud-based OCR recognition**, triggered only when local extraction results are invalid (insufficient Chinese characters or missing ticket keywords)

#### 2. Signature Authentication (TC3-HMAC-SHA256)

Tencent Cloud API requires every request to carry an `Authorization` header signed with the TC3-HMAC-SHA256 algorithm. `TencentOCR.ets` fully implements this signing flow on the device:

**Step 1: Build Canonical Request**
```
HTTPMethod + '\n' +
CanonicalURI + '\n' +
CanonicalQueryString + '\n' +
CanonicalHeaders + '\n' +
SignedHeaders + '\n' +
HashedRequestPayload
```
- `HashedRequestPayload`: SHA256 hash of the request body JSON

**Step 2: Build String to Sign**
```
Algorithm + '\n' +
Timestamp + '\n' +
CredentialScope + '\n' +
HashedCanonicalRequest
```
- `CredentialScope`: format `Date/Service/tc3_request`

**Step 3: Calculate Signature**
```
SecretDate    = HMAC_SHA256("TC3" + SecretKey, Date)
SecretService = HMAC_SHA256(SecretDate, Service)
SecretSigning = HMAC_SHA256(SecretService, "tc3_request")
Signature     = HMAC_SHA256_Hex(SecretSigning, StringToSign)
```

**Step 4: Assemble Authorization**
```
TC3-HMAC-SHA256 Credential=SecretId/CredentialScope,
SignedHeaders=content-type;host, Signature=...
```

> Implementation relies on HarmonyOS `@kit.CryptoArchitectureKit` for SHA256 and HMAC-SHA256 computation.

#### 3. Request and Response Flow

**Request Construction (`doRequest`)**:
| Header Field | Description |
|-------------|-------------|
| `Content-Type` | `application/json` |
| `Host` | `ocr.tencentcloudapi.com` |
| `X-TC-Action` | `GeneralBasicOCR` or `GeneralAccurateOCR` |
| `X-TC-Version` | `2018-11-19` |
| `X-TC-Timestamp` | Current Unix timestamp |
| `X-TC-Region` | User-configured Tencent Cloud region (e.g., `ap-guangzhou`) |
| `Authorization` | TC3-HMAC-SHA256 signature result |

**Request Body**:
```json
{
  "ImageBase64": "iVBORw0KGgoAAAA...",
  "IsPdf": true,
  "PdfPageNumber": 1
}
```

**Response Parsing**:
```json
{
  "Response": {
    "TextDetections": [
      { "DetectedText": "Catering Fee", "Confidence": 99 },
      { "DetectedText": "¥128.00", "Confidence": 98 }
    ],
    "RequestId": "xxx"
  }
}
```
- Text lines from the `TextDetections` array are concatenated to form the complete extracted ticket text
- `Confidence` is also returned for subsequent quality assessment

#### 4. Supported Recognition Interfaces

The `TencentOCR` class encapsulates three calling methods:

| Method | Interface | Use Case |
|--------|-----------|----------|
| `recognizeBase64(imageBase64)` | `GeneralBasicOCR` | Recognize image Base64 (e.g., photographed paper invoices) |
| `recognizePdfBase64(pdfBase64, pageNumber)` | `GeneralAccurateOCR` | Recognize a specific page of a PDF file (primary usage in this project) |
| `recognizeUrl(imageUrl)` | `GeneralBasicOCR` | Recognize online image URLs |

#### 5. Configuration

Configure your Tencent Cloud credentials in `entry/src/main/ets/common/utils/ocr/OCRConfig.ets`:

```typescript
private static readonly SECRET_ID: string = 'YOUR_SECRET_ID';
private static readonly SECRET_KEY: string = 'YOUR_SECRET_KEY';
private static readonly REGION: string = 'ap-guangzhou';
```

> ⚠️ Note: When SecretId and SecretKey are empty or placeholder values, the OCR feature is automatically skipped without affecting other local parsing functions.

## Constraints

1. **Supported Devices**: Huawei phones, tablets, and 2in1 devices (standard systems)
2. **HarmonyOS Version**: HarmonyOS 5.0.5 Release or later
3. **DevEco Studio Version**: DevEco Studio 6.0.0 Release or later
4. **HarmonyOS SDK Version**: HarmonyOS SDK 5.0.5(17) - 6.0.0(20)
5. **AI Features**: Requires user-configured DeepSeek API Key; the app does not provide built-in AI services
6. **OCR Features**: Requires user-configured Tencent Cloud SecretId and SecretKey (configured in `entry/src/main/ets/common/utils/ocr/OCRConfig.ets`)
7. **File Formats**: TXT format has the best ticket parsing support; PDF/OFD have basic support; PDF parsing automatically falls back to Tencent Cloud OCR when local extraction fails

## Build Commands

```bash
# Build HAP (debug mode)
hvigorw assembleHap --mode module -p product=default -p buildMode=debug

# Build HAP (release mode)
hvigorw assembleHap --mode module -p product=default -p buildMode=release

# Clean build artifacts
hvigorw clean

# Sync project dependencies
hvigorw sync
```

## Open Source License

This project is licensed under the [Apache License 2.0](LICENSE).
