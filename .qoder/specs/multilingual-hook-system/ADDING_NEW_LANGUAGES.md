# Multilingual Hook System - Adding New Languages

This document explains how to add support for new languages to the Stigmergy CLI multilingual hook system.

## Overview

The multilingual hook system uses regular expression patterns to detect cross-CLI requests in multiple languages. Each language has its own pattern definition file that specifies how users can request cross-CLI communication in that language.

## Steps to Add a New Language

### 1. Create Language Pattern Definition File

Create a new JavaScript file in `.qoder/specs/multilingual-hook-system/language-patterns/` with the language code as the filename (e.g., `dutch.js` for Dutch).

Example for Dutch (`dutch.js`):
```javascript
// Dutch language patterns
const dutchPatterns = [
  {
    name: 'gebruik claude om code te schrijven',
    regex: /(?:gebruik|gebruiken|maak gebruik van)\\s+(\\w+)\\s+(?:om|voor)\\s+(.+)$/i,
    example: 'gebruik claude om code te schrijven'
  },
  {
    name: 'roep gemini aan voor hulp',
    regex: /(?:roep|bel)\\s+(\\w+)\\s+(?:aan|voor)\\s+(?:hulp|ondersteuning)\\s+(?:bij|voor)\\s+(.+)$/i,
    example: 'roep gemini aan voor hulp bij uitleg'
  },
  {
    name: '... kun je helpen',
    regex: /(\\w+)\\s+(?:kun je|zou je|wil je)\\s+(?:helpen|ondersteunen)\\s+(.+)$/i,
    example: 'claude kun je helpen een functie te schrijven'
  },
  {
    name: '... alsjeblieft ...',
    regex: /(\\w+)[,\\s]+alsjeblieft\\s+(.+)$/i,
    example: 'gemini, alsjeblieft leg deze code uit'
  }
];

module.exports = dutchPatterns;
```

### 2. Add Language to Supported Languages List

Add the new language to the `supportedLanguages` object in both:

1. `src/core/multilingual/language-pattern-manager.js` (for runtime usage):

```javascript
this.supportedLanguages = {
  en: { name: 'English', direction: 'ltr' },
  zh: { name: 'Chinese', direction: 'ltr' },
  ja: { name: 'Japanese', direction: 'ltr' },
  ko: { name: 'Korean', direction: 'ltr' },
  de: { name: 'German', direction: 'ltr' },
  fr: { name: 'French', direction: 'ltr' },
  es: { name: 'Spanish', direction: 'ltr' },
  it: { name: 'Italian', direction: 'ltr' },
  pt: { name: 'Portuguese', direction: 'ltr' },
  ru: { name: 'Russian', direction: 'ltr' },
  ar: { name: 'Arabic', direction: 'rtl' },
  tr: { name: 'Turkish', direction: 'ltr' },
  nl: { name: 'Dutch', direction: 'ltr' } // Add new language here
};
```

2. `src/core/coordination/nodejs/HookDeploymentManager.js` - Update the embedded `LanguagePatternManager` class in the `generateNodeJsHookTemplate` method to ensure deployed hooks have the new language patterns. You'll need to update both the `supportedLanguages` object and add language patterns to the `languagePatterns` object in the same embedded class.

### 3. Test the New Language

Create test cases in `test/multilingual/language-pattern-manager.test.js`:

```javascript
test('should detect Dutch patterns', () => {
  const result = manager.detectCrossCLIRequest('gebruik claude om code te schreiben');
  expect(result).toBeDefined();
  expect(result.targetCLI).toBe('claude');
  expect(result.task).toBe('code te schreiben');
  expect(result.language).toBe('nl');
});
```

## Pattern Guidelines

When creating patterns for a new language, consider:

1. **Common Phrases**: Include the most common ways users might request cross-CLI communication
2. **Grammar Structures**: Account for the language's grammar and word order
3. **Politeness Levels**: Include both formal and informal ways of making requests
4. **Variety**: Provide at least 3-4 different pattern variations
5. **Examples**: Include clear examples for each pattern

## Regular Expression Best Practices

1. **Use Non-Capturing Groups**: `(?:...)` for groups that don't need to be extracted
2. **Case Insensitive**: Use the `i` flag for case-insensitive matching
3. **Unicode Support**: Ensure patterns work with Unicode characters
4. **Escape Special Characters**: Properly escape regex special characters
5. **Capture Groups**: Use capturing groups `(...)` only for the CLI name and task

## Testing New Languages

After adding a new language:

1. Run the language pattern manager tests:
   ```bash
   npm test test/multilingual/language-pattern-manager.test.js
   ```

2. Run the hook deployment tests:
   ```bash
   npm test test/multilingual/hook-deployment.test.js
   ```

3. Manually test by deploying hooks and verifying they work with the new language patterns

## Troubleshooting

If patterns aren't matching correctly:

1. **Check Regex Syntax**: Ensure all special characters are properly escaped
2. **Verify Case Sensitivity**: Make sure the `i` flag is used if needed
3. **Test Individual Patterns**: Test each pattern separately to isolate issues
4. **Validate Capturing Groups**: Ensure exactly two capturing groups (CLI name and task)
5. **Check Supported CLI List**: Verify the target CLI is in the supported list

By following these guidelines, you can easily extend the multilingual hook system to support additional languages and provide a better international user experience.