/**
 * Stigmergy 跨CLI进化孵化器 - 类型定义 (JavaScript版本)
 */

/**
 * 用户输入类型
 * @enum {string}
 */
const InputType = {
  SOURCE_CODE: 'source_code',    // 项目源码
  WEBSITE: 'website',            // 网站系统
  DESKTOP_SOFTWARE: 'desktop',   // 桌面软件
  NONE: 'none'                   // 从零开始
};

/**
 * CLI工具类型
 * @enum {string}
 */
const CLITool = {
  OPENCLI: 'opencli',            // 分析网站生成CLI
  CLI_ANYTHING: 'cli-anything'   // 分析源码生成CLI
};

/**
 * 孵化阶段
 * @enum {string}
 */
const IncubationPhase = {
  INIT: 'init',                  // 初始化
  CLI_GENERATION: 'cli_generation',  // CLI生成
  BASE_SKILL_CREATION: 'base_skill_creation',  // 基础技能创建
  SKILL_ORCHESTRATION: 'skill_orchestration',  // 技能编排
  REGISTRATION: 'registration',  // 注册
  COMPLETE: 'complete'           // 完成
};

module.exports = {
  InputType,
  CLITool,
  IncubationPhase
};
