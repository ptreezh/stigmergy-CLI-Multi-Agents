import { spawn } from 'child_process';

function testTool(toolName, versionCommand) {
    return new Promise((resolve) => {
        const [baseCommand, ...args] = versionCommand;
        
        // 在Windows上尝试带.cmd扩展名的命令
        const commandsToTry = process.platform === 'win32' 
            ? [`${baseCommand}.cmd`, baseCommand]
            : [baseCommand];
        
        let attempts = 0;
        
        const tryNextCommand = () => {
            if (attempts >= commandsToTry.length) {
                resolve(false);
                return;
            }
            
            const command = commandsToTry[attempts];
            attempts++;
            
            console.log(`Testing ${toolName} with command: ${command} ${args.join(' ')}`);
            
            const child = spawn(command, args, {
                stdio: 'pipe',
                timeout: 5000
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                console.log(`${toolName} exit code: ${code}`);
                console.log(`${toolName} stdout: "${stdout.trim()}"`);
                console.log(`${toolName} stderr: "${stderr.trim()}"`);
                if (code === 0 && (stdout.trim() !== '' || stderr.trim() !== '')) {
                    resolve(true);
                } else {
                    tryNextCommand();
                }
            });

            child.on('error', (error) => {
                console.log(`${toolName} error: ${error.message}`);
                tryNextCommand();
            });
        };
        
        tryNextCommand();
    });
}

// 测试Claude
testTool('claude', ['claude', '--version']).then(result => {
    console.log(`Claude available: ${result}`);
});

// 测试Gemini
testTool('gemini', ['gemini', '--version']).then(result => {
    console.log(`Gemini available: ${result}`);
});