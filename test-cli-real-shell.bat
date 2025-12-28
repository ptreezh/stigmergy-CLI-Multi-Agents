@echo off
REM 真实CLI环境测试脚本
REM 在实际的CLI工具中测试 /stigmergy-resume 命令

echo ============================================================
echo 真实CLI环境测试 - /stigmergy-resume 命令
echo ============================================================
echo.

cd /d D:\stigmergy-CLI-Multi-Agents

REM 测试 IFlow CLI
echo ============================================================
echo 测试 1: IFlow CLI
echo ============================================================
echo 命令: iflow
echo 输入: /stigmergy-resume
echo.
echo 请手动在 IFlow CLI 中输入: /stigmergy-resume
echo 然后检查输出是否包含会话历史
echo.
pause
echo.

REM 测试 Claude CLI  
echo ============================================================
echo 测试 2: Claude CLI
echo ============================================================
echo 命令: claude
echo 输入: /stigmergy-resume
echo.
echo 请手动在 Claude CLI 中输入: /stigmergy-resume
echo 然后检查输出是否包含会话历史
echo.
pause
echo.

REM 测试 Gemini CLI
echo ============================================================
echo 测试 3: Gemini CLI
echo ============================================================
echo 命令: gemini
echo 输入: /stigmergy-resume
echo.
echo 请手动在 Gemini CLI 中输入: /stigmergy-resume
echo 然后检查输出是否包含会话历史
echo.
pause
echo.

REM 测试 Qwen CLI
echo ============================================================
echo 测试 4: Qwen CLI
echo ============================================================
echo 命令: qwen
echo 输入: /stigmergy-resume
echo.
echo 请手动在 Qwen CLI 中输入: /stigmergy-resume
echo 然后检查输出是否包含会话历史
echo.
pause
echo.

echo ============================================================
echo 所有CLI测试完成
echo ============================================================
echo.
echo 请确认以下内容:
echo 1. 每个CLI都能识别 /stigmergy-resume 命令
echo 2. 命令能正确扫描和显示会话历史
echo 3. 会话内容正确解析（无 [object Object]）
echo 4. 会话列表按时间排序
echo.
pause
