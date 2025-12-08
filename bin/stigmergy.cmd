@ECHO OFF
SETLOCAL
SET "NODE_PATH=%~dp0\node_modules;%NODE_PATH%"
SET "PATH=%~dp0;%PATH%"
node "%~dp0..\src\main_english.js" %*