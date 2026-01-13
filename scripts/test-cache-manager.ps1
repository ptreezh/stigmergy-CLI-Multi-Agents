# Test script for DNASPEC Cache Manager
# Demonstrates the complete workflow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DNASPEC Cache Manager Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize cache
Write-Host "Step 1: Initialize cache system" -ForegroundColor Yellow
& .\scripts\cache-manager.ps1 -Operation "init-cache" -ProjectPath "."
Write-Host ""

# Step 2: Create a test file
Write-Host "Step 2: Create test file" -ForegroundColor Yellow
$testFile = "test-ai-generated.js"
$testContent = @"
/**
 * @file $testFile
 * @author AI Assistant (Claude 3.5 Sonnet)
 * @created 2026-01-13
 * @reviewed [PENDING]
 * @status draft
 */

// AI-generated test function
function calculateSum(a, b) {
    return a + b;
}

module.exports = { calculateSum };
"@
$testContent | Set-Content $testFile -NoNewline
Write-Host "✅ Created test file: $testFile" -ForegroundColor Green
Write-Host ""

# Step 3: Stage the file
Write-Host "Step 3: Stage the file" -ForegroundColor Yellow
& .\scripts\cache-manager.ps1 -Operation "stage-file" -ProjectPath "." -FilePath $testFile
Write-Host ""

# Step 4: Validate staged files
Write-Host "Step 4: Validate staged files" -ForegroundColor Yellow
& .\scripts\cache-manager.ps1 -Operation "validate-staged" -ProjectPath "."
Write-Host ""

# Step 5: Show cache status
Write-Host "Step 5: Show cache status" -ForegroundColor Yellow
& .\scripts\cache-manager.ps1 -Operation "cache-status" -ProjectPath "."
Write-Host ""

# Step 6: Commit validated files (commented out to avoid actual commit)
# Write-Host "Step 6: Commit validated files" -ForegroundColor Yellow
# & .\scripts\cache-manager.ps1 -Operation "commit-staged" -ProjectPath "." -Message "test: Add AI-generated test function"
# Write-Host ""

# Step 7: Cleanup cache
Write-Host "Step 6: Cleanup cache" -ForegroundColor Yellow
& .\scripts\cache-manager.ps1 -Operation "cleanup-cache" -ProjectPath "."
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To commit the validated file, run:" -ForegroundColor Cyan
Write-Host "   .\scripts\cache-manager.ps1 -Operation 'commit-staged' -ProjectPath '.' -Message 'test: Add AI-generated test function'" -ForegroundColor White
Write-Host ""
Write-Host "💡 To clean up test files, run:" -ForegroundColor Cyan
Write-Host "   Remove-Item $testFile -Force" -ForegroundColor White
Write-Host "   Remove-Item .cache -Recurse -Force" -ForegroundColor White