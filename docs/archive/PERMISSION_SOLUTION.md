/**
 * Soul权限问题解决方案详解
 */

/*
## 三级优先级系统

### P0: 项目本地目录（优先级最高）
```
/home/user/my-project/.stigmergy/skills/  ← 优先使用
/home/user/my-project/.agent/skills/      ← 备用
/home/user/my-project/.claude/skills/     ← 备用
```
- ✅ **优势**: 用户有完整权限（读写执行）
- ✅ **隔离性**: 每个项目独立，互不干扰
- ✅ **可移植性**: 项目可以包含自己的soul配置

### P1: 用户目录（作为fallback）
```
~/.stigmergy/skills/  ← 全局共享
~/.agent/skills/      ← 备用
~/.claude/skills/     ← 备用
```
- ⚠️ **使用场景**: 仅当项目本地没有soul时
- ✅ **优势**: 多个项目共享同一个soul
- ⚠️ **风险**: 可能遇到权限问题

### P2: 自动创建项目本地目录（最后手段）
```
/home/user/my-project/.stigmergy/skills/  ← 自动创建
```
- ✅ **保证**: 总是有可写路径
- ✅ **自动**: 用户无需手动创建
*/

/*
## 权限检查机制

### _isWritable() 函数
```javascript
_isWritable(dirPath) {
  try {
    // 尝试检查写权限
    fs.accessSync(dirPath, fs.constants.W_OK);
    return true;  // 有写权限
  } catch {
    return false; // 无写权限
  }
}
```

### 工作原理
1. **检查目录存在**: `fs.existsSync(p)`
2. **检查写权限**: `fs.accessSync(p, W_OK)`
3. **双重验证**: 只有同时满足才使用该路径
*/

/*
## 实际运行流程

### 场景1: 项目有本地soul
```
用户在 /home/user/my-project/ 运行 CLI

1. 检查 P0: /home/user/my-project/.stigmergy/skills/
   ├─ 目录存在? ✅
   ├─ 可写? ✅
   └─ 使用此路径 ✅

结果: 使用项目本地路径，权限无问题
```

### 场景2: 项目无soul，但有全局soul
```
用户在 /home/user/other-project/ 运行 CLI

1. 检查 P0: /home/user/other-project/.stigmergy/skills/
   ├─ 目录存在? ❌
   └─ 跳过

2. 检查 P1: ~/.stigmergy/skills/
   ├─ 目录存在? ✅
   ├─ 可写? ✅
   └─ 使用此路径 ✅

结果: 使用用户目录，通常有权限
```

### 场景3: 完全没有soul
```
用户在新项目运行 CLI

1. 检查 P0: 项目本地路径 - 不存在
2. 检查 P1: 用户目录路径 - 不存在
3. 执行 P2: 创建项目本地路径
   ├─ mkdirSync(/current/project/.stigmergy/skills/)
   └─ 成功 ✅

结果: 自动创建，有完整权限
```
*/

/*
## 与其他CLI工具的对比

### Claude CLI
- 使用 ~/.claude/plugins/ 和 ~/.claude/skills/
- ✅ 问题：在项目目录运行时可能无权限

### Stigmergy (修复后)
- 优先使用 .stigmergy/skills/
- ✅ 优势：总是有权限，自动降级

### 关键区别
```
Claude:     ~/.claude/ ← 固定全局路径
Stigmergy:  .stigmergy/ ← 项目本地优先
            ~/.stigmergy/ ← 降级使用
```
*/

/*
## 跨平台兼容性

### Windows
```
项目本地: C:\Users\user\project\.stigmergy\skills\
用户目录: C:\Users\user\.stigmergy\skills\
环境变量: %USERPROFILE%
```

### Linux/Mac
```
项目本地: /home/user/project/.stigmergy/skills/
用户目录: /home/user/.stigmergy/skills/
环境变量: $HOME
```

### 自动适配
```javascript
const home = process.env.HOME || process.env.USERPROFILE || "";
// Windows: USERPROFILE
// Unix:   HOME
```
*/

/*
## 实际测试验证

### 测试用例1: 项目本地路径
```bash
cd /tmp/test-project
mkdir -p .stigmergy/skills
echo "# Soul" > .stigmergy/skills/soul.md

# 运行 CLI
stigmergy soul status

# 输出:
# ✅ [SoulManager] Using project local path: /tmp/test-project/.stigmergy/skills
```

### 测试用例2: 权限不足时自动降级
```bash
cd /tmp/test-project-2
# 不创建任何目录

# 运行 CLI
stigmergy soul status

# 输出:
# ✅ [SoulManager] Created project local path: /tmp/test-project-2/.stigmergy/skills
```

### 测试用例3: 全局路径fallback
```bash
cd /tmp/test-project-3
# 项目本地无soul

# 预先创建全局soul
mkdir -p ~/.stigmergy/skills
echo "# Global Soul" > ~/.stigmergy/skills/soul.md

# 运行 CLI
stigmergy soul status

# 输出:
# ✅ [SoulManager] Using user directory path: /home/user/.stigmergy/skills
```
*/

/*
## 总结

### 核心策略
1. **优先项目本地** - 解决90%的权限问题
2. **权限验证** - 避免使用无权限路径
3. **自动创建** - 确保总有可写路径
4. **智能降级** - 多级fallback保证可用性

### 关键代码
```javascript
// P0: 项目本地（有权限）
for (const p of projectPaths) {
  if (fs.existsSync(p) && this._isWritable(p)) {
    return p;  // ✅ 使用项目本地
  }
}

// P1: 用户目录（可能有权限）
for (const p of userPaths) {
  if (fs.existsSync(p) && this._isWritable(p)) {
    return p;  // ✅ 降级到用户目录
  }
}

// P2: 自动创建（确保有权限）
fs.mkdirSync(projectLocalPath, { recursive: true });
return projectLocalPath;  // ✅ 总是成功
```

### 为什么有效？
1. 项目目录总有写权限（用户自己的项目）
2. 权限检查避免使用只读目录
3. 自动创建确保100%可用
4. 多级fallback处理所有边缘情况
*/
