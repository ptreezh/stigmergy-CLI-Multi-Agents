@echo off
cd /d C:\bde\stigmergy
echo === Git Status ===
git status --short
echo.
echo === Git Add ===
git add -A
echo.
echo === Git Commit ===
git commit -m "feat: 内置 Superpowers + 自动部署 + 进化机制" || echo Nothing to commit
echo.
echo === Git Push ===
git push
echo.
echo === NPM Version ===
npm version prerelease --preid=beta
echo.
echo === NPM Publish ===
npm publish --tag beta
echo.
echo === Done ===
pause
