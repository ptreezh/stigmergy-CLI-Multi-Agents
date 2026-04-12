/**
 * Stigmergy 跨CLI进化孵化器 - 类型定义
 */

/**
 * 用户输入类型
 */
export enum InputType {
  SOURCE_CODE = 'source_code',    // 项目源码
  WEBSITE = 'website',            // 网站系统
  DESKTOP_SOFTWARE = 'desktop',   // 桌面软件
  NONE = 'none'                   // 从零开始
}

/**
 * CLI工具类型
 */
export enum CLITool {
  OPENCLI = 'opencli',            // 分析网站生成CLI
  CLI_ANYTHING = 'cli-anything'   // 分析源码生成CLI
}

/**
 * 孵化阶段
 */
export enum IncubationPhase {
  INIT = 'init',                  // 初始化
  CLI_GENERATION = 'cli_generation',  // CLI生成
  BASE_SKILL_CREATION = 'base_skill_creation',  // 基础技能创建
  SKILL_ORCHESTRATION = 'skill_orchestration',  // 技能编排
  REGISTRATION = 'registration',  // 注册
  COMPLETE = 'complete'           // 完成
}

/**
 * 孵化进度
 */
export interface IncubationProgress {
  phase: IncubationPhase;
  percentage: number;             // 0-100
  estimatedRemainingHours: number;
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
}

/**
 * 孵化请求
 */
export interface IncubationRequest {
  idea: string;                   // 用户想法
  inputType: InputType;           // 输入类型
  inputSource?: string;           // GitHub URL / 网站URL / 本地路径
  industry?: string;              // 行业领域
  skillType?: 'teaching' | 'business';  // 技能类型
}

/**
 * CLI溯源信息
 */
export interface CLIProvenance {
  cliName: string;
  sourceType: 'website' | 'source_code';
  sourceUrl: string;
  generatedAt: string;            // ISO 8601
  generatedBy: CLITool;
  capabilities: string[];         // CLI命令清单
  testPassed: boolean;
}

/**
 * 技能依赖声明
 */
export interface SkillDependencies {
  cliPlatform: {
    required: string[];
    recommended: string[];
    optional: string[];
  };
  corePackage: {
    imGateway: boolean;
    smartRouter: boolean;
    skillRegistry: boolean;
    soulSystem: boolean;
  };
  baseSkills: string[];           // 编排的基础技能
}

/**
 * 技能清单
 */
export interface SkillManifest {
  skill: {
    name: string;
    version: string;
    type: 'vertical-professional' | 'base-operation';
    industry: string;
    description: string;
    incubatedBy: string;
    incubationDate: string;
  };
  dependencies: SkillDependencies;
  capabilities: {
    triggers: string[];
    operations: string[];
    courses?: string[];
  };
  userValue: {
    focusOn: string[];            // 用户专注的专业思维
    liberatedFrom: string[];      // 用户从什么软件操作中解放
  };
}

/**
 * 孵化结果
 */
export interface IncubationResult {
  success: boolean;
  skillName?: string;
  skillPath?: string;
  cliProvenance?: CLIProvenance[];
  baseSkills?: string[];
  message: string;
  error?: string;
}

/**
 * 技能注册请求
 */
export interface SkillRegistrationRequest {
  manifest: SkillManifest;
  cliProvenance: CLIProvenance[];
  orchestrationGraph?: string;    // 编排关系图(JSON)
}

/**
 * 技能注册响应
 */
export interface SkillRegistrationResponse {
  success: boolean;
  skillId: string;
  message: string;
  error?: string;
}

/**
 * IM追问模板
 */
export interface IMFollowUpTemplate {
  question: string;
  options: {
    label: string;
    value: InputType;
    description?: string;
  }[];
  helpText?: string;
}
