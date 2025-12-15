// test/multilingual/language-pattern-manager.test.js

const LanguagePatternManager = require('../../src/core/multilingual/language-pattern-manager');

describe('LanguagePatternManager', () => {
  let manager;

  beforeEach(() => {
    manager = new LanguagePatternManager();
  });

  test('should load language patterns correctly', () => {
    expect(manager.languagePatterns).toBeDefined();
    expect(Object.keys(manager.languagePatterns).length).toBeGreaterThan(0);
  });

  test('should detect English patterns', () => {
    const result = manager.detectCrossCLIRequest('use claude to write code');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('write code');
    expect(result.language).toBe('en');
  });

  test('should detect Chinese patterns', () => {
    const result = manager.detectCrossCLIRequest('请用copilot帮我创建React组件');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('copilot');
    expect(result.task).toBe('创建React组件');
    expect(result.language).toBe('zh');
  });

  test('should detect Japanese patterns', () => {
    const result = manager.detectCrossCLIRequest('claudeを使ってコードを書いて関数を作成');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('関数を作成');
    expect(result.language).toBe('ja');
  });

  test('should detect Korean patterns', () => {
    const result = manager.detectCrossCLIRequest('claude로 코드 작성해 줘함수를 만들어');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('함수를 만들어');
    expect(result.language).toBe('ko');
  });

  test('should detect German patterns', () => {
    const result = manager.detectCrossCLIRequest('benutze claude um code zu schreiben');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('code zu schreiben');
    expect(result.language).toBe('de');
  });

  test('should detect French patterns', () => {
    const result = manager.detectCrossCLIRequest('utilise claude pour écrire du code');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('écrire du code');
    expect(result.language).toBe('fr');
  });

  test('should detect Spanish patterns', () => {
    const result = manager.detectCrossCLIRequest('usa claude para escribir código');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('escribir código');
    expect(result.language).toBe('es');
  });

  test('should detect Italian patterns', () => {
    const result = manager.detectCrossCLIRequest('usa claude per scrivere codice');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('scrivere codice');
    expect(result.language).toBe('it');
  });

  test('should detect Portuguese patterns', () => {
    const result = manager.detectCrossCLIRequest('use claude para escrever código');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('escrever código');
    expect(result.language).toBe('pt');
  });

  test('should detect Russian patterns', () => {
    const result = manager.detectCrossCLIRequest('используй claude чтобы написать код');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('написать код');
    expect(result.language).toBe('ru');
  });

  test('should detect Arabic patterns', () => {
    const result = manager.detectCrossCLIRequest('استخدم claude لكتابة الكود');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('كتابة الكود');
    expect(result.language).toBe('ar');
  });

  test('should detect Turkish patterns', () => {
    const result = manager.detectCrossCLIRequest('claude kullanarak kod yaz bir fonksiyon');
    expect(result).toBeDefined();
    expect(result.targetCLI).toBe('claude');
    expect(result.task).toBe('kod yaz bir fonksiyon');
    expect(result.language).toBe('tr');
  });

  test('should return null for unsupported CLI tools', () => {
    const result = manager.detectCrossCLIRequest('use nonexistenttool to do something');
    expect(result).toBeNull();
  });

  test('should return null for non-cross-CLI requests', () => {
    const result = manager.detectCrossCLIRequest('just a regular prompt');
    expect(result).toBeNull();
  });

  test('should get patterns for specific language', () => {
    const patterns = manager.getPatterns('en');
    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBeGreaterThan(0);
  });

  test('should get all patterns', () => {
    const allPatterns = manager.getAllPatterns();
    expect(allPatterns).toBeDefined();
    expect(Object.keys(allPatterns).length).toBeGreaterThan(0);
  });

  test('should detect language from environment', () => {
    const language = manager.detectLanguage();
    expect(typeof language).toBe('string');
    expect(language.length).toBeGreaterThan(0);
  });
});