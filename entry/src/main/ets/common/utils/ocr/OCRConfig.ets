/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import { TencentOCRConfig } from './TencentOCR';

/**
 * OCR配置管理
 * 注意：实际使用时请替换为你的腾讯云密钥
 */
export class OCRConfig {
  // TODO: 替换为你的腾讯云SecretId和SecretKey
  private static readonly SECRET_ID: string = 'YOUR_SECRET_ID';
  private static readonly SECRET_KEY: string = 'YOUR_SECRET_KEY';
  private static readonly REGION: string = 'ap-guangzhou';

  /**
   * 获取腾讯云OCR配置
   */
  static getTencentConfig(): TencentOCRConfig {
    return {
      secretId: OCRConfig.SECRET_ID,
      secretKey: OCRConfig.SECRET_KEY,
      region: OCRConfig.REGION
    };
  }

  /**
   * 检查配置是否有效
   */
  static isConfigValid(): boolean {
    return OCRConfig.SECRET_ID !== 'YOUR_SECRET_ID' &&
      OCRConfig.SECRET_KEY !== 'YOUR_SECRET_KEY';
  }
}
