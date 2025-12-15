# Multilingual Hook System - Design Document

## Overview
This document outlines the design for a comprehensive multilingual hook system that enables users to interact with AI CLI tools using natural language commands in multiple languages. The system extends the existing English and Chinese pattern matching capabilities to support 12 additional languages, providing a truly international user experience.

## Technical Architecture
The multilingual hook system follows the existing project pattern and integrates seamlessly with the current hook deployment architecture. The system uses:

1. **Pattern-Based Detection**: Regular expressions for detecting cross-CLI requests in multiple languages
2. **Modular Design**: Language patterns organized in a modular structure for easy maintenance and extension
3. **Intl API Integration**: Uses Node.js Intl API for language detection when possible
4. **Backward Compatibility**: Maintains full compatibility with existing English and Chinese patterns

## Component Design

### 1. Language Pattern Manager
Central component that manages language-specific patterns and provides pattern matching functionality.

### 2. Hook Template Generator
Extends the existing hook template generation to include multilingual patterns.

### 3. Language Detector
Uses environment variables and Intl API to detect user's preferred language.

### 4. Configuration Manager
Manages language configuration and pattern definitions.

## Data Models

### Language Pattern Structure
```javascript
{
  "languageCode": "en",
  "languageName": "English",
  "patterns": [
    {
      "name": "use pattern",
      "regex": "/(?:use|call|ask)\\s+(\\w+)\\s+(?:to|for)\\s+(.+)$/i",
      "example": "use claude to write code"
    },
    {
      "name": "direct addressing",
      "regex": "/(\\w+)[,\\s]+(?:please\\s+)?(?:help\\s+me\\s+)?(.+)$/i",
      "example": "claude, please help me"
    }
  ]
}
```

### Supported Languages Configuration
```javascript
const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    direction: 'ltr'
  },
  zh: {
    name: 'Chinese',
    direction: 'ltr'
  },
  ja: {
    name: 'Japanese',
    direction: 'ltr'
  },
  ko: {
    name: 'Korean',
    direction: 'ltr'
  },
  de: {
    name: 'German',
    direction: 'ltr'
  },
  fr: {
    name: 'French',
    direction: 'ltr'
  },
  es: {
    name: 'Spanish',
    direction: 'ltr'
  },
  it: {
    name: 'Italian',
    direction: 'ltr'
  },
  pt: {
    name: 'Portuguese',
    direction: 'ltr'
  },
  ru: {
    name: 'Russian',
    direction: 'ltr'
  },
  ar: {
    name: 'Arabic',
    direction: 'rtl'
  },
  tr: {
    name: 'Turkish',
    direction: 'ltr'
  }
};
```

## API Specifications

### LanguagePatternManager
```javascript
class LanguagePatternManager {
  // Get patterns for a specific language
  getPatterns(languageCode) {}
  
  // Get all patterns for all languages
  getAllPatterns() {}
  
  // Detect language from environment
  detectLanguage() {}
  
  // Match input against patterns
  detectCrossCLIRequest(input, preferredLanguage = null) {}
}
```

### HookTemplateGenerator
```javascript
class HookTemplateGenerator {
  // Generate hook template with multilingual support
  generateMultilingualHookTemplate(cliName) {}
}
```

## Error Handling
- Unsupported language patterns will gracefully fall back to English
- Malformed patterns will be skipped with warnings
- Missing Intl API support will fall back to environment variables
- Pattern matching failures will return null (no cross-CLI request detected)

## Testing Strategy

### Unit Tests
- Test pattern matching for each language
- Test language detection mechanisms
- Test backward compatibility with existing patterns
- Test error handling scenarios

### Integration Tests
- Test hook deployment with multilingual patterns
- Test cross-CLI communication with different languages
- Test CLI tool integration with language-specific commands

### Test Cases by Language
Each language will have test cases covering:
1. Primary pattern matching (e.g., "use ... to ...")
2. Direct addressing pattern (e.g., "..., ...")
3. Language-specific idioms and constructions

## Implementation Notes
1. All patterns will be stored as regular expressions with appropriate flags
2. Unicode support will be enabled for non-Latin scripts
3. Right-to-left languages (Arabic) will be handled appropriately
4. Language codes will follow ISO 639-1 standards
5. The system will prioritize user's preferred language but fall back to English
6. Patterns will be organized by language for easier maintenance
7. New languages can be added by simply adding a new pattern definition file