const { spawnSync } = require('child_process');

// Test where command for claude
console.log('Testing where command for claude:');
const result = spawnSync('where', ['claude'], { stdio: 'pipe' });
console.log('Status:', result.status);
console.log('Stdout:', result.stdout.toString());
console.log('Stderr:', result.stderr.toString());

const isAvailable = result.status === 0;
console.log('Is available?', isAvailable);