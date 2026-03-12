#!/usr/bin/env node

/**
 * 技能匹配工具 - 自动匹配任务与技能
 * 
 * 使用方式:
 *   node scripts/skill-matcher.js "任务描述"
 * 
 * 输出:
 *   建议加载的技能列表
 */

const path = require('path');
const fs = require('fs');

// 技能定义
const SKILLS = [
  {
    name: 'brainstorming',
    description: '创意发散、想法生成',
    keywords: ['创意', '想法', '设计', '新功能', 'feature', 'idea', 'design', 'brainstorm'],
    patterns: [/如何.*\?/, /怎么.*\?/, /what.*\?/, /how.*\?/, /add.*feature/, /create.*new/],
    priority: 'high',
    type: 'process'
  },
  {
    name: 'test-driven-development',
    description: '测试驱动开发',
    keywords: ['测试', 'bug', '修复', 'test', 'fix', 'bug', 'error', 'issue'],
    patterns: [/测试/, /bug/, /fix/, /error/, /issue/, /write test/, /add test/],
    priority: 'high',
    type: 'process'
  },
  {
    name: 'systematic-debugging',
    description: '系统化调试',
    keywords: ['调试', '错误', '为什么', '不工作', 'debug', 'why', 'not working'],
    patterns: [/调试/, /错误/, /为什么/, /不工作/, /debug/, /why/, /not work/],
    priority: 'high',
    type: 'process'
  },
  {
    name: 'planning-with-files',
    description: '文件式规划',
    keywords: ['计划', '步骤', '怎么开始', '开始', 'plan', 'step', 'how to start'],
    patterns: [/计划/, /步骤/, /怎么开始/, /开始/, /plan/, /roadmap/],
    priority: 'high',
    type: 'process'
  },
  {
    name: 'field-analysis',
    description: '布迪厄场域分析',
    keywords: ['分析', '评估', '场域', '资本', 'field', 'analysis', 'evaluate'],
    patterns: [/分析/, /评估/, /field/, /analysis/, /evaluate/],
    priority: 'medium',
    type: 'domain'
  },
  {
    name: 'network-computation',
    description: '社会网络分析',
    keywords: ['网络', '关系', '连接', 'network', 'relation', 'connection'],
    patterns: [/网络/, /关系/, /network/, /graph/, /node/],
    priority: 'medium',
    type: 'domain'
  },
  {
    name: 'grounded-theory',
    description: '扎根理论分析',
    keywords: ['扎根', '编码', '理论', 'grounded', 'coding', 'theory'],
    patterns: [/扎根/, /编码/, /grounded/, /qualitative/],
    priority: 'medium',
    type: 'domain'
  },
  {
    name: 'frontend-design',
    description: '前端设计',
    keywords: ['前端', 'UI', '界面', 'React', 'frontend', 'UI', 'interface', 'component'],
    patterns: [/前端/, /UI/, /界面/, /React/, /frontend/, /component/],
    priority: 'medium',
    type: 'implementation'
  },
  {
    name: 'using-superpowers',
    description: '技能使用元协议',
    keywords: [],
    patterns: [/^.*$/], // 总是匹配（作为基础）
    priority: 'critical',
    type: 'meta'
  }
];

/**
 * 扫描技能目录
 */
async function scanSkillsDirectory() {
  const skillsDirs = [
    path.join(__dirname, '..', 'skills'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.stigmergy', 'skills'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.qwen', 'skills')
  ];
  
  const foundSkills = [];
  
  for (const dir of skillsDirs) {
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const skillMd = path.join(dir, entry.name, 'SKILL.md');
          if (fs.existsSync(skillMd)) {
            foundSkills.push({
              name: entry.name,
              path: skillMd,
              source: dir
            });
          }
        }
      }
    }
  }
  
  return foundSkills;
}

/**
 * 匹配任务与技能
 */
function matchSkills(task) {
  const matches = [];
  const taskLower = task.toLowerCase();
  
  for (const skill of SKILLS) {
    let score = 0;
    const reasons = [];
    
    // 关键词匹配
    for (const keyword of skill.keywords) {
      if (taskLower.includes(keyword.toLowerCase())) {
        score += 2;
        reasons.push(`关键词匹配："${keyword}"`);
      }
    }
    
    // 正则匹配
    for (const pattern of skill.patterns) {
      if (pattern.test(task)) {
        score += 3;
        reasons.push(`模式匹配：${pattern}`);
      }
    }
    
    // 跳过 meta 技能的自动匹配（它总是被加载）
    if (skill.type === 'meta' && score > 0) {
      score = 0;
    }
    
    if (score > 0) {
      matches.push({
        name: skill.name,
        description: skill.description,
        priority: skill.priority,
        type: skill.type,
        score: score,
        reasons: reasons
      });
    }
  }
  
  // 按优先级和分数排序
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  matches.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.score - a.score;
  });
  
  return matches;
}

/**
 * 格式化输出
 */
function formatOutput(matches, task) {
  if (matches.length === 0) {
    return `
🔍 技能匹配结果

任务："${task}"

⚠️  未检测到特定技能匹配

建议:
1. 仍然加载 using-superpowers (基础协议)
2. 手动浏览技能目录
3. 根据任务类型选择技能
`;
  }
  
  let output = `
🔍 技能匹配结果
═══════════════════════════════════════

任务："${task}"

✅ 建议加载的技能:

`;
  
  matches.forEach((match, index) => {
    const icon = match.priority === 'critical' ? '🔴' : 
                 match.priority === 'high' ? '🟠' : '🟡';
    
    output += `${index + 1}. ${icon} ${match.name} (${match.type})
   描述：${match.description}
   优先级：${match.priority}
   匹配原因:
`;
    
    match.reasons.forEach(reason => {
      output += `     - ${reason}
`;
    });
    
    output += '\n';
  });
  
  output += `═══════════════════════════════════════
💡 使用方式:
   stigmergy call "${matches[0].name} <任务>"
   
   或在 AI 对话中说："使用 ${matches[0].name} 技能"
`;
  
  return output;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 技能匹配工具

使用方式:
  node scripts/skill-matcher.js "<任务描述>"

示例:
  node scripts/skill-matcher.js "如何添加一个新功能？"
  node scripts/skill-matcher.js "这个 bug 怎么修复？"
  node scripts/skill-matcher.js "分析这个系统的架构"
`);
    process.exit(0);
  }
  
  const task = args.join(' ');
  
  // 扫描技能目录
  console.log('📂 扫描技能目录...');
  const foundSkills = await scanSkillsDirectory();
  if (foundSkills.length > 0) {
    console.log(`✓ 发现 ${foundSkills.length} 个技能`);
  }
  
  // 匹配技能
  const matches = matchSkills(task);
  
  // 输出结果
  console.log(formatOutput(matches, task));
}

// 运行
main().catch(console.error);
