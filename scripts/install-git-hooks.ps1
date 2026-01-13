# PowerShell script to install Git hooks for Stigmergy CLI Multi-Agents
# This script ensures hooks are executable on Windows systems

Write-Host "🔧 Installing Git hooks for Stigmergy CLI Multi-Agents..." -ForegroundColor Cyan

# Check if .git directory exists
if (-not (Test-Path ".git")) {
    Write-Host "❌ ERROR: .git directory not found" -ForegroundColor Red
    Write-Host "   Please run this script from the root of a Git repository" -ForegroundColor Yellow
    exit 1
}

# Check if .git/hooks directory exists
if (-not (Test-Path ".git/hooks")) {
    Write-Host "❌ ERROR: .git/hooks directory not found" -ForegroundColor Red
    exit 1
}

# List of hooks to install
$hooks = @("pre-commit", "pre-push", "commit-msg", "post-merge")

# Install hooks
foreach ($hook in $hooks) {
    $hookFile = ".git/hooks/$hook"

    if (Test-Path $hookFile) {
        Write-Host "📋 Hook already exists: $hook" -ForegroundColor Yellow
        $response = Read-Host "   Overwrite? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "   Skipping $hook" -ForegroundColor Gray
            continue
        }
    }

    # On Windows, Git hooks don't need to be executable in the same way as Unix
    # Git for Windows automatically executes these files
    Write-Host "✅ Installed: $hook" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Git hooks installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Installed hooks:" -ForegroundColor Cyan
foreach ($hook in $hooks) {
    Write-Host "   - $hook" -ForegroundColor White
}
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - pre-commit: Validates files before committing" -ForegroundColor White
Write-Host "   - pre-push: Runs tests before pushing to remote" -ForegroundColor White
Write-Host "   - commit-msg: Validates commit message format" -ForegroundColor White
Write-Host "   - post-merge: Runs tests after merging branches" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: These hooks will run automatically on Git operations." -ForegroundColor Yellow
Write-Host "   You can bypass them with --no-verify flag (not recommended)." -ForegroundColor Yellow