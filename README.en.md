# Files Manager

## Introduction

Learn how to implement file management, including saving and reading app files, reading user files and images, and reading and saving TXT files.  

![](screenshots/device/file.en.gif)

## Concepts

- [Files manager](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-fs): provides APIs for file operations, including accessing and managing files and directories, obtaining file information, and reading and writing data using streams. (**@ohos.file.fs**)
- [Picker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-picker): encapsulates APIs such as **DocumentViewPicker**, and **AudioViewPicker** for you to pick and save files. (**@ohos.file.picker**)
- [Photo manager](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-picker): provides the photo management capabilities, including creating an album, and accessing and modifying media data in the album, and **PhotoViewPicker**. (**@ohos.file.photoAccessHelper**)
- [PhotoViewPicker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-picker#photoviewpickerdeprecated): allows you to pick and save images and videos.
- [DocumentViewPicker](https://developer.huawei.com/consumer/en/doc/harmonyos-references/js-apis-file-picker#documentviewpicker): allows you to pick and save documents in different formats.

## Permissions

N/A

## How to Use

1. Enter the content in the text box and tap **Save to the application sandbox directory**. Create a sandbox file for saving the information.
2. Tap **Read the saved file content** to read the content saved in the sandbox file.
3. Tap **Save image** to save the image to Gallery.
4. Tap the image to be added. Switch to Gallery and pick an image to display.
5. Enter the content in the text box and tap **Save the test.txt file to the user directory**. Switch to the file manager page, create a file, and save the content.
6. Tap **Read the test.txt file content**. Switch to the file directory and pick the file to read.

## Constraints

1. The sample is only supported on Huawei phones with standard systems.
2. HarmonyOS: HarmonyOS 5.0.5 Release or later.
3. DevEco Studio: DevEco Studio 6.0.0 Release or later.
4. HarmonyOS SDK: HarmonyOS 6.0.0 Release SDK or later.
