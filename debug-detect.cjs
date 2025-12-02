const { spawnSync } = require('child_process');

// 复制原来的检测逻辑
function checkToolAvailable(cliName) {
    try {
        let result;
        if (process.platform === 'win32') {
            result = spawnSync('where', [cliName], { stdio: 'pipe' });
        } else {
            result = spawnSync('which', [cliName], { stdio: 'pipe' });
        }
        console.log(`${cliName}: status=${result.status}, stdout="${result.stdout.toString().trim()}"`);
        return result.status === 0;
    } catch (e) {
        console.log(`${cliName}: error=${e.message}`);
        // 如果系统命令失败，尝试npm检查
        try {
            const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
            if (npmResult.status === 0 && npmResult.stdout) {
                return npmResult.stdout.includes(cliName);
            }
        } catch (e2) {
            // 忽略npm检查错误
        }
        return false;
    }
}

console.log('Testing detection logic:');
console.log('Claude available:', checkToolAvailable('claude'));
console.log('Gemini available:', checkToolAvailable('gemini'));