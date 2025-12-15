import { SessionScanner } from '../src/core/SessionScanner';
import { SessionFilter } from '../src/core/SessionFilter';
import { HistoryFormatter } from '../src/core/HistoryFormatter';
import { HistoryQuery } from '../src/core/HistoryQuery';
import { CLIScanner } from '../src/utils/CLIScanner';
import { CodeGenerator } from '../src/utils/CodeGenerator';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('ResumeSession End-to-End Integration Tests', () => {
  let sessionScanner: SessionScanner;
  let sessionFilter: SessionFilter;
  let historyFormatter: HistoryFormatter;
  let historyQuery: HistoryQuery;
  let cliScanner: CLIScanner;
  let codeGenerator: CodeGenerator;
  
  const testProjectDir = join(homedir(), '.resumesession-integration-test');
  const testSessionsDir = join(testProjectDir, 'test-sessions');
  const testConfig = {
    version: '1.0.0',
    author: 'ResumeSession Integration Test',
    description: 'End-to-end integration test configuration'
  };

  beforeAll(async () => {
    // 初始化所有组件
    sessionScanner = new SessionScanner();
    sessionFilter = new SessionFilter();
    historyFormatter = new HistoryFormatter();
    historyQuery = new HistoryQuery();
    cliScanner = CLIScanner.getInstance();
    codeGenerator = new CodeGenerator();

    // 创建测试目录结构
    if (!existsSync(testProjectDir)) {
      mkdirSync(testProjectDir, { recursive: true });
    }
    if (!existsSync(testSessionsDir)) {
      mkdirSync(testSessionsDir, { recursive: true });
    }

    // 创建测试会话文件
    createTestSessionFiles();
  });

  afterAll(async () => {
    // 清理测试文件和目录
    await cleanupTestFiles();
  });

  function createTestSessionFiles() {
    const testSessions = [
      {
        filename: 'claude-session-1.json',
        cliType: 'claude',
        data: {
          id: 'claude-session-1',
          title: 'React Component Development',
          content: 'We developed a React component with TypeScript',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1天前
          messages: [
            { role: 'user', content: 'Create a React component' },
            { role: 'assistant', content: 'I will create a React component for you' },
            { role: 'user', content: 'Add TypeScript support' },
            { role: 'assistant', content: 'Adding TypeScript support to the component' }
          ],
          projectPath: testProjectDir
        }
      },
      {
        filename: 'gemini-session-1.json',
        cliType: 'gemini',
        data: {
          id: 'gemini-session-1',
          title: 'Python Script Optimization',
          content: 'Optimized a Python script for better performance',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2天前
          messages: [
            { role: 'user', content: 'Optimize this Python script' },
            { role: 'assistant', content: 'I will optimize your Python script' }
          ],
          projectPath: testProjectDir
        }
      },
      {
        filename: 'iflow-session-1.json',
        cliType: 'iflow',
        data: {
          sessionId: 'iflow-session-1',
          topic: 'Database Schema Design',
          content: 'Designed a database schema for the application',
          updatedAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
          messageCount: 5,
          workingDirectory: testProjectDir
        }
      },
      {
        filename: 'codebuddy-session-1.json',
        cliType: 'codebuddy',
        data: {
          id: 'codebuddy-session-1',
          title: 'CSS Styling Issues',
          content: 'Fixed CSS styling issues in the application',
          timestamp: new Date(Date.now() - 345600000).toISOString(), // 4天前
          messages: [
            { role: 'user', content: 'Help me fix CSS issues' },
            { role: 'assistant', content: 'I will help you fix the CSS issues' }
          ],
          projectPath: testProjectDir
        }
      }
    ];

    testSessions.forEach(session => {
      const sessionPath = join(testSessionsDir, session.filename);
      writeFileSync(sessionPath, JSON.stringify(session.data, null, 2));
    });
  }

  async function cleanupTestFiles() {
    // 清理会话文件
    const testSessions = [
      'claude-session-1.json',
      'gemini-session-1.json', 
      'iflow-session-1.json',
      'codebuddy-session-1.json'
    ];

    testSessions.forEach(filename => {
      const sessionPath = join(testSessionsDir, filename);
      if (existsSync(sessionPath)) {
        unlinkSync(sessionPath);
      }
    });

    // 清理生成的集成代码
    const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
    for (const cliType of cliTypes) {
      const integrationPath = getIntegrationPath(cliType, testProjectDir);
      if (existsSync(integrationPath)) {
        unlinkSync(integrationPath);
      }

      // 清理目录
      const parentDir = join(integrationPath, '..');
      try {
        if (existsSync(parentDir)) {
          rmdirSync(parentDir);
        }
      } catch (error) {
        // 忽略目录非空错误
      }
    }

    // 清理测试目录
    try {
      if (existsSync(testSessionsDir)) {
        rmdirSync(testSessionsDir);
      }
      if (existsSync(testProjectDir)) {
        rmdirSync(testProjectDir);
      }
    } catch (error) {
      // 忽略目录非空错误
    }
  }

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

  describe('Complete Workflow Integration', () => {
    it('should execute complete session scanning and querying workflow', async () => {
      // 1. 扫描所有CLI工具
      const cliList = await cliScanner.scanAllCLIs();
      expect(cliList).toHaveLength(7);
      expect(cliList.some(cli => cli.name === 'iflow')).toBe(true);

      // 2. 扫描会话文件
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(sessions).toHaveLength(4);

      // 3. 应用过滤器
      const filteredSessions = sessionFilter.applyFilters(sessions, {
        cli: null,
        search: null,
        timeRange: 'all',
        limit: 10
      }, testProjectDir);
      expect(filteredSessions).toHaveLength(4);

      // 4. 格式化结果
      const summary = historyFormatter.formatSummary(filteredSessions, { projectPath: testProjectDir });
      expect(summary).toContain('项目历史会话');
      expect(summary).toContain('共找到 4 个会话');

      // 5. 执行完整查询
      const queryResult = await historyQuery.queryHistory({
        cli: null,
        search: null,
        timeRange: 'all',
        limit: 10,
        format: 'summary'
      }, testProjectDir);
      
      expect(queryResult.response).toContain('项目历史会话');
      expect(queryResult.suggestions).toBeDefined();
      expect(Array.isArray(queryResult.suggestions)).toBe(true);
    });

    it('should handle CLI-specific filtering workflow', async () => {
      // 1. 扫描会话
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      
      // 2. 按CLI类型过滤
      const claudeSessions = sessionFilter.filterByCLI(sessions, 'claude');
      expect(claudeSessions).toHaveLength(1);
      expect(claudeSessions[0].cliType).toBe('claude');

      // 3. 格式化特定CLI结果
      const timeline = historyFormatter.formatTimeline(claudeSessions);
      expect(timeline).toContain('时间线视图');
      expect(timeline).toContain('React Component Development');
    });

    it('should handle search filtering workflow', async () => {
      // 1. 扫描会话
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      
      // 2. 搜索过滤
      const searchResults = sessionFilter.filterBySearch(sessions, 'React');
      expect(searchResults.length).toBeGreaterThanOrEqual(1);
      expect(searchResults[0].content).toContain('React');

      // 3. 格式化搜索结果
      const detailed = historyFormatter.formatDetailed(searchResults);
      expect(detailed).toContain('详细视图');
      expect(detailed).toContain('React Component Development');
    });

    it('should handle time-based filtering workflow', async () => {
      // 1. 扫描会话
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      
      // 2. 时间过滤（最近2天）
      const recentSessions = sessionFilter.filterByDateRange(sessions, 'week');
      expect(recentSessions.length).toBeGreaterThanOrEqual(1);

      // 3. 格式化时间过滤结果
      const summary = historyFormatter.formatSummary(recentSessions, { projectPath: testProjectDir });
      expect(summary).toContain('项目历史会话');
    });
  });

  describe('Code Generation Integration', () => {
    it('should generate and validate integration code for all CLI types', async () => {
      const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
      
      for (const cliType of cliTypes) {
        // 1. 生成集成代码
        await codeGenerator.generateIntegration(cliType, testProjectDir, testConfig);
        
        // 2. 验证文件存在
        const integrationPath = getIntegrationPath(cliType, testProjectDir);
        expect(existsSync(integrationPath)).toBe(true);

        // 3. 验证代码内容
        const content = require('fs').readFileSync(integrationPath, 'utf8');
        expect(content).toContain(cliType);
        expect(content).toContain('ResumeSession Integration');
        expect(content).toContain(testConfig.version);

        // 4. 验证JavaScript语法
        expect(() => new Function(content)).not.toThrow();
      }
    });

    it('should generate functional integration code', async () => {
      // 1. 生成Claude集成代码
      await codeGenerator.generateIntegration('claude', testProjectDir, testConfig);
      
      // 2. 加载生成的模块
      const integrationPath = getIntegrationPath('claude', testProjectDir);
      
      // 3. 验证模块结构
      const content = require('fs').readFileSync(integrationPath, 'utf8');
      expect(content).toContain('handleHistoryCommand');
      expect(content).toContain('buildQuery');
      expect(content).toContain('formatResponse');
      expect(content).toContain('module.exports');
    });
  });

  describe('Cross-CLI Compatibility', () => {
    it('should handle different session formats across CLI types', async () => {
      // 1. 创建不同格式的会话文件
      const differentFormats = [
        {
          filename: 'format1.json',
          data: {
            id: 'session1',
            title: 'Standard Format',
            content: 'Standard session format',
            timestamp: new Date().toISOString(),
            messages: [],
            projectPath: testProjectDir
          }
        },
        {
          filename: 'format2.session',
          data: {
            sessionId: 'session2',
            topic: 'Alternative Format',
            content: 'Alternative session format',
            updatedAt: new Date().toISOString(),
            messageCount: 3,
            workingDirectory: testProjectDir
          }
        },
        {
          filename: 'format3.json',
          data: [
            { role: 'user', content: 'Array format message 1' },
            { role: 'assistant', content: 'Array format message 2' }
          ]
        }
      ];

      // 2. 写入不同格式的文件
      differentFormats.forEach(format => {
        const filePath = join(testSessionsDir, format.filename);
        writeFileSync(filePath, JSON.stringify(format.data, null, 2));
      });

      // 3. 扫描并验证处理
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(sessions.length).toBeGreaterThan(3);

      // 4. 验证格式化处理
      sessions.forEach(session => {
        expect(session.cliType).toBe('test-cli');
        expect(session.sessionId).toBeTruthy();
        expect(session.title).toBeTruthy();
        expect(session.content).toBeTruthy();
        expect(session.updatedAt).toBeInstanceOf(Date);
        expect(typeof session.messageCount).toBe('number');
      });

      // 5. 清理测试文件
      differentFormats.forEach(format => {
        const filePath = join(testSessionsDir, format.filename);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle large number of sessions efficiently', async () => {
      // 1. 创建大量会话文件
      const largeSessionCount = 50;
      for (let i = 0; i < largeSessionCount; i++) {
        const sessionData = {
          id: `bulk-session-${i}`,
          title: `Bulk Session ${i}`,
          content: `Content for bulk session ${i}`,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          messages: [
            { role: 'user', content: `Message ${i}` },
            { role: 'assistant', content: `Response ${i}` }
          ],
          projectPath: testProjectDir
        };

        const sessionPath = join(testSessionsDir, `bulk-session-${i}.json`);
        writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
      }

      // 2. 测试扫描性能
      const startTime = Date.now();
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      const scanTime = Date.now() - startTime;

      expect(sessions.length).toBeGreaterThanOrEqual(largeSessionCount);
      expect(scanTime).toBeLessThan(5000); // 应该在5秒内完成

      // 3. 测试过滤性能
      const filterStartTime = Date.now();
      const filteredSessions = sessionFilter.applyFilters(sessions, {
        limit: 20,
        timeRange: 'all'
      }, testProjectDir);
      const filterTime = Date.now() - filterStartTime;

      expect(filteredSessions.length).toBeLessThanOrEqual(20);
      expect(filterTime).toBeLessThan(1000); // 应该在1秒内完成

      // 4. 测试格式化性能
      const formatStartTime = Date.now();
      const summary = historyFormatter.formatSummary(filteredSessions, { projectPath: testProjectDir });
      const formatTime = Date.now() - formatStartTime;

      expect(summary).toBeTruthy();
      expect(formatTime).toBeLessThan(1000); // 应该在1秒内完成

      // 5. 清理批量文件
      for (let i = 0; i < largeSessionCount; i++) {
        const sessionPath = join(testSessionsDir, `bulk-session-${i}.json`);
        if (existsSync(sessionPath)) {
          unlinkSync(sessionPath);
        }
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle corrupted session files gracefully', async () => {
      // 1. 创建损坏的会话文件
      const corruptedFiles = [
        { filename: 'invalid-json.json', content: '{ invalid json content' },
        { filename: 'empty.json', content: '' },
        { filename: 'null-content.json', content: '{"content": null}' }
      ];

      corruptedFiles.forEach(file => {
        const filePath = join(testSessionsDir, file.filename);
        writeFileSync(filePath, file.content);
      });

      // 2. 扫描应该跳过损坏的文件
      const sessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(sessions.length).toBeGreaterThan(0); // 应该仍然能找到有效文件

      // 3. 查询应该正常工作
      const queryResult = await historyQuery.queryHistory({
        format: 'summary'
      }, testProjectDir);
      
      expect(queryResult.response).toBeTruthy();
      expect(queryResult.suggestions).toBeDefined();

      // 4. 清理损坏文件
      corruptedFiles.forEach(file => {
        const filePath = join(testSessionsDir, file.filename);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      });
    });

    it('should handle missing directories gracefully', async () => {
      // 1. 使用不存在的目录
      const nonExistentDir = join(testProjectDir, 'non-existent');
      
      // 2. 扫描应该返回空结果
      const sessions = sessionScanner.scanSessions('test-cli', nonExistentDir, testProjectDir);
      expect(sessions).toHaveLength(0);

      // 3. 查询应该正常处理
      const queryResult = await historyQuery.queryHistory({
        format: 'summary'
      }, testProjectDir);
      
      expect(queryResult.response).toContain('暂无历史会话');
    });
  });

  describe('Real-world Scenario Tests', () => {
    it('should simulate real developer workflow', async () => {
      // 1. 开发者使用多个CLI工具工作
      const developerWorkflow = [
        { cli: 'claude', task: 'React component development', time: new Date(Date.now() - 3600000) },
        { cli: 'gemini', task: 'API design', time: new Date(Date.now() - 7200000) },
        { cli: 'iflow', task: 'Database schema', time: new Date(Date.now() - 10800000) },
        { cli: 'codebuddy', task: 'CSS styling', time: new Date(Date.now() - 14400000) }
      ];

      // 2. 为每个工作流创建会话文件
      developerWorkflow.forEach((work, index) => {
        const sessionData = {
          id: `${work.cli}-work-${index}`,
          title: work.task,
          content: `Working on ${work.task}`,
          timestamp: work.time.toISOString(),
          messages: [
            { role: 'user', content: `Help with ${work.task}` },
            { role: 'assistant', content: `I'll help you with ${work.task}` }
          ],
          projectPath: testProjectDir
        };

        const sessionPath = join(testSessionsDir, `${work.cli}-work-${index}.json`);
        writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
      });

      // 3. 开发者查询今天的工作
      const todayWork = await historyQuery.queryHistory({
        timeRange: 'today',
        format: 'timeline'
      }, testProjectDir);

      expect(todayWork.response).toContain('时间线视图');
      expect(todayWork.suggestions.length).toBeGreaterThan(0);

      // 4. 开发者搜索特定任务
      const reactWork = await historyQuery.queryHistory({
        search: 'React',
        format: 'detailed'
      }, testProjectDir);

      expect(reactWork.response).toContain('详细视图');
      expect(reactWork.response).toContain('React component development');

      // 5. 开发者查看特定CLI的工作
      const claudeWork = await historyQuery.queryHistory({
        cli: 'claude',
        format: 'summary'
      }, testProjectDir);

      expect(claudeWork.response).toContain('CLAUDE');
      expect(claudeWork.response).toContain('React component development');

      // 6. 清理工作流文件
      developerWorkflow.forEach((work, index) => {
        const sessionPath = join(testSessionsDir, `${work.cli}-work-${index}.json`);
        if (existsSync(sessionPath)) {
          unlinkSync(sessionPath);
        }
      });
    });
  });
});