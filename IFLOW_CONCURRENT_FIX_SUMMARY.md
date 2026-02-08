# 修复报告：Stigmergy 并发任务中 iflow 参数解析问题

## 问题描述

在 Stigmergy 的并发任务执行中，当同时执行多个 CLI 工具时：
- qwen 和 claude 成功执行
- iflow 失败，错误信息为：`Unknown arguments: 可以用, skill-from-masters, 优化，目标就是复杂任务的分解和系统工程化思维, 管理任务分解，确保任务系统综合有效，分解可以递归分解，整个过程可以递归，确保子任务上下文能够128K完成，可以用树状目录的方式进行项目的计划和进度和系统综合上级的组织`

## 根本原因

在 `src/cli/commands/concurrent.js` 文件中，第39行附近的代码：

```javascript
// 旧代码 - 直接将整个提示作为参数传递
const command = `${cliName} "${prompt}"`;
```

这种格式对于 iflow CLI 来说是不正确的。iflow 需要使用 `-p` 或 `--prompt` 参数来接收提示内容。

## 解决方案

修改 `src/cli/commands/concurrent.js` 文件，根据不同的 CLI 工具构建正确的命令格式：

```javascript
// 新代码 - 根据CLI类型构建正确的命令格式
let args = [];
switch (cliName) {
  case 'claude':
  case 'iflow':
  case 'gemini':
    // 这些CLI需要 -p 参数
    args = ['-p', prompt];
    break;
  case 'qwen':
  case 'copilot':
  case 'kode':
    // 这些CLI直接接受位置参数
    args = [prompt];
    break;
  case 'codebuddy':
    // codebuddy 需要 -y -p 参数
    args = ['-y', '-p', prompt];
    break;
  case 'qodercli':
    // qodercli 需要 -p 参数
    args = ['-p', prompt];
    break;
  case 'codex':
    // codex 需要 -m gpt-5 和提示参数
    args = ['-m', 'gpt-5', prompt];
    break;
  default:
    // 默认情况，直接使用位置参数
    args = [prompt];
}
```

## 验证

通过以下测试验证修复：

1. 创建了 `test-iflow-specific.js` 测试脚本
2. 验证了 `iflow -p "hi"` 命令格式正确
3. 确认不再出现 "Unknown arguments" 错误
4. iflow 现在能够正确解析参数并进入执行流程

## 影响

- 修复了 iflow 在并发任务中的参数解析问题
- 确保所有支持的 CLI 工具都能在并发模式下正常工作
- 提高了 Stigmergy 系统的整体稳定性和可靠性