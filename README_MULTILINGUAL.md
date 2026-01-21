# Multilingual Hook System

The multilingual hook system extends Stigmergy CLI's cross-CLI communication capabilities to support natural language commands in 12 languages. Users can now interact with AI CLI tools using familiar language constructs in their native tongue.

## Supported Languages

1. **English** - Native pattern matching with "use", "call", "ask" constructions
2. **Chinese** - Full support for 请用...帮我..., 调用...来..., 用...帮我..., ...，..., 让...做... patterns
3. **Japanese** - Support for Japanese natural language constructions
4. **Korean** - Support for Korean natural language constructions
5. **German** - Support for German natural language constructions
6. **French** - Support for French natural language constructions
7. **Spanish** - Support for Spanish natural language constructions
8. **Italian** - Support for Italian natural language constructions
9. **Portuguese** - Support for Portuguese natural language constructions
10. **Russian** - Support for Russian natural language constructions
11. **Arabic** - Support for Arabic natural language constructions (RTL support)
12. **Turkish** - Support for Turkish natural language constructions

## How It Works

The system uses regular expression patterns specific to each language to detect cross-CLI requests. When a user enters a command, the system:

1. Detects the user's preferred language based on environment variables and Intl API
2. Matches the input against language-specific patterns
3. Extracts the target CLI tool and task
4. Routes the request to the appropriate CLI tool

## Example Commands

### English
```
use claude to write a Python function
please use gemini to explain quantum computing
copilot, please help me create a React component
```

### Chinese
```
请用qwen帮我分析这段代码
调用claude来写一个排序算法
用gemini帮我翻译这段文档
codebuddy，检查一下这个函数
让copilot生成测试用例
```

### Japanese
```
claudeを使ってコードを書いて関数を作成
geminiを呼び出して助けて説明して
copilotにコード作成を依頼Reactコンポーネントを
qwen、このコードを説明して
```

### And many more languages...

## Deployment

To deploy hooks with multilingual support:

```bash
stigmergy deploy
```

This will automatically generate hooks for all installed CLI tools with support for all 12 languages.

## Testing

Run the multilingual system test:

```bash
node test/multilingual/system-test.js
```

Run comprehensive tests:

```bash
npm test test/multilingual/
```

## Adding New Languages

To add support for additional languages:

1. Create a new pattern definition file in `.qoder/specs/multilingual-hook-system/language-patterns/`
2. Add the language to the supported languages list in `src/core/multilingual/language-pattern-manager.js` (for runtime usage)
3. Add the same language support to the embedded `LanguagePatternManager` class in `src/core/coordination/nodejs/HookDeploymentManager.js` (in the `generateNodeJsHookTemplate` method) to ensure deployed hooks have the new language patterns
4. Add test cases in `test/multilingual/language-pattern-manager.test.js`
5. Run tests to verify the new language works correctly

See `.qoder/specs/multilingual-hook-system/ADDING_NEW_LANGUAGES.md` for detailed instructions.

## Architecture

The system consists of:

- **LanguagePatternManager**: Central component managing all language patterns
- **Pattern Definition Files**: Separate files for each language's patterns
- **Enhanced Hook Templates**: Hooks that include multilingual pattern matching
- **Intelligent Language Detection**: Automatic detection of user's preferred language

## Benefits

- **Natural Language Interaction**: Communicate with AI CLI tools in native language
- **Intuitive Commands**: Use familiar linguistic constructions for cross-CLI requests
- **Reduced Learning Curve**: No need to memorize English command syntax
- **Improved Accessibility**: Better experience for non-English speakers
- **Backward Compatibility**: All existing functionality continues to work unchanged