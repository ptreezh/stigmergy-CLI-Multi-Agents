# PowerShell script to enforce Git rules and project constitution
# This script validates the current state against DNASPEC rules

param(
    [switch]$Fix = $false,
    [switch]$Strict = $false
)

Write-Host "🔒 Enforcing Git Rules and Project Constitution" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# Check 1: Verify Git hooks are installed
Write-Host ""
Write-Host "📋 Check 1: Git Hooks" -ForegroundColor Cyan
$requiredHooks = @("pre-commit", "pre-push", "commit-msg", "post-merge")
$missingHooks = @()

foreach ($hook in $requiredHooks) {
    $hookPath = ".git/hooks/$hook"
    if (-not (Test-Path $hookPath)) {
        $missingHooks += $hook
    }
}

if ($missingHooks.Count -gt 0) {
    $errors += "Missing Git hooks: $($missingHooks -join ', ')"
    Write-Host "   ❌ Missing hooks: $($missingHooks -join ', ')" -ForegroundColor Red
} else {
    Write-Host "   ✅ All required hooks installed" -ForegroundColor Green
}

# Check 2: Check for prohibited files
Write-Host ""
Write-Host "📋 Check 2: Prohibited Files" -ForegroundColor Cyan
$prohibitedExtensions = @("*.bin", "*.exe", "*.dll", "*.so", "*.dylib", "*.class", "*.pyc", "*.pyo", "*.js.map")
$prohibitedFiles = @()

foreach ($ext in $prohibitedExtensions) {
    $files = Get-ChildItem -Path . -Filter $ext -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }
    $prohibitedFiles += $files
}

if ($prohibitedFiles.Count -gt 0) {
    $errors += "Found $($prohibitedFiles.Count) prohibited file(s)"
    Write-Host "   ❌ Found $($prohibitedFiles.Count) prohibited file(s):" -ForegroundColor Red
    $prohibitedFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No prohibited files found" -ForegroundColor Green
}

# Check 3: Check for temporary files
Write-Host ""
Write-Host "📋 Check 3: Temporary Files" -ForegroundColor Cyan
$tmpFiles = Get-ChildItem -Path . -Filter "*.tmp.*" -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }

if ($tmpFiles.Count -gt 0) {
    $warnings += "Found $($tmpFiles.Count) temporary file(s)"
    Write-Host "   ⚠️  Found $($tmpFiles.Count) temporary file(s):" -ForegroundColor Yellow
    $tmpFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Yellow }
} else {
    Write-Host "   ✅ No temporary files found" -ForegroundColor Green
}

# Check 4: Check for draft/review files
Write-Host ""
Write-Host "📋 Check 4: Draft/Review Files" -ForegroundColor Cyan
$draftFiles = Get-ChildItem -Path . -Filter "*.draft.*" -Recurse -File -ErrorAction SilentlyContinue |
              Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }
$reviewFiles = Get-ChildItem -Path . -Filter "*.review.*" -Recurse -File -ErrorAction SilentlyContinue |
               Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }

if ($draftFiles.Count -gt 0) {
    $warnings += "Found $($draftFiles.Count) draft file(s)"
    Write-Host "   ⚠️  Found $($draftFiles.Count) draft file(s):" -ForegroundColor Yellow
    $draftFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Yellow }
} else {
    Write-Host "   ✅ No draft files found" -ForegroundColor Green
}

if ($reviewFiles.Count -gt 0) {
    $warnings += "Found $($reviewFiles.Count) review file(s)"
    Write-Host "   ⚠️  Found $($reviewFiles.Count) review file(s):" -ForegroundColor Yellow
    $reviewFiles | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Yellow }
} else {
    Write-Host "   ✅ No review files found" -ForegroundColor Green
}

# Check 5: Check for secrets
Write-Host ""
Write-Host "📋 Check 5: Secrets in Code" -ForegroundColor Cyan
$secretPatterns = @("password\s*=", "api_key\s*=", "secret\s*=", "token\s*=", "private_key\s*=")
$filesWithSecrets = @()

$sourceFiles = Get-ChildItem -Path . -Include @("*.js", "*.ts", "*.jsx", "*.tsx", "*.py", "*.json", "*.env*") -Recurse -File -ErrorAction SilentlyContinue |
                 Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" }

foreach ($file in $sourceFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        foreach ($pattern in $secretPatterns) {
            if ($content -match $pattern) {
                $filesWithSecrets += $file
                break
            }
        }
    }
}

if ($filesWithSecrets.Count -gt 0) {
    $errors += "Found potential secrets in $($filesWithSecrets.Count) file(s)"
    Write-Host "   ❌ Found potential secrets in $($filesWithSecrets.Count) file(s):" -ForegroundColor Red
    $filesWithSecrets | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No secrets detected" -ForegroundColor Green
}

# Check 6: Check for AI attribution in source files
Write-Host ""
Write-Host "📋 Check 6: AI Attribution" -ForegroundColor Cyan
$sourceFiles = Get-ChildItem -Path . -Include @("*.js", "*.ts", "*.jsx", "*.tsx", "*.py") -Recurse -File -ErrorAction SilentlyContinue |
                 Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" -and $_.FullName -notlike "*\scripts\*" }

$filesWithoutAttribution = @()
foreach ($file in $sourceFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        if (-not ($content -match "@author AI Assistant")) {
            $filesWithoutAttribution += $file
        }
    }
}

if ($filesWithoutAttribution.Count -gt 0) {
    $warnings += "Found $($filesWithoutAttribution.Count) file(s) without AI attribution"
    Write-Host "   ⚠️  Found $($filesWithoutAttribution.Count) file(s) without AI attribution:" -ForegroundColor Yellow
    $filesWithoutAttribution | Select-Object -First 5 | ForEach-Object { Write-Host "      - $($_.FullName)" -ForegroundColor Yellow }
    if ($filesWithoutAttribution.Count -gt 5) {
        Write-Host "      ... and $($filesWithoutAttribution.Count - 5) more" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ All source files have AI attribution" -ForegroundColor Green
}

# Check 7: Check for uncommitted changes
Write-Host ""
Write-Host "📋 Check 7: Uncommitted Changes" -ForegroundColor Cyan
$uncommittedFiles = git status --porcelain

if ($uncommittedFiles) {
    $warnings += "Found uncommitted changes"
    Write-Host "   ⚠️  Found uncommitted changes:" -ForegroundColor Yellow
    $uncommittedFiles | ForEach-Object { Write-Host "      - $_" -ForegroundColor Yellow }
} else {
    Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "   ❌ Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "   ⚠️  Warnings: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -gt 0) { "Yellow" } else { "Green" })

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host ""
    Write-Host "✅ All checks passed! Repository is compliant with DNASPEC rules." -ForegroundColor Green
    exit 0
} elseif ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Found errors that must be fixed:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }

    if ($Strict) {
        Write-Host ""
        Write-Host "🔒 Strict mode enabled. Exiting with error." -ForegroundColor Red
        exit 1
    }

    if ($Fix -and $tmpFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "🔧 Attempting to fix issues..." -ForegroundColor Yellow
        Write-Host "   Removing temporary files..." -ForegroundColor Yellow
        foreach ($file in $tmpFiles) {
            Remove-Item -Path $file.FullName -Force
            Write-Host "   ✅ Removed: $($file.Name)" -ForegroundColor Green
        }
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Found warnings that should be reviewed:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
}

exit 0