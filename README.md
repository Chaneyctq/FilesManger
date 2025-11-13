# 实现文件管理功能

## 简介

本示例通过Core File kit实现文件管理相关的操作，包括应用文件保存与读取，用户文件图片读取，txt文档读取保存操作。帮助开发者应对多种文件处理场景。

![](screenshots/device/file.gif)

## 相关概念

- [文件管理能力](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-file-fs)：该模块为基础文件操作API，提供基础文件操作能力，包括文件基本管理、文件目录管理、文件信息统计、文件流式读写等常用功能。（@ohos.file.fs）
- [选择器](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-file-picker)： 选择器(Picker)是一个封装DocumentViewPicker、AudioViewPicker等API模块，具有选择与保存的能力。（@ohos.file.picker）
- [相册管理模块](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-photoaccesshelper)：该模块提供相册管理模块能力，包括创建相册以及访问、修改相册中的媒体数据信息以及PhotoViewPicker等。（@ohos.file.photoAccessHelper）
- [PhotoViewPicker](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkts-apis-photoaccesshelper-photoviewpicker)：图库选择器对象，用来支撑选择图片/视频和保存图片/视频等用户场景。
- [DocumentViewPicker](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-file-picker#documentviewpicker)：文件选择器对象，用来支撑选择和保存各种格式文档。

## 相关权限

不涉及

## 使用说明

1. 在输入框输入内容后，点击保存至应用沙箱目录，可以创建沙箱文件并将信息存储在沙箱文件下。
2. 点击读取保存的文件内容，即可获取沙箱文件保存的内容。
3. 点击保存图片按钮，可以将图片保存至图库中。
4. 点击添加文件的图片，可以拉取图库，并挑选一张图片展示在页面上。
5. 在输入框输入内容后，点击保存 test.txt至用户目录，可以拉取文件管理页面，创建文件并保存内容。
6. 点击读取test.txt文件内容。可以拉取文件目录，挑选文件读取内容。

## 约束与限制

1. 本示例仅支持标准系统上运行，支持设备：华为手机。
2. HarmonyOS系统：HarmonyOS 5.0.5 Release及以上。
3. DevEco Studio版本：DevEco Studio 6.0.0 Release及以上。
4. HarmonyOS SDK版本：HarmonyOS 6.0.0 Release SDK及以上。
