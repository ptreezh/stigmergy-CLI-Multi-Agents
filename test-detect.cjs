const { spawnSync } = require('child_process');

function checkToolAvailable(cliName) {
    try {
        let result;
        if (process.platform === 'win32') {
            result = spawnSync('where', [cliName], { stdio: 'pipe' });
        } else {
            result = spawnSync('which', [cliName], { stdio: 'pipe' });
        }
        console.log(`${cliName} where result status: ${result.status}`);
        console.log(`${cliName} where result stdout: "${result.stdout.toString().trim()}"`);
        return result.status === 0;
    } catch (e) {
        console.log(`${cliName} where error: ${e.message}`);
        return false;
    }
}

console.log('Testing claude:');
console.log('Available:', checkToolAvailable('claude'));

console.log('\nTesting gemini:');
console.log('Available:', checkToolAvailable('gemini'));