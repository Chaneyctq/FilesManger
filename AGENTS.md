# AGENTS.md - FilesManger HarmonyOS Application

## Project Overview

HarmonyOS 5.0+ file management application using ArkTS and Stage model.
Implements file operations using Core File Kit including sandbox files, user files,
and photo library access.

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

## IDE Commands (DevEco Studio)

- **Build**: Build > Build Hap(s)/APP(s) > Build Hap(s)
- **Run**: Run > Run 'entry'
- **Preview**: Use Previewer panel for component preview

## Project Structure

```
entry/
├── src/main/
│   ├── ets/                    # ArkTS source code
│   │   ├── entryability/       # UIAbility entry point
│   │   ├── pages/              # Page components (@Entry)
│   │   ├── view/               # Reusable view components
│   │   ├── components/         # UI components
│   │   └── common/
│   │       ├── model/          # Data models and interfaces
│   │       └── utils/          # Utility classes
│   ├── resources/              # Resource files (strings, colors, media)
│   └── module.json5            # Module configuration
└── build-profile.json5         # Build configuration
```

## Code Style Guidelines

### File Headers

All source files must include Apache 2.0 license header:
```typescript
/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * ...
 */
```

### Import Conventions

```typescript
// Use @kit imports for HarmonyOS APIs
import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { buffer } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';
import { hilog } from '@kit.PerformanceAnalysisKit';

// Local imports use relative paths
import { SandboxFileItem } from '../common/model/SandboxFileItem';
import Logger from '../common/utils/Logger';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes, Interfaces, Enums | PascalCase | `SandboxFileUtil`, `SandboxFileItem` |
| Variables, Methods, Parameters | camelCase | `loadFiles()`, `selectedPath` |
| Constants | UPPER_SNAKE_CASE | `CONTENT_SEARCH_MAX_BYTES` |
| Enum Values | UPPER_SNAKE_CASE | `SandboxFileItemType.DIRECTORY` |
| Component structs | PascalCase | `struct HomePage` |
| State variables | camelCase with @State | `@State keyword: string` |

### Type System (CRITICAL)

ArkTS uses static typing. Follow these rules strictly:

```typescript
// REQUIRED: Explicit type annotations
const size: number = stat.size;
const items: SandboxFileItem[] = [];
let stat: fileIo.Stat | null = null;

// FORBIDDEN: any/unknown types
let config: any = {};  // DO NOT USE

// FORBIDDEN: Object spread operator
const newObj = { ...oldObj };  // DO NOT USE

// REQUIRED: Use explicit property copying
const newItem: SandboxFileItem = {
  path: item.path,
  name: item.name,
  type: item.type,
  size: item.size,
  modifiedTime: item.modifiedTime
};
```

### Static Method Calls (CRITICAL)

In static methods, use class name, NOT `this`:

```typescript
// CORRECT
export class SandboxFileUtil {
  static getSandboxRootDir(): string {
    return SandboxFileUtil.getContext().filesDir;  // Use class name
  }
  private static getContext(): common.UIAbilityContext { ... }
}

// INCORRECT - causes arkts-no-standalone-this error
static getSandboxRootDir(): string {
  return this.getContext().filesDir;  // DO NOT USE this
}
```

### Component Structure

```typescript
@Component
export struct MyComponent {
  // 1. State variables
  @State private isLoading: boolean = false;
  @State files: SandboxFileItem[] = [];

  // 2. Props (from parent)
  @Prop title: string = '';

  // 3. Private variables
  private controller: TextInputController = new TextInputController();

  // 4. Lifecycle methods
  aboutToAppear(): void {
    this.loadData();
  }

  aboutToDisappear(): void {
    // Clean up resources
  }

  // 5. Private methods
  private loadData(): void { ... }

  // 6. Build method (always last)
  build() {
    Column() { ... }
  }
}
```

### Error Handling

```typescript
// Use BusinessError for HarmonyOS API errors
import { BusinessError } from '@kit.BasicServicesKit';

try {
  const stat: fileIo.Stat = fileIo.statSync(path);
} catch (error) {
  const err: BusinessError = error as BusinessError;
  Logger.error('Operation failed, code=' + err.code + ', message=' + err.message);
  return defaultValue;
}

// For async operations
windowStage.loadContent('pages/HomePage', (err, data) => {
  if (err.code) {
    hilog.error(0x0000, 'testTag', 'Failed: %{public}s', JSON.stringify(err));
    return;
  }
  // Success handling
});
```

### Logging

Use the Logger utility or hilog:

```typescript
import Logger from '../common/utils/Logger';

Logger.info('Operation started');
Logger.error('Failed, code=' + err.code);

// Or direct hilog
import { hilog } from '@kit.PerformanceAnalysisKit';
hilog.info(0x0000, 'testTag', '%{public}s', 'Message');
```

### Resource References

```typescript
// Use $r() for resource references
Text($r('app.string.title'))
  .fontSize($r('app.float.default_16'))
  .fontColor($r('app.color.text_color'))

Image($r('app.media.background'))
  .width('100%')
```

### UI Layout Patterns

```typescript
// Stack for layered content (background + foreground)
Stack() {
  Image($r('app.media.background'))
  Column() { /* content */ }
}

// Use layoutWeight for flexible sizing
Row() {
  TextInput().layoutWeight(1)  // Takes remaining space
  Button('Action').width(80)   // Fixed width
}
```

### State Management Decorators

| Decorator | Use Case |
|-----------|----------|
| `@State` | Component-local reactive state |
| `@Prop` | One-way data from parent (immutable in child) |
| `@Link` | Two-way binding with parent |
| `@StorageLink` | Bind to AppStorage (global state) |
| `@Watch('method')` | Observe state changes |

### Page Navigation

```typescript
// Navigate to page with parameters
this.getUIContext().getRouter().pushUrl({
  url: 'pages/SandboxFileEditorPage',
  params: {
    path: item.path,
    name: item.name
  }
});

// Receive parameters in target page
const params = router.getParams() as Record<string, Object>;
const path = params['path'] as string;
```

## Testing

This project does not include automated tests. Manual testing through DevEco Studio
Previewer and device/emulator deployment is the primary testing method.

## Key Dependencies

- HarmonyOS SDK: 5.0.5 (17) - 6.0.0 (20)
- Core File Kit: File operations (`@kit.CoreFileKit`)
- Ability Kit: App lifecycle (`@kit.AbilityKit`)
- ArkTS Kit: Buffer operations (`@kit.ArkTS`)

## Common Patterns

### Utility Class Pattern

```typescript
export class MyUtil {
  static doOperation(param: string): boolean {
    try {
      // Implementation using class name for static calls
      const result = MyUtil.helper(param);
      return true;
    } catch (error) {
      const err: BusinessError = error as BusinessError;
      Logger.error('Failed: ' + err.message);
      return false;
    }
  }
  private static helper(param: string): string { ... }
}
```

### Model/Interface Definition

```typescript
export enum ItemType {
  FILE = 0,
  DIRECTORY = 1
}

export interface FileItem {
  path: string;
  name: string;
  type: ItemType;
  size: number;
  modifiedTime: number;
}
```
