# PowerShell script for DNASPEC Cache Manager
# Manages AI-generated files with staging and validation

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init-cache", "stage-file", "validate-staged", "commit-staged", "cleanup-cache", "cache-status")]
    [string]$Operation,

    [string]$ProjectPath = ".",
    [string]$FilePath,
    [string]$Content,
    [string]$Message,
    [switch]$Force
)

# Load configuration
function Get-CacheConfig {
    $configPath = Join-Path $ProjectPath ".cache\cache-config.json"
    if (-not (Test-Path $configPath)) {
        Write-Host "❌ ERROR: Cache configuration not found" -ForegroundColor Red
        Write-Host "   Run 'init-cache' operation first" -ForegroundColor Yellow
        exit 1
    }
    return Get-Content $configPath | ConvertFrom-Json
}

# Load metadata
function Get-CacheMetadata {
    $metadataPath = Join-Path $ProjectPath ".cache\metadata.json"
    if (-not (Test-Path $metadataPath)) {
        return @{
            version = "1.0.0"
            created = (Get-Date).ToString("o")
            lastUpdated = (Get-Date).ToString("o")
            stagedFiles = @()
            validatedFiles = @()
            statistics = @{
                totalStaged = 0
                totalValidated = 0
                totalCommitted = 0
                totalCleaned = 0
            }
        }
    }
    return Get-Content $metadataPath | ConvertFrom-Json
}

# Save metadata
function Save-CacheMetadata($metadata) {
    $metadataPath = Join-Path $ProjectPath ".cache\metadata.json"
    $metadata.lastUpdated = (Get-Date).ToString("o")
    $metadata | ConvertTo-Json -Depth 10 | Set-Content $metadataPath
}

# Initialize cache system
function Initialize-Cache {
    Write-Host "🚀 Initializing DNASPEC Cache System..." -ForegroundColor Cyan

    $cacheDir = Join-Path $ProjectPath ".cache"
    $stagingDir = Join-Path $cacheDir "staging"
    $validatedDir = Join-Path $cacheDir "validated"

    # Create directories
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
    New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
    New-Item -ItemType Directory -Path $validatedDir -Force | Out-Null

    # Create default configuration
    $configPath = Join-Path $cacheDir "cache-config.json"
    $config = @{
        version = "1.0.0"
        cacheDir = ".cache"
        stagingDir = ".cache\staging"
        validatedDir = ".cache\validated"
        metadataFile = ".cache\metadata.json"
        maxCacheAge = 86400
        maxCacheSize = 104857600
        validationRules = @{
            minFileSize = 0
            maxFileSize = 1048576
            allowedExtensions = @(".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".go", ".rs", ".rb", ".php", ".cs", ".cpp", ".h", ".hpp", ".c", ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".html", ".css", ".scss", ".less")
            prohibitedPatterns = @("password", "api_key", "secret", "token", "private_key", "aws_access_key", "aws_secret_key")
            requireAIAttribution = $true
        }
        autoCleanup = $true
        cleanupInterval = 3600
    }
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath

    # Create default metadata
    $metadataPath = Join-Path $cacheDir "metadata.json"
    $metadata = @{
        version = "1.0.0"
        created = (Get-Date).ToString("o")
        lastUpdated = (Get-Date).ToString("o")
        stagedFiles = @()
        validatedFiles = @()
        statistics = @{
            totalStaged = 0
            totalValidated = 0
            totalCommitted = 0
            totalCleaned = 0
        }
    }
    $metadata | ConvertTo-Json -Depth 10 | Set-Content $metadataPath

    # Create .gitignore for cache directory
    $gitignorePath = Join-Path $cacheDir ".gitignore"
    "*`n!.gitignore`n!cache-config.json`n!metadata.json" | Set-Content $gitignorePath

    Write-Host "✅ Cache system initialized" -ForegroundColor Green
    Write-Host "   Cache directory: $cacheDir" -ForegroundColor White
    Write-Host "   Staging directory: $stagingDir" -ForegroundColor White
    Write-Host "   Validated directory: $validatedDir" -ForegroundColor White
}

# Stage file
function Stage-File {
    if (-not $FilePath) {
        Write-Host "❌ ERROR: FilePath is required for stage-file operation" -ForegroundColor Red
        exit 1
    }

    $config = Get-CacheConfig
    $metadata = Get-CacheMetadata

    Write-Host "📝 Staging file: $FilePath" -ForegroundColor Cyan

    # Validate file extension
    $extension = [System.IO.Path]::GetExtension($FilePath)
    if ($extension -notin $config.validationRules.allowedExtensions) {
        Write-Host "❌ ERROR: File extension '$extension' is not allowed" -ForegroundColor Red
        Write-Host "   Allowed extensions: $($config.validationRules.allowedExtensions -join ', ')" -ForegroundColor Yellow
        exit 1
    }

    # Prepare file content
    $fileContent = if ($Content) { $Content } else { Get-Content $FilePath -Raw -ErrorAction SilentlyContinue }
    if (-not $fileContent) {
        Write-Host "❌ ERROR: Cannot read file content" -ForegroundColor Red
        exit 1
    }

    # Check file size
    $fileSize = [System.Text.Encoding]::UTF8.GetByteCount($fileContent)
    if ($fileSize -gt $config.validationRules.maxFileSize) {
        Write-Host "❌ ERROR: File size exceeds maximum allowed size" -ForegroundColor Red
        Write-Host "   File size: $fileSize bytes" -ForegroundColor Yellow
        Write-Host "   Max size: $($config.validationRules.maxFileSize) bytes" -ForegroundColor Yellow
        exit 1
    }

    # Check for prohibited patterns
    foreach ($pattern in $config.validationRules.prohibitedPatterns) {
        if ($fileContent -match "$pattern\s*=") {
            Write-Host "❌ ERROR: File contains prohibited pattern: $pattern" -ForegroundColor Red
            Write-Host "   Potential secret detected. Please remove before staging." -ForegroundColor Yellow
            exit 1
        }
    }

    # Check AI attribution
    if ($config.validationRules.requireAIAttribution) {
        if ($extension -match "\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs|cpp|h|hpp|c)$") {
            if (-not ($fileContent -match "@author AI Assistant")) {
                Write-Host "⚠️  WARNING: Missing AI attribution header" -ForegroundColor Yellow
                Write-Host "   AI-generated files should include '@author AI Assistant' in the header" -ForegroundColor Yellow
                if (-not $Force) {
                    $continue = Read-Host "   Continue anyway? (y/N)"
                    if ($continue -ne "y" -and $continue -ne "Y") {
                        Write-Host "❌ Staging cancelled" -ForegroundColor Red
                        exit 0
                    }
                }
            }
        }
    }

    # Generate unique filename for staging
    $fileName = [System.IO.Path]::GetFileName($FilePath)
    $timestamp = (Get-Date).Ticks
    $stagedFileName = "${timestamp}_${fileName}"
    $stagedFilePath = Join-Path $ProjectPath ".cache\staging\$stagedFileName"

    # Save staged file
    $fileContent | Set-Content $stagedFilePath -NoNewline

    # Update metadata
    $fileMetadata = [PSCustomObject]@{
        originalPath = $FilePath
        stagedPath = $stagedFilePath
        stagedAt = (Get-Date).ToString("o")
        size = $fileSize
        extension = $extension
        status = "staged"
        aiAttributed = ($fileContent -match "@author AI Assistant")
    }

    $metadata.stagedFiles += @($fileMetadata)
    $metadata.statistics.totalStaged++

    Save-CacheMetadata $metadata

    Write-Host "✅ File staged successfully" -ForegroundColor Green
    Write-Host "   Staged file: $stagedFileName" -ForegroundColor White
    Write-Host "   Size: $fileSize bytes" -ForegroundColor White
    Write-Host "   Status: staged" -ForegroundColor White
}

# Validate staged files
function Validate-Staged {
    $config = Get-CacheConfig
    $metadata = Get-CacheMetadata

    Write-Host "🔍 Validating staged files..." -ForegroundColor Cyan

    if ($metadata.stagedFiles.Count -eq 0) {
        Write-Host "ℹ️  No staged files to validate" -ForegroundColor Gray
        exit 0
    }

    $passedCount = 0
    $failedCount = 0

    foreach ($file in $metadata.stagedFiles) {
        Write-Host ""
        Write-Host "Validating: $($file.originalPath)" -ForegroundColor White

        $stagedFilePath = $file.stagedPath
        if (-not (Test-Path $stagedFilePath)) {
            Write-Host "   ❌ ERROR: Staged file not found" -ForegroundColor Red
            $failedCount++
            continue
        }

        $content = Get-Content $stagedFilePath -Raw

        # Check 1: File size
        $fileSize = (Get-Item $stagedFilePath).Length
        if ($fileSize -gt $config.validationRules.maxFileSize) {
            Write-Host "   ❌ File size exceeds maximum" -ForegroundColor Red
            $failedCount++
            continue
        }
        Write-Host "   ✅ File size OK" -ForegroundColor Green

        # Check 2: Prohibited patterns
        $hasSecrets = $false
        foreach ($pattern in $config.validationRules.prohibitedPatterns) {
            if ($content -match "$pattern\s*=") {
                Write-Host "   ❌ Contains prohibited pattern: $pattern" -ForegroundColor Red
                $hasSecrets = $true
            }
        }
        if ($hasSecrets) {
            $failedCount++
            continue
        }
        Write-Host "   ✅ No prohibited patterns" -ForegroundColor Green

        # Check 3: AI attribution
        if ($config.validationRules.requireAIAttribution) {
            if ($file.extension -match "\.(js|ts|jsx|tsx|py|java|go|rs|rb|php|cs|cpp|h|hpp|c)$") {
                if ($content -match "@author AI Assistant") {
                    Write-Host "   ✅ AI attribution present" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  Missing AI attribution" -ForegroundColor Yellow
                    if (-not $Force) {
                        Write-Host "   Skipping file" -ForegroundColor Yellow
                        $failedCount++
                        continue
                    }
                }
            }
        }

        # Check 4: Syntax validation (basic)
        $syntaxError = $false
        switch ($file.extension) {
            ".js" { try { [System.Management.Automation.PSParser]::Tokenize($content, [ref]$null) | Out-Null } catch { $syntaxError = $true } }
            ".json" { try { $content | ConvertFrom-Json | Out-Null } catch { $syntaxError = $true } }
        }

        if ($syntaxError) {
            Write-Host "   ❌ Syntax validation failed" -ForegroundColor Red
            $failedCount++
            continue
        }
        Write-Host "   ✅ Syntax validation passed" -ForegroundColor Green

        # Move to validated directory
        $validatedFileName = [System.IO.Path]::GetFileName($stagedFilePath)
        $validatedFilePath = Join-Path $ProjectPath ".cache\validated\$validatedFileName"
        Move-Item -Path $stagedFilePath -Destination $validatedFilePath -Force

        # Create new validated file metadata
        $validatedFile = [PSCustomObject]@{
            originalPath = $file.originalPath
            stagedPath = $stagedFilePath
            stagedAt = $file.stagedAt
            size = $file.size
            extension = $file.extension
            status = "validated"
            aiAttributed = $file.aiAttributed
            validatedAt = (Get-Date).ToString("o")
            validatedPath = $validatedFilePath
        }
        $metadata.validatedFiles += @($validatedFile)

        $passedCount++
        Write-Host "   ✅ File validated and moved to validated directory" -ForegroundColor Green
    }

    # Clear staged files from metadata
    $metadata.stagedFiles = @()
    $metadata.statistics.totalValidated += $passedCount

    Save-CacheMetadata $metadata

    Write-Host ""
    Write-Host "📊 Validation Summary:" -ForegroundColor Cyan
    Write-Host "   ✅ Passed: $passedCount" -ForegroundColor Green
    Write-Host "   ❌ Failed: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
}

# Commit validated files
function Commit-Staged {
    if (-not $Message) {
        Write-Host "❌ ERROR: Message is required for commit-staged operation" -ForegroundColor Red
        exit 1
    }

    $metadata = Get-CacheMetadata

    Write-Host "🚀 Committing validated files..." -ForegroundColor Cyan

    if ($metadata.validatedFiles.Count -eq 0) {
        Write-Host "ℹ️  No validated files to commit" -ForegroundColor Gray
        exit 0
    }

    Write-Host "📋 Files to commit:" -ForegroundColor Cyan
    $metadata.validatedFiles | ForEach-Object {
        Write-Host "   - $($_.originalPath)" -ForegroundColor White
    }

    Write-Host ""
    $confirm = Read-Host "Commit these files? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Commit cancelled" -ForegroundColor Red
        exit 0
    }

    # Copy files to their original locations
    foreach ($file in $metadata.validatedFiles) {
        $validatedFilePath = $file.validatedPath
        $originalPath = Join-Path $ProjectPath $file.originalPath

        # Create directory if it doesn't exist
        $directory = [System.IO.Path]::GetDirectoryName($originalPath)
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }

        Copy-Item -Path $validatedFilePath -Destination $originalPath -Force
        Write-Host "✅ Committed: $($file.originalPath)" -ForegroundColor Green

        # Remove from validated directory
        Remove-Item $validatedFilePath -Force
    }

    # Stage files in Git
    $filesToStage = $metadata.validatedFiles | ForEach-Object { $_.originalPath }
    $filesToStage | ForEach-Object {
        git add $_
    }

    # Create commit
    git commit -m $Message

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ All files committed successfully!" -ForegroundColor Green
        $metadata.statistics.totalCommitted += $metadata.validatedFiles.Count
        $metadata.validatedFiles = @()
        Save-CacheMetadata $metadata
    } else {
        Write-Host ""
        Write-Host "❌ Git commit failed" -ForegroundColor Red
        Write-Host "   Files are in the workspace but not committed to Git" -ForegroundColor Yellow
        exit 1
    }
}

# Cleanup cache
function Cleanup-Cache {
    $config = Get-CacheConfig
    $metadata = Get-CacheMetadata

    Write-Host "🧹 Cleaning up cache..." -ForegroundColor Cyan

    $cleanedCount = 0
    $currentTime = (Get-Date).Ticks

    # Clean staged files
    foreach ($file in $metadata.stagedFiles) {
        $stagedTime = [DateTime]::Parse($file.stagedAt).Ticks
        $ageInSeconds = ($currentTime - $stagedTime) / 10000000

        if ($ageInSeconds -gt $config.maxCacheAge) {
            if (Test-Path $file.stagedPath) {
                Remove-Item $file.stagedPath -Force
                Write-Host "✅ Removed expired staged file: $($file.originalPath)" -ForegroundColor Green
                $cleanedCount++
            }
        }
    }

    # Clean validated files
    foreach ($file in $metadata.validatedFiles) {
        $validatedTime = if ($file.validatedAt) { [DateTime]::Parse($file.validatedAt).Ticks } else { 0 }
        $ageInSeconds = ($currentTime - $validatedTime) / 10000000

        if ($ageInSeconds -gt $config.maxCacheAge) {
            if (Test-Path $file.validatedPath) {
                Remove-Item $file.validatedPath -Force
                Write-Host "✅ Removed expired validated file: $($file.originalPath)" -ForegroundColor Green
                $cleanedCount++
            }
        }
    }

    # Update metadata
    $metadata.stagedFiles = $metadata.stagedFiles | Where-Object {
        $stagedTime = [DateTime]::Parse($_.stagedAt).Ticks
        ($currentTime - $stagedTime) / 10000000 -le $config.maxCacheAge
    }

    $metadata.validatedFiles = $metadata.validatedFiles | Where-Object {
        $validatedTime = if ($_.validatedAt) { [DateTime]::Parse($_.validatedAt).Ticks } else { 0 }
        ($currentTime - $validatedTime) / 10000000 -le $config.maxCacheAge
    }

    $metadata.statistics.totalCleaned += $cleanedCount
    Save-CacheMetadata $metadata

    if ($cleanedCount -eq 0) {
        Write-Host "✅ No expired files to clean" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✅ Cleaned $cleanedCount expired file(s)" -ForegroundColor Green
    }
}

# Cache status
function Show-CacheStatus {
    $config = Get-CacheConfig
    $metadata = Get-CacheMetadata

    Write-Host "📊 DNASPEC Cache Status" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Gray
    Write-Host ""

    Write-Host "🔹 Configuration" -ForegroundColor Cyan
    Write-Host "   Cache directory: $(Join-Path $ProjectPath '.cache')" -ForegroundColor White
    Write-Host "   Max cache age: $($config.maxCacheAge) seconds" -ForegroundColor White
    Write-Host "   Max cache size: $([math]::Round($config.maxCacheSize / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   Auto cleanup: $(if ($config.autoCleanup) { 'Enabled' } else { 'Disabled' })" -ForegroundColor White

    Write-Host ""
    Write-Host "🔹 Statistics" -ForegroundColor Cyan
    Write-Host "   Total staged: $($metadata.statistics.totalStaged)" -ForegroundColor White
    Write-Host "   Total validated: $($metadata.statistics.totalValidated)" -ForegroundColor White
    Write-Host "   Total committed: $($metadata.statistics.totalCommitted)" -ForegroundColor White
    Write-Host "   Total cleaned: $($metadata.statistics.totalCleaned)" -ForegroundColor White

    Write-Host ""
    Write-Host "🔹 Current Staged Files: $($metadata.stagedFiles.Count)" -ForegroundColor Cyan
    if ($metadata.stagedFiles.Count -gt 0) {
        $metadata.stagedFiles | ForEach-Object {
            $age = ((Get-Date) - [DateTime]::Parse($_.stagedAt)).TotalMinutes.ToString("0.0")
            Write-Host "   - $($_.originalPath) ($age minutes ago)" -ForegroundColor White
        }
    } else {
        Write-Host "   No staged files" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "🔹 Current Validated Files: $($metadata.validatedFiles.Count)" -ForegroundColor Cyan
    if ($metadata.validatedFiles.Count -gt 0) {
        $metadata.validatedFiles | ForEach-Object {
            $age = if ($_.validatedAt) { ((Get-Date) - [DateTime]::Parse($_.validatedAt)).TotalMinutes.ToString("0.0") } else { "N/A" }
            Write-Host "   - $($_.originalPath) ($age minutes ago)" -ForegroundColor White
        }
    } else {
        Write-Host "   No validated files" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "================================" -ForegroundColor Gray
}

# Main execution
switch ($Operation) {
    "init-cache" { Initialize-Cache }
    "stage-file" { Stage-File }
    "validate-staged" { Validate-Staged }
    "commit-staged" { Commit-Staged }
    "cleanup-cache" { Cleanup-Cache }
    "cache-status" { Show-CacheStatus }
}

exit 0