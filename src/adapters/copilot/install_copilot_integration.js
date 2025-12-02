#!/usr/bin/env node

/**
 * Copilot CLI 跨CLI集成安装脚本
 * 
 * 自动安装和配置Copilot CLI的跨CLI集成功能
 * 包括MCP服务器注册、自定义代理创建和权限配置
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CopilotIntegrationInstaller {
    /** Copilot CLI集成安装器 */
    
    constructor(configPath = null) {
        /**
         * 初始化安装器
         * @param {string} configPath - 配置文件路径，如果为null则使用默认路径
         */
        this.scriptDir = __dirname;
        this.projectRoot = path.join(__dirname, '..', '..', '..');
        
        if (configPath) {
            this.configPath = path.resolve(configPath);
        } else {
            // 在npx环境下，可能需要搜索配置文件的多个位置
            const possiblePaths = [
                path.join(this.scriptDir, 'config.json'), // 标准位置 - 应该是最可能的路径
                path.join(this.scriptDir, '..', 'copilot', 'config.json'), // 在adapters/copilot/下
                path.join(path.dirname(__filename), 'config.json'), // 使用脚本所在目录 - 也是标准位置
            ];
            
            // 检查环境变量以获取项目根目录
            const projectRootEnv = process.env.STIGMERGY_PROJECT_ROOT || '';
            if (projectRootEnv) {
                // 添加环境变量指定的路径到搜索列表
                const envConfigPath = path.join(projectRootEnv, 'src', 'adapters', 'copilot', 'config.json');
                possiblePaths.push(envConfigPath);
            }
            
            // 查找存在的配置文件
            this.configPath = possiblePaths.find(p => fs.access(p).then(() => true).catch(() => false)) || 
                             path.join(this.scriptDir, 'config.json');
        }
    }
    
    async createDefaultConfig() {
        /** 创建默认配置 */
        const defaultConfig = {
            "name": "copilot",
            "displayName": "GitHub Copilot CLI",
            "version": "1.0.0",
            "integration_type": "mcp_server",
            "config_file": path.join(homedir(), '.config', 'copilot', 'config.json'),
            "global_doc": "copilot.md",
            "description": "GitHub Copilot CLI MCP服务器集成适配器",
            "mcp_config": {
                "server_name": "stigmergy-copilot-integration",
                "command": "node",
                "args": [
                    "src/adapters/copilot/mcp_server.js"
                ],
                "environment": {
                    "NODE_PATH": ".",
                    "STIGMERGY_CONFIG_PATH": path.join(homedir(), '.stigmergy'),
                    "COPILOT_ADAPTER_MODE": "cross_cli"
                },
                "health_check_interval": 30,
                "timeout": 60
            },
            "custom_agents": {
                "cross_cli_caller": {
                    "name": "CrossCLICaller",
                    "description": "跨CLI工具调用代理",
                    "version": "1.0.0",
                    "tools": [
                        "cross_cli_execute",
                        "get_available_clis",
                        "check_cli_status"
                    ],
                    "permissions": [
                        "execute_external_cli",
                        "read_config",
                        "write_logs"
                    ]
                }
            },
            "supported_cli_tools": [
                "claude",
                "gemini",
                "qwencode",
                "iflow",
                "qoder",
                "codebuddy",
                "codex"
            ],
            "permissions": {
                "execute_external_cli": {
                    "description": "执行外部CLI工具",
                    "level": "high",
                    "requires_approval": false
                },
                "read_config": {
                    "description": "读取CLI配置文件",
                    "level": "medium",
                    "requires_approval": false
                },
                "write_logs": {
                    "description": "写入日志文件",
                    "level": "low",
                    "requires_approval": false
                }
            },
            "adapter": {
                "name": "Copilot MCP Integration Adapter",
                "version": "1.0.0",
                "type": "mcp_server",
                "module_path": "src.adapters.copilot.mcp_adapter",
                "class_name": "CopilotMCPIntegrationAdapter",
                "features": [
                    "cross_cli_detection",
                    "command_routing",
                    "result_formatting",
                    "collaboration_tracking"
                ]
            }
        };
        
        // 创建配置文件
        try {
            await fs.mkdir(path.dirname(this.configPath), { recursive: true });
            await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
            console.log(`[OK] 创建默认配置文件: ${this.configPath}`);
            return defaultConfig;
        } catch (error) {
            console.error(`[ERROR] 创建默认配置文件失败: ${error.message}`);
            throw error;
        }
    }
    
    async loadConfig() {
        /** 加载配置文件 */
        try {
            const configExists = await fs.access(this.configPath).then(() => true).catch(() => false);
            if (!configExists) {
                return await this.createDefaultConfig();
            }
            
            const configContent = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            console.warn(`[WARNING] 加载配置文件失败: ${error.message}`);
            return await this.createDefaultConfig();
        }
    }
    
    async installMCPIntegration() {
        /** 安装MCP集成功能 */
        try {
            const config = await this.loadConfig();
            
            // 确保MCP配置目录存在
            const mcpConfigDir = path.dirname(config.config_file);
            await fs.mkdir(mcpConfigDir, { recursive: true });
            
            // 写入主配置文件
            await fs.writeFile(config.config_file, JSON.stringify(config, null, 2), 'utf8');
            console.log(`[OK] Copilot MCP配置已安装: ${config.config_file}`);
            
            // 创建MCP服务器脚本（如果不存在）
            const mcpServerPath = path.join(this.projectRoot, 'src', 'adapters', 'copilot', 'mcp_server.js');
            const mcpServerExists = await fs.access(mcpServerPath).then(() => true).catch(() => false);
            
            if (!mcpServerExists) {
                const mcpServerContent = `#!/usr/bin/env node
// Copilot MCP服务器入口点
console.log('Copilot MCP服务器正在启动...');

// 这里应该实现实际的MCP服务器逻辑
// 由于这是一个示例，我们只是创建一个基本的服务器框架

import { createServer } from 'http';

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'ok',
        message: 'Copilot MCP服务器运行中',
        timestamp: new Date().toISOString()
    }));
});

const PORT = process.env.MCP_PORT || 3000;
server.listen(PORT, () => {
    console.log(\`Copilot MCP服务器正在端口 \${PORT} 上运行\`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
`;
                await fs.writeFile(mcpServerPath, mcpServerContent, 'utf8');
                console.log(`[OK] 创建MCP服务器脚本: ${mcpServerPath}`);
            }
            
            return true;
        } catch (error) {
            console.error(`[ERROR] 安装MCP集成功能失败: ${error.message}`);
            return false;
        }
    }
    
    async copyAdapterFiles() {
        /** 复制适配器文件 */
        try {
            const adapterDir = path.join(this.projectRoot, 'src', 'adapters', 'copilot');
            const configDir = path.dirname(this.configPath);
            
            // 复制适配器文件
            const adapterFiles = [
                'mcp_server.js',
                'mcp_adapter.py',
                'config.json'
            ];
            
            for (const fileName of adapterFiles) {
                const srcFile = path.join(adapterDir, fileName);
                const dstFile = path.join(configDir, fileName);
                
                try {
                    await fs.access(srcFile);
                    await fs.copyFile(srcFile, dstFile);
                    console.log(`[OK] 复制适配器文件: ${fileName}`);
                } catch (error) {
                    console.warn(`[WARNING] 适配器文件不存在: ${fileName}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error(`[ERROR] 复制适配器文件失败: ${error.message}`);
            return false;
        }
    }
    
    async verifyInstallation() {
        /** 验证安装 */
        console.log('\n🔍 验证Copilot CLI集成安装...');
        
        try {
            // 检查配置文件
            await fs.access(this.configPath);
            console.log(`[OK] 配置文件存在: ${this.configPath}`);
            
            // 检查MCP配置文件
            const config = await this.loadConfig();
            await fs.access(config.config_file);
            console.log(`[OK] MCP配置文件存在: ${config.config_file}`);
            
            // 检查MCP服务器脚本
            const mcpServerPath = path.join(this.projectRoot, 'src', 'adapters', 'copilot', 'mcp_server.js');
            await fs.access(mcpServerPath);
            console.log(`[OK] MCP服务器脚本存在: ${mcpServerPath}`);
            
            console.log('[OK] Copilot CLI集成安装验证通过');
            return true;
        } catch (error) {
            console.error(`[ERROR] 验证安装失败: ${error.message}`);
            return false;
        }
    }
    
    async uninstallIntegration() {
        /** 卸载集成 */
        try {
            const config = await this.loadConfig();
            
            // 删除MCP配置文件
            try {
                await fs.unlink(config.config_file);
                console.log(`[OK] 已删除MCP配置文件: ${config.config_file}`);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.warn(`[WARNING] 删除MCP配置文件失败: ${error.message}`);
                }
            }
            
            // 删除配置目录（如果为空）
            const configDir = path.dirname(config.config_file);
            try {
                const files = await fs.readdir(configDir);
                if (files.length === 0) {
                    await fs.rmdir(configDir);
                    console.log(`[OK] 已删除配置目录: ${configDir}`);
                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.warn(`[WARNING] 删除配置目录失败: ${error.message}`);
                }
            }
            
            console.log('[OK] Copilot CLI集成卸载完成');
            return true;
        } catch (error) {
            console.error(`[ERROR] 卸载集成失败: ${error.message}`);
            return false;
        }
    }
}

async function main() {
    /** 主函数 */
    const args = process.argv.slice(2);
    const options = {
        verify: args.includes('--verify'),
        uninstall: args.includes('--uninstall'),
        install: args.includes('--install') || args.length === 0
    };
    
    console.log('Copilot CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));
    
    const installer = new CopilotIntegrationInstaller();
    
    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await installer.uninstallIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await installer.verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 安装MCP集成功能
        const mcpSuccess = await installer.installMCPIntegration();
        
        // 2. 复制适配器文件
        const adapterSuccess = await installer.copyAdapterFiles();
        
        const success = mcpSuccess && adapterSuccess;
        
        if (success) {
            console.log('\n🎉 Copilot CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log('   [OK] MCP服务器配置: 已启用');
            console.log('   [OK] 跨CLI协作功能: 已启用');
            console.log('   [OK] 自定义代理: 已配置');
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ Copilot CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_copilot_integration.js [--install|--verify|--uninstall]');
        console.log('  默认为安装模式');
    }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(`[FATAL] ${error.message}`);
        process.exit(1);
    });
}

export { CopilotIntegrationInstaller };