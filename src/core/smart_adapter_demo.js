/**
 * Smart Adapter Demo Script
 * Demonstrates Python/Node.js auto-selection and fallback mechanism
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
        console.log('🚀 Smart Adapter Demo Program');
        console.log('=' .repeat(50));
        console.log('Python/Node.js Auto-selection and Fallback Mechanism');
        console.log('=' .repeat(50));
        
        // 初始化管理器
        await this.manager.initialize();
        
        for (let i = 0; i < this.demos.length; i++) {
            const demo = this.demos[i];
            console.log(`\n[DEMO] ${i + 1}. ${demo.name}`);
            console.log(`   [DESC] ${demo.description}`);
            
            try {
                await this.runDemo(demo);
            } catch (error) {
                console.error(`   [ERROR] Demo failed: ${error.message}`);
            }
        }
        
        console.log('\n' + '=' .repeat(50));
        console.log('✅ All demos completed!');
        console.log('=' .repeat(50));
    }

    /**
     * 运行单个演示
     */
    async runDemo(demo) {
        switch (demo.name) {
            case 'System Detection Demo':
                await this.demoSystemDetection();
                break;
            case 'Smart Selection Demo':
                await this.demoSmartSelection();
                break;
            case 'Fallback Mechanism Demo':
                await this.demoFallbackMechanism();
                break;
            case 'Execution Comparison Demo':
                await this.demoExecutionComparison();
                break;
            case 'Config Management Demo':
                await this.demoConfigManagement();
                break;
        }
    }

    /**
     * 系统检测演示
     */
    async demoSystemDetection() {
        console.log('\n🔍 Detecting system environment...\n');
        
        const status = await this.manager.handleStatus([]);
        
        console.log('🔧 Environment detection results:');
        console.log(`   Python: ${status.pythonAvailable ? '✅ Available' : '❌ Unavailable'}`);
        console.log(`   Node.js: ${status.nodeAvailable ? '✅ Available' : '❌ Unavailable'}`);
        console.log(`   Fallback mode: ${status.fallbackMode ? '✅ Enabled' : '❌ Disabled'}`);
        
        console.log('\n📋 Adapter detection:');
        for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
            const available = cliStatus.pythonAdapter?.available || cliStatus.nodejsAdapter?.available;
            const icon = available ? '[OK]' : '[ERROR]';
            const adapterType = cliStatus.recommended?.type || 'none';
            const confidence = cliStatus.recommended?.confidence || 0;
            const fallback = cliStatus.fallback ? '[FALLBACK]' : '';
            
            console.log(`  ${icon} ${fallback} ${cliName}: ${adapterType} (${confidence})`);
            
            if (cliStatus.pythonAdapter?.files?.length > 0) {
                console.log(`    🐍 Python files: ${cliStatus.pythonAdapter.files.length}`);
            }
            
            if (cliStatus.nodejsAdapter?.command) {
                console.log(`    🟢 Node.js command: ${cliStatus.nodejsAdapter.command}`);
            }
        }
        
        const summary = {
            totalAdapters: status.totalCLIs,
            availableAdapters: status.availableCLIs,
            pythonAdapters: status.pythonAdapters,
            nodeAdapters: status.nodeAdapters,
            fallbackAdapters: status.fallbackAdapters
        };
        
        console.log('\n[STATS] Statistics:');
        console.log(`   Total adapters: ${summary.totalAdapters}`);
        console.log(`   Available adapters: ${summary.availableAdapters}`);
        console.log(`   Python adapters: ${summary.pythonAdapters}`);
        console.log(`   Node.js adapters: ${summary.nodeAdapters}`);
        console.log(`   Fallback adapters: ${summary.fallbackAdapters}`);
    }

    /**
     * 智能选择演示
     */
    async demoSmartSelection() {
        console.log('\n🤖 Smart selection of best adapter demo...\n');
        
        const testCLIs = ['claude', 'gemini', 'qwen'];
        
        for (const cliName of testCLIs) {
            console.log(`🔍 Selecting adapter for ${cliName}...\n`);
            
            const result = await this.manager.handleCheck([cliName]);
            
            if (result.pythonAdapter || result.nodejsAdapter) {
                console.log(`📋 ${cliName} adapter details:`);
                
                if (result.pythonAdapter) {
                    const pyStatus = result.pythonAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]';
                    console.log(`  🐍 Python adapter: ${pyStatus}`);
                    console.log(`     Status: ${result.pythonAdapter.reason || 'Running'}`);
                    if (result.pythonAdapter.files) {
                        console.log(`     Files: ${result.pythonAdapter.files.length}`);
                    }
                }
                
                if (result.nodejsAdapter) {
                    const nodeStatus = result.nodejsAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]';
                    console.log(`  🟢 Node.js adapter: ${nodeStatus}`);
                    console.log(`     Status: ${result.nodejsAdapter.reason || 'Available'}`);
                    if (result.nodejsAdapter.command) {
                        console.log(`     Command: ${result.nodejsAdapter.command}`);
                    }
                }
                
                console.log(`  🎯 Recommended selection: ${result.recommended?.type || 'none'} (${result.recommended?.confidence || 0})`);
                console.log(`  🎯 Fallback mode: ${result.fallback ? 'Yes' : 'No'}`);
            } else {
                console.log(`  ❌ ${cliName}: No available adapters`);
            }
        }
    }

    /**
     * 降级机制演示
     */
    async demoFallbackMechanism() {
        console.log('\n🔄 Fallback mechanism demo...\n');
        
        console.log('📋 Test scenario: Auto fallback when Python is unavailable\n');
        
        // 模拟Python不可用的情况
        const originalPythonAvailable = this.manager.integration.config.enablePython;
        this.manager.integration.config.enablePython = false;
        await this.manager.integration.saveConfig();
        
        const testCLIs = ['claude', 'gemini', 'iflow'];
        
        for (const cliName of testCLIs) {
            console.log(`🔍 Testing ${cliName} fallback mechanism...\n`);
            
            const beforeStatus = await this.manager.handleCheck([cliName]);
            const beforeAdapter = beforeStatus.recommended?.type || 'none';
            
            console.log(`  Recommended before fallback: ${beforeAdapter}`);
            
            // 模拟执行，触发降级
            const executionResult = await this.manager.handleExecute([cliName, '--version']);
            
            if (executionResult.success) {
                console.log(`  ✅ Execution successful`);
                console.log(`  🔧 Using adapter: ${executionResult.adapter}`);
                console.log(`  🔄 Fallback status: ${executionResult.fallback ? 'Yes' : 'No'}`);
            } else {
                console.log(`  ❌ Execution failed: ${executionResult.error}`);
            }
            
            console.log('');
        }
        
        // 恢复Python可用性
        this.manager.integration.config.enablePython = originalPythonAvailable;
        await this.manager.integration.saveConfig();
        
        console.log('✅ Python availability restored');
        console.log('🔄 Fallback mechanism demo completed');
    }

    /**
     * 执行对比演示
     */
    async demoExecutionComparison() {
        console.log('\n⚖️ Execution comparison demo...\n');
        
        const testCLIs = ['claude', 'gemini'];
        const testArgs = ['--version'];
        
        for (const cliName of testCLIs) {
            console.log(`[COMPARE] Comparing execution effects of ${cliName}...\n`);
            
            // 获取适配器状态
            const status = await this.manager.handleCheck([cliName]);
            
            if (!status.pythonAdapter && !status.nodejsAdapter) {
                console.log(`  [SKIP] ${cliName}: No available adapters, skipping comparison`);
                continue;
            }
            
            // 模拟Python执行
            if (status.pythonAdapter?.available) {
                console.log('  [PYTHON] Python adapter execution:');
                const pythonResult = await this.simulatePythonExecution(cliName, testArgs);
                console.log(`    Status: ${pythonResult.success ? '[SUCCESS]' : '[FAILED]'}`);
                if (pythonResult.success) {
                    console.log(`    响应: ${pythonResult.output.substring(0, 50)}...`);
                    console.log(`    耗时: ${pythonResult.executionTime}ms`);
                }
            }
            
            // 模拟Node.js执行
            if (status.nodejsAdapter?.available) {
                console.log('  [NODEJS] Node.js adapter execution:');
                const nodeResult = await this.simulateNodeJSExecution(cliName, testArgs);
                console.log(`    Status: ${nodeResult.success ? '[SUCCESS]' : '[FAILED]'}`);
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
        console.log('\n[CONFIG] Configuration management demo...\n');
        
        console.log('[INFO] Current configuration:');
        const currentConfig = await this.manager.handleConfig(['get', 'integrationMode']);
        console.log(`   Integration mode: ${currentConfig}`);
        
        console.log('\n[SWITCH] Switching to different modes:');
        
        const modes = ['python-only', 'nodejs-only', 'hybrid'];
        
        for (const mode of modes) {
            console.log(`\n  [TARGET] Switching to ${mode} mode...`);
            
            const switchResult = await this.manager.handleSwitchMode([mode]);
            
            if (switchResult.success) {
                console.log(`    [SUCCESS] Switch successful: ${switchResult.mode}`);
            } else {
                console.log(`    [ERROR] Switch failed: ${switchResult.error}`);
            }
            
            // 显示切换后的状态
            const newStatus = await this.manager.getSmartAdapterStatus();
            console.log(`    [STATS] Available adapters: ${newStatus.availableCLIs}`);
            console.log(`    [STATS] Python adapters: ${newStatus.pythonAdapters}`);
            console.log(`    [STATS] Node.js adapters: ${newStatus.nodeAdapters}`);
        }
        
        console.log('\n[RESTORE] Restoring to hybrid mode...');
        const restoreResult = await this.manager.handleSwitchMode(['hybrid']);
        
        if (restoreResult.success) {
            console.log(`[SUCCESS] Restored to hybrid mode`);
        }
        
        console.log('\n[COMPLETE] Configuration management completed');
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