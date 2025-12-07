#!/usr/bin/env node

/**
 * Create a test CLI to simulate AI CLI installation
 */

const fs = require('fs');
const path = require('path');

async function createTestCLI(cliName) {
    const installDir = path.join(require('os').homedir(), '.stigmergy-test');
    const cliFile = path.join(installDir, `${cliName.toLowerCase()}.cmd`);
    const cliScript = path.join(installDir, `${cliName.toLowerCase()}.js`);

    // Create JavaScript CLI
    const script = `#!/usr/bin/env node
console.log('${cliName} CLI v1.0.0 - Test AI CLI Tool');
console.log('This is a test CLI for stigmergy integration testing');

if (process.argv.includes('--version')) {
    console.log('${cliName.toLowerCase()} v1.0.0');
    process.exit(0);
}

if (process.argv.includes('--help')) {
    console.log('Usage: ${cliName.toLowerCase()} [options]');
    console.log('  --version    Show version');
    console.log('  --help       Show this help');
    console.log('  <prompt>     Process AI prompt');
    process.exit(0);
}

// Process prompt
const prompt = process.argv.slice(2).join(' ');
if (prompt) {
    console.log(\`[PROCESSING] \${prompt}\`);
    console.log('[RESULT] Test response from ${cliName}');
    console.log('[TIME] Processing completed');
}
`;

    // Create Windows batch file
    const batch = `@echo off
node "${cliScript}" %*
`;

    await fs.mkdir(installDir, { recursive: true });
    await fs.writeFile(cliScript, script);
    await fs.writeFile(cliFile, batch);

    // Add to PATH for this session
    process.env.PATH = `${installDir};${process.env.PATH}`;

    console.log(`[TEST] Created test CLI: ${cliName}`);
    console.log(`[PATH] ${installDir}`);

    return {
        name: cliName,
        path: installDir,
        command: cliFile.replace(/\\/g, '/'),
        script: cliScript.replace(/\\/g, '/')
    };
}

// Create 2 test CLIs
async function main() {
    console.log('[SETUP] Creating test AI CLI tools...');

    const testClaude = await createTestCLI('Claude');
    const testGemini = await createTestCLI('Gemini');

    console.log(`[OK] Created test CLIs:`);
    console.log(`  - ${testClaude.name}: ${testClaude.command}`);
    console.log(`  - ${testGemini.name}: ${testGemini.command}`);

    // Test the CLIs
    console.log('\n[TEST] Testing created CLIs...');

    const { spawnSync } = require('child_process');

    const claudeTest = spawnSync('claude', ['--version'], {
        encoding: 'utf8',
        timeout: 5000,
        env: { ...process.env, PATH: testClaude.path + ';' + process.env.PATH }
    });

    const geminiTest = spawnSync('gemini', ['--version'], {
        encoding: 'utf8',
        timeout: 5000,
        env: { ...process.env, PATH: testGemini.path + ';' + process.env.PATH }
    });

    console.log(`Claude CLI: ${claudeTest.status === 0 ? 'Working' : 'Not working'}`);
    console.log(`Gemini CLI: ${geminiTest.status === 0 ? 'Working' : 'Not working'}`);
}

if (require.main === module) {
    main();
}