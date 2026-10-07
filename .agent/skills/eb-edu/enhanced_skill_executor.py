#!/usr/bin/env python3
"""
电商 AI 实训平台 - 增强版 Skill 执行器

特性:
- 自动 Token 管理
- 智能参数提取
- 多轮对话补全
- 分层错误处理
- 自动重试机制
"""

import json
import sys
import subprocess
import argparse
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import re

# 配置
AUTH_FILE = Path.home() / ".stigmergy" / "auth" / "tokens.json"
CONFIG_FILE = Path.home() / ".stigmergy" / "auth" / "config.json"

class SkillExecutor:
    """增强版 Skill 执行器"""
    
    def __init__(self, skill_name: str):
        self.skill_name = skill_name
        self.token = self._load_token()
        self.config = self._load_config()
        
    def _load_token(self) -> Optional[str]:
        """加载 Token（自动刷新）"""
        if not AUTH_FILE.exists():
            return None
            
        with open(AUTH_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # 检查 Token 是否过期
        expires_at = datetime.fromisoformat(data.get('expires_at', '2000-01-01'))
        if datetime.now() >= expires_at:
            # Token 过期，尝试刷新
            print("⚠️ Token 已过期，正在刷新...")
            if self._refresh_token():
                return self._load_token()
            else:
                print("❌ Token 刷新失败，请重新认证")
                print("执行：stigmergy auth login")
                return None
                
        return data.get('access_token')
    
    def _refresh_token(self) -> bool:
        """刷新 Token"""
        try:
            result = subprocess.run(
                ["stigmergy", "auth", "refresh"],
                capture_output=True,
                text=True,
                timeout=30
            )
            return result.returncode == 0
        except Exception:
            return False
    
    def _load_config(self) -> dict:
        """加载用户配置"""
        if not CONFIG_FILE.exists():
            return {}
            
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def extract_params_with_llm(self, user_input: str, schema: dict) -> dict:
        """
        LLM 提取参数（带置信度）
        
        返回:
        {
            "params": {...},
            "confidence": 0.95,
            "missing": ["param1", "param2"],
            "ambiguous": ["param3"]
        }
        """
        # 调用 LLM 提取参数
        llm_prompt = f"""
请从以下用户输入中提取参数：

Schema:
{json.dumps(schema, ensure_ascii=False, indent=2)}

用户输入：{user_input}

请以 JSON 格式返回：
{{
    "params": {{...}},  // 提取的参数
    "confidence": 0.0-1.0,  // 置信度
    "missing": [],  // 缺失的必需参数
    "ambiguous": []  // 模糊的参数
}}
"""
        
        # 调用 AI CLI 的 LLM
        result = subprocess.run(
            ["qwen", llm_prompt],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            try:
                return json.loads(result.stdout)
            except json.JSONDecodeError:
                pass
        
        # LLM 调用失败，返回默认值
        return {
            "params": {},
            "confidence": 0.0,
            "missing": schema.get("required", []),
            "ambiguous": []
        }
    
    def confirm_with_user(self, missing_params: List[str], schema: dict) -> dict:
        """
        多轮对话补全参数
        
        返回用户补充的参数
        """
        print("\n📋 需要补充以下信息：\n")
        
        completed_params = {}
        
        for param in missing_params:
            param_schema = schema["properties"].get(param, {})
            description = param_schema.get("description", "无描述")
            example = param_schema.get("example", "")
            
            # 智能提示
            prompt = f"{param} ({description})"
            if example:
                prompt += f"，例如：{example}"
            prompt += ": "
            
            # 获取用户输入
            value = input(prompt).strip()
            
            if value:
                completed_params[param] = value
        
        return completed_params
    
    def recommend_params(self, schema: dict, history: List[dict]) -> dict:
        """
        基于历史数据智能推荐参数
        """
        recommendations = {}
        
        # 分析历史数据
        if history:
            # 最近使用的参数
            recent = history[-1] if history else {}
            
            for param in schema.get("required", []):
                if param in recent:
                    recommendations[param] = {
                        "value": recent[param],
                        "source": "历史记录"
                    }
        
        # 默认值
        for param, prop in schema.get("properties", {}).items():
            if "default" in prop and param not in recommendations:
                recommendations[param] = {
                    "value": prop["default"],
                    "source": "默认值"
                }
        
        return recommendations
    
    def execute_with_retry(self, params: dict, max_retries: int = 3) -> dict:
        """
        执行 Skill（带智能重试）
        """
        last_error = None
        
        for attempt in range(1, max_retries + 1):
            try:
                print(f"\n🔧 执行 Skill: {self.skill_name} (尝试 {attempt}/{max_retries})")
                
                # 构建 CLI 命令
                cli_command = self._build_cli_command(params)
                
                # 执行命令
                result = subprocess.run(
                    cli_command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode == 0:
                    # 成功
                    try:
                        return {
                            "success": True,
                            "data": json.loads(result.stdout),
                            "message": "执行成功"
                        }
                    except json.JSONDecodeError:
                        return {
                            "success": True,
                            "data": result.stdout,
                            "message": "执行成功"
                        }
                else:
                    # 失败，分析错误类型
                    error_type = self._analyze_error(result.stderr)
                    
                    if error_type == "NETWORK_ERROR" and attempt < max_retries:
                        # 网络错误，指数退避重试
                        wait_time = 2 ** attempt
                        print(f"⚠️ 网络错误，{wait_time}秒后重试...")
                        time.sleep(wait_time)
                        continue
                    
                    elif error_type == "TOKEN_EXPIRED" and attempt < max_retries:
                        # Token 过期，刷新后重试
                        print("⚠️ Token 过期，正在刷新...")
                        if self._refresh_token():
                            continue
                        else:
                            return {
                                "success": False,
                                "error": "Token 刷新失败",
                                "action": "stigmergy auth login"
                            }
                    
                    elif error_type == "PARAM_ERROR":
                        # 参数错误，直接返回
                        return {
                            "success": False,
                            "error": result.stderr,
                            "error_type": "PARAM_ERROR",
                            "suggestion": "请检查参数格式"
                        }
                    
                    else:
                        last_error = result.stderr
                        
            except subprocess.TimeoutExpired:
                if attempt < max_retries:
                    print(f"⚠️ 执行超时，重试...")
                    continue
                else:
                    return {
                        "success": False,
                        "error": "执行超时",
                        "action": "请稍后重试"
                    }
            
            except Exception as e:
                last_error = str(e)
        
        # 所有重试失败
        return {
            "success": False,
            "error": last_error,
            "action": "多次重试失败，请联系管理员"
        }
    
    def _build_cli_command(self, params: dict) -> str:
        """构建 CLI 命令"""
        cmd = f"stigmergy eb-edu {self.skill_name}"
        
        for key, value in params.items():
            if isinstance(value, bool):
                if value:
                    cmd += f" --{key}"
            elif isinstance(value, list):
                for item in value:
                    cmd += f" --{key} \"{item}\""
            else:
                cmd += f" --{key} \"{value}\""
        
        # 注入 Token
        if self.token:
            cmd += f" --token \"{self.token}\""
        
        return cmd
    
    def _analyze_error(self, error_msg: str) -> str:
        """分析错误类型"""
        error_lower = error_msg.lower()
        
        if "timeout" in error_lower or "network" in error_lower:
            return "NETWORK_ERROR"
        elif "token" in error_lower or "auth" in error_lower:
            return "TOKEN_EXPIRED"
        elif "parameter" in error_lower or "param" in error_lower:
            return "PARAM_ERROR"
        elif "permission" in error_lower or "forbidden" in error_lower:
            return "PERMISSION_ERROR"
        else:
            return "BUSINESS_ERROR"
    
    def format_output(self, result: dict, params: dict) -> str:
        """格式化输出"""
        if result["success"]:
            # 成功输出
            output = f"\n✅ {self.skill_name} 执行成功\n\n"
            output += "### 执行结果\n"
            
            if isinstance(result["data"], dict):
                for key, value in result["data"].items():
                    output += f"- **{key}**: {value}\n"
            else:
                output += result["data"]
            
            return output
        else:
            # 失败输出
            output = f"\n❌ {self.skill_name} 执行失败\n\n"
            output += f"**错误类型**: {result.get('error_type', '未知')}\n"
            output += f"**错误信息**: {result.get('error', '未知错误')}\n"
            
            if "action" in result:
                output += f"\n**建议操作**: `{result['action']}`\n"
            
            if "suggestion" in result:
                output += f"\n**提示**: {result['suggestion']}\n"
            
            return output


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="增强版 Skill 执行器")
    parser.add_argument("skill_name", help="Skill 名称")
    parser.add_argument("--input", "-i", type=str, help="用户自然语言输入")
    parser.add_argument("--params", type=json.loads, help="JSON 参数")
    parser.add_argument("--interactive", action="store_true", help="交互模式")
    
    args = parser.parse_args()
    
    # 创建执行器
    executor = SkillExecutor(args.skill_name)
    
    if args.input:
        # 自然语言输入 → LLM 提取参数
        print(f"🤖 理解用户输入：{args.input}")
        
        # TODO: 加载 Skill Schema
        schema = {}
        
        extraction_result = executor.extract_params_with_llm(args.input, schema)
        
        if extraction_result["confidence"] < 0.7:
            # 置信度低，需要补全
            print("⚠️ 参数置信度较低，需要补全")
            
            if args.interactive:
                # 交互模式补全
                completed = executor.confirm_with_user(
                    extraction_result["missing"],
                    schema
                )
                extraction_result["params"].update(completed)
            else:
                # 非交互模式，使用推荐值
                recommendations = executor.recommend_params(schema, [])
                for param, rec in recommendations.items():
                    if param not in extraction_result["params"]:
                        extraction_result["params"][param] = rec["value"]
        
        params = extraction_result["params"]
    else:
        # 直接参数输入
        params = args.params or {}
    
    # 执行 Skill（带重试）
    result = executor.execute_with_retry(params)
    
    # 输出结果
    output = executor.format_output(result, params)
    print(output)
    
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
