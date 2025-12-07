#!/usr/bin/env node

/**
 * Skills Detector Unit Tests
 * TDD Phase 1: Test-Driven Development
 */

const assert = require('assert');
const SkillsDetector = require('../../src/skills-engine/skills-detector.cjs');

describe('Skills Detector', () => {
    let detector;

    beforeEach(() => {
        detector = new SkillsDetector();
    });

    describe('Skill Detection', () => {
        test('should detect translation skill with English keywords', () => {
            const result = detector.detectSkill('translate this to English');

            assert.strictEqual(result.skill, 'translation');
            assert(result.confidence > 7);
            assert.strictEqual(result.parameters.text, 'translate this to English');
        });

        test('should detect translation skill with Chinese keywords', () => {
            const result = detector.detectSkill('请把这段代码翻译成英文');

            assert.strictEqual(result.skill, 'translation');
            assert(result.confidence > 7);
            assert(result.parameters.text, '请把这段代码翻译成英文');
        });

        test('should detect code analysis skill', () => {
            const result = detector.detectSkill('analyze the security of this code');

            assert.strictEqual(result.skill, 'code-analysis');
            assert(result.confidence > 6);
        });

        test('should detect code generation skill', () => {
            const result = detector.detectSkill('generate a user authentication function');

            assert.strictEqual(result.skill, 'code-generation');
            assert(result.confidence > 6);
        });

        test('should detect documentation skill', () => {
            const result = detector.detectSkill('create documentation for this API');

            assert.strictEqual(result.skill, 'documentation');
            assert(result.confidence > 5);
        });

        test('should return null when no skill detected', () => {
            const result = detector.detectSkill('random text without skill keywords');

            assert.strictEqual(result.skill, null);
            assert.strictEqual(result.confidence, 0);
        });

        test('should handle empty input', () => {
            const result = detector.detectSkill('');

            assert.strictEqual(result.skill, null);
            assert.strictEqual(result.confidence, 0);
        });

        test('should handle case-insensitive keywords', () => {
            const result1 = detector.detectSkill('TRANSLATE this text');
            const result2 = detector.detectSkill('Translate This Text');

            assert.strictEqual(result1.skill, 'translation');
            assert.strictEqual(result2.skill, 'translation');
            assert.strictEqual(result1.confidence, result2.confidence);
        });

        test('should prioritize specific skills over general ones', () => {
            const result = detector.detectSkill('analyze the security vulnerabilities');

            assert.strictEqual(result.skill, 'code-analysis');
            assert(result.confidence > 8);
        });

        test('should extract additional parameters', () => {
            const result = detector.detectSkill('generate user authentication in Python');

            assert.strictEqual(result.skill, 'code-generation');
            assert.strictEqual(result.parameters.language, 'python');
        });

        test('should handle mixed language input', () => {
            const result = detector.detectSkill('generate a 用户认证 system');

            assert.strictEqual(result.skill, 'code-generation');
            assert(result.confidence > 6);
        });
    });

    describe('Skill Confidence Scoring', () => {
        test('should assign high confidence for exact keyword matches', () => {
            const result = detector.detectSkill('translate');

            assert.strictEqual(result.skill, 'translation');
            assert(result.confidence > 9);
        });

        test('should assign medium confidence for partial matches', () => {
            const result = detector.detectSkill('please help translate this text');

            assert.strictEqual(result.skill, 'translation');
            assert(result.confidence > 5 && result.confidence < 8);
        });

        test('should assign confidence based on keyword specificity', () => {
            const specific = detector.detectSkill('analyze security vulnerabilities');
            const general = detector.detectSkill('analyze this');

            assert(specific.confidence > general.confidence);
        });
    });

    describe('Parameter Extraction', () => {
        test('should extract target language from translation requests', () => {
            const result = detector.detectSkill('translate to Spanish');

            assert.strictEqual(result.parameters.targetLanguage, 'spanish');
        });

        test('should extract programming language from generation requests', () => {
            const result = detector.detectSkill('generate function in JavaScript');

            assert.strictEqual(result.parameters.language, 'javascript');
        });

        test('should extract analysis type from analysis requests', () => {
            const result = detector.detectSkill('analyze performance bottlenecks');

            assert.strictEqual(result.parameters.analysisType, 'performance');
        });

        test('should handle complex parameter extraction', () => {
            const result = detector.detectSkill('generate REST API with authentication in Node.js');

            assert.strictEqual(result.parameters.type, 'rest api');
            assert.strictEqual(result.parameters.features, 'authentication');
            assert.strictEqual(result.parameters.language, 'node.js');
        });
    });
});

if (require.main === module) {
    // Run tests when executed directly
    const { run } = require('node:test');
    run({
        files: [__filename],
        timeout: 5000
    }).catch(console.error);
}