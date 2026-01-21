# PowerShell script to generate workspace status report
# This script provides a comprehensive report of the current workspace state

param(
    [switch]$Detailed = $false
)

Write-Host "📊 Workspace Status Report" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Gray
Write-Host ""

# Git Information
Write-Host "🔹 Git Information" -ForegroundColor Cyan
Write-Host "   Branch: $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor White
Write-Host "   Commit: $(git rev-parse --short HEAD)" -ForegroundColor White
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) { $remoteUrl = "No remote configured" }
Write-Host "   Remote: $remoteUrl" -ForegroundColor White

# Uncommitted Changes
Write-Host ""
Write-Host "🔹 Uncommitted Changes" -ForegroundColor Cyan
$uncommitted = git status --porcelain
if ($uncommitted) {
    $modified = $uncommitted | Where-Object { $_ -match "^ M" }
    $added = $uncommitted | Where-Object { $_ -match "^A" }
    $deleted = $uncommitted | Where-Object { $_ -match "^ D" }
    $untracked = $uncommitted | Where-Object { $_ -match "^??" }

    Write-Host "   Modified: $($modified.Count) file(s)" -ForegroundColor $(if ($modified.Count -gt 0) { "Yellow" } else { "Green" })
    Write-Host "   Added: $($added.Count) file(s)" -ForegroundColor $(if ($added.Count -gt 0) { "Yellow" } else { "Green" })
    Write-Host "   Deleted: $($deleted.Count) file(s)" -ForegroundColor $(if ($deleted.Count -gt 0) { "Yellow" } else { "Green" })
    Write-Host "   Untracked: $($untracked.Count) file(s)" -ForegroundColor $(if ($untracked.Count -gt 0) { "Yellow" } else { "Green" })

    if ($Detailed -and $uncommitted) {
        Write-Host ""
        Write-Host "   Details:" -ForegroundColor Gray
        $uncommitted | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}

# AI File Statistics
Write-Host ""
Write-Host "🔹 AI File Statistics" -ForegroundColor Cyan

$tmpFiles = Get-ChildItem -Path . -Filter "*.tmp.*" -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }
$draftFiles = Get-ChildItem -Path . -Filter "*.draft.*" -Recurse -File -ErrorAction SilentlyContinue |
              Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }
$reviewFiles = Get-ChildItem -Path . -Filter "*.review.*" -Recurse -File -ErrorAction SilentlyContinue |
               Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }

Write-Host "   Temporary files: $($tmpFiles.Count)" -ForegroundColor $(if ($tmpFiles.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Draft files: $($draftFiles.Count)" -ForegroundColor $(if ($draftFiles.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Review files: $($reviewFiles.Count)" -ForegroundColor $(if ($reviewFiles.Count -gt 0) { "Yellow" } else { "Green" })

if ($Detailed) {
    if ($tmpFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "   Temporary files:" -ForegroundColor Gray
        $tmpFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Gray }
    }
    if ($draftFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "   Draft files:" -ForegroundColor Gray
        $draftFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Gray }
    }
    if ($reviewFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "   Review files:" -ForegroundColor Gray
        $reviewFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Gray }
    }
}

# Git Hooks Status
Write-Host ""
Write-Host "🔹 Git Hooks Status" -ForegroundColor Cyan
$requiredHooks = @("pre-commit", "pre-push", "commit-msg", "post-merge")
$installedHooks = @()

foreach ($hook in $requiredHooks) {
    if (Test-Path ".git/hooks/$hook") {
        $installedHooks += $hook
    }
}

Write-Host "   Installed: $($installedHooks.Count)/$($requiredHooks.Count)" -ForegroundColor $(if ($installedHooks.Count -eq $requiredHooks.Count) { "Green" } else { "Yellow" })
Write-Host "   Hooks: $($installedHooks -join ', ')" -ForegroundColor White

# Project Constitution
Write-Host ""
Write-Host "🔹 Project Constitution" -ForegroundColor Cyan
if (Test-Path ".git/CONSTITUTION.md") {
    Write-Host "   ✅ Constitution file exists" -ForegroundColor Green
    $constitution = Get-Content ".git/CONSTITUTION.md" -Raw
    if ($constitution -match "Version: ([\d.]+)") {
        Write-Host "   Version: $($matches[1])" -ForegroundColor White
    }
} else {
    Write-Host "   ❌ Constitution file not found" -ForegroundColor Red
}

# File Statistics
Write-Host ""
Write-Host "🔹 File Statistics" -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }

$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum
$totalSizeKB = [math]::Round($totalSize / 1KB, 2)
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "   Total files: $($allFiles.Count)" -ForegroundColor White
Write-Host "   Total size: $totalSizeKB KB ($totalSizeMB MB)" -ForegroundColor White

# Recent Commits
Write-Host ""
Write-Host "🔹 Recent Commits" -ForegroundColor Cyan
$recentCommits = git log --oneline -n 5
if ($recentCommits) {
    $recentCommits | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "   No commits yet" -ForegroundColor Gray
}

# Branches
Write-Host ""
Write-Host "🔹 Branches" -ForegroundColor Cyan
$branches = git branch -a
if ($branches) {
    $branches | ForEach-Object {
        $branchName = $_.Trim()
        if ($branchName -match "^\*") {
            Write-Host "   $branchName (current)" -ForegroundColor Green
        } else {
            Write-Host "   $branchName" -ForegroundColor White
        }
    }
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Gray
Write-Host "✅ Status Report Completed" -ForegroundColor Green

if ($tmpFiles.Count -gt 0 -or $draftFiles.Count -gt 0 -or $reviewFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Cyan
    Write-Host "   - Clean temporary files: .\scripts\clean-workspace.ps1" -ForegroundColor White
    Write-Host "   - Enforce rules: .\scripts\enforce-rules.ps1" -ForegroundColor White
}

exit 0