module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  
  // TypeScript支持
  preset: 'ts-jest',
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // 转换配置
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // 忽略转换的文件
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|commander|inquirer|fs-extra)/)'
  ],
  
  // 覆盖率收集
  collectCoverage: true,
  
  // 覆盖率报告目录
  coverageDirectory: 'coverage',
  
  // 覆盖率收集文件模式
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  
  // 设置文件
  setupFilesAfterEnv: [],
  
  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 清除模拟
  clearMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 快照序列化选项
  snapshotSerializers: [],
  
  // 测试超时
  testTimeout: 10000,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 缓存配置
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
};