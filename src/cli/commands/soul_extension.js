/**
 * Soul CLI Commands 扩展
 * 添加 init/sync/promote 子命令
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * 注册Soul扩展命令
 */
function registerSoulCommands(program) {
  const soulCmd = program.command('soul')
    .description('Soul 自主进化系统扩展命令')
    .option('-v, --verbose', 'Verbose output')
    .option('--cli <name>', 'Target specific CLI tool');

  // stigmergy soul init - 初始化项目Soul并继承全局智慧
  soulCmd.command('init')
    .description('初始化项目Soul并从全局灵魂层继承智慧')
    .option('-n, --name <name>', 'Project name')
    .option('-t, --type <type>', 'Project type (engineering/ecommerce/academic/etc)')
    .action(async (options) => {
      try {
        const KnowledgeInheritance = require('../../core/soul/knowledge_inheritance');
        const os = require('os');
        
        const projectName = options.name || path.basename(process.cwd());
        const projectType = options.type || 'general';
        
        console.log(`🧬 初始化项目Soul: ${projectName} (类型: ${projectType})`);
        
        const inheritance = new KnowledgeInheritance({
          globalSoulPath: path.join(os.homedir(), '.stigmergy', 'soul-global'),
          projectSoulPath: process.cwd()
        });
        
        const result = await inheritance.inherit(projectName, projectType);
        
        console.log(`✅ 项目Soul初始化完成！`);
        console.log(`   继承最佳实践: ${result.inheritedPractices.length}条`);
        console.log(`   继承错误教训: ${result.inheritedLessons.length}条`);
        console.log(`   继承知识条目: ${result.inheritedKnowledge.length}条`);
        console.log(`   总计: ${result.totalCount}条`);
      } catch (error) {
        console.error(`❌ Soul初始化失败: ${error.message}`);
        process.exit(1);
      }
    });

  // stigmergy soul sync - 从全局同步最新智慧
  soulCmd.command('sync')
    .description('从全局灵魂层同步智慧到项目')
    .option('-f, --force', 'Force sync even if already synced')
    .action(async (options) => {
      try {
        const KnowledgeInheritance = require('../../core/soul/knowledge_inheritance');
        const os = require('os');
        
        console.log(`🔄 同步全局智慧到项目...`);
        
        const inheritance = new KnowledgeInheritance({
          globalSoulPath: path.join(os.homedir(), '.stigmergy', 'soul-global'),
          projectSoulPath: process.cwd()
        });
        
        const projectName = path.basename(process.cwd());
        const result = await inheritance.inherit(projectName, 'general');
        
        console.log(`✅ 同步完成！`);
        console.log(`   新增最佳实践: ${result.inheritedPractices.length}条`);
        console.log(`   新增错误教训: ${result.inheritedLessons.length}条`);
      } catch (error) {
        console.error(`❌ 同步失败: ${error.message}`);
        process.exit(1);
      }
    });

  // stigmergy soul promote - 提升项目教训到全局
  soulCmd.command('promote')
    .description('提升项目教训到全局灵魂层')
    .option('-t, --title <title>', 'Lesson title to promote')
    .action(async (options) => {
      try {
        const PromotionManager = require('../../core/soul/promotion_manager');
        const os = require('os');
        
        const promotionManager = new PromotionManager({
          dataPath: path.join(os.homedir(), '.stigmergy', 'soul-global', 'promotion_data.json')
        });
        
        if (options.title) {
          // 提升指定教训
          await promotionManager.confirmPromotion(options.title);
          const promoted = await promotionManager.checkAndPromote(options.title);
          
          if (promoted) {
            console.log(`✅ 已提升 "${options.title}" 到全局灵魂层`);
          } else {
            console.log(`⏳ 等待更多项目使用后提升`);
          }
        } else {
          // 显示待提升列表
          const pending = await promotionManager.getPendingPromotions();
          
          if (pending.length === 0) {
            console.log(`📋 暂无待提升的教训`);
          } else {
            console.log(`📋 待提升的教训 (${pending.length}条):`);
            for (const item of pending) {
              console.log(`   • ${item.title} (${item.projectCount}个项目使用)`);
              console.log(`     首次使用: ${new Date(item.firstUsed).toLocaleDateString()}`);
            }
            console.log(`\n运行: stigmergy soul promote -t "<标题>" 确认提升`);
          }
        }
      } catch (error) {
        console.error(`❌ 提升失败: ${error.message}`);
        process.exit(1);
      }
    });

  // stigmergy soul status - 显示Soul状态（扩展版）
  soulCmd.command('status')
    .description('显示Soul系统状态')
    .action(async () => {
      try {
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        
        const globalSoulPath = path.join(os.homedir(), '.stigmergy', 'soul-global');
        const projectSoulPath = path.join(process.cwd(), '.soul');
        
        console.log(`🧬 Soul系统状态\n`);
        
        // 全局灵魂层状态
        console.log(`📚 全局灵魂层: ${globalSoulPath}`);
        if (fs.existsSync(globalSoulPath)) {
          const wisdomPath = path.join(globalSoulPath, 'CORE_WISDOM.md');
          if (fs.existsSync(wisdomPath)) {
            const content = fs.readFileSync(wisdomPath, 'utf-8');
            const bpCount = (content.match(/^### /gm) || []).length;
            console.log(`   ✅ 核心智慧: ${bpCount}条`);
          } else {
            console.log(`   ⚠️ 核心智慧文件不存在`);
          }
        } else {
          console.log(`   ⚠️ 全局灵魂层未初始化`);
        }
        
        console.log(`\n📁 项目灵魂层: ${projectSoulPath}`);
        if (fs.existsSync(projectSoulPath)) {
          console.log(`   ✅ 项目Soul已初始化`);
        } else {
          console.log(`   ⚠️ 项目Soul未初始化`);
          console.log(`   运行: stigmergy soul init`);
        }
        
        // 自动分类器状态
        console.log(`\n🤖 自动分类器: 已启用`);
        console.log(`   全局阈值: 0.7`);
        console.log(`   审核阈值: 0.5`);
        
        // 提升管理器状态
        const PromotionManager = require('../../core/soul/promotion_manager');
        const promotionManager = new PromotionManager();
        const pending = await promotionManager.getPendingPromotions();
        console.log(`\n📈 待提升教训: ${pending.length}条`);
        for (const item of pending.slice(0, 3)) {
          console.log(`   • ${item.title} (${item.projectCount}个项目)`);
        }
        if (pending.length > 3) {
          console.log(`   ... 还有${pending.length - 3}条`);
        }
      } catch (error) {
        console.error(`❌ 获取状态失败: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerSoulCommands };
