const fs = require('fs');

const filePath = 'src/core/installer.js';
const content = fs.readFileSync(filePath, 'utf8');

// 新的 deployHooks 方法
const newDeployHooks = `  async deployHooks(available) {
    console.log('\n[DEPLOY] Deploying cross-CLI integration hooks...');
    console.log(chalk.blue(\`[INFO] Using parallel deployment with concurrency: \${this.concurrency || 4}\`));

    const HookDeploymentManager = require('./coordination/nodejs/HookDeploymentManager');
    const hookManager = new HookDeploymentManager();
    
    await hookManager.initialize();

    const toolEntries = Object.entries(available);
    let successCount = 0;
    let totalCount = toolEntries.length;
    const concurrency = this.concurrency || 4;

    // 并行部署函数
    const deployForTool = async ([toolName, toolInfo]) => {
      const startTime = Date.now();
      
      try {
        const fs = require('fs/promises');
        const path = require('path');
        
        // Create hooks directory
        await fs.mkdir(toolInfo.hooksDir, { recursive: true });
        
        // Create config directory
        const configDir = path.dirname(toolInfo.config);
        await fs.mkdir(configDir, { recursive: true });

        // Use HookDeploymentManager to deploy Node.js hooks
        const deploySuccess = await hookManager.deployHooksForCLI(toolName);
        
        if (deploySuccess) {
          // Run JavaScript-based installation for each tool
          await this.installToolIntegration(toolName, toolInfo);
          
          const duration = Date.now() - startTime;
          console.log(\`[OK] \${toolInfo.name} deployed successfully (\${duration}ms)\`);
          return { success: true, toolName, duration };
        }

        return { success: false, toolName, duration: Date.now() - startTime };

      } catch (error) {
        const { errorHandler } = require('./error_handler');
        await errorHandler.logError(
          error,
          'ERROR',
          \`StigmergyInstaller.deployHooks.\${toolName}\`,
        );
        
        const duration = Date.now() - startTime;
        console.log(
          \`[ERROR] Failed to deploy hooks for \${toolInfo.name}: \${error.message} (\${duration}ms)\`,
        );
        
        return { success: false, toolName, duration, error: error.message };
      }
    };

    // 批量并行处理
    const results = [];
    for (let i = 0; i < toolEntries.length; i += concurrency) {
      const batch = toolEntries.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(deployForTool));
      results.push(...batchResults);
    }

    // 统计结果
    successCount = results.filter(r => r.success).length;
    const totalDuration = Math.max(...results.map(r => r.duration));

    console.log(
      \`\n[SUMMARY] Hook deployment completed: \${successCount}/\${totalCount} tools successful\`,
    );
    console.log(chalk.blue(\`[PERFORMANCE] Total deployment time: \${totalDuration}ms\`));
    console.log(chalk.blue(\`[PERFORMANCE] Average per tool: \${Math.round(totalDuration / totalCount)}ms\`));
    
    return successCount > 0;
  }`;

// 使用正则表达式替换
const pattern = /async deployHooks\(available\) \{[\s\S]*?return successCount > 0;\s*\}/;
const newContent = content.replace(pattern, newDeployHooks);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ installer.js 已优化，支持并行部署');