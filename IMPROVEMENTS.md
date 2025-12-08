# Stigmergy Package Improvements

## Current State Analysis

After thorough testing, I've identified areas where the Stigmergy package can be improved to provide better user experience during installation and error handling.

## Issues Identified

### 1. Limited Error Handling in Auto-Install
The auto-install process lacks granular error handling within the individual steps. While the main function has basic error catching, the auto-install section does not have specific try-catch blocks for each step.

### 2. No Graceful Degradation for Individual Step Failures
If one step fails during auto-install (e.g., deployHooks), the entire process may fail without providing specific guidance to the user.

## Recommended Improvements

### 1. Enhanced Error Handling in Auto-Install Section

```javascript
case 'auto-install':
    // Auto-install mode for npm postinstall - NON-INTERACTIVE
    console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
    console.log('='.repeat(60));

    try {
        // Step 1: Download required assets
        try {
            console.log('[STEP] Downloading required assets...');
            await installer.downloadRequiredAssets();
            console.log('[OK] Assets downloaded successfully');
        } catch (error) {
            console.log(`[WARN] Failed to download assets: ${error.message}`);
            console.log('[INFO] Continuing with installation...');
        }

        // Step 2: Scan for CLI tools
        let autoAvailable = {}, autoMissing = {};
        try {
            console.log('[STEP] Scanning for CLI tools...');
            const scanResult = await installer.scanCLI();
            autoAvailable = scanResult.available;
            autoMissing = scanResult.missing;
            console.log('[OK] CLI tools scanned successfully');
        } catch (error) {
            console.log(`[WARN] Failed to scan CLI tools: ${error.message}`);
            console.log('[INFO] Continuing with installation...');
        }

        // Step 3: Show summary to user after installation
        try {
            if (Object.keys(autoMissing).length > 0) {
                console.log('\n[INFO] Found ' + Object.keys(autoMissing).length + ' missing AI CLI tools:');
                for (const [toolName, toolInfo] of Object.entries(autoMissing)) {
                    console.log(`  - ${toolInfo.name} (${toolName})`);
                }
                console.log('\n[INFO] Auto-install mode detected. Skipping automatic installation of missing tools.');
                console.log('[INFO] For full functionality, please run "stigmergy install" after installation completes.');
            } else {
                console.log('\n[INFO] All AI CLI tools are already installed! No additional tools required.');
            }
        } catch (error) {
            console.log(`[WARN] Failed to show tool summary: ${error.message}`);
        }

        // Step 4: Deploy hooks to available CLI tools
        try {
            console.log('[STEP] Deploying hooks to available CLI tools...');
            await installer.deployHooks(autoAvailable);
            console.log('[OK] Hooks deployed successfully');
        } catch (error) {
            console.log(`[ERROR] Failed to deploy hooks: ${error.message}`);
            console.log('[INFO] You can manually deploy hooks later by running: stigmergy deploy');
        }

        // Step 5: Deploy project documentation
        try {
            console.log('[STEP] Deploying project documentation...');
            await installer.deployProjectDocumentation();
            console.log('[OK] Documentation deployed successfully');
        } catch (error) {
            console.log(`[WARN] Failed to deploy documentation: ${error.message}`);
            console.log('[INFO] Continuing with installation...');
        }

        // Step 6: Initialize configuration
        try {
            console.log('[STEP] Initializing configuration...');
            await installer.initializeConfig();
            console.log('[OK] Configuration initialized successfully');
        } catch (error) {
            console.log(`[ERROR] Failed to initialize configuration: ${error.message}`);
            console.log('[INFO] You can manually initialize configuration later by running: stigmergy setup');
        }

        // Step 7: Show final message to guide users
        console.log('\n[SUCCESS] Stigmergy CLI installed successfully!');
        console.log('[USAGE] Run "stigmergy setup" to complete full configuration and install missing AI CLI tools.');
        console.log('[USAGE] Run "stigmergy install" to install only missing AI CLI tools.');
        console.log('[USAGE] Run "stigmergy --help" to see all available commands.');
    } catch (fatalError) {
        console.error('[FATAL] Auto-install process failed:', fatalError.message);
        console.log('\n[TROUBLESHOOTING] To manually complete installation:');
        console.log('1. Run: stigmergy setup    # Complete setup');
        console.log('2. Run: stigmergy install  # Install missing tools');
        console.log('3. Run: stigmergy deploy   # Deploy hooks manually');
        process.exit(1);
    }
    break;
```

### 2. Improved DeployHooks Error Handling

The deployHooks function should also have better error handling:

```javascript
async deployHooks(available) {
    console.log('\n[DEPLOY] Deploying cross-CLI integration hooks...');

    // Import the post-deployment configurer for executing installation scripts
    const { PostDeploymentConfigurer } = require('./../scripts/post-deployment-config.js');
    const configurer = new PostDeploymentConfigurer();

    let successCount = 0;
    let totalCount = Object.keys(available).length;

    for (const [toolName, toolInfo] of Object.entries(available)) {
        console.log(`\n[DEPLOY] Deploying hooks for ${toolInfo.name}...`);

        try {
            await fs.mkdir(toolInfo.hooksDir, { recursive: true });

            // Create config directory (not the config file itself)
            const configDir = path.dirname(toolInfo.config);
            await fs.mkdir(configDir, { recursive: true });

            // Copy adapter files from local assets
            // Mapping for tool names that don't match their adapter directory names
            const toolNameToAdapterDir = {
                'qodercli': 'qoder',
                'qwencode': 'qwen'
            };
            const adapterDirName = toolNameToAdapterDir[toolName] || toolName;
            const assetsAdaptersDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters', adapterDirName);
            if (await this.fileExists(assetsAdaptersDir)) {
                await this.copyDirectory(assetsAdaptersDir, toolInfo.hooksDir);
                console.log(`[OK] Copied adapter files for ${toolInfo.name}`);
            }

            // NEW: Execute the installation script to complete configuration
            console.log(`[CONFIG] Running installation script for ${toolInfo.name}...`);
            const installResult = await configurer.configureTool(toolName);
            if (installResult.runSuccess) {
                console.log(`[OK] ${toolInfo.name} configured successfully`);
                successCount++;
            } else {
                console.log(`[WARN] ${toolInfo.name} configuration failed: ${installResult.error || 'Unknown error'}`);
                console.log(`[INFO] You can manually configure ${toolInfo.name} later by running the installation script`);
            }

            console.log(`[OK] Created directories for ${toolInfo.name}`);
            console.log(`[INFO] Hooks directory: ${toolInfo.hooksDir}`);
            console.log(`[INFO] Config directory: ${configDir}`);
        } catch (error) {
            console.log(`[ERROR] Failed to deploy hooks for ${toolInfo.name}: ${error.message}`);
            console.log(`[INFO] You can manually deploy hooks for ${toolInfo.name} later by running: stigmergy deploy`);
        }
    }

    console.log(`\n[SUMMARY] Hook deployment completed: ${successCount}/${totalCount} tools configured successfully`);
    
    if (successCount < totalCount) {
        console.log(`[INFO] ${totalCount - successCount} tools failed to configure. See warnings above for details.`);
        console.log(`[INFO] Run 'stigmergy deploy' to retry configuration for failed tools.`);
    }
    
    return successCount > 0; // Return true if at least one tool was configured successfully
}
```

## Benefits of These Improvements

1. **Better User Experience**: Users will get specific error messages and guidance instead of generic failures
2. **Graceful Degradation**: If one step fails, the installation can continue with other steps
3. **Clear Troubleshooting**: Users will know exactly what failed and how to fix it
4. **Manual Recovery Options**: Users can manually complete failed steps after the initial installation
5. **Progress Tracking**: Users can see which tools were successfully configured and which failed

## Implementation Priority

1. **High Priority**: Enhanced error handling in auto-install section
2. **Medium Priority**: Improved deployHooks error handling with summary
3. **Low Priority**: Additional logging and user guidance enhancements

These improvements would make the Stigmergy package much more robust and user-friendly, especially for users who might encounter issues during installation.