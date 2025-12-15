# Context Awareness in Hook Integration

## 上下文来源

### 1. 文件系统上下文
```javascript
const context = {
    cwd: '/path/to/project',
    currentFile: 'src/auth.js',
    workspace: {
        files: ['package.json', 'README.md', 'src/'],
        language: 'javascript'
    }
};
```

### 2. 编辑器上下文
```javascript
// 如果CLI与编辑器集成
const editorContext = {
    selection: 'function login() { ... }',
    cursor: { line: 15, column: 4 },
    visibleRange: { start: 1, end: 30 }
};
```

### 3. 项目上下文
```javascript
const projectContext = {
    type: 'nodejs',
    dependencies: ['express', 'mongoose'],
    scripts: ['start', 'test', 'build'],
    recentEdits: ['auth.js', 'routes.js']
};
```

## 上下文增强示例

```javascript
function buildContextualPrompt(skill, userInput, context) {
    const basePrompt = userInput;

    // 添加文件上下文
    if (context.currentFile) {
        basePrompt += `\n\nCurrent file: ${context.currentFile}`;
    }

    // 添加项目上下文
    if (context.workspace) {
        basePrompt += `\n\nProject type: ${context.workspace.language}`;
    }

    // 技能特定的上下文增强
    switch (skill) {
        case 'analyze':
            basePrompt += '\n\nFocus on security and performance in this context.';
            break;
        case 'generate':
            basePrompt += `\n\nGenerate code compatible with ${context.workspace.language} patterns.`;
            break;
    }

    return basePrompt;
}
```

## 实际使用场景

### 场景1：代码分析
```bash
claude> /skill analyze security issues

# Hook会自动：
# 1. 检测当前文件类型
# 2. 识别项目技术栈
# 3. 构建安全相关的增强prompt
# 4. 返回针对性的安全分析
```

### 场景2：代码生成
```bash
claude> /skill generate user authentication

# Hook会自动：
# 1. 分析现有项目结构
# 2. 检测相关依赖
# 3. 生成符合项目风格的代码
# 4. 包含适当的错误处理
```

### 场景3：翻译本地化
```bash
claude> /skill translate error messages to Japanese

# Hook会自动：
# 1. 提取项目中的错误消息
# 2. 考虑项目的UI框架
# 3. 保持技术术语一致性
# 4. 生成本地化的翻译
```
```

## 💡 **总结：为什么Hook集成是正确的选择**

### **技术优势：**
1. **非侵入性** - 不修改CLI工具源码
2. **独立性** - 可以独立开发和维护
3. **兼容性** - 支持多个版本的CLI工具
4. **可扩展性** - 容易添加新的技能和功能

### **用户体验优势：**
1. **无缝集成** - 在熟悉的环境中使用
2. **上下文保持** - 利用现有的文件和项目上下文
3. **学习成本低** - 不需要学习新的工具
4. **渐进增强** - 可以选择性安装和使用

### **实施优势：**
1. **快速部署** - 不需要等待CLI工具更新
2. **灵活配置** - 用户可以自定义Hook行为
3. **错误隔离** - Hook问题不影响CLI核心功能
4. **版本管理** - 可以独立更新Hook功能

**Hook集成是在不修改现有CLI工具的前提下，实现功能扩展的最佳方案。它既保持了技术独立性，又提供了优秀的用户体验。**