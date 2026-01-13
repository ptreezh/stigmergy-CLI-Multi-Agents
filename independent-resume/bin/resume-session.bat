@echo off
REM Independent Session Recovery Launcher
REM This script launches the independent recovery tool
REM No dependency on Stigmergy installation

REM Script directory
set SCRIPT_DIR=%~dp0
REM Script file
set SCRIPT_FILE=%SCRIPT_DIR%\independent-resume.js

REM Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if the independent-resume.js file exists
if not exist "%SCRIPT_FILE%" (
    echo Error: independent-resume.js not found
    echo Expected location: %SCRIPT_FILE%
    pause
    exit /b 1
)

REM Run the independent recovery tool with all arguments
node "%SCRIPT_FILE%" %*

endlocal
