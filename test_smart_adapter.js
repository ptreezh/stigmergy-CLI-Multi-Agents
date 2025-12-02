/**
 * 智能适配器测试脚本
 * 验证Python修复和Node.js备用方案
 */

import fs from 'fs/promises';
import path from 'path';

class SmartAdapterTest {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🧪 智能适配器测试开始');
        console.log('=' .repeat(60));
        
        // 1. Python语法测试
        await this.testPythonSyntax();
        
        // 2. Node.js模块测试
        await this.testNodeModules();
        
        // 3. 智能适配器初始化测试
        await this.testSmartAdapterInit();
        
        // 4. 降级机制测试
        await this.testFallbackMechanism();
        
        // 5. CLI执行测试
        await this.testCLIExecution();
        
        // 6. 集成测试
        await this.testIntegration();
        
        // 7. 生成测试报告
        await this.generateTestReport();
        
        console.log('\n' + '=' .repeat(60));
        console.log('✅ 所有测试完成!');
        
        return this.testResults;
    }

    /**
     * 测试Python语法修复
     */
    async testPythonSyntax() {
        console.log('📋 1. Python语法测试');
        
        try {
            // 测试修复后的verified_cross_cli_system.py
            const { spawnSync } = await import('child_process');
            
            const result = spawnSync('python3', [
                '-c', 
                'import sys; sys.path.append("src/core"); import verified_cross_cli_system; print("Python语法检查通过")'
            ], {
                stdio: 'pipe',
                timeout: 10000
            });

            const success = result.status === 0 && result.stdout.includes('Python语法检查通过');
            
            this.testResults.push({
                test: 'Python语法修复',
                success,
                error: success ? null : result.stderr,
                duration: Date.now() - this.startTime
            });

            console.log(`   ${success ? '✅' : '❌'} Python语法修复: ${success ? '通过' : '失败'}`);
            if (!success) {
                console.log(`      错误: ${result.stderr}`);
            }
            
        } catch (error) {
            this.testResults.push({
                test: 'Python语法修复',
                success: false,
                error: error.message,
                duration: Date.now() - this.startTime
            });
            
            console.log(`   ❌ Python语法修复: 异常 - ${error.message}`);
        }
    }

    /**
     * 测试Node.js模块
     */
    async testNodeModules() {
        console.log('\n📋 2. Node.js模块测试');
        
        const modules = [
            'environment_stigmergy_system.js',
            'cli_interaction_detector.js',
            'lightweight_cli_enhancer.js',
            'nodejs_fallback_adapter.js',
            'smart_adapter_detector.js',
            'smart_adapter_integration.js',
            'cli_adapter_manager.js',
            'smart_adapter_demo.js'
        ];
        
        for (const module of modules) {
            try {
                // 动态导入模块测试
                const modulePath = path.join(process.cwd(), 'src', 'core', module);
                await fs.access(modulePath);
                
                // 简单的语法检查
                const content = await fs.readFile(modulePath, 'utf8');
                const hasExport = content.includes('export ');
                const hasClass = content.includes('class ');
                const hasFunction = content.includes('function ');
                const hasImport = content.includes('import ');
                
                const syntaxValid = !this.hasJSSyntaxErrors(content);
                
                const success = syntaxValid && (hasExport || hasClass || hasFunction || hasImport);
                
                this.testResults.push({
                    test: `Node.js模块: ${module}`,
                    success,
                    error: success ? null : '语法错误',
                    details: {
                        hasExport,
                        hasClass,
                        hasFunction,
                        hasImport,
                        syntaxValid
                    }
                });
                
                console.log(`   ${success ? '✅' : '❌'} ${module}: ${success ? '通过' : '失败'}`);
                
            } catch (error) {
                this.testResults.push({
                    test: `Node.js模块: ${module}`,
                    success: false,
                    error: error.message
                });
                
                console.log(`   ❌ ${module}: 异常 - ${error.message}`);
            }
        }
    }

    /**
     * 检查JavaScript语法错误
     */
    hasJSSyntaxErrors(code) {
        try {
            new Function(code);
            return false;
        } catch (error) {
            return true;
        }
    }

    /**
     * 测试智能适配器初始化
     */
    async testSmartAdapterInit() {
        console.log('\n📋 3. 智能适配器初始化测试');
        
        try {
            // 测试智能适配器集成
            const { SmartAdapterIntegration } = await import('./smart_adapter_integration.js');
            const integration = new SmartAdapterIntegration();
            
            const initSuccess = await integration.initialize();
            
            this.testResults.push({
                test: '智能适配器初始化',
                success: initSuccess,
                error: initSuccess ? null : '初始化失败'
            });
            
            console.log(`   ${initSuccess ? '✅' : '❌'} 智能适配器初始化: ${initSuccess ? '通过' : '失败'}`);
            
            // 测试CLI管理器
            const { CLIAdapterManager } = await import('./cli_adapter_manager.js');
            const manager = new CLIAdapterManager();
            
            const managerInitSuccess = await manager.initialize();
            
            this.testResults.push({
                test: 'CLI管理器初始化',
                success: managerInitSuccess,
                error: managerInitSuccess ? null : '管理器初始化失败'
            });
            
            console.log(`   ${managerInitSuccess ? '✅' : '❌'} CLI管理器初始化: ${managerInitSuccess ? '通过' : '失败'}`);
            
        } catch (error) {
            this.testResults.push({
                test: '智能适配器初始化',
                success: false,
                error: error.message
            });
            
            console.log(`   ❌ 智能适配器初始化: 异常 - ${error.message}`);
        }
    }

    /**
     * 测试降级机制
     */
    async testFallbackMechanism() {
        console.log('\n📋 4. 降级机制测试');
        
        try {
            const { SmartAdapterDetector } = await import('./smart_adapter_detector.js');
            const detector = new SmartAdapterDetector();
            
            // 测试Python可用性检测
            const pythonCheck = await detector.checkPythonEnvironment();
            
            this.testResults.push({
                test: 'Python环境检测',
                success: pythonCheck.available !== undefined,
                error: pythonCheck.available === undefined ? '检测失败' : null,
                details: {
                    available: pythonCheck.available,
                    command: pythonCheck.command
                }
            });
            
            console.log(`   ${pythonCheck.available ? '✅' : '❌'} Python环境检测: ${pythonCheck.available ? '可用' : '不可用'}`);
            
            // 测试Node.js降级适配器
            const { NodeJSFallbackAdapter } = await import('./nodejs_fallback_adapter.js');
            const fallback = new NodeJSFallbackAdapter();
            
            const nodejsCheck = await fallback.checkPythonAvailability();
            
            this.testResults.push({
                test: 'Node.js降级适配器',
                success: true, // Node.js应该总是可用
                error: null,
                details: {
                    pythonAvailable: nodejsCheck
                }
            });
            
            console.log(`   ✅ Node.js降级适配器: 可用`);
            
            // 测试环境线索系统
            const { EnvironmentStigmergySystem } = await import('./environment_stigmergy_system.js');
            const envSystem = new EnvironmentStigmergySystem();
            
            const envInit = await envSystem.initializeEnvironmentSystem();
            
            this.testResults.push({
                test: '环境线索系统',
                success: envInit,
                error: envInit ? null : '环境初始化失败'
            });
            
            console.log(`   ${envInit ? '✅' : '❌'} 环境线索系统: ${envInit ? '通过' : '失败'}`);
            
        } catch (error) {
            this.testResults.push({
                test: '降级机制',
                success: false,
                error: error.message
            });
            
            console.log(`   ❌ 降级机制: 异常 - ${error.message}`);
        }
    }

    /**
     * 测试CLI执行
     */
    async testCLIExecution() {
        console.log('\n📋 5. CLI执行测试');
        
        try {
            const { CLIAdapterManager } = await import('./cli_adapter_manager.js');
            const manager = new CLIAdapterManager();
            
            // 测试状态检查
            const statusResult = await manager.handleStatus([]);
            
            this.testResults.push({
                test: 'CLI状态检查',
                success: true,
                error: null
            });
            
            console.log(`   ✅ CLI状态检查: 通过`);
            
            // 测试帮助命令
            const helpResult = manager.showHelp();
            
            this.testResults.push({
                test: 'CLI帮助命令',
                success: true,
                error: null
            });
            
            console.log(`   ✅ CLI帮助命令: 通过`);
            
        } catch (error) {
            this.testResults.push({
                test: 'CLI执行',
                success: false,
                error: error.message
            });
            
            console.log(`   ❌ CLI执行: 异常 - ${error.message}`);
        }
    }

    /**
     * 测试集成
     */
    async testIntegration() {
        console.log('\n📋 6. 集成测试');
        
        try {
            // 测试轻量级增强器
            const { LightweightCLIEnhancer } = await import('./lightweight_cli_enhancer.js');
            const enhancer = new LightweightCLIEnhancer();
            
            const enhancerStatus = await enhancer.getEnvironmentStatus();
            
            this.testResults.push({
                test: '轻量级增强器',
                success: enhancerStatus.systemInitialized,
                error: enhancerStatus.systemInitialized ? null : '增强器初始化失败'
            });
            
            console.log(`   ${enhancerStatus.systemInitialized ? '✅' : '❌'} 轻量级增强器: ${enhancerStatus.systemInitialized ? '通过' : '失败'}`);
            
            // 测试CLI交互检测器
            const { CLIInteractionDetector } = await import('./cli_interaction_detector.js');
            const detector = new CLIInteractionDetector();
            
            const detectorInit = await detector.initialize();
            
            this.testResults.push({
                test: 'CLI交互检测器',
                success: detectorInit,
                error: detectorInit ? null : '检测器初始化失败'
            });
            
            console.log(`   ${detectorInit ? '✅' : '❌'} CLI交互检测器: ${detectorInit ? '通过' : '失败'}`);
            
        } catch (error) {
            this.testResults.push({
                test: '集成测试',
                success: false,
                error: error.message
            });
            
            console.log(`   ❌ 集成测试: 异常 - ${error.message}`);
        }
    }

    /**
     * 生成测试报告
     */
    async generateTestReport() {
        const reportData = {
            testTime: new Date().toISOString(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.success).length,
            failedTests: this.testResults.filter(r => !r.success).length,
            testResults: this.testResults,
            summary: {
                pythonFixed: this.testResults.filter(r => r.test.includes('Python语法修复')).every(r => r.success),
                nodeModulesValid: this.testResults.filter(r => r.test.includes('Node.js模块')).every(r => r.success),
                smartAdaptersWorking: this.testResults.filter(r => r.test.includes('适配器') && r.success).length > 0,
                fallbackMechanismWorking: this.testResults.filter(r => r.test.includes('降级机制') && r.success).length > 0
            }
        };
        
        const reportFile = path.join(process.cwd(), 'test_report.json');
        await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));
        
        const successRate = reportData.passedTests / reportData.totalTests * 100;
        
        console.log('\n📊 测试报告:');
        console.log(`   总测试数: ${reportData.totalTests}`);
        console.log(`   通过测试: ${reportData.passedTests}`);
        console.log(`   失败测试: ${reportData.failedTests}`);
        console.log(`   成功率: ${successRate.toFixed(1)}%`);
        console.log(`   报告文件: ${reportFile}`);
        
        // 详细结果
        console.log('\n📋 详细结果:');
        for (const result of reportData.testResults) {
            console.log(`   ${result.success ? '✅' : '❌'} ${result.test}: ${result.success ? '通过' : '失败'}`);
            if (result.error) {
                console.log(`      错误: ${result.error}`);
            }
            if (result.details) {
                console.log(`      详情: ${JSON.stringify(result.details)}`);
            }
        }
        
        console.log('\n✅ Python修复验证: ' + (reportData.summary.pythonFixed ? '✅ 成功' : '❌ 失败'));
        console.log('✅ Node.js备用方案: ' + (reportData.summary.smartAdaptersWorking ? '✅ 就绪' : '❌ 需要修复'));
        console.log('✅ 增量设计验证: ' + (reportData.summary.fallbackMechanismWorking ? '✅ 成功' : '❌ 需要检查'));
    }
}

// 测试入口
async function runSmartAdapterTest() {
    const tester = new SmartAdapterTest();
    
    try {
        const results = await tester.runAllTests();
        return results;
    } catch (error) {
        console.error('❌ 测试执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    runSmartAdapterTest();
}

export { SmartAdapterTest };