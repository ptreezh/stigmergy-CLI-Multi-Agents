// Debug script to see what keywords are generated for each tool
const SmartRouter = require('./src/core/smart_router');

async function debugKeywords() {
  console.log('Debug: Analyzing keywords for each tool...\n');
  
  try {
    const router = new SmartRouter();
    await router.initialize();
    
    // Manually test keyword extraction for each tool
    for (const [toolName, _] of Object.entries(router.tools)) {
      console.log(`Tool: ${toolName}`);
      const keywords = router.extractKeywords(toolName, null);
      console.log(`  Keywords: [${keywords.map(k => `"${k}"`).join(', ')}]`);
      console.log('');
    }
    
    // Test specific inputs
    console.log('Testing specific inputs:');
    
    const testInputs = [
      'codex to write code',
      'use codex to write code', 
      'use claude to explain this code',
      'use qodercli to help with code'
    ];
    
    for (const input of testInputs) {
      console.log(`\nAnalyzing: "${input}"`);
      
      for (const [toolName, _] of Object.entries(router.tools)) {
        const keywords = router.extractKeywords(toolName, null);
        const matchedKeywords = [];
        
        for (const keyword of keywords) {
          if (input.toLowerCase().includes(keyword.toLowerCase())) {
            matchedKeywords.push(keyword);
          }
        }
        
        if (matchedKeywords.length > 0) {
          console.log(`  ${toolName}: matched keywords [${matchedKeywords.map(k => `"${k}"`).join(', ')}]`);
        }
      }
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugKeywords();
