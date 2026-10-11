# Generates the 1280x640 GitHub social-preview card for stigmergy.
# Requires Windows + .NET System.Drawing (built in). No external tools.
# Usage:  pwsh -NoProfile -File scripts/generate-social-preview.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$W = 1280
$H = 640
$outDir = Join-Path $PSScriptRoot "..\assets"
$outFile = Join-Path $outDir "social-preview.png"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Background gradient
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$c1 = [System.Drawing.Color]::FromArgb(255, 11, 15, 25)
$c2 = [System.Drawing.Color]::FromArgb(255, 24, 32, 51)
$br = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 25.0)
$g.FillRectangle($br, $rect)

# Soft glow, top-right
$glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 88, 166, 255))
$g.FillEllipse($glow, 880, -180, 640, 640)

# Left accent bar
$accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 46, 160, 67))
$g.FillRectangle($accent, 0, 0, 10, $H)

# Palette
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 240, 246, 252))
$grey = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 201, 209, 217))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 139, 148, 158))
$blue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 88, 166, 255))
$green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 126, 231, 135))
$panel = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 17, 22, 34))
$border = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 48, 54, 61), 2)

$fTitle = New-Object System.Drawing.Font("Segoe UI", 66, [System.Drawing.FontStyle]::Bold)
$fTag = New-Object System.Drawing.Font("Segoe UI", 30, [System.Drawing.FontStyle]::Regular)
$fCli = New-Object System.Drawing.Font("Segoe UI", 25, [System.Drawing.FontStyle]::Bold)
$fMono = New-Object System.Drawing.Font("Consolas", 21, [System.Drawing.FontStyle]::Regular)
$fFoot = New-Object System.Drawing.Font("Consolas", 19, [System.Drawing.FontStyle]::Regular)

# Title
$g.DrawString("Stigmergy CLI", $fTitle, $white, 62, 58)

# Tagline
$g.DrawString("Write a skill once. Run it in every AI CLI.", $fTag, $grey, 66, 168)

# Divider
$divPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 48, 54, 61), 2)
$g.DrawLine($divPen, 66, 228, 1214, 228)

# CLI row
$g.DrawString("Claude", $fCli, $blue, 66, 250)
$g.DrawString("Gemini", $fCli, $blue, 202, 250)
$g.DrawString("Qwen", $fCli, $blue, 344, 250)
$g.DrawString("iFlow", $fCli, $blue, 460, 250)
$g.DrawString("Qoder", $fCli, $blue, 588, 250)
$g.DrawString("CodeBuddy", $fCli, $blue, 716, 250)
$g.DrawString("Codex", $fCli, $blue, 900, 250)
$g.DrawString("KiloCode", $fCli, $blue, 1022, 250)
$g.DrawString("opencode", $fCli, $blue, 66, 290)

# Terminal panel
$g.FillRectangle($panel, 66, 356, 1148, 196)
$g.DrawRectangle($border, 66, 356, 1148, 196)
$g.DrawString("$ stigmergy --version", $fMono, $green, 92, 378)
$g.DrawString("1.11.0", $fMono, $white, 92, 414)
$g.DrawString("$ stigmergy scan", $fMono, $green, 92, 450)
$g.DrawString(" Found 9 CLI tools: Claude 2.1.295 | Gemini 0.63.0 | Qwen 0.25.0 | ...", $fMono, $muted, 92, 486)

# Footer
$g.DrawString("github.com/ptreezh/stigmergy-CLI-Multi-Agents", $fFoot, $muted, 66, 590)
$g.DrawString("npm i -g stigmergy@beta", $fFoot, $muted, 890, 590)

$bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$g.Dispose(); $bmp.Dispose(); $br.Dispose(); $glow.Dispose(); $accent.Dispose()
$white.Dispose(); $grey.Dispose(); $muted.Dispose(); $blue.Dispose(); $green.Dispose()
$panel.Dispose(); $border.Dispose(); $divPen.Dispose()
$fTitle.Dispose(); $fTag.Dispose(); $fCli.Dispose(); $fMono.Dispose(); $fFoot.Dispose()

$img = [System.Drawing.Image]::FromFile($outFile)
"SAVED: $outFile  ($($img.Width)x$($img.Height), $([math]::Round((Get-Item $outFile).Length/1KB,1)) KB)"
$img.Dispose()
