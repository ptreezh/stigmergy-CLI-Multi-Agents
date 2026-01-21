const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

// 修改方法签名
const oldMethod = '  async analyzeAllCLI() {';
const newMethod = '  async analyzeAllCLI(options = {}) {';
let newContent = content.replace(oldMethod, newMethod);

// 修改调用 analyzeCLI 的地方
const oldCall = '        const result = await Promise.race([this.analyzeCLI(cliName), timeoutPromise]);';
const newCall = '        const result = await Promise.race([this.analyzeCLI(cliName, options), timeoutPromise]);';
newContent = newContent.replace(oldCall, newCall);

fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Updated analyzeAllCLI method');