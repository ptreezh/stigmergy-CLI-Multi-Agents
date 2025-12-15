#!/usr/bin/env node

/**
 * Example script demonstrating the multilingual hook system
 */

const LanguagePatternManager = require('./src/core/multilingual/language-pattern-manager');

// Create an instance of the language pattern manager
const languageManager = new LanguagePatternManager();

// Example inputs in different languages
const examples = [
  // English
  'use claude to write a Python function',
  'please use gemini to explain quantum computing',
  'copilot, please help me create a React component',
  
  // Chinese
  '请用qwen帮我分析这段代码',
  '调用claude来写一个排序算法',
  '用gemini帮我翻译这段文档',
  'codebuddy，检查一下这个函数',
  '让copilot生成测试用例',
  
  // Japanese
  'claudeを使ってコードを書いて関数を作成',
  'geminiを呼び出して助けて説明して',
  'copilotにコード作成を依頼Reactコンポーネントを',
  'qwen、このコードを説明して',
  
  // Korean
  'claude로 코드 작성해 줘함수를 만들어',
  'gemini 호출해서 도와줘이걸 설명해',
  'copilot에게 코드 작성 요청리액트 컴포넌트',
  'qwen아 이 코드 설명해줄래',
  
  // German
  'benutze claude um code zu schreiben',
  'rufe gemini für hilfe an',
  'claude kannst du mir helfen code zu schreiben',
  'gemini, bitte erkläre diesen Code',
  
  // French
  'utilise claude pour écrire du code',
  'appelle gemini pour aider',
  'claude peux-tu aider à écrire une fonction',
  'gemini, s\'il te plaît explique ce code',
  
  // Spanish
  'usa claude para escribir código',
  'llama a gemini para ayuda',
  'claude puedes ayudar a escribir una función',
  'gemini, por favor explica este código',
  
  // Italian
  'usa claude per scrivere codice',
  'chiama gemini per aiuto',
  'claude puoi aiutare a scrivere una funzione',
  'gemini, per favore spiega questo codice',
  
  // Portuguese
  'use claude para escrever código',
  'chame o gemini para ajudar',
  'claude você pode ajudar a escrever uma função',
  'gemini, por favor explique este código',
  
  // Russian
  'используй claude чтобы написать код',
  'вызови gemini для помощи',
  'claude ты можешь помочь написать функцию',
  'gemini, пожалуйста объясни этот код',
  
  // Arabic
  'استخدم claude لكتابة الكود',
  'اتصل بـ gemini للمساعدة',
  'claude يمكنك المساعدة في كتابة دالة',
  'gemini، من فضلك اشرح هذا الكود',
  
  // Turkish
  'claude kullanarak kod yaz bir fonksiyon',
  'yardım için gemini çağır bunu açıkla',
  'claude yardım edebilir misin kod yazmak için',
  'gemini, lütfen bu kodu açıkla'
];

console.log('Multilingual Hook System Demo');
console.log('==============================\n');

// Test each example
examples.forEach((example, index) => {
  console.log(`${index + 1}. Input: "${example}"`);
  
  // Detect cross-CLI request
  const result = languageManager.detectCrossCLIRequest(example);
  
  if (result) {
    console.log(`   Detected:`);
    console.log(`     Target CLI: ${result.targetCLI}`);
    console.log(`     Task: ${result.task}`);
    console.log(`     Language: ${languageManager.supportedLanguages[result.language]?.name || result.language}`);
    console.log(`     Pattern: ${result.patternName}`);
  } else {
    console.log(`   No cross-CLI request detected`);
  }
  
  console.log('');
});

// Demonstrate language detection
console.log('Language Detection Demo');
console.log('=======================\n');

const detectedLanguage = languageManager.detectLanguage();
console.log(`Detected language: ${languageManager.supportedLanguages[detectedLanguage]?.name || detectedLanguage}`);

// Show all available patterns
console.log('\nAvailable Language Patterns');
console.log('===========================\n');

const allPatterns = languageManager.getAllPatterns();
Object.entries(allPatterns).forEach(([languageCode, patterns]) => {
  const languageName = languageManager.supportedLanguages[languageCode]?.name || languageCode;
  console.log(`${languageName} (${languageCode}): ${patterns.length} patterns`);
});