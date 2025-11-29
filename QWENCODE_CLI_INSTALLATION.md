# QwenCode CLI 安装和集成说明文档

## 1. QwenCode CLI 安装位置

### 实际安装位置
- **主目录**: `C:\npm_global\node_modules\@qwen-code\qwen-code\` (Windows)  
  `/usr/local/lib/node_modules/@qwen-code/qwen-code/` (Unix-like)
- **可执行文件**: `cli.js` (14.7MB)
- **命令入口**: 
  - Windows: `C:\npm_global\qwen` 和 `C:\npm_global\qwen.cmd`
  - Unix-like: `/usr/local/bin/qwen`

### 包信息
- **npm包名**: `@qwen-code/qwen-code`
- **安装命令**: `npm install -g @qwen-code/qwen-code@latest`
- **可执行命令**: `qwen` (不是 `qwencode-cli`)
- **Node.js要求**: `>=20.0.0`

### 目录结构
```
C:\npm_global\node_modules\@qwen-code\qwen-code\
├── cli.js (主可执行文件 - 14.7MB)
├── LICENSE
├── package.json
├── README.md
├── sandbox-macos-*.sb (沙箱配置文件)
├── locales/
│   ├── en.js
│   └── zh.js
├── node_modules/ (依赖: tiktoken, node-pty等)
└── vendor/
    └── ripgrep/ (跨平台ripgrep二进制文件)
        ├── arm64-darwin/
        ├── arm64-linux/
        ├── x64-darwin/
        ├── x64-linux/
        └── x64-win32/
            └── rg.exe (Windows ripgrep可执行文件)
```

## 2. QwenCode CLI 集成配置

### 用户配置目录
- **插件配置主目录**: `~/.config/qwencode/`
- **插件安装位置**: `~/.config/qwencode/plugins/`
- **主配置文件**: `~/.config/qwencode/config.yml`
- **日志目录**: `~/.config/qwencode/logs/`

### 集成机制
QwenCode CLI 使用类继承(Class Inheritance)机制，不同于其他CLI工具的Hook系统。

#### 配置文件说明 (`~/.config/qwencode/config.yml`)
- 包含跨CLI协作插件配置
- 启用 `CrossCLIAdapterPlugin`
- 配置支持的CLI工具列表
- 设置协作功能参数

## 3. 项目适配器集成

### 源适配器目录 (项目内)
- **目录位置**: `src/adapters/qwencode/`
- **适配器文件**:
  - `inheritance_adapter.py` - 继承适配器
  - `standalone_qwencode_adapter.py` - 独立适配器
  - `install_qwencode_integration.py` - 安装脚本
  - `config.json` - 适配器配置

### 安装流程
1. 用户安装 `@qwen-code/qwen-code` npm包
2. 运行 `install_qwencode_integration.py` 脚本
3. 脚本将适配器从 `src/adapters/qwencode/` 复制到 `~/.config/qwencode/plugins/`
4. 在 `~/.config/qwencode/config.yml` 中添加插件配置
5. 重启QwenCode CLI后跨CLI协作功能生效

## 4. 跨CLI协作功能

### 支持的CLI工具
- claude, gemini, iflow, qoder, codebuddy, codex

### 协作协议
- **中文协议**:
  - "请用{cli}帮我{task}"
  - "调用{cli}来{task}"
  - "用{cli}帮我{task}"
- **英文协议**:
  - "use {cli} to {task}"
  - "call {cli} to {task}"

### 插件优先级
- 插件名称: `CrossCLIAdapterPlugin`
- 插件类型: 继承适配器
- 优先级: 100 (高优先级)
- 基础类: `BaseQwenCodePlugin`

## 5. 故障排除

### 常见问题
1. **命令未找到**: 检查npm全局安装路径是否在系统PATH中
2. **插件未加载**: 检查 `~/.config/qwencode/config.yml` 中是否有插件配置
3. **跨CLI调用失败**: 检查目标CLI工具是否已安装并可用

### 验证命令
```bash
# 验证QwenCode CLI是否安装
qwen --version

# 验证集成是否安装
python src/adapters/qwencode/install_qwencode_integration.py --verify

# 检查配置目录
ls -la ~/.config/qwencode/
```