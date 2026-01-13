const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

const oldCode = `        // 获取当前版本
        const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
        // 如果版本未变化，使用缓存
        if (currentVersion === cachedAnalysis.version && !this.isCacheExpired(cachedAnalysis.timestamp)) {
          if (process.env.DEBUG === "true") {
            console.log(`[DEBUG] ${cliName}: 使用缓存的分析结果 (版本: ${cachedAnalysis.version})`);
          }
          return cachedAnalysis;
        } else {
          if (process.env.DEBUG === "true") {
            console.log(`[DEBUG] ${cliName}: 版本变化 (${cachedAnalysis.version} -> ${currentVersion}) 或缓存过期，重新分析`);
          }
        }
      }
      
      // Get help information`;

const newCode = `          // 获取当前版本
          const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
          // 如果版本未变化，使用缓存
          if (currentVersion === cachedAnalysis.version && !this.isCacheExpired(cachedAnalysis.timestamp)) {
            if (process.env.DEBUG === "true") {
              console.log(`[DEBUG] ${cliName}: 使用缓存的分析结果 (版本: ${cachedAnalysis.version})`);
            }
            // 添加增强信息
            if (enhanced) {
              return this.addEnhancedInfo(cachedAnalysis, cliName);
            }
            return cachedAnalysis;
          } else {
            if (process.env.DEBUG === "true") {
              console.log(`[DEBUG] ${cliName}: 版本变化 (${cachedAnalysis.version} -> ${currentVersion}) 或缓存过期，重新分析`);
            }
          }
        }
      }
      
      // Get help information`;

const newContent = content.replace(oldCode, newCode);
fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Added enhanced check and closing braces');