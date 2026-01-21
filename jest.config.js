/**
 * Jest 配置文件
 * 用于单元测试、集成测试和E2E测试
 */

module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js'
  ],

  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js',
    '!src/**/router*.js',
    '!src/test/**',
    '!**/node_modules/**'
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 测试超时时间
  testTimeout: 120000,

  // 并发测试
  maxWorkers: '50%',

  // 清除模拟
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 详细输出
  verbose: true,

  // 模块路径映射（如果需要）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // 测试设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  },

  // 忽略的文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // 转换器
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 报告器
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ]
};