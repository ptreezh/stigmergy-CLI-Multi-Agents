@ECHO off
SETLOCAL

IF EXIST "%~dp0\node.exe" (
  SET "_prog=%~dp0\node.exe"
) ELSE (
  SET "_prog=node"
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%~dp0\stigmergy" %*