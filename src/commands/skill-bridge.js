/**
 * Skill Command Bridge - ES Module Bridge Script
 * 
 * This script acts as a bridge between CommonJS and ES modules
 */

import { handleSkillCommand } from './skill.js';

// Parse command line arguments
const args = process.argv.slice(2);
const action = args[0];
const commandArgs = [];
const options = {};

// Parse arguments and options
for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
        // Options
        const optName = arg.substring(2);
        if (optName === 'force') options.force = true;
        else if (optName === 'verbose') options.verbose = true;
        else if (optName === 'no-auto-sync') options.autoSync = false;
    } else {
        // Arguments
        commandArgs.push(arg);
    }
}

// Execute command
handleSkillCommand(action, commandArgs, options)
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(`❌ Command failed: ${err.message}`);
        process.exit(1);
    });
