@echo off
REM Test script for concurrent command using simple echo

echo Testing concurrent command with simple echo commands...
echo.

node src/index.js concurrent "test" -c 2 --timeout 5000
