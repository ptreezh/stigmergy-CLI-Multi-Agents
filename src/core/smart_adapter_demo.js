/**
 * 智能适配器演示脚本
 * 展示Python/Node.js自动选择和降级机制
 */

import fs from 'fs/promises';
import path from 'path';
import { CLIAdapterManager } from './cli_adapter_manager.js';

class SmartAdapterDemo {
    constructor() {
        this.manager = new CLIAdapterManager();
        this.demos = [
            {
                name: '系统检测演示',
                description: '检测Python和Node.js环境，显示所有适配器状态'
            },
            {
                name: '智能选择演示', 
                description: '演示智能选择最佳适配器的过程'
            },
            {
                name: '降级机制演示',
                description: '演示Python不可用时自动降级到Node.js'
            },
            {
                name: '执行对比演示',
                description: '对比Python和Node.js适配器的执行效果'
            },
            {
                name: '配置管理演示',
                description: '演示配置管理和模式切换'
            }
        ];
    }

    /**
     * 运行所有演示
     */
    async runAllDemos() {
        console.log('🚀 智能适配器演示程序');
        console.log('=' .repeat(50));
        console.log('Python/Node.js 自动选择和降级机制');
        console.log('=' .repeat(50));
        
        // 初始化管理器
        await this.manager.initialize();
        
        for (let i = 0; i < this.demos.length; i++) {
            const demo = this.demos[i];
            console.log(`\n📋 ${i + 1}. ${demo.name}`);
            console.log(`   ${demo.description}`);
            
            try {
                await this.runDemo(demo);
            } catch (error) {
                console.error(`   ❌ 演示失败: ${error.message}`);
            }
        }
        
        console.log('\n' + '=' .repeat(50));
        console.log('✅ 所有演示完成！');
        console.log('=' .repeat(50));
    }

    /**
     * 运行单个演示
     */
    async runDemo(demo) {
        switch (demo.name) {
            case '系统检测演示':
                await this.demoSystemDetection();
                break;
            case '智能选择演示':
                await this.demoSmartSelection();
                break;
            case '降级机制演示':
                await this.demoFallbackMechanism();
                break;
            case '执行对比演示':
                await this.demoExecutionComparison();
                break;
            case '配置管理演示':
                await this.demoConfigManagement();
                break;
        }
    }

    /**
     * 系统检测演示
     */
    async demoSystemDetection() {
        console.log('\n🔍 检测系统环境...\n');
        
        const status = await this.manager.handleStatus([]);
        
        console.log('🔧 环境检测结果:');
        console.log(`   Python: ${status.pythonAvailable ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`   Node.js: ${status.nodeAvailable ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`   降级模式: ${status.fallbackMode ? '✅ 启用' : '❌ 未启用'}`);
        
        console.log('\n📋 适配器检测:');
        for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
            const available = cliStatus.pythonAdapter?.available || cliStatus.nodejsAdapter?.available;
            const icon = available ? '✅' : '❌';
            const adapterType = cliStatus.recommended?.type || 'none';
            const confidence = cliStatus.recommended?.confidence || 0;
            const fallback = cliStatus.fallback ? '🔄' : '';
            
            console.log(`  ${icon} ${fallback} ${cliName}: ${adapterType} (${confidence})`);
            
            if (cliStatus.pythonAdapter?.files?.length > 0) {
                console.log(`    🐍 Python文件: ${cliStatus.pythonAdapter.files.length} 个`);
            }
            
            if (cliStatus.nodejsAdapter?.command) {
                console.log(`    🟢 Node.js命令: ${cliStatus.nodejsAdapter.command}`);
            }
        }
        
        const summary = {
            totalAdapters: status.totalCLIs,
            availableAdapters: status.availableCLIs,
            pythonAdapters: status.pythonAdapters,
            nodeAdapters: status.nodeAdapters,
            fallbackAdapters: status.fallbackAdapters
        };
        
        console.log('\n📊 统计信息:');
        console.log(`   总适配器: ${summary.totalAdapters}`);
        console.log(`   可用适配器: ${summary.availableAdapters}`);
        console.log(`   Python适配器: ${summary.pythonAdapters}`);
        console.log(`   Node.js适配器: ${summary.nodeAdapters}`);
        console.log(`   降级适配器: ${summary.fallbackAdapters}`);
    }

    /**
     * 智能选择演示
     */
    async demoSmartSelection() {
        console.log('\n🤖 智能选择最佳适配器演示...\n');
        
        const testCLIs = ['claude', 'gemini', 'qwen'];
        
        for (const cliName of testCLIs) {
            console.log(`🔍 为 ${cliName} 选择适配器...\n`);
            
            const result = await this.manager.handleCheck([cliName]);
            
            if (result.pythonAdapter || result.nodejsAdapter) {
                console.log(`📋 ${cliName} 适配器详情:`);
                
                if (result.pythonAdapter) {
                    const pyStatus = result.pythonAdapter.available ? '✅ 可用' : '❌ 不可用';
                    console.log(`  🐍 Python适配器: ${pyStatus}`);
                    console.log(`     状态: ${result.pythonAdapter.reason || '运行中'}`);
                    if (result.pythonAdapter.files) {
                        console.log(`     文件: ${result.pythonAdapter.files.length} 个`);
                    }
                }
                
                if (result.nodejsAdapter) {
                    const nodeStatus = result.nodejsAdapter.available ? '✅ 可用' : '❌ 不可用';
                    console.log(`  🟢 Node.js适配器: ${nodeStatus}`);
                    console.log(`     状态: ${result.nodejsAdapter.reason || '可用'}`);
                    if (result.nodejsAdapter.command) {
                        console.log(`     命令: ${result.nodejsAdapter.command}`);
                    }
                }
                
                console.log(`  🎯 推荐选择: ${result.recommended?.type || 'none'} (${result.recommended?.confidence || 0})`);
                console.log(`  🎯 降级模式: ${result.fallback ? '是' : '否'}`);
            } else {
                console.log(`  ❌ ${cliName}: 无可用适配器`);
            }
        }
    }

    /**
     * 降级机制演示
     */
    async demoFallbackMechanism() {
        console.log('\n🔄 降级机制演示...\n');
        
        console.log('📋 测试场景: Python不可用时的自动降级\n');
        
        // 模拟Python不可用的情况
        const originalPythonAvailable = this.manager.integration.config.enablePython;
        this.manager.integration.config.enablePython = false;
        await this.manager.integration.saveConfig();
        
        const testCLIs = ['claude', 'gemini', 'iflow'];
        
        for (const cliName of testCLIs) {
            console.log(`🔍 测试 ${cliName} 的降级机制...\n`);
            
            const beforeStatus = await this.manager.handleCheck([cliName]);
            const beforeAdapter = beforeStatus.recommended?.type || 'none';
            
            console.log(`  降级前推荐: ${beforeAdapter}`);
            
            // 模拟执行，触发降级
            const executionResult = await this.manager.handleExecute([cliName, '--version']);
            
            if (executionResult.success) {
                console.log(`  ✅ 执行成功`);
                console.log(`  🔧 使用适配器: ${executionResult.adapter}`);
                console.log(`  🔄 降级状态: ${executionResult.fallback ? '是' : '否'}`);
            } else {
                console.log(`  ❌ 执行失败: ${executionResult.error}`);
            }
            
            console.log('');
        }
        
        // 恢复Python可用性
        this.manager.integration.config.enablePython = originalPythonAvailable;
        await this.manager.integration.saveConfig();
        
        console.log('✅ 已恢复Python可用性');
        console.log('🔄 降级机制演示完成');
    }

    /**
     * 执行对比演示
     */
    async demoExecutionComparison() {
        console.log('\n⚖️ 执行对比演示...\n');
        
        const testCLIs = ['claude', 'gemini'];
        const testArgs = ['--version'];
        
        for (const cliName of testCLIs) {
            console.log(`🔍 对比 ${cliName} 的执行效果...\n`);
            
            // 获取适配器状态
            const status = await this.manager.handleCheck([cliName]);
            
            if (!status.pythonAdapter && !status.nodejsAdapter) {
                console.log(`  ❌ ${cliName}: 无可用适配器，跳过对比`);
                continue;
            }
            
            // 模拟Python执行
            if (status.pythonAdapter?.available) {
                console.log('  🐍 Python适配器执行:');
                const pythonResult = await this.simulatePythonExecution(cliName, testArgs);
                console.log(`    状态: ${pythonResult.success ? '✅ 成功' : '❌ 失败'}`);
                if (pythonResult.success) {
                    console.log(`    响应: ${pythonResult.output.substring(0, 50)}...`);
                    console.log(`    耗时: ${pythonResult.executionTime}ms`);
                }
            }
            
            // 模拟Node.js执行
            if (status.nodejsAdapter?.available) {
                console.log('  🟢 Node.js适配器执行:');
                const nodeResult = await this.simulateNodeJSExecution(cliName, testArgs);
                console.log(`    状态: ${nodeResult.success ? '✅ 成功' : '❌ 失败'}`);
                if (nodeResult.success) {
                    console.log(`    响应: ${nodeResult.output.substring(0, 50)}...`);
                    console.log(`    耗时: ${nodeResult.executionTime}ms`);
                }
            }
            
            console.log('');
        }
    }

    /**
     * 模拟Python执行
     */
    async simulatePythonExecution(cliName, args) {
        const startTime = Date.now();
        
        try {
            // 这里应该调用真实的Python适配器
            // 为了演示，我们模拟结果
            const result = {
                success: true,
                output: `${cliName} Python adapter simulation output`,
                executionTime: Date.now() - startTime
            };
            
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * 模拟Node.js执行
     */
    async simulateNodeJSExecution(cliName, args) {
        const startTime = Date.now();
        
        try {
            // 这里应该调用真实的Node.js适配器
            // 为了演示，我们模拟结果
            const result = {
                success: true,
                output: `${cliName} Node.js adapter simulation output`,
                executionTime: Date.now() - startTime
            };
            
            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                executionTime: Date.now() - startTime
            };
        }
    }

    /**
     * 配置管理演示
     */
    async demoConfigManagement() {
        console.log('\n⚙️ 配置管理演示...\n');
        
        console.log('📋 当前配置:');
        const currentConfig = await this.manager.handleConfig(['get', 'integrationMode']);
        console.log(`   集成模式: ${currentConfig}`);
        
        console.log('\n🔄 切换到不同模式:');
        
        const modes = ['python-only', 'nodejs-only', 'hybrid'];
        
        for (const mode of modes) {
            console.log(`\n  🎯 切换到 ${mode} 模式...`);
            
            const switchResult = await this.manager.handleSwitchMode([mode]);
            
            if (switchResult.success) {
                console.log(`    ✅ 切换成功: ${switchResult.mode}`);
            } else {
                console.log(`    ❌ 切换失败: ${switchResult.error}`);
            }
            
            // 显示切换后的状态
            const newStatus = await this.manager.getSmartAdapterStatus();
            console.log(`    📊 可用适配器: ${newStatus.availableCLIs}`);
            console.log(`    📊 Python适配器: ${newStatus.pythonAdapters}`);
            console.log(`    📊 Node.js适配器: ${newStatus.nodeAdapters}`);
        }
        
        console.log('\n🔄 恢复到混合模式...');
        const restoreResult = await this.manager.handleSwitchMode(['hybrid']);
        
        if (restoreResult.success) {
            console.log(`✅ 已恢复到混合模式`);
        }
        
        console.log('\n📋 配置管理完成');
    }
}

// 演示入口
async function runDemo() {
    const demo = new SmartAdapterDemo();
    
    try {
        await demo.runAllDemos();
    } catch (error) {
        console.error('❌ 演示执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    runDemo();
}

export { SmartAdapterDemo };