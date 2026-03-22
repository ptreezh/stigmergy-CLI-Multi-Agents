/**
 * Jest 测试设置文件
 * 在所有测试运行之前执行
 */

// 设置测试超时时间
jest.setTimeout(120000);

// 全局 mocks
global.testMocks = {};

// 清理控制台输出
beforeEach(() => {
  jest.clearAllMocks();
});

// 测试完成后清理
afterEach(() => {
  jest.resetAllMocks();
});
