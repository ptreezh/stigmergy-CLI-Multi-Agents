# Generates the README hero banner + "how it works" architecture diagram for stigmergy.
# Requires Windows + .NET System.Drawing (built in). No external tools.
# Output:
#   assets/banner.png        1600x400  README hero banner
#   assets/architecture.png  1400x800  concept diagram (one store -> N CLIs -> shared session bus)
# Usage:  pwsh -NoProfile -File scripts/generate-readme-images.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\assets"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# ---- palette (matches scripts/generate-social-preview.ps1) ----
$cBg1   = [System.Drawing.Color]::FromArgb(255, 11, 15, 25)
$cBg2   = [System.Drawing.Color]::FromArgb(255, 24, 32, 51)
$cWhite = [System.Drawing.Color]::FromArgb(255, 240, 246, 252)
$cGrey  = [System.Drawing.Color]::FromArgb(255, 201, 209, 217)
$cMuted = [System.Drawing.Color]::FromArgb(255, 139, 148, 158)
$cBlue  = [System.Drawing.Color]::FromArgb(255, 88, 166, 255)
$cGreen = [System.Drawing.Color]::FromArgb(255, 126, 231, 135)
$cPanel = [System.Drawing.Color]::FromArgb(255, 17, 22, 34)
$cBorder= [System.Drawing.Color]::FromArgb(255, 48, 54, 61)
$cAccent= [System.Drawing.Color]::FromArgb(255, 46, 160, 67)

function New-RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $d = $r * 2
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-CenterFmt {
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  return $sf
}

function Add-ArrowHead($g, [single]$tx, [single]$ty, [single]$angleDeg, [single]$size, $brush) {
  $a = $angleDeg * [math]::PI / 180.0
  $p1 = New-Object System.Drawing.PointF($tx, $ty)
  $p2 = New-Object System.Drawing.PointF(
    ($tx - $size * [math]::Cos($a - 0.42)), ($ty - $size * [math]::Sin($a - 0.42)))
  $p3 = New-Object System.Drawing.PointF(
    ($tx - $size * [math]::Cos($a + 0.42)), ($ty - $size * [math]::Sin($a + 0.42)))
  $g.FillPolygon($brush, @($p1, $p2, $p3))
}

# =====================================================================
# 1) BANNER  1600x400
# =====================================================================
$BW = 1600; $BH = 400
$bmp = New-Object System.Drawing.Bitmap($BW, $BH)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$rect = New-Object System.Drawing.Rectangle(0, 0, $BW, $BH)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cBg1, $cBg2, 25.0)
$g.FillRectangle($bg, $rect)

$glow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 88, 166, 255))
$g.FillEllipse($glow, 980, -220, 760, 760)

$accent = New-Object System.Drawing.SolidBrush($cAccent)
$g.FillRectangle($accent, 0, 0, 10, $BH)

$white = New-Object System.Drawing.SolidBrush($cWhite)
$grey  = New-Object System.Drawing.SolidBrush($cGrey)
$muted = New-Object System.Drawing.SolidBrush($cMuted)
$blue  = New-Object System.Drawing.SolidBrush($cBlue)
$green = New-Object System.Drawing.SolidBrush($cGreen)
$panel = New-Object System.Drawing.SolidBrush($cPanel)
$borderPen = New-Object System.Drawing.Pen($cBorder, 2)

$fTitle = New-Object System.Drawing.Font("Segoe UI", 72, [System.Drawing.FontStyle]::Bold)
$fTag   = New-Object System.Drawing.Font("Segoe UI", 31, [System.Drawing.FontStyle]::Regular)
$fCli   = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Bold)
$fSub   = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Regular)
$fMono  = New-Object System.Drawing.Font("Consolas", 22, [System.Drawing.FontStyle]::Regular)
$fCap   = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
$fNode  = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)

$g.DrawString("Stigmergy CLI", $fTitle, $white, 64, 38)
$g.DrawString("Write a skill once. Run it in every AI CLI.", $fTag, $grey, 68, 156)

$divPen = New-Object System.Drawing.Pen($cBorder, 2)
$g.DrawLine($divPen, 68, 220, 1030, 220)

$g.DrawString("Claude  ·  Gemini  ·  Qwen  ·  iFlow  ·  Qoder  ·  CodeBuddy  ·  Codex  ·  KiloCode  ·  opencode", $fCli, $blue, 68, 240)
$g.DrawString("One skill store  ·  one session bridge  ·  one optional router across 9+ AI CLIs", $fSub, $muted, 68, 284)
$g.DrawString("$ npm i -g stigmergy@beta", $fMono, $green, 68, 328)

# right motif: one skill node fanning out to a ring of CLIs
$cx = 1310.0; $cy = 200.0; $rr = 138.0
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 88, 166, 255), 2)
$nodePen = New-Object System.Drawing.Pen($cGreen, 2)
$nodeFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 13, 24, 20))
for ($i = 0; $i -lt 8; $i++) {
  $ang = ($i * 45.0 - 90.0) * [math]::PI / 180.0
  $nx = $cx + $rr * [math]::Cos($ang)
  $ny = $cy + $rr * [math]::Sin($ang)
  $g.DrawLine($linePen, $cx, $cy, $nx, $ny)
  $g.FillEllipse($nodeFill, $nx - 15, $ny - 15, 30, 30)
  $g.DrawEllipse($nodePen, $nx - 15, $ny - 15, 30, 30)
}
$g.FillEllipse($blue, $cx - 46, $cy - 46, 92, 92)
$g.DrawEllipse($borderPen, $cx - 46, $cy - 46, 92, 92)
$sfCenter = New-CenterFmt
$g.DrawString("skill", $fNode, $white, (New-Object System.Drawing.RectangleF(($cx - 46), ($cy - 46), 92, 92)), $sfCenter)
$g.DrawString("1 skill  ->  N CLIs", $fCap, $muted, 1219, 352)

$bannerOut = Join-Path $outDir "banner.png"
$bmp.Save($bannerOut, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

# =====================================================================
# 2) ARCHITECTURE  1400x800
# =====================================================================
$AW = 1400; $AH = 800
$bmp2 = New-Object System.Drawing.Bitmap($AW, $AH)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

$rect2 = New-Object System.Drawing.Rectangle(0, 0, $AW, $AH)
$bg2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect2, $cBg1, $cBg2, 90.0)
$g2.FillRectangle($bg2, $rect2)

$glow2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 88, 166, 255))
$g2.FillEllipse($glow2, 760, -300, 900, 900)

$white2 = New-Object System.Drawing.SolidBrush($cWhite)
$grey2  = New-Object System.Drawing.SolidBrush($cGrey)
$muted2 = New-Object System.Drawing.SolidBrush($cMuted)
$blue2  = New-Object System.Drawing.SolidBrush($cBlue)
$green2 = New-Object System.Drawing.SolidBrush($cGreen)
$panel2 = New-Object System.Drawing.SolidBrush($cPanel)
$border2 = New-Object System.Drawing.Pen($cBorder, 2)
$bluePen = New-Object System.Drawing.Pen($cBlue, 3)
$greenPen = New-Object System.Drawing.Pen($cGreen, 3)

$sfC = New-CenterFmt

$fH1   = New-Object System.Drawing.Font("Segoe UI", 38, [System.Drawing.FontStyle]::Bold)
$fH2   = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Regular)
$fBox  = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Bold)
$fBoxS = New-Object System.Drawing.Font("Segoe UI", 17, [System.Drawing.FontStyle]::Regular)
$fCliB = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$fCap2 = New-Object System.Drawing.Font("Segoe UI", 19, [System.Drawing.FontStyle]::Regular)
$fMono2= New-Object System.Drawing.Font("Consolas", 20, [System.Drawing.FontStyle]::Regular)

$g2.DrawString("How Stigmergy works", $fH1, $white2, 64, 40)
$g2.DrawString("One skill store  ·  one session bridge  ·  one optional router.", $fH2, $grey2, 66, 104)

# --- Skill store box ---
$sx = 480.0; $sy = 190.0; $sw = 440.0; $sh = 96.0
$storePath = New-RoundedPath $sx $sy $sw $sh 16
$g2.FillPath($panel2, $storePath)
$storePen = New-Object System.Drawing.Pen($cBlue, 2)
$g2.DrawPath($storePen, $storePath)
$g2.DrawString("Skill store", $fBox, $white2, (New-Object System.Drawing.RectangleF($sx, ($sy + 8), $sw, 46)), $sfC)
$g2.DrawString("~/.stigmergy/skills  -  install once", $fBoxS, $muted2, (New-Object System.Drawing.RectangleF($sx, ($sy + 52), $sw, 30)), $sfC)

# --- arrow store -> distribution bar ---
$storeCx = $sx + $sw / 2.0
$g2.DrawLine($bluePen, $storeCx, ($sy + $sh), $storeCx, 332)
Add-ArrowHead $g2 $storeCx 340 90 14 $blue2

# --- distribution bar ---
$barX1 = 64.0; $barX2 = 1336.0; $barY = 352.0
$g2.DrawLine($bluePen, $barX1, $barY, $barX2, $barY)

# --- CLI boxes (single row of 9) ---
$names = @("Claude","Gemini","Qwen","iFlow","Qoder","CodeBuddy","Codex","KiloCode","opencode")
$boxW = 120.0; $gap = 24.0; $step = $boxW + $gap; $startX = 64.0
$boxTop = 386.0; $boxH = 96.0
$centers = @()
for ($i = 0; $i -lt 9; $i++) {
  $bx = $startX + $i * $step
  $cx2 = $bx + $boxW / 2.0
  $centers += $cx2
  # drop from distribution bar into the box
  $g2.DrawLine($bluePen, $cx2, $barY, $cx2, $boxTop)
  $bp = New-RoundedPath $bx $boxTop $boxW $boxH 12
  $g2.FillPath($panel2, $bp)
  $g2.DrawPath($border2, $bp)
  $g2.DrawString($names[$i], $fCliB, $blue2, (New-Object System.Drawing.RectangleF($bx, $boxTop, $boxW, $boxH)), $sfC)
}

# --- session bus ---
$sesY = 566.0
$connPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 126, 231, 135), 2)
for ($i = 0; $i -lt 9; $i++) {
  $g2.DrawLine($connPen, $centers[$i], ($boxTop + $boxH), $centers[$i], $sesY)
}
$g2.DrawLine($greenPen, $barX1, $sesY, $barX2, $sesY)
$g2.DrawString("Shared session bus  -  recover session context across CLIs", $fCap2, $grey2, (New-Object System.Drawing.RectangleF($barX1, ($sesY + 12), ($barX2 - $barX1), 40)), $sfC)

# --- footer command strip ---
$stripPen = New-Object System.Drawing.Pen($cBorder, 2)
$g2.DrawLine($stripPen, 64, 672, 1336, 672)
$g2.DrawString("$ stigmergy scan  ·  skill install  ·  skill read  ·  call  ·  concurrent", $fMono2, $green2, (New-Object System.Drawing.RectangleF(64, 692, 1272, 40)), $sfC)
$g2.DrawString("github.com/ptreezh/stigmergy-CLI-Multi-Agents", $fBoxS, $muted2, (New-Object System.Drawing.RectangleF(64, 744, 1272, 30)), $sfC)

$archOut = Join-Path $outDir "architecture.png"
$bmp2.Save($archOut, [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose(); $bmp2.Dispose()

# ---- report + verify ----
foreach ($f in @($bannerOut, $archOut)) {
  $img = [System.Drawing.Image]::FromFile($f)
  "{0}  ({1}x{2}, {3} KB)" -f (Split-Path $f -Leaf), $img.Width, $img.Height, [math]::Round((Get-Item $f).Length / 1KB, 1)
  $img.Dispose()
}
