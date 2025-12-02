# CLI扩展指引文档

## 新增CLI工具完整工作指引

添加新的AI CLI工具到Stigmergy生态系统不仅需要技术实现，还需要考虑用户体验，特别是自动化安装和用户交互界面。本指引涵盖了从研究分析到最终部署维护的完整流程。

## 第一阶段：研究分析（必需）

### 1. CLI工具深度调研
- [ ] **官方文档分析**：获取CLI的官方文档、API参考、扩展指南
- [ ] **扩展机制识别**：
  - Hook系统（事件钩子、回调机制）
  - Plugin/Extension系统（插件架构）
  - Configuration系统（配置文件格式和位置）
  - Command系统（命令行参数和子命令）
- [ ] **调用方式分析**：
  - 命令行调用格式
  - 参数传递机制
  - 输出格式（JSON、文本等）
  - 错误处理机制

### 2. 集成点识别
- [ ] **用户交互点**：用户输入、命令执行、结果输出
- [ ] **扩展接入点**：插件注册、Hook注册、配置文件位置
- [ ] **状态管理**：全局配置、项目配置、会话状态
- [ ] **数据持久化**：缓存、日志、历史记录

## 第二阶段：架构设计（必需）

### 3. 集成方案设计
- [ ] **适配器模式选择**：
  - Hook系统适配
  - Plugin系统适配
  - Extension系统适配
  - Class继承适配
  - Workflow集成适配
- [ ] **数据流设计**：
  - 输入处理流程
  - 跨CLI调用路由
  - 结果处理和返回
- [ ] **配置管理设计**：
  - 全局配置映射
  - 项目配置映射
  - 会话状态管理

### 4. 接口规范定义
- [ ] **核心接口**：
  - `initialize()` - 初始化
  - `is_available()` - 可用性检查
  - `execute_task()` - 任务执行
  - `health_check()` - 健康检查
- [ ] **Hook接口**（根据具体机制）：
  - 用户输入Hook
  - 命令执行Hook
  - 结果处理Hook
  - 错误处理Hook

### 5. 安装和用户交互设计
- [ ] **自动化安装方案**：
  - npm/yarn包管理器安装
  - 独立安装脚本
  - 二进制文件下载安装
  - 系统包管理器集成（apt, brew, etc.）
- [ ] **用户交互界面**：
  - 安装前确认提示
  - 进度显示和日志输出
  - 错误处理和重试机制
  - 安装后验证和配置
- [ ] **菜单系统集成**：
  - 在扫描结果中显示新CLI
  - 提供安装选项和说明
  - 支持批量安装选择
  - 显示安装状态和结果

## 第三阶段：核心实现（必需）

### 5. 基础适配器开发
- [ ] **创建适配器结构**：
  ```bash
  mkdir src/adapters/{cli_name}
  touch src/adapters/{cli_name}/{integration_type}_adapter.py
  ```
- [ ] **实现基础适配器类**：
  - 继承`BaseCrossCLIAdapter`
  - 实现核心接口方法
  - 集成自然语言解析器
  - 实现跨CLI调用路由

### 6. 配置系统集成
- [ ] **CLI配置映射**：
  - 在`models.py`中添加配置
  - 定义配置文件路径
  - 定义全局文档文件名
  - 定义安装命令和验证命令
- [ ] **安装脚本开发**：
  - 创建`install_{cli_name}_integration.py`
  - 实现安装、验证、卸载功能
  - 处理配置文件创建和更新
  - 实现自动化安装逻辑
- [ ] **用户交互集成**：
  - 在部署脚本中添加用户菜单选项
  - 实现安装进度提示
  - 添加安装结果反馈

## 第四阶段：扩展功能（推荐）

### 7. 高级功能实现
- [ ] **Hook系统集成**（如果支持）：
  - 实现各种Hook回调函数
  - 处理Hook注册和管理
- [ ] **状态管理**：
  - 会话状态跟踪
  - 错误恢复机制
  - 性能监控和统计
- [ ] **缓存机制**：
  - 结果缓存
  - 配置缓存
  - 会话缓存

### 8. 项目集成支持
- [ ] **项目配置支持**：
  - 项目特定配置文件处理
  - 项目状态检测
  - 项目初始化集成
- [ ] **协作协议支持**：
  - 自然语言模式扩展
  - 协作场景优化
  - 最佳实践集成

## 第五阶段：质量保证（必需）

### 9. 测试用例开发
- [ ] **单元测试**：
  - 适配器初始化测试
  - 核心方法功能测试
  - 错误处理测试
- [ ] **集成测试**：
  - 跨CLI调用测试
  - 自我调用防护测试
  - 协作协议测试
- [ ] **兼容性测试**：
  - 不同版本CLI兼容性
  - 不同操作系统兼容性
  - 与其他CLI工具协作测试

### 10. 部署集成
- [ ] **部署脚本更新**：
  - 在`deploy.js`中添加安装配置
  - 添加版本检查命令
  - 添加安装命令
  - 添加用户交互菜单选项
  - 实现批量安装支持
- [ ] **文档生成支持**：
  - 确保MD生成器支持新CLI
  - 验证文档内容准确性
- [ ] **环境检测支持**：
  - 更新环境扫描器
  - 添加可用性检查逻辑
  - 添加自动化安装触发机制

## 第七阶段：自动化安装和用户交互（必需）

### 13. 自动化安装实现
- [ ] **安装命令集成**：
  - 支持多种安装方式（npm, pip, brew, curl等）
  - 实现跨平台安装脚本
  - 添加安装前环境检查
  - 实现安装后配置初始化
- [ ] **错误处理和恢复**：
  - 网络错误重试机制
  - 权限错误处理提示
  - 安装失败回滚机制
  - 依赖项自动安装

### 14. 用户交互界面
- [ ] **扫描结果显示**：
  - 在环境扫描结果中显示新CLI工具
  - 显示安装状态（已安装/未安装）
  - 提供版本信息和功能描述
- [ ] **安装菜单系统**：
  - 交互式安装选择界面
  - 支持单个或批量安装
  - 显示安装进度和日志
  - 提供安装完成确认和下一步指导
- [ ] **用户提示和帮助**：
  - 安装前风险提示
  - 安装后使用指导
  - 常见问题解答链接

### 11. 文档完善
- [ ] **技术文档**：
  - 适配器架构说明
  - 集成机制说明
  - 配置选项说明
- [ ] **使用文档**：
  - 安装指南
  - 使用示例
  - 故障排除指南
- [ ] **协作指南**：
  - 推荐协作模式
  - 最佳实践
  - 性能优化建议

### 12. 维护支持
- [ ] **版本兼容性**：
  - 版本更新跟踪
  - 兼容性测试计划
  - 升级迁移指南
- [ ] **监控和日志**：
  - 错误日志分析
  - 性能监控
  - 使用统计

## 关键成功因素

### 必需项（没有这些无法工作）：
1. ✅ CLI工具扩展机制深入理解
2. ✅ 核心适配器实现
3. ✅ 配置系统集成
4. ✅ 基础测试用例
5. ✅ 部署集成
6. ✅ 自动化安装和用户交互实现

### 推荐项（提升用户体验）：
1. 🎯 高级Hook集成
2. 📊 状态管理和监控
3. ⚡ 性能优化
4. 📚 完整文档
5. 🛠️ 故障排除工具
6. 🚀 自动化安装优化

### 可选项（根据需求添加）：
1. 🔧 项目特定功能
2. 🔄 高级协作模式
3. 📈 使用统计和分析
4. 🎨 用户体验优化

## 自动化安装和用户交互实现示例

### 安装脚本模板

```javascript
#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { spawn } from 'child_process';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CLIInstaller {
    constructor(cliName) {
        this.cliName = cliName;
        this.supportedPlatforms = ['Windows', 'Linux', 'Darwin'];
    }
    
    detectPlatform() {
        /** 检测操作系统平台 */
        return process.platform;
    }
    
    async isInstalled() {
        /** 检查CLI是否已安装 */
        return new Promise((resolve) => {
            const child = spawn(this.cliName, ['--version'], { stdio: 'pipe' });
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                resolve(code === 0);
            });
            
            child.on('error', () => {
                resolve(false);
            });
        });
    }
}

async function main() {
    const args = process.argv.slice(2);
    const options = {
        verify: args.includes('--verify'),
        uninstall: args.includes('--uninstall'),
        install: args.includes('--install') || args.length === 0
    };

    if (options.install) {
        // 安装逻辑
        console.log('📦 安装模式...');
    } else if (options.verify) {
        // 验证逻辑
        console.log('🔍 验证模式...');
    } else if (options.uninstall) {
        // 卸载逻辑
        console.log('[UNINSTALL] 卸载模式...');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(`[FATAL] ${error.message}`);
        process.exit(1);
    });
}
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def get_install_commands(self):
        """获取不同平台的安装命令"""
        platform_commands = {
            'Windows': [
                'npm install -g @vendor/cli-name',
                'choco install cli-name',
                'scoop install cli-name'
            ],
            'Linux': [
                'npm install -g @vendor/cli-name',
                'sudo apt install cli-name',
                'sudo yum install cli-name'
            ],
            'Darwin': [
                'npm install -g @vendor/cli-name',
                'brew install vendor/cli-name',
                'curl -fsSL https://vendor.com/install.sh | sh'
            ]
        }
        return platform_commands.get(self.detect_platform(), [])
    
    def install(self, method='auto'):
        """安装CLI工具"""
        if self.is_installed():
            print(f"✅ {self.cli_name} 已安装")
            return True
            
        platform_name = self.detect_platform()
        if platform_name not in self.supported_platforms:
            print(f"❌ 不支持的平台: {platform_name}")
            return False
            
        commands = self.get_install_commands()
        if not commands:
            print(f"❌ 未找到适用于 {platform_name} 的安装命令")
            return False
            
        print(f"🚀 开始安装 {self.cli_name} ({platform_name})")
        
        for i, command in enumerate(commands, 1):
            print(f"  尝试方法 {i}: {command}")
            try:
                result = subprocess.run(
                    command, 
                    shell=True, 
                    capture_output=True, 
                    text=True
                )
                if result.returncode == 0:
                    print(f"✅ 安装成功: {command}")
                    return True
                else:
                    print(f"  失败: {result.stderr}")
            except Exception as e:
                print(f"  错误: {e}")
                
        print(f"❌ 所有安装方法都失败了")
        return False
    
    def verify_installation(self):
        """验证安装"""
        if self.is_installed():
            try:
                result = subprocess.run(
                    [self.cli_name, '--version'], 
                    capture_output=True, 
                    text=True
                )
                version = result.stdout.strip() or result.stderr.strip()
                print(f"✅ {self.cli_name} 安装验证成功: {version}")
                return True
            except Exception as e:
                print(f"❌ 安装验证失败: {e}")
                return False
        else:
            print(f"❌ {self.cli_name} 未安装")
            return False

def main():
    parser = argparse.ArgumentParser(description=f"{cli_name} CLI安装器")
    parser.add_argument("--install", action="store_true", help="安装CLI")
    parser.add_argument("--verify", action="store_true", help="验证安装")
    parser.add_argument("--check", action="store_true", help="检查是否已安装")
    
    args = parser.parse_args()
    
    installer = CLIInstaller("cli_name")
    
    if args.check:
        if installer.is_installed():
            print("已安装")
            sys.exit(0)
        else:
            print("未安装")
            sys.exit(1)
    elif args.install:
        if installer.install():
            sys.exit(0)
        else:
            sys.exit(1)
    elif args.verify:
        if installer.verify_installation():
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
```

### 用户交互菜单集成示例

在部署脚本中添加用户交互：

```javascript
// 在deploy.js中添加交互式安装选择
async function askUserToInstall(results) {
    const unavailableCLIs = results.filter(cli => !cli.available);
    const uninstalledIntegrations = results.filter(cli => !cli.integration.installed);

    if (unavailableCLIs.length === 0 && uninstalledIntegrations.length === 0) {
        colorLog('green', '\n🎉 所有CLI工具和集成都已安装！');
        return { installCLIs: [], installIntegrations: [] };
    }

    console.log('');
    colorLog('yellow', '📋 检测到以下未安装的工具:');

    let needInstallCLIs = [];
    let needInstallIntegrations = [];

    // 显示未安装的CLI工具
    if (unavailableCLIs.length > 0) {
        console.log('\n🔴 未安装的CLI工具:');
        unavailableCLIs.forEach((cli, index) => {
            const required = cli.required ? '(必需)' : '(可选)';
            console.log(`  ${index + 1}. ${cli.displayName} ${required} - ${cli.description}`);
        });

        console.log('');
        const choices = unavailableCLIs.map((cli, index) => ({
            name: `${index + 1}. ${cli.displayName}`,
            value: cli.name
        }));
        
        choices.push({ name: '跳过所有安装', value: 'skip' });
        
        const { selected } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selected',
                message: '选择要安装的CLI工具 (空格选择, 回车确认):',
                choices: choices
            }
        ]);
        
        if (selected.includes('skip')) {
            needInstallCLIs = [];
        } else {
            needInstallCLIs = unavailableCLIs.filter(cli => selected.includes(cli.name));
        }
    }

    // 显示未安装的集成
    if (uninstalledIntegrations.length > 0) {
        console.log('\n❌ 未安装的CLI集成:');
        uninstalledIntegrations.forEach(cli => {
            const required = cli.required ? '(必需)' : '(可选)';
            console.log(`  - ${cli.displayName} 集成 ${required}`);
        });

        console.log('');
        const shouldInstallIntegrations = await askYesNo(
            `是否要自动安装 ${uninstalledIntegrations.length} 个CLI集成？`,
            true
        );

        if (shouldInstallIntegrations) {
            needInstallIntegrations = uninstalledIntegrations;
        }
    }

    return {
        installCLIs: needInstallCLIs,
        installIntegrations: needInstallIntegrations
    };
}
```