#!/usr/bin/env node

/**
 * ShareMem Demo - 演示 sharemem 功能
 * 展示如何在项目中初始化和使用跨CLI会话恢复
 */

const chalk = require('chalk');
const path = require('path');

console.log(chalk.blue.bold('🚀 ShareMem Demo - Cross-CLI Session Recovery\n'));

console.log(chalk.yellow('ShareMem 允许在任何项目目录下初始化跨CLI会话恢复功能。\n'));

console.log(chalk.bold('📋 功能特�?'));
console.log('�?自动扫描本地可用的CLI工具');
console.log('�?交互式选择要集成的CLI工具');
console.log('�?自动生成集成代码');
console.log('�?项目感知的会话历�?);
console.log('�?按时间排序（最新优先）');
console.log('�?跨CLI内容搜索');
console.log('�?上下文恢复功能\n');

console.log(chalk.bold('🔧 使用流程:'));
console.log('1. 在任何项目目录下运行: ' + chalk.cyan('sharemem init'));
console.log('2. 选择要集成的CLI工具（如Claude、Gemini、Qwen等）');
console.log('3. ShareMem自动生成集成代码');
console.log('4. 在集成的CLI工具中使�?/history 命令\n');

console.log(chalk.bold('💡 支持的CLI工具:'));
const clis = [
  { name: 'Claude CLI', icon: '🟢', level: 'Native' },
  { name: 'Gemini CLI', icon: '🔵', level: 'Native' },
  { name: 'Qwen CLI', icon: '🟡', level: 'Native' },
  { name: 'IFlow CLI', icon: '🔴', level: 'Hook-based' },
  { name: 'CodeBuddy CLI', icon: '🟣', level: 'External' },
  { name: 'QoderCLI', icon: '🟠', level: 'External' },
  { name: 'Codex CLI', icon: '🟪', level: 'External' }
];

clis.forEach(cli => {
  console.log(`   ${cli.icon} ${cli.name} - ${cli.level}`);
});

console.log('\n' + chalk.bold('📝 /history 命令示例:'));
console.log(chalk.cyan('   /history') + chalk.gray('                      # 显示所有项目会话（最新优先）'));
console.log(chalk.cyan('   /history --cli claude') + chalk.gray('         # 显示Claude会话'));
console.log(chalk.cyan('   /history --search "react"') + chalk.gray('     # 搜索react相关会话'));
console.log(chalk.cyan('   /history --today') + chalk.gray('              # 显示今天的会�?));
console.log(chalk.cyan('   /history --format timeline') + chalk.gray('    # 时间线视�?));
console.log(chalk.cyan('   /history --context') + chalk.gray('            # 获取上下文恢�?));

console.log('\n' + chalk.bold('🎯 实际应用场景:'));
console.log('�?前一天在Claude中讨论React组件架构');
console.log('�?第二天在Gemini中想继续昨天的工�?);
console.log('�?在项目中运行 /history --format context');
console.log('�?自动获取昨天的讨论内容，可以无缝继续开发\n');

console.log(chalk.bold('🔍 初始化演�?'));

// 模拟sharemem init过程
console.log(chalk.blue('$ sharemem init'));
console.log(chalk.green('🔍 Scanning for available CLI tools...'));
console.log(chalk.green('�?Found 3 supported CLI tools:'));
console.log('   1. Claude CLI �?);
console.log('      Version: 1.2.0');
console.log('      Integration: Native support');
console.log('      Sessions: /Users/user/.claude/sessions');
console.log('');
console.log('   2. Gemini CLI �?);
console.log('      Version: 0.9.5');
console.log('      Integration: Native support');
console.log('      Sessions: /Users/user/.gemini/sessions');
console.log('');
console.log('   3. IFlow CLI �?);
console.log('      Version: 2.1.3');
console.log('      Integration: Hook-based');
console.log('      Sessions: /Users/user/.iflow/stigmergy/sessions');

console.log(chalk.cyan('\n? Select CLI tools to integrate with ShareMem: (Press <space> to select)'));
console.log(chalk.green('❯◉ Claude CLI (1.2.0)'));
console.log(' �?Gemini CLI (0.9.5)'));
console.log(' �?IFlow CLI (2.1.3)');

console.log(chalk.blue('\n🔧 Validating selected CLI tools...'));
console.log(chalk.green('   �?claude is ready for cross-CLI integration'));
console.log(chalk.green('   �?iflow is ready for cross-CLI integration'));

console.log(chalk.blue('\n💾 Saving configuration...'));
console.log(chalk.blue('🔨 Generating integration code...'));
console.log(chalk.green('   �?Generated integration for claude'));
console.log(chalk.green('   �?Generated integration for iflow'));

console.log(chalk.green.bold('\n🎉 ShareMem initialization completed successfully!\n'));

console.log(chalk.bold('📁 生成的文件结�?'));
console.log('project-folder/');
console.log('├── .sharemem                    # 配置文件');
console.log('├── .claude/');
console.log('�?  └── hooks/');
console.log('�?      └── sharemem-history.js # Claude CLI集成代码');
console.log('├── stigmergy/');
console.log('�?  └── commands/');
console.log('�?      └── history.js          # IFlow CLI集成代码');
console.log('└── SHAREMEM.md                 # 使用说明');

console.log('\n' + chalk.bold('🎮 使用示例:'));
console.log(chalk.gray('打开Claude CLI在项目目录中:'));
console.log(chalk.cyan('User: /history'));
console.log(chalk.gray('AI Response:'));
console.log(chalk.white('📁 **项目历史会话**'));
console.log(chalk.white('📊 共找�?5 个会�?));
console.log('');
console.log(chalk.white('📅 **今天**'));
console.log(chalk.white('🟢 **CLAUDE** (3个会�?'));
console.log(chalk.white('   1. React component architecture discussion...'));
console.log(chalk.white('      📅 14:30 �?💬 15条消�?));
console.log(chalk.white('      🔑 claude-session-123'));
console.log('');
console.log(chalk.white('🔴 **IFLOW** (2个会�?'));
console.log(chalk.white('   1. Database migration strategy...'));
console.log(chalk.white('      📅 10:15 �?💬 8条消�?));
console.log(chalk.white('      🔑 iflow-session-456'));

console.log('\n' + chalk.bold('�?核心优势:'));
console.log('�?🔄 跨CLI无缝切换，不丢失上下�?);
console.log('�?📁 项目感知，只显示当前项目的会�?);
console.log('�?�?时间排序，最新会话优先显�?);
console.log('�?🔍 全文搜索，快速定位相关内�?);
console.log('�?🎯 上下文恢复，无缝继续工作');

console.log('\n' + chalk.green.bold('现在你可以在任何项目中使�?resumesession 来管理跨CLI会话了！'));
console.log(chalk.gray('运行 npm install -g resumesession 安装工具'));
