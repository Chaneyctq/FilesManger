const fs = require('fs');
const path = require('path');

// 配置参数
const CONFIG = {
  targetDir: path.join(__dirname, 'mock_data'),
  totalFiles: 200,
  minSize: 500,    // 最小 500B
  maxSize: 2048,   // 最大 2KB
  duplicateRate: 0.4 // 40% 重复率 (即约80个重复文件)
};

// 确保目录存在
if (fs.existsSync(CONFIG.targetDir)) {
  fs.rmSync(CONFIG.targetDir, { recursive: true, force: true });
}
fs.mkdirSync(CONFIG.targetDir);

// 生成随机内容的函数
function generateRandomContent(size) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n';
  let result = '';
  // 先添加一些固定头部信息，方便肉眼识别
  const header = `Test File - Size: ${size} bytes - Timestamp: ${Date.now()}\n`;
  result += header;
  
  while (result.length < size) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.substring(0, size);
}

// 主逻辑
function generateDataset() {
  console.log(`开始生成数据集...`);
  console.log(`目标目录: ${CONFIG.targetDir}`);
  
  const uniqueCount = Math.floor(CONFIG.totalFiles * (1 - CONFIG.duplicateRate));
  const duplicateCount = CONFIG.totalFiles - uniqueCount;
  
  console.log(`计划生成: 唯一文件 ${uniqueCount} 个, 重复文件 ${duplicateCount} 个`);
  
  const uniqueContents = [];
  
  // 1. 生成唯一文件
  for (let i = 0; i < uniqueCount; i++) {
    const size = Math.floor(Math.random() * (CONFIG.maxSize - CONFIG.minSize + 1)) + CONFIG.minSize;
    const content = generateRandomContent(size);
    uniqueContents.push(content);
    
    const fileName = `file_${String(i).padStart(3, '0')}.txt`;
    fs.writeFileSync(path.join(CONFIG.targetDir, fileName), content);
  }
  
  // 2. 生成重复文件
  for (let i = 0; i < duplicateCount; i++) {
    // 随机选择一个已有的内容进行复制
    const sourceIndex = Math.floor(Math.random() * uniqueContents.length);
    const content = uniqueContents[sourceIndex];
    
    // 文件名继续递增
    const fileName = `file_${String(uniqueCount + i).padStart(3, '0')}_dup_of_${sourceIndex}.txt`;
    fs.writeFileSync(path.join(CONFIG.targetDir, fileName), content);
  }
  
  console.log('✅ 数据集生成完成！');
  
  // 验证
  const files = fs.readdirSync(CONFIG.targetDir);
  console.log(`实际生成文件数: ${files.length}`);
  
  // 简单统计
  let minSizeFound = Infinity;
  files.forEach(f => {
    const stat = fs.statSync(path.join(CONFIG.targetDir, f));
    if (stat.size < minSizeFound) minSizeFound = stat.size;
  });
  console.log(`最小文件大小: ${minSizeFound} bytes`);
}

generateDataset();
