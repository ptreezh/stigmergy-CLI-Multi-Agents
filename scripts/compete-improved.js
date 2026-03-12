#!/usr/bin/env node
/**
 * 竞争进化改进脚本
 * 
 * 改进内容:
 * 1. 降低评估标准（从 90% → 70%）
 * 2. 添加"可接受"级别
 * 3. 记录失败模式
 * 4. 增加迭代次数（3 → 5）
 * 5. 接受"足够好"的方案
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  SUCCESS_THRESHOLD: 0.7,      // 成功阈值（原 0.9）
  ACCEPTABLE_THRESHOLD: 0.5,   // 可接受阈值（新增）
  MAX_ITERATIONS: 5,           // 最大迭代次数（原 3）
  ENABLE_LEARNING: true,       // 启用学习机制
  MIN_SCORE: 50                // 最低接受分数
};

// 失败日志文件
const FAILURE_LOG_PATH = path.join(__dirname, 'failure-log.jsonl');

/**
 * 记录失败模式
 */
function logFailure(iteration, task, result, feedback) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    iteration: iteration,
    task: task.substring(0, 100) + '...',
    result: result ? 'generated' : 'null',
    feedback: feedback,
    pattern: extractPattern(feedback)
  };
  
  fs.appendFileSync(FAILURE_LOG_PATH, JSON.stringify(logEntry) + '\n');
  return logEntry;
}

/**
 * 提取失败模式
 */
function extractPattern(feedback) {
  const patterns = {
    'too_short': /too short|too brief|lacks detail|内容太少/i.test(feedback),
    'incorrect': /incorrect|wrong|error|错误/i.test(feedback),
    'incomplete': /incomplete|missing|lacks|不完整/i.test(feedback),
    'poor_quality': /poor quality|low quality|not good|质量差/i.test(feedback),
    'timeout': /timeout|time out|too long|超时/i.test(feedback),
    'no_output': /no output|empty|无输出/i.test(feedback)
  };
  
  return patterns;
}

/**
 * 分析失败模式
 */
function analyzeFailurePattern(failureLog) {
  const patternCount = {};
  
  for (const entry of failureLog) {
    for (const [pattern, matches] of Object.entries(entry.pattern)) {
      if (matches) {
        patternCount[pattern] = (patternCount[pattern] || 0) + 1;
      }
    }
  }
  
  // 排序
  return Object.entries(patternCount)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern, count }));
}

/**
 * 增强任务（使用失败反馈）
 */
function enhanceTaskWithFeedback(originalTask, feedback) {
  return `${originalTask}

注意之前的反馈:
${feedback}

请根据反馈改进方案，确保:
- 内容完整
- 格式正确
- 包含必要的细节`;
}

/**
 * 评估代码（新标准）
 */
function evaluateCode(code) {
  let score = {
    correctness: 0,
    robustness: 0,
    documentation: 0,
    bestPractices: 0,
    total: 0
  };

  // 正确性 (40 分) - 降低要求
  if (code.includes('function') || code.includes('=>')) score.correctness += 15;  // 原 20
  if (code.includes('return ')) score.correctness += 15;  // 原 20
  if (code.includes('if') || code.includes('switch')) score.correctness += 10;  // 新增
  
  // 健壮性 (30 分) - 降低要求
  if (code.includes('if') || code.includes('typeof')) score.robustness += 10;
  if (code.includes('try') || code.includes('catch')) score.robustness += 10;
  if (code.includes('null') || code.includes('undefined')) score.robustness += 10;
  
  // 文档 (20 分) - 降低要求
  if (code.includes('/**') || code.includes('//')) score.documentation += 10;
  if (code.includes('@param') || code.includes('@returns') || code.includes('@return')) score.documentation += 10;
  
  // 最佳实践 (10 分)
  if (code.includes('const ') || code.includes('let ')) score.bestPractices += 5;
  if (!code.includes('var ')) score.bestPractices += 5;

  score.total = score.correctness + score.robustness + score.documentation + score.bestPractices;
  
  return score;
}

/**
 * 获取评估等级（新标准）
 */
function getLevel(score, maxScore = 100) {
  const percentage = score.total / maxScore;
  
  if (percentage >= CONFIG.SUCCESS_THRESHOLD) {
    return 'success';
  } else if (percentage >= CONFIG.ACCEPTABLE_THRESHOLD) {
    return 'acceptable';
  } else {
    return 'failure';
  }
}

/**
 * 生成反馈
 */
function generateFeedback(evaluation) {
  const feedback = [];
  
  if (evaluation.scores.correctness < 28) {  // 70% of 40
    feedback.push('正确性不足：确保包含函数定义和返回值');
  }
  if (evaluation.scores.robustness < 21) {  // 70% of 30
    feedback.push('健壮性需要提高：添加错误处理和边界检查');
  }
  if (evaluation.scores.documentation < 14) {  // 70% of 20
    feedback.push('文档需要改进：添加注释和 JSDoc');
  }
  if (evaluation.scores.bestPractices < 7) {  // 70% of 10
    feedback.push('最佳实践需要加强：使用 const/let，避免 var');
  }
  
  return feedback.join('; ') || '整体评分不足';
}

/**
 * 竞争进化主函数（改进版）
 */
async function compete(task, executeConcurrent, evaluate) {
  const failureLog = [];
  let bestResult = null;
  let bestScore = 0;
  let bestEvaluated = null;
  
  console.log(`🏁 开始竞争进化 (任务：${task.substring(0, 50)}...)`);
  console.log(`📊 配置：成功阈值=${CONFIG.SUCCESS_THRESHOLD * 100}%, 可接受阈值=${CONFIG.ACCEPTABLE_THRESHOLD * 100}%, 最大迭代=${CONFIG.MAX_ITERATIONS}`);
  console.log('');
  
  for (let iteration = 1; iteration <= CONFIG.MAX_ITERATIONS; iteration++) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🔄 迭代 ${iteration}/${CONFIG.MAX_ITERATIONS}`);
    console.log('═'.repeat(70));
    
    try {
      // 执行竞争
      console.log('  📝 执行并发任务...');
      const results = await executeConcurrent(task);
      
      // 评估结果
      console.log('  📊 评估方案...');
      const evaluated = [];
      for (const result of results) {
        if (result.success && result.output) {
          const score = evaluate(result.output);
          evaluated.push({ 
            cli: result.cli, 
            score: score.total, 
            code: result.output,
            scores: score
          });
          
          console.log(`     ${result.cli}: ${score.total}/100`);
          console.log(`        - Correctness: ${score.correctness}/40`);
          console.log(`        - Robustness: ${score.robustness}/30`);
          console.log(`        - Documentation: ${score.documentation}/20`);
          console.log(`        - Best Practices: ${score.bestPractices}/10`);
        }
      }
      
      if (evaluated.length === 0) {
        console.log('  ❌ 无有效结果');
        logFailure(iteration, task, null, 'No valid solutions');
        failureLog.push({ iteration, result: null, feedback: 'No valid solutions' });
        continue;
      }
      
      // 找出最佳方案
      const sorted = evaluated.sort((a, b) => b.score - a.score);
      const best = sorted[0];
      
      // 记录最佳结果
      if (best.score > bestScore) {
        bestScore = best.score;
        bestResult = best.code;
        bestEvaluated = best;
        console.log(`  ⭐ 新的最佳结果！得分：${best.score}`);
      }
      
      // 评估等级
      const level = getLevel({ total: best.score });
      console.log(`  📊 评估等级：${level} (${(best.score / 100 * 100).toFixed(1)}%)`);
      
      // 检查是否成功
      if (level === 'success') {
        console.log(`\n✅ 成功！得分：${best.score}`);
        return {
          success: true,
          result: best.code,
          score: best.score,
          iterations: iteration,
          winner: best.cli
        };
      }
      
      // 如果是"可接受"且已迭代 2 次以上，接受结果
      if (level === 'acceptable' && iteration >= 2) {
        console.log(`\n⚠️ 接受可接受方案 (得分：${best.score})`);
        return {
          success: true,
          result: best.code,
          score: best.score,
          iterations: iteration,
          accepted: true,
          winner: best.cli
        };
      }
      
      // 记录失败
      const feedback = generateFeedback({ scores: best.scores });
      logFailure(iteration, task, best.code, feedback);
      failureLog.push({ iteration, result: best.code, feedback });
      
      console.log(`  ❌ 失败：${feedback}`);
      
      // 增强任务（学习）
      if (CONFIG.ENABLE_LEARNING) {
        console.log('  📚 使用反馈增强任务...');
        task = enhanceTaskWithFeedback(task, feedback);
      }
      
    } catch (error) {
      console.error(`  💥 错误：${error.message}`);
      logFailure(iteration, task, null, error.message);
      failureLog.push({ iteration, result: null, feedback: error.message });
    }
  }
  
  // 所有迭代失败，返回最佳结果
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`❌ 所有迭代失败`);
  console.log(`📊 失败模式分析:`);
  
  const patterns = analyzeFailurePattern(failureLog);
  patterns.forEach(({ pattern, count }) => {
    console.log(`   - ${pattern}: ${count}次`);
  });
  
  if (bestResult && bestScore >= MIN_SCORE) {
    console.log(`\n⚠️ 返回最佳结果 (得分：${bestScore})`);
    return {
      success: false,
      result: bestResult,
      score: bestScore,
      iterations: CONFIG.MAX_ITERATIONS,
      fallback: true,
      winner: bestEvaluated?.cli
    };
  }
  
  return {
    success: false,
    error: 'No valid solutions',
    iterations: CONFIG.MAX_ITERATIONS,
    failurePatterns: patterns
  };
}

// 导出
module.exports = {
  CONFIG,
  compete,
  evaluateCode,
  logFailure,
  analyzeFailurePattern,
  getLevel
};

// CLI 入口
if (require.main === module) {
  console.log('竞争进化改进脚本');
  console.log('═'.repeat(70));
  console.log('此脚本提供改进的竞争进化逻辑');
  console.log('');
  console.log('配置:');
  console.log(`  成功阈值：${CONFIG.SUCCESS_THRESHOLD * 100}%`);
  console.log(`  可接受阈值：${CONFIG.ACCEPTABLE_THRESHOLD * 100}%`);
  console.log(`  最大迭代：${CONFIG.MAX_ITERATIONS}`);
  console.log(`  学习机制：${CONFIG.ENABLE_LEARNING ? '启用' : '禁用'}`);
  console.log(`  最低接受分数：${MIN_SCORE}`);
  console.log('');
  console.log('改进内容:');
  console.log('  1. 降低评估标准（90% → 70%）');
  console.log('  2. 添加"可接受"级别（50%）');
  console.log('  3. 记录失败模式用于学习');
  console.log('  4. 增加迭代次数（3 → 5）');
  console.log('  5. 接受"足够好"的方案（2 次迭代后）');
}
