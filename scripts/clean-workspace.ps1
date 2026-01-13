# PowerShell script to clean AI-generated temporary files from workspace
# This script removes .tmp., .draft., and .review. files according to DNASPEC rules

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false,
    [switch]$IncludeDraft = $false,
    [switch]$IncludeReview = $false
)

Write-Host "🧹 Cleaning AI-generated temporary files from workspace" -ForegroundColor Cyan

# Define file patterns
$patterns = @("*.tmp.*")

if ($IncludeDraft) {
    $patterns += "*.draft.*"
}

if ($IncludeReview) {
    $patterns += "*.review.*"
}

# Directories to exclude
$excludeDirs = @("node_modules", ".git", "dist", "build", "coverage", ".next", "out")

Write-Host ""
Write-Host "📋 Search patterns:" -ForegroundColor Cyan
$patterns | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }

Write-Host ""
Write-Host "🚫 Excluding directories:" -ForegroundColor Cyan
$excludeDirs | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }

Write-Host ""

# Find files
$filesToRemove = @()
foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object {
                 $file = $_
                 -not ($excludeDirs | Where-Object { $file.FullName -like "*\$_\*" })
             }
    $filesToRemove += $files
}

if ($filesToRemove.Count -eq 0) {
    Write-Host "✅ No temporary files found!" -ForegroundColor Green
    exit 0
}

Write-Host "📊 Found $($filesToRemove.Count) temporary file(s):" -ForegroundColor Yellow
Write-Host ""

# Group by file type
$tmpFiles = $filesToRemove | Where-Object { $_.Name -match "\.tmp\." }
$draftFiles = $filesToRemove | Where-Object { $_.Name -match "\.draft\." }
$reviewFiles = $filesToRemove | Where-Object { $_.Name -match "\.review\." }

if ($tmpFiles.Count -gt 0) {
    Write-Host "📝 Temporary files ($($tmpFiles.Count)):" -ForegroundColor Yellow
    $tmpFiles | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "   - $($_.FullName) ($size KB)" -ForegroundColor White
    }
}

if ($draftFiles.Count -gt 0 -and $IncludeDraft) {
    Write-Host "📄 Draft files ($($draftFiles.Count)):" -ForegroundColor Yellow
    $draftFiles | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "   - $($_.FullName) ($size KB)" -ForegroundColor White
    }
}

if ($reviewFiles.Count -gt 0 -and $IncludeReview) {
    Write-Host "📑 Review files ($($reviewFiles.Count)):" -ForegroundColor Yellow
    $reviewFiles | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "   - $($_.FullName) ($size KB)" -ForegroundColor White
    }
}

Write-Host ""

# Calculate total size
$totalSize = ($filesToRemove | Measure-Object -Property Length -Sum).Sum
$totalSizeKB = [math]::Round($totalSize / 1KB, 2)
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "💾 Total size: $totalSizeKB KB ($totalSizeMB MB)" -ForegroundColor Cyan
Write-Host ""

# Dry run mode
if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
    Write-Host "   Use -Force flag to actually delete files" -ForegroundColor Yellow
    exit 0
}

# Confirm deletion
if (-not $Force) {
    $confirm = Read-Host "Delete these files? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        exit 0
    }
}

# Delete files
Write-Host "🗑️  Deleting files..." -ForegroundColor Yellow
$deletedCount = 0
$errorCount = 0

foreach ($file in $filesToRemove) {
    try {
        Remove-Item -Path $file.FullName -Force
        Write-Host "   ✅ Deleted: $($file.Name)" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "   ❌ Error deleting: $($file.Name)" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Deleted: $deletedCount file(s)" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "   ❌ Errors: $errorCount" -ForegroundColor Red
}

if ($deletedCount -gt 0) {
    Write-Host ""
    Write-Host "💡 Tip: Consider committing these deletions with:" -ForegroundColor Cyan
    Write-Host "   git add -A" -ForegroundColor White
    Write-Host "   git commit -m 'chore: Clean AI temporary files'" -ForegroundColor White
}

exit 0