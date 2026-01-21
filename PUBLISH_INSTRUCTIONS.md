# 发布 stigmergy@1.3.2-beta.4 说明

## 当前状态
- 版本已更新到 1.3.2-beta.4
- 所有代码更改已提交到本地仓库
- 包已通过 npm pack 验证

## 发布步骤

### 1. 登录到 npm
```bash
npm login
```

### 2. 发布 beta 版本
```bash
npm publish --tag beta
```

或者，如果要作为最新版本发布：
```bash
npm publish
```

### 3. 推送到远程仓库
```bash
git push origin main
```

## 验证发布

发布后，可以通过以下方式验证：

```bash
npm view stigmergy@beta version
# 或
npm view stigmergy version
```

## 安装测试

用户可以通过以下方式安装新版本：

```bash
npm install -g stigmergy@beta
# 或
npm install -g stigmergy@1.3.2-beta.4
```

## 主要变更

此版本包括以下重要变更：

1. 统一了CLI检测逻辑，修复了scan、status和setup命令的检测不一致问题
2. 所有命令现在使用相同的检测方法（StigmergyInstaller）
3. 提高了检测准确性
4. 修复了在容器环境中检测工具的问题