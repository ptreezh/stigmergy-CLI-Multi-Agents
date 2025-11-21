# 快速使用说明

## 使用方法

### CMD路由器
```
qwen_smart.cmd "用gemini帮我翻译"
claude_smart.cmd "让kimi帮我写代码"
```

### Python路由器  
```
python qwen_smart.py "用gemini解释这段代码"
python claude_smart.py "让kimi生成文档"
```

## 路由规则
- 系统会自动识别命令中的工具名并路由到相应工具
- 如果没有识别到特定工具，会使用原始工具执行
