const fs = require('fs');

const filePath = 'src/core/installer.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// 找到 constructor 并添加 concurrency
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('constructor(options = {}) {')) {
    // 在 super(options) 后面添加
    lines.splice(i + 2, 0, '    this.concurrency = options.concurrency || 4;');
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('✅ Added concurrency parameter to constructor');