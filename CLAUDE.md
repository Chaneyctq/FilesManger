# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HarmonyOS 5.0+ file management application using ArkTS and Stage model. Implements file operations using Core File Kit including sandbox files, user files, and photo library access. Features include ticket management, intelligent reporting, and duplicate file detection with worker threads.

## Build Commands

```bash
# Build the project (run from project root)
hvigorw assembleHap --mode module -p product=default

# Build debug variant
hvigorw assembleHap --mode module -p product=default -p buildMode=debug

# Build release variant
hvigorw assembleHap --mode module -p product=default -p buildMode=release

# Clean build artifacts
hvigorw clean

# Sync project dependencies
hvigorw sync
```

**DevEco Studio**: Build > Build Hap(s)/APP(s) > Build Hap(s), Run > Run 'entry'

## Architecture

**Entry Point**: `entry/src/main/ets/entryability/EntryAbility.ets` - UIAbility that loads HomePage

**Main UI**: `entry/src/main/ets/pages/HomePage.ets` - Tabbed interface with three tabs:
- TicketListTab - Ticket collection management
- ReportTab - Intelligent reporting
- SandboxFilesTab - File management (contains DuplicateFilesTab)

**Background Processing**: `entry/src/main/ets/workers/DuplicateScanWorker.ets` - Worker thread for duplicate file scanning

**Key Utilities** (in `entry/src/main/ets/common/utils/`):
- `sandbox/SandboxFileUtil.ets` - File system operations
- `duplicate/DuplicateScannerUtil.ets` - Duplicate detection with incremental scanning
- `duplicate/FileHashUtil.ets` - MD5/SHA256 hash calculation
- `duplicate/RecycleBinUtil.ets` - Recycle bin with restore functionality

## Critical ArkTS Rules

### Static Method Calls
In static methods, use class name, NOT `this`:
```typescript
// CORRECT
static getSandboxRootDir(): string {
  return SandboxFileUtil.getContext().filesDir;
}

// WRONG - causes arkts-no-standalone-this error
static getSandboxRootDir(): string {
  return this.getContext().filesDir;
}
```

### Type System
```typescript
// REQUIRED: Explicit type annotations
const items: SandboxFileItem[] = [];
let stat: fileIo.Stat | null = null;

// FORBIDDEN: any/unknown types, Object spread operator
const newObj = { ...oldObj };  // DO NOT USE - copy properties explicitly
```

### Import Conventions
```typescript
// HarmonyOS APIs use @kit imports
import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';

// Local imports use relative paths
import { SandboxFileItem } from '../common/model/SandboxFileItem';
```

### Error Handling
```typescript
try {
  const stat: fileIo.Stat = fileIo.statSync(path);
} catch (error) {
  const err: BusinessError = error as BusinessError;
  Logger.error('Failed, code=' + err.code + ', message=' + err.message);
}
```

## Component Structure

```typescript
@Component
export struct MyComponent {
  // 1. State variables
  @State private isLoading: boolean = false;
  // 2. Props (from parent)
  @Prop title: string = '';
  // 3. Private variables
  private controller: TextInputController = new TextInputController();
  // 4. Lifecycle methods
  aboutToAppear(): void { }
  // 5. Private methods
  private loadData(): void { }
  // 6. Build method (always last)
  build() { }
}
```

## State Management Decorators

| Decorator | Use Case |
|-----------|----------|
| `@State` | Component-local reactive state |
| `@Prop` | One-way data from parent |
| `@Link` | Two-way binding with parent |
| `@StorageLink` | Bind to AppStorage (global state) |

## Testing

No automated tests. Manual testing through DevEco Studio Previewer and device/emulator deployment.

## Requirements

- HarmonyOS SDK: 5.0.5 (17) - 6.0.0 (20)
- DevEco Studio: 6.0.0 Release+
- Supported devices: Phone, Tablet, 2-in-1
