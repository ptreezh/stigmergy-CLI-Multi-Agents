# Stigmergy 发布指南

本文档详细说明如何发布 stigmergy npm 包到 npm registry。

---

## 📋 发布前检查清单

### ✅ 必须完成的任务

- [ ] 1. 确保 TypeScript 编译产物存在
- [ ] 2. 更新版本号（如果需要）
- [ ] 3. 更新 CHANGELOG.md
- [ ] 4. 运行完整测试套件
- [ ] 5. 运行发布前检查脚本
- [ ] 6. 提交所有代码更改
- [ ] 7. 推送到 Git 仓库
- [ ] 8. 检查 npm 包内容预览
- [ ] 9. 发布到 npm
- [ ] 10. 验证发布结果

---

## 🔧 详细步骤

### 步骤 1: 构建 TypeScript 编译产物

```bash
cd "D:\stigmergy-CLI-Multi-Agents"

# 编译 TypeScript 到 dist/orchestration/
npm run build:orchestration

# 验证编译产物
ls dist/orchestration/**/*.js
```

**预期输出：**
```
dist/orchestration/config/index.js
dist/orchestration/core/CentralOrchestrator.js
dist/orchestration/events/EventBus.js
dist/orchestration/hooks/HookInstaller.js
... 等
```

### 步骤 2: 运行测试（可选但推荐）

```bash
# 运行所有测试
npm test

# 或运行快速测试（跳过 E2E）
npm run test:quick
```

### 步骤 3: 运行发布前检查

```bash
# 运行自动检查脚本
node scripts/pre-publish-check.js
```

**检查项目：**
- ✅ package.json 配置正确
- ✅ bin 文件存在
- ✅ 主入口文件存在
- ✅ TypeScript 编译产物存在
- ✅ .npmignore 文件存在
- ✅ 工作目录状态
- ✅ npm pack 预览

### 步骤 4: 更新版本号（如需要）

```bash
# 使用 npm version 自动更新版本号并创建 Git tag

# 补丁版本（bug 修复）：1.3.54 -> 1.3.55
npm version patch

# 小版本（新功能）：1.3.54 -> 1.4.0
npm version minor

# 大版本（破坏性更改）：1.3.54 -> 2.0.0
npm version major

# 预发布版本：1.3.54-beta.0 -> 1.3.54-beta.1
npm version prerelease

# 或手动编辑 package.json 中的 version 字段
```

### 步骤 5: 预览发布包内容

```bash
# 打包但不发布（检查包内容）
npm pack --dry-run

# 或实际打包生成 .tgz 文件
npm pack

# 解压检查内容
tar -tzf stigmergy-1.3.54-beta.0.tgz | less
```

**将包含在 npm 包中的内容：**

✅ **会发布的文件：**
- `src/**/*.js` - JavaScript 源代码
- `dist/orchestration/**/*.js` - TypeScript 编译产物
- `config/**/*.json` - 配置文件
- `bin/**/*` - CLI 启动器
- `package.json` - 包配置
- `README.md` - 说明文档
- `LICENSE` - 许可证
- `STIGMERGY.md` - 项目文档

❌ **不会发布的文件（被 .npmignore 排除）：**
- `node_modules/` - 依赖包
- `tests/`, `test/` - 测试文件
- `scripts/` - 开发脚本
- `.git/` - Git 数据
- `*.ts` - TypeScript 源文件
- `*.md` - 大部分文档（除了 README.md, STIGMERGY.md）
- `devDependencies` - 开发依赖

### 步骤 6: 提交代码更改

```bash
# 查看更改
git status

# 添加所有更改
git add .

# 提交
git commit -m "chore: release v1.3.54-beta.0"

# 推送到 GitHub
git push origin main
git push --tags
```

### 步骤 7: 登录 npm（如需要）

```bash
# 检查当前登录状态
npm whoami

# 如未登录，执行登录
npm login

# 输入你的 npm 凭据
# Username: your-npm-username
# Password: ********
# Email: your-email@example.com
```

### 步骤 8: 发布到 npm

```bash
# 正式发布
npm publish

# 或发布为 beta 版本（使用 --tag）
npm publish --tag beta

# 或发布为 next 版本
npm publish --tag next
```

**发布输出示例：**
```
npm notice
npm notice 📦  stigmergy@1.3.54-beta.0
npm notice === Tarball Contents ===
npm notice 1.2kB  bin/stigmergy
npm notice 456B   src/index.js
npm notice ...
npm notice === Tarball Details ===
npm notice name:          stigmergy
npm notice version:       1.3.54-beta.0
npm notice filename:      stigmergy-1.3.54-beta.0.tgz
npm notice package size:  123.4 kB
npm notice unpacked size: 456.7 kB
npm notice shasum:        abc123...
npm notice integrity:     sha512-xyz...
npm notice total files:   123
npm notice
npm notice Publishing to https://registry.npmjs.org/
+ stigmergy@1.3.54-beta.0
```

### 步骤 9: 验证发布

```bash
# 等待几秒后，从 npm 查看包信息
npm view stigmergy

# 查看特定版本
npm view stigmergy@1.3.54-beta.0

# 或在浏览器中打开
# https://www.npmjs.com/package/stigmergy

# 测试安装新发布的包
npm install -g stigmergy@1.3.54-beta.0

# 或在另一个项目中测试
mkdir test-stigmergy && cd test-stigmergy
npm init -y
npm install stigmergy@1.3.54-beta.0
```

---

## 🎯 关于开发依赖

### ✅ 正确理解：devDependencies 不会发布

你说得对！**devDependencies 不会包含在发布的 npm 包中**。

```json
{
  "dependencies": {
    // ✅ 这些会被安装到用户的 node_modules/
    "chalk": "^4.1.2",
    "commander": "^14.0.2",
    "inquirer": "^13.1.0",
    "js-yaml": "^4.1.1",
    "semver": "^7.7.3"
  },
  "devDependencies": {
    // ❌ 这些不会发布，用户安装时不会被安装
    "@types/jest": "^30.0.0",
    "@types/node": "^25.0.9",
    "eslint": "^9.39.2",
    "fs-extra": "^11.3.3",
    "jest": "^30.2.0",
    "prettier": "^3.7.4",
    "rimraf": "^6.1.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

### 📊 发布包大小对比

| 项目 | 本地开发 | 发布到 npm |
|------|---------|-----------|
| **dependencies** | ✅ 5个 | ✅ 5个（会被安装） |
| **devDependencies** | ✅ 9个 | ❌ 0个（不会被包含） |
| **node_modules/** | ~200MB | 用户安装后 ~30MB |
| **包文件** | ~500KB | ~150KB（压缩后） |

---

## 🚀 快速发布流程（一键命令）

如果你已经完成所有检查，可以使用以下一键命令：

```bash
# 完整发布流程（复制粘贴）
npm run build:orchestration && \
npm test && \
node scripts/pre-publish-check.js && \
npm version patch && \
git add . && \
git commit -m "chore: release v$(node -p "require('./package.json').version")" && \
git push && \
git push --tags && \
npm publish --tag beta
```

---

## ⚠️ 常见问题和解决方案

### 问题 1: npm publish 失败 - 403 Forbidden

**原因：** 包名已被其他人占用

**解决：**
```bash
# 检查包名是否可用
npm ping stigmergy

# 如已被占用，需要换个包名或联系原作者
```

### 问题 2: 版本号未更新

**原因：** 尝试发布已存在的版本

**解决：**
```bash
# 更新版本号
npm version patch

# 或手动编辑 package.json
```

### 问题 3: TypeScript 编译产物缺失

**原因：** 未运行构建命令

**解决：**
```bash
npm run build:orchestration
```

### 问题 4: 包体积过大

**原因：** 包含了不必要的文件

**解决：**
```bash
# 检查 .npmignore 配置
cat .npmignore

# 预览包内容
npm pack --dry-run

# 使用文件过滤
```

---

## 📋 发布后检查清单

发布成功后：

- [ ] 在 npmjs.com 上验证包信息
- [ ] 在新目录中测试安装
- [ ] 运行基本功能测试
- [ ] 更新 GitHub Releases
- [ ] 通知用户（如有重大更新）

---

## 🔐 安全建议

1. **启用 2FA（双因素认证）**
   ```bash
   npm profile enable-2fa
   ```

2. **使用 npm tokens**
   ```bash
   # 创建访问令牌
   npm token create

   # 使用令牌发布（不暴露密码）
   npm publish // --token <your-token>
   ```

3. **定期审计依赖**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 📖 参考资料

- [npm publish 官方文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [package.json 配置说明](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [npmignore 文件说明](https://docs.npmjs.com/cli/v9/configuring-npm/npmignore)

---

## ✅ 总结

### ✅ 现在可以发布了！

经过检查，你的项目已经准备就绪：

1. ✅ **package.json 配置正确** - 已修复 files 字段
2. ✅ **bin 文件存在** - bin/stigmergy 启动器
3. ✅ **主入口文件存在** - src/index.js
4. ✅ **TypeScript 编译产物存在** - dist/orchestration/
5. ✅ **.npmignore 配置正确** - 排除开发文件
6. ✅ **devDependencies 不会发布** - 仅包含生产依赖

### 🚀 立即发布命令：

```bash
cd "D:\stigmergy-CLI-Multi-Agents"

# 1. 构建编译产物（如果还没做）
npm run build:orchestration

# 2. 运行检查（可选）
node scripts/pre-publish-check.js

# 3. 发布！
npm publish --tag beta
```

祝发布顺利！🎉
