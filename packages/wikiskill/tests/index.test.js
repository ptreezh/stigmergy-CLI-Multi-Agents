const WikiCollaborativeSkill = require('../src/core/WikiCollaborativeSkill');
const MultiTopicWikiManager = require('../src/core/MultiTopicWikiManager');
const IntelligentTopicSelector = require('../src/core/IntelligentTopicSelector');
const FeedbackProcessor = require('../src/core/FeedbackProcessor');
const CLIToolIntegrator = require('../src/integrators/CLIToolIntegrator');
const WikiInitializer = require('../src/utils/WikiInitializer');
const WikiViewer = require('../src/utils/WikiViewer');
const WikiPathResolver = require('../src/utils/WikiPathResolver');

describe('WikiCollaborativeSkill', () => {
  let skill;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      llm: {
        generate: jest.fn().mockResolvedValue({ content: 'Test response' })
      },
      tools: {
        search: { search: jest.fn().mockResolvedValue([]) },
        download: { download: jest.fn().mockResolvedValue('content') },
        fileReader: { parse: jest.fn().mockResolvedValue({}) },
        codeExecutor: { execute: jest.fn().mockResolvedValue({ success: true }) },
        calculator: { calculate: jest.fn().mockResolvedValue({ result: 42 }) }
      },
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        success: jest.fn(),
        debug: jest.fn()
      }
    };

    skill = new WikiCollaborativeSkill(mockCliContext);
  });

  describe('executeWikiTask', () => {
    it('should execute a wiki task successfully', async () => {
      const taskDescription = '参与机器学习词条编辑';
      const result = await skill.executeWikiTask(taskDescription);

      expect(result).toBeDefined();
      expect(mockCliContext.logger.info).toHaveBeenCalledWith('开始执行Wiki协同任务');
      expect(mockCliContext.logger.success).toHaveBeenCalledWith('Wiki协同任务完成');
    });

    it('should handle errors gracefully', async () => {
      mockCliContext.llm.generate.mockRejectedValue(new Error('LLM error'));

      await expect(skill.executeWikiTask('test task')).rejects.toThrow();
      expect(mockCliContext.logger.error).toHaveBeenCalled();
    });
  });

  describe('understandTask', () => {
    it('should parse task understanding correctly', async () => {
      const taskDescription = '创建一个新的机器学习主题';
      const result = await skill.understandTask(taskDescription);

      expect(result.originalTask).toBe(taskDescription);
      expect(result.coreObjectives).toBeDefined();
      expect(result.domain).toBeDefined();
    });
  });

  describe('establishProfessionalRole', () => {
    it('should create a professional role', async () => {
      const taskUnderstanding = {
        domain: '机器学习',
        complexity: 'medium'
      };
      const context = { isNewTopic: true };

      const result = await skill.establishProfessionalRole(taskUnderstanding, context);

      expect(result.persona).toBeDefined();
      expect(result.expertise).toBeDefined();
    });
  });
});

describe('MultiTopicWikiManager', () => {
  let manager;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      logger: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn()
      }
    };

    manager = new MultiTopicWikiManager(mockCliContext);
  });

  describe('listTopics', () => {
    it('should list topics', async () => {
      // Mock file system operations
      jest.spyOn(require('fs-extra'), 'readdir').mockResolvedValue(['topic1.html', 'topic2.html']);
      jest.spyOn(require('fs-extra'), 'stat').mockResolvedValue({ 
        mtime: new Date(), 
        size: 1024 
      });
      jest.spyOn(WikiPathResolver, 'findWikiPath').mockResolvedValue('/test/wiki');

      const topics = await manager.listTopics();
      expect(topics).toHaveLength(2);
      expect(topics[0].name).toBe('topic1');
    });
  });

  describe('createTopic', () => {
    it('should create a new topic', async () => {
      const topicName = 'test-topic';
      const options = { role: { persona: { name: 'Test' } } };

      jest.spyOn(WikiPathResolver, 'findWikiPath').mockResolvedValue('/test/wiki');
      jest.spyOn(require('fs-extra'), 'pathExists').mockResolvedValue(false);
      jest.spyOn(require('fs-extra'), 'writeFile').mockResolvedValue();

      const result = await manager.createTopic(topicName, options);
      
      expect(result.topicName).toBe(topicName);
      expect(result.created).toBe(true);
    });
  });
});

describe('IntelligentTopicSelector', () => {
  let selector;

  beforeEach(() => {
    selector = new IntelligentTopicSelector();
  });

  describe('selectOptimalTopic', () => {
    it('should select optimal topic for a task', async () => {
      const taskDescription = '参与机器学习词条编辑';
      
      jest.spyOn(WikiPathResolver, 'findWikiPath').mockResolvedValue('/test/wiki');
      jest.spyOn(require('fs-extra'), 'readdir').mockResolvedValue(['machine-learning.html']);

      const result = await selector.selectOptimalTopic(taskDescription);

      expect(result.selectedTopic).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.strategy).toBeDefined();
    });
  });

  describe('analyzeTask', () => {
    it('should analyze task correctly', () => {
      const taskDescription = '创建一个新的机器学习主题';
      
      const result = selector.analyzeTask(taskDescription);

      expect(result.originalTask).toBe(taskDescription);
      expect(result.keywords).toBeDefined();
      expect(result.domain).toBeDefined();
    });
  });
});

describe('FeedbackProcessor', () => {
  let processor;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      }
    };

    processor = new FeedbackProcessor(mockCliContext);
  });

  describe('monitorTopic', () => {
    it('should monitor topic for feedback', async () => {
      const topicName = 'test-topic';

      jest.spyOn(WikiPathResolver, 'getTopicPath').mockResolvedValue('/test/wiki/test-topic.html');
      jest.spyOn(require('fs-extra'), 'pathExists').mockResolvedValue(true);
      
      // Mock chokidar
      const mockWatcher = {
        on: jest.fn(),
        close: jest.fn()
      };
      jest.doMock('chokidar', () => ({
        watch: jest.fn().mockReturnValue(mockWatcher)
      }));

      const result = await processor.monitorTopic(topicName);

      expect(result.topicName).toBe(topicName);
      expect(result.isActive).toBe(true);
    });
  });
});

describe('CLIToolIntegrator', () => {
  let integrator;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      llm: {
        generate: jest.fn().mockResolvedValue({ content: 'Test response' })
      },
      tools: {
        search: { search: jest.fn().mockResolvedValue([]) },
        download: { download: jest.fn().mockResolvedValue('content') },
        fileReader: { parse: jest.fn().mockResolvedValue({}) },
        codeExecutor: { execute: jest.fn().mockResolvedValue({ success: true }) },
        calculator: { calculate: jest.fn().mockResolvedValue({ result: 42 }) }
      }
    };

    integrator = new CLIToolIntegrator(mockCliContext);
  });

  describe('llmInference', () => {
    it('should perform LLM inference', async () => {
      const prompt = 'Test prompt';
      const options = { temperature: 0.5 };

      const result = await integrator.llmInference(prompt, options);

      expect(result).toBeDefined();
      expect(mockCliContext.llm.generate).toHaveBeenCalledWith(prompt, expect.objectContaining(options));
    });
  });

  describe('enhancedSearch', () => {
    it('should perform enhanced search', async () => {
      const query = 'test query';

      const result = await integrator.enhancedSearch(query);

      expect(Array.isArray(result)).toBe(true);
      expect(mockCliContext.tools.search.search).toHaveBeenCalledWith(query, expect.any(Object));
    });
  });
});

describe('WikiInitializer', () => {
  let initializer;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      logger: {
        success: jest.fn(),
        error: jest.fn()
      }
    };

    initializer = new WikiInitializer(mockCliContext);
  });

  describe('initializeWiki', () => {
    it('should initialize wiki system', async () => {
      const projectPath = '/test/project';

      jest.spyOn(require('fs-extra'), 'pathExists').mockResolvedValue(false);
      jest.spyOn(require('fs-extra'), 'ensureDir').mockResolvedValue();
      jest.spyOn(require('fs-extra'), 'copy').mockResolvedValue();
      jest.spyOn(require('fs-extra'), 'writeJson').mockResolvedValue();
      jest.spyOn(require('fs-extra'), 'writeFile').mockResolvedValue();

      const result = await initializer.initializeWiki(projectPath);

      expect(result).toBeDefined();
      expect(mockCliContext.logger.success).toHaveBeenCalledWith('Wiki初始化完成');
    });
  });
});

describe('WikiViewer', () => {
  let viewer;
  let mockCliContext;

  beforeEach(() => {
    mockCliContext = {
      logger: {
        info: jest.fn(),
        error: jest.fn()
      }
    };

    viewer = new WikiViewer(mockCliContext);
  });

  describe('openWiki', () => {
    it('should open wiki', async () => {
      const topicName = 'test-topic';

      jest.spyOn(WikiPathResolver, 'findWikiPath').mockResolvedValue('/test/wiki');
      jest.spyOn(WikiPathResolver, 'getTopicPath').mockResolvedValue('/test/wiki/test-topic.html');
      jest.spyOn(require('fs-extra'), 'pathExists').mockResolvedValue(true);
      jest.spyOn(require('fs-extra'), 'readJson').mockResolvedValue({ localServer: { enabled: false } });
      jest.doMock('open', () => jest.fn());

      const result = await viewer.openWiki(topicName);

      expect(result).toBeDefined();
    });
  });
});

describe('WikiPathResolver', () => {
  describe('findWikiPath', () => {
    it('should find wiki path', async () => {
      jest.spyOn(require('fs-extra'), 'pathExists').mockResolvedValue(true);

      const result = await WikiPathResolver.findWikiPath('/test');

      expect(result).toBeDefined();
    });
  });

  describe('getTopicPath', () => {
    it('should get topic path', () => {
      const topicName = 'test-topic';
      const wikiPath = '/test/wiki';

      const result = WikiPathResolver.getTopicPath(topicName, wikiPath);

      expect(result).toContain(topicName);
      expect(result).toContain('.html');
    });
  });
});