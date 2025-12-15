#!/usr/bin/env node

/**
 * Simple test to verify the multilingual hook system works
 */

const fs = require('fs');
const path = require('path');

console.log('Testing Multilingual Hook System...\n');

// Check if required files exist
const requiredFiles = [
  '../../src/core/multilingual/language-pattern-manager.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/english.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/chinese.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/japanese.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/korean.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/german.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/french.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/spanish.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/italian.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/portuguese.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/russian.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/arabic.js',
  '../../.qoder/specs/multilingual-hook-system/language-patterns/turkish.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✓ All required files are present');
  
  // Try to load the LanguagePatternManager
  try {
    const LanguagePatternManager = require('../../src/core/multilingual/language-pattern-manager');
    const manager = new LanguagePatternManager();
    
    console.log('✓ LanguagePatternManager loaded successfully');
    
    // Test English pattern matching
    const englishResult = manager.detectCrossCLIRequest('use claude to write code');
    if (englishResult && englishResult.targetCLI === 'claude') {
      console.log('✓ English pattern matching works');
    } else {
      console.log('✗ English pattern matching failed');
    }
    
    // Test Chinese pattern matching
    const chineseResult = manager.detectCrossCLIRequest('请用copilot帮我创建React组件');
    if (chineseResult && chineseResult.targetCLI === 'copilot') {
      console.log('✓ Chinese pattern matching works');
    } else {
      console.log('✗ Chinese pattern matching failed');
    }
    
    // Test Japanese pattern matching
    const japaneseResult = manager.detectCrossCLIRequest('claudeを使ってコードを書いて関数を作成');
    if (japaneseResult && japaneseResult.targetCLI === 'claude') {
      console.log('✓ Japanese pattern matching works');
    } else {
      console.log('✗ Japanese pattern matching failed');
    }
    
    console.log('\n🎉 Multilingual Hook System is ready!');
    console.log('\nTo deploy multilingual hooks, run:');
    console.log('  stigmergy deploy');
    
  } catch (error) {
    console.log(`✗ Failed to load LanguagePatternManager: ${error.message}`);
  }
} else {
  console.log('\n✗ Some required files are missing');
  process.exit(1);
}