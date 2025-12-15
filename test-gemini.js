const { spawn } = require('child_process');

const testGemini = () => {
  return new Promise((resolve) => {
    const child = spawn('gemini', ['--version'], {
      stdio: 'pipe',
      shell: true,
      windowsHide: true
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
      console.log('Exit code:', code);
      console.log('STDOUT length:', stdout.length);
      console.log('STDERR length:', stderr.length);
      console.log('STDERR contains ERR_MODULE_NOT_FOUND:', stderr.includes('ERR_MODULE_NOT_FOUND'));
      console.log('STDERR contains Cannot find module:', stderr.includes('Cannot find module'));
      console.log('STDERR content:', JSON.stringify(stderr));
      console.log('Lowercase STDERR:', stderr.toLowerCase());

      // Check for serious errors
      const hasSeriousError = stderr.includes('ERR_MODULE_NOT_FOUND') ||
          stderr.includes('Cannot find module') ||
          stderr.includes('command not found') ||
          stderr.includes('is not recognized');

      if (hasSeriousError) {
        console.log('Detected serious error - NOT available');
        resolve(false);
        return;
      }

      const hasOutput = stdout.length > 0 || (stderr.length > 0 && !stderr.includes('Error'));
      console.log('Has output:', hasOutput);
      console.log('Available (0,1,255):', code === 0 || code === 1 || code === 255);
      console.log('Final decision:', (code === 0 || code === 1 || code === 255) && hasOutput);
      resolve((code === 0 || code === 1 || code === 255) && hasOutput);
    });

    child.on('error', (err) => {
      console.log('Spawn error:', err.message);
      resolve(false);
    });
  });
};

testGemini().then(result => console.log('Result:', result));
