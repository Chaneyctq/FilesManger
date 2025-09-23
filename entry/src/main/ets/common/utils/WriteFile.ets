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

import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

const uiContext: UIContext | undefined = AppStorage.get('uiContext');
let context = uiContext!.getHostContext() as common.UIAbilityContext;
let filesDir = context.filesDir;

/**
 * writeFile.
 * Write content to a file
 * @param content Contents to be written to the file
 */
export function writeFile(content: string): void {
  let filePath = filesDir + '/test.txt';
  // Open a file stream based on the file path.
  let fileStream = fileIo.createStreamSync(filePath, "w+");
  fileStream.writeSync(content);
  fileStream.close();
}