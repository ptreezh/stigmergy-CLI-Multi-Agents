import { HistoryQuery } from '../src/core/HistoryQuery';
import { SessionScanner } from '../src/core/SessionScanner';
import { CLIScanner } from '../src/utils/CLIScanner';
import { CodeGenerator } from '../src/utils/CodeGenerator';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('User Workflow Real Environment Tests', () => {
  let historyQuery: HistoryQuery;
  let sessionScanner: SessionScanner;
  let cliScanner: CLIScanner;
  let codeGenerator: CodeGenerator;
  
  const testProjectDir = join(homedir(), '.resumesession-user-workflow-test');
  const testSessionsDir = join(testProjectDir, 'sessions');
  const userHomeDir = join(homedir(), '.resumesession-user-home');

  beforeAll(async () => {
    // 初始化组件
    historyQuery = new HistoryQuery();
    sessionScanner = new SessionScanner();
    cliScanner = CLIScanner.getInstance();
    codeGenerator = new CodeGenerator();

    // 创建测试环境
    setupTestEnvironment();
    createUserSessionFiles();
  });

  afterAll(async () => {
    // 清理测试环境
    cleanupTestEnvironment();
  });

  function setupTestEnvironment() {
    // 创建项目目录
    if (!existsSync(testProjectDir)) {
      mkdirSync(testProjectDir, { recursive: true });
    }
    if (!existsSync(testSessionsDir)) {
      mkdirSync(testSessionsDir, { recursive: true });
    }

    // 创建用户主目录模拟
    if (!existsSync(userHomeDir)) {
      mkdirSync(userHomeDir, { recursive: true });
    }

    // 创建CLI配置目录
    const cliDirs = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
    cliDirs.forEach(cli => {
      const cliDir = join(userHomeDir, cli);
      if (!existsSync(cliDir)) {
        mkdirSync(cliDir, { recursive: true });
      }

      // 创建sessions目录
      const sessionsDir = cli === 'iflow' 
        ? join(cliDir, 'stigmergy', 'sessions')
        : cli === 'codebuddy'
        ? join(cliDir, 'conversations')
        : cli === 'qodercli'
        ? join(cliDir, 'chats')
        : join(cliDir, 'sessions');

      if (!existsSync(sessionsDir)) {
        mkdirSync(sessionsDir, { recursive: true });
      }
    });
  }

  function createUserSessionFiles() {
    // 模拟真实用户在不同CLI工具中的会话
    const userSessions = [
      {
        cli: 'claude',
        sessions: [
          {
            filename: 'react-project-setup.json',
            data: {
              id: 'claude-react-001',
              title: 'React Project Setup and Configuration',
              content: 'Set up a new React project with TypeScript, ESLint, and Prettier. Configured webpack for development and production builds.',
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1小时前
              messages: [
                { role: 'user', content: 'Help me set up a React project with TypeScript' },
                { role: 'assistant', content: 'I\'ll help you create a React project with TypeScript configuration' },
                { role: 'user', content: 'Add ESLint and Prettier too' },
                { role: 'assistant', content: 'I\'ll configure ESLint and Prettier for your project' }
              ],
              projectPath: testProjectDir
            }
          },
          {
            filename: 'api-integration.json',
            data: {
              id: 'claude-api-002',
              title: 'REST API Integration with Axios',
              content: 'Implemented REST API integration using Axios, including error handling and interceptors for authentication.',
              timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
              messages: [
                { role: 'user', content: 'How to integrate REST API in React?' },
                { role: 'assistant', content: 'I\'ll show you how to integrate REST API using Axios' }
              ],
              projectPath: testProjectDir
            }
          }
        ]
      },
      {
        cli: 'gemini',
        sessions: [
          {
            filename: 'database-design.json',
            data: {
              id: 'gemini-db-001',
              title: 'Database Schema Design for E-commerce',
              content: 'Designed a comprehensive database schema for an e-commerce platform, including users, products, orders, and payment tables.',
              timestamp: new Date(Date.now() - 7200000).toISOString(), // 2小时前
              messages: [
                { role: 'user', content: 'Design a database schema for e-commerce' },
                { role: 'assistant', content: 'I\'ll design a complete database schema for your e-commerce platform' }
              ],
              projectPath: testProjectDir
            }
          }
        ]
      },
      {
        cli: 'iflow',
        sessions: [
          {
            filename: 'deployment-workflow.json',
            data: {
              sessionId: 'iflow-deploy-001',
              topic: 'CI/CD Pipeline Setup',
              content: 'Set up a complete CI/CD pipeline using GitHub Actions, including automated testing, building, and deployment to production.',
              updatedAt: new Date(Date.now() - 10800000).toISOString(), // 3小时前
              messageCount: 8,
              workingDirectory: testProjectDir
            }
          }
        ]
      },
      {
        cli: 'codebuddy',
        sessions: [
          {
            filename: 'css-styling.json',
            data: {
              id: 'codebuddy-css-001',
              title: 'Responsive CSS Grid Layout',
              content: 'Created a responsive CSS Grid layout for the main application interface, with mobile-first design approach.',
              timestamp: new Date(Date.now() - 14400000).toISOString(), // 4小时前
              messages: [
                { role: 'user', content: 'Help me create a responsive grid layout' },
                { role: 'assistant', content: 'I\'ll help you create a responsive CSS Grid layout' }
              ],
              projectPath: testProjectDir
            }
          }
        ]
      }
    ];

    // 写入用户会话文件到对应的CLI目录
    userSessions.forEach(cliSession => {
      cliSession.sessions.forEach(session => {
        const sessionsDir = cliSession.cli === 'iflow'
          ? join(userHomeDir, cliSession.cli, 'stigmergy', 'sessions')
          : cliSession.cli === 'codebuddy'
          ? join(userHomeDir, cliSession.cli, 'conversations')
          : cliSession.cli === 'qodercli'
          ? join(userHomeDir, cliSession.cli, 'chats')
          : join(userHomeDir, cliSession.cli, 'sessions');

        const sessionPath = join(sessionsDir, session.filename);
        writeFileSync(sessionPath, JSON.stringify(session.data, null, 2));
      });
    });
  }

  function cleanupTestEnvironment() {
    // 清理用户会话文件
    const cliDirs = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
    cliDirs.forEach(cli => {
      const sessionsDir = cli === 'iflow'
        ? join(userHomeDir, cli, 'stigmergy', 'sessions')
        : cli === 'codebuddy'
        ? join(userHomeDir, cli, 'conversations')
        : cli === 'qodercli'
        ? join(userHomeDir, cli, 'chats')
        : join(userHomeDir, cli, 'sessions');

      try {
        if (existsSync(sessionsDir)) {
          const files = require('fs').readdirSync(sessionsDir);
          files.forEach(file => {
            const filePath = join(sessionsDir, file);
            if (existsSync(filePath)) {
              unlinkSync(filePath);
            }
          });
          rmdirSync(sessionsDir);
        }
        
        const cliDir = join(userHomeDir, cli);
        if (existsSync(cliDir)) {
          rmdirSync(cliDir);
        }
      } catch (error) {
        // 忽略清理错误
      }
    });

    // 清理用户主目录
    try {
      if (existsSync(userHomeDir)) {
        rmdirSync(userHomeDir);
      }
    } catch (error) {
      // 忽略清理错误
    }

    // 清理项目目录
    try {
      if (existsSync(testSessionsDir)) {
        rmdirSync(testSessionsDir);
      }
      if (existsSync(testProjectDir)) {
        rmdirSync(testProjectDir);
      }
    } catch (error) {
      // 忽略清理错误
    }
  }

  describe('Real User Scenarios', () => {
    it('should support developer daily workflow - morning research', async () => {
      // 场景：开发者早上开始工作，想查看昨天的研究内容
      const morningResearch = await historyQuery.queryHistory({
        timeRange: 'today',
        format: 'timeline',
        limit: 10
      }, testProjectDir);

      expect(morningResearch.response).toContain('时间线视图');
      expect(morningResearch.response).toContain('React Project Setup');
      expect(morningResearch.response).toContain('Database Schema Design');
      expect(morningResearch.suggestions.length).toBeGreaterThan(0);

      // 验证建议的相关性
      const suggestions = morningResearch.suggestions;
      expect(suggestions.some(s => s.includes('context'))).toBe(true);
      expect(suggestions.some(s => s.includes('timeline'))).toBe(true);
    });

    it('should support developer searching for specific technology', async () => {
      // 场景：开发者想查找所有关于React的讨论
      const reactSearch = await historyQuery.queryHistory({
        search: 'React',
        format: 'detailed',
        limit: 5
      }, testProjectDir);

      expect(reactSearch.response).toContain('详细视图');
      expect(reactSearch.response).toContain('React Project Setup');
      expect(reactSearch.response).toContain('TypeScript');

      // 验证搜索结果的相关性
      expect(reactSearch.response).toContain('ESLint');
      expect(reactSearch.response).toContain('Prettier');
    });

    it('should support developer focusing on specific CLI tool', async () => {
      // 场景：开发者想查看只使用Claude CLI的会话
      const claudeOnly = await historyQuery.queryHistory({
        cli: 'claude',
        format: 'summary',
        limit: 10
      }, testProjectDir);

      expect(claudeOnly.response).toContain('项目历史会话');
      expect(claudeOnly.response).toContain('CLAUDE');
      expect(claudeOnly.response).toContain('2个'); // Claude有2个会话

      // 验证只包含Claude的会话
      expect(claudeOnly.response).toContain('React Project Setup');
      expect(claudeOnly.response).toContain('API Integration');
      expect(claudeOnly.response).not.toContain('Database Schema');
    });

    it('should support developer getting context for continuation', async () => {
      // 场景：开发者想要恢复最近的会话上下文
      const recentContext = await historyQuery.queryHistory({
        format: 'context',
        limit: 1
      }, testProjectDir);

      expect(recentContext.response).toContain('上下文恢复');
      expect(recentContext.response).toContain('会话时间');
      expect(recentContext.response).toContain('来源CLI');
      expect(recentContext.response).toContain('React Project Setup');

      // 验证上下文信息的完整性
      expect(recentContext.response).toContain('消息数');
      expect(recentContext.response).toContain('会话ID');
      expect(recentContext.response).toContain('上次讨论内容');
    });

    it('should support developer weekly review', async () => {
      // 场景：开发者进行周度工作回顾
      const weeklyReview = await historyQuery.queryHistory({
        timeRange: 'week',
        format: 'summary',
        limit: 20
      }, testProjectDir);

      expect(weeklyReview.response).toContain('项目历史会话');
      expect(weeklyReview.response).toContain('共找到');
      
      // 验证包含多种CLI工具的工作
      expect(weeklyReview.response).toContain('CLAUDE');
      expect(weeklyReview.response).toContain('GEMINI');
      expect(weeklyReview.response).toContain('IFLOW');
      expect(weeklyReview.response).toContain('CODEBUDDY');

      // 验证包含不同类型的工作
      expect(weeklyReview.response).toContain('React');
      expect(weeklyReview.response).toContain('Database');
      expect(weeklyReview.response).toContain('CI/CD');
      expect(weeklyReview.response).toContain('CSS');
    });
  });

  describe('CLI Integration Workflow', () => {
    it('should support integration code generation for user environment', async () => {
      // 场景：用户想要为所有可用的CLI工具生成集成代码
      const availableCLIs = await cliScanner.scanAllCLIs();
      const supportedCLIs = availableCLIs.filter(cli => cli.available);

      expect(supportedCLIs.length).toBeGreaterThan(0);

      // 为每个可用的CLI生成集成代码
      for (const cli of supportedCLIs) {
        await codeGenerator.generateIntegration(cli.name, testProjectDir, {
          version: '1.0.0',
          author: 'User Integration Test',
          description: `Integration for ${cli.displayName}`
        });

        // 验证集成代码文件存在
        const integrationPath = getIntegrationPath(cli.name, testProjectDir);
        expect(existsSync(integrationPath)).toBe(true);

        // 验证代码内容包含用户相关信息
        const content = require('fs').readFileSync(integrationPath, 'utf8');
        expect(content).toContain(cli.name);
        expect(content).toContain(testProjectDir);
      }
    });

    it('should support cross-CLI session discovery', async () => {
      // 场景：用户想要发现所有CLI工具中的相关会话
      const allSessions = sessionScanner.scanAllCLISessions(testProjectDir);
      
      expect(allSessions.length).toBeGreaterThan(0);

      // 验证会话包含所有CLI类型
      const cliTypes = [...new Set(allSessions.map(s => s.cliType))];
      expect(cliTypes.length).toBeGreaterThan(1);

      // 验证会话数据的完整性
      allSessions.forEach(session => {
        expect(session.cliType).toBeTruthy();
        expect(session.sessionId).toBeTruthy();
        expect(session.title).toBeTruthy();
        expect(session.content).toBeTruthy();
        expect(session.updatedAt).toBeInstanceOf(Date);
        expect(session.projectPath).toBe(testProjectDir);
      });
    });
  });

  function getIntegrationPath(cliType: string, projectPath: string): string {
    const paths = {
      claude: join(projectPath, '.claude', 'hooks', 'resumesession-history.js'),
      gemini: join(projectPath, '.gemini', 'extensions', 'resumesession-history.js'),
      qwen: join(projectPath, '.qwen', 'plugins', 'resumesession-history.js'),
      iflow: join(projectPath, 'stigmergy', 'commands', 'history.js'),
      codebuddy: join(projectPath, '.codebuddy', 'integrations', 'resumesession.js'),
      qodercli: join(projectPath, '.qodercli', 'extensions', 'history.js'),
      codex: join(projectPath, '.codex', 'plugins', 'resumesession-history.js')
    };

    return paths[cliType as keyof typeof paths] || join(projectPath, '.resumesession', `${cliType}-integration.js`);
  }

  describe('Advanced User Workflows', () => {
    it('should support project switching workflow', async () => {
      // 场景：用户在多个项目间切换工作
      const project1Dir = join(testProjectDir, 'project1');
      const project2Dir = join(testProjectDir, 'project2');

      // 创建多个项目目录
      if (!existsSync(project1Dir)) mkdirSync(project1Dir, { recursive: true });
      if (!existsSync(project2Dir)) mkdirSync(project2Dir, { recursive: true });

      // 为项目1创建会话
      const project1Session = {
        id: 'project1-session',
        title: 'Project1 Feature Development',
        content: 'Working on feature for project1',
        timestamp: new Date().toISOString(),
        messages: [{ role: 'user', content: 'Project1 task' }],
        projectPath: project1Dir
      };

      // 为项目2创建会话
      const project2Session = {
        id: 'project2-session',
        title: 'Project2 Bug Fix',
        content: 'Fixing bug in project2',
        timestamp: new Date().toISOString(),
        messages: [{ role: 'user', content: 'Project2 bug' }],
        projectPath: project2Dir
      };

      // 写入会话文件
      const project1SessionPath = join(testSessionsDir, 'project1-session.json');
      const project2SessionPath = join(testSessionsDir, 'project2-session.json');
      writeFileSync(project1SessionPath, JSON.stringify(project1Session, null, 2));
      writeFileSync(project2SessionPath, JSON.stringify(project2Session, null, 2));

      // 查询项目1的会话
      const project1History = await historyQuery.queryHistory({
        format: 'summary'
      }, project1Dir);

      expect(project1History.response).toContain('Project1 Feature Development');
      expect(project1History.response).not.toContain('Project2 Bug Fix');

      // 查询项目2的会话
      const project2History = await historyQuery.queryHistory({
        format: 'summary'
      }, project2Dir);

      expect(project2History.response).toContain('Project2 Bug Fix');
      expect(project2History.response).not.toContain('Project1 Feature Development');

      // 清理项目文件
      unlinkSync(project1SessionPath);
      unlinkSync(project2SessionPath);
      rmdirSync(project1Dir);
      rmdirSync(project2Dir);
    });

    it('should support collaborative workflow analysis', async () => {
      // 场景：团队成员想要了解项目的技术栈和开发历史
      const techStackQuery = await historyQuery.queryHistory({
        search: 'TypeScript',
        format: 'detailed',
        limit: 10
      }, testProjectDir);

      expect(techStackQuery.response).toContain('详细视图');
      expect(techStackQuery.response).toContain('TypeScript');

      // 验证技术栈分析结果
      if (techStackQuery.response.includes('TypeScript')) {
        expect(techStackQuery.response).toContain('React');
        expect(techStackQuery.response).toContain('ESLint');
      }
    });

    it('should support learning and knowledge tracking', async () => {
      // 场景：用户想要跟踪学习进度和知识积累
      const learningTopics = ['database', 'deployment', 'css'];
      const learningResults = [];

      for (const topic of learningTopics) {
        const result = await historyQuery.queryHistory({
          search: topic,
          format: 'summary',
          limit: 5
        }, testProjectDir);
        
        learningResults.push({
          topic,
          hasResults: result.response.includes('共找到') && 
                     !result.response.includes('暂无历史会话')
        });
      }

      // 验证学习跟踪结果
      expect(learningResults.some(r => r.hasResults)).toBe(true);

      // 验证数据库学习记录
      const dbResult = learningResults.find(r => r.topic === 'database');
      if (dbResult?.hasResults) {
        expect(dbResult.hasResults).toBe(true);
      }
    });
  });

  describe('Performance and Usability', () => {
    it('should handle large user history efficiently', async () => {
      // 场景：用户有大量历史会话记录
      const largeHistorySize = 100;
      const sessions = [];

      // 创建大量会话
      for (let i = 0; i < largeHistorySize; i++) {
        const session = {
          id: `bulk-session-${i}`,
          title: `Session ${i}: ${i % 2 === 0 ? 'React' : 'Node.js'} Development`,
          content: `Content for session ${i}`,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          messages: [{ role: 'user', content: `Task ${i}` }],
          projectPath: testProjectDir
        };

        sessions.push(session);
      }

      // 写入会话文件
      sessions.forEach((session, index) => {
        const sessionPath = join(testSessionsDir, `bulk-session-${index}.json`);
        writeFileSync(sessionPath, JSON.stringify(session, null, 2));
      });

      // 测试查询性能
      const startTime = Date.now();
      const queryResult = await historyQuery.queryHistory({
        format: 'summary',
        limit: 20
      }, testProjectDir);
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(queryResult.response).toContain('项目历史会话');
      expect(queryResult.suggestions.length).toBeGreaterThan(0);

      // 清理批量文件
      sessions.forEach((_, index) => {
        const sessionPath = join(testSessionsDir, `bulk-session-${index}.json`);
        if (existsSync(sessionPath)) {
          unlinkSync(sessionPath);
        }
      });
    });

    it('should provide relevant and actionable suggestions', async () => {
      // 场景：用户获得智能建议
      const queryResult = await historyQuery.queryHistory({
        format: 'summary',
        limit: 5
      }, testProjectDir);

      const suggestions = queryResult.suggestions;
      
      // 验证建议的质量
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5); // 最多5个建议

      // 验证建议的多样性
      const hasContextSuggestion = suggestions.some(s => s.includes('context'));
      const hasTimelineSuggestion = suggestions.some(s => s.includes('timeline'));
      const hasCLISuggestion = suggestions.some(s => s.includes('--cli'));
      const hasSearchSuggestion = suggestions.some(s => s.includes('--search'));

      expect(hasContextSuggestion || hasTimelineSuggestion).toBe(true);
    });
  });
});