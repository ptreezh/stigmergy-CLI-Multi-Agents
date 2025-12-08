# Claude and iFlow CLI Integration Issues Analysis

## Executive Summary

After detailed investigation, we've identified the root causes of the integration issues with Claude and iFlow CLIs:

1. **Claude CLI**: The issue is not with the tool itself, which works correctly when called directly. The problem lies in how the Stigmergy CLI passes parameters to the tool.

2. **iFlow CLI**: The tool works correctly when called with the proper flags. The issue is that iFlow requires the `-p` flag for non-interactive mode, similar to how Qoder CLI works.

## Detailed Analysis

### Claude CLI Issues

**Problem**: 
When calling Claude CLI through Stigmergy, the tool receives no output despite working correctly when called directly.

**Root Cause**:
The issue is in the parameter passing mechanism in `src/main_english.js`. Looking at lines 852-856, the code treats Claude CLI differently by wrapping the prompt in quotes:

```javascript
if (route.tool === 'claude') {
    // Claude CLI expects the prompt as a quoted string
    toolArgs = [`"${route.prompt}"`];
}
```

However, this approach may not be working correctly with the shell execution.

**Evidence**:
1. Direct call works: `claude "write a simple Python function to add two numbers"`
2. Stigmergy call fails: `node src/main_english.js call "claude write a simple Python function to add two numbers"`

### iFlow CLI Issues

**Problem**:
Similar to Claude, iFlow works correctly when called directly with the proper flags but fails through Stigmergy.

**Root Cause**:
iFlow requires the `-p` flag for non-interactive mode, but the Stigmergy CLI is not using this flag. Looking at lines 856-862 in `src/main_english.js`, there's no special handling for iFlow:

```javascript
} else if (route.tool === 'qodercli') {
    // Qoder CLI expects the prompt with -p flag
    toolArgs = ['-p', `"${route.prompt}"`];
} else {
    // For other tools, pass the prompt as a single argument
    toolArgs = [route.prompt];
}
```

**Evidence**:
1. Direct call with flag works: `iflow -p "write a basic function to check if a number is even"`
2. Direct call without flag fails: `iflow "write a basic function to check if a number is even"`
3. Stigmergy call fails because it doesn't use the `-p` flag

## Recommendations

### Immediate Fixes

1. **Update parameter handling for Claude CLI**:
   Modify the parameter passing logic to ensure Claude CLI receives the prompt correctly.

2. **Add special handling for iFlow CLI**:
   Add a specific condition for iFlow CLI to use the `-p` flag, similar to Qoder CLI.

### Code Changes Needed

In `src/main_english.js`, update the tool argument handling section (around lines 852-862):

```javascript
// For different tools, we need to pass the prompt differently
let toolArgs = [];
if (route.tool === 'claude') {
    // Claude CLI expects the prompt as a quoted string
    toolArgs = ['-p', `"${route.prompt}"`];  // Change this line
} else if (route.tool === 'qodercli' || route.tool === 'iflow') {
    // Qoder CLI and iFlow expect the prompt with -p flag
    toolArgs = ['-p', `"${route.prompt}"`];
} else {
    // For other tools, pass the prompt as a single argument
    toolArgs = [route.prompt];
}
```

### Testing Plan

1. Apply the code changes
2. Test Claude CLI integration:
   ```bash
   node src/main_english.js call "claude write a simple Python function to add two numbers"
   ```
3. Test iFlow CLI integration:
   ```bash
   node src/main_english.js call "iflow write a basic function to check if a number is even"
   ```
4. Verify that other tools still work correctly

## Additional Observations

1. **Smart Router Functionality**: The SmartRouter correctly identifies Claude and iFlow based on keywords, so the routing logic is working properly.

2. **Tool Availability**: Both Claude and iFlow are properly installed and accessible from the command line.

3. **Error Handling**: The error handling in the current implementation doesn't provide enough detail about why the tools are failing, which made debugging more difficult.

## Conclusion

The integration issues with Claude and iFlow CLIs are due to incorrect parameter passing rather than fundamental problems with the tools themselves. With the recommended changes to the argument handling logic, both tools should work correctly through the Stigmergy CLI system.