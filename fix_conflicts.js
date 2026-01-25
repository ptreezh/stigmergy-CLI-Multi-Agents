const fs = require('fs');
const path = require('path');

// Read the file
let content = fs.readFileSync('D:/stigmergy-CLI-Multi-Agents/src/core/cli_help_analyzer.js', 'utf8');

// Count conflicts before
const conflictsBefore = (content.match(/<<<<<<< HEAD/g) || []).length;
console.log(`Found ${conflictsBefore} conflicts before processing`);

// Remove all merge conflict markers and their content
// This regex finds the entire conflict block and replaces it with the HEAD content
let processedContent = content;
const conflictRegex = /<<<<<<< HEAD\s*([\s\S]*?)=======\s*[\s\S]*?>>>>>>> [a-f0-9]{40}/g;

processedContent = processedContent.replace(conflictRegex, (match, headContent) => {
  return headContent.trim();
});

// Count conflicts after
const conflictsAfterFinal = (processedContent.match(/<<<<<<< HEAD/g) || []).length;
console.log(`Found ${conflictsAfterFinal} conflicts after processing`);

// Handle any remaining conflict markers that might not have had the expected format
processedContent = processedContent.replace(/<<<<<<< HEAD[\s\S]*?>>>>>>> [a-f0-9]{40}/g, '');

// Final count
const finalCount = (processedContent.match(/<<<<<<< HEAD/g) || []).length;
console.log(`Found ${finalCount} conflicts after final processing`);

// Write the file back
fs.writeFileSync('D:/stigmergy-CLI-Multi-Agents/src/core/cli_help_analyzer.js', processedContent);
console.log('Merge conflicts resolved');