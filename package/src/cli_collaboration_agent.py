#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多智能体协作代理
通过项目背景实现CLI工具间的间接协同（Stigmergy）
"""

import os
import sys
import json
import subprocess
import time
import re
from datetime import datetime
from pathlib import Path


class ProjectContext:
    """项目背景管理器 - 实现Stigmergy机制"""
    
    def __init__(self, project_path="."):
        self.project_path = Path(project_path)
        self.spec_file = self.project_path / "PROJECT_SPEC.json"
        self.tasks_file = self.project_path / "TASKS.md"
        self.log_file = self.project_path / "COLLABORATION_LOG.md"
        self.background_files = [self.spec_file, self.tasks_file, self.log_file]
        self.data = self._load_context()
    
    def _load_context(self):
        """加载项目背景"""
        if self.spec_file.exists():
            with open(self.spec_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # 创建默认背景
            default_context = {
                "project_name": "Collaboration Project",
                "created_at": datetime.now().isoformat(),
                "status": "active",
                "current_agents": {},
                "tasks": {},
                "collaboration_history": [],
                "decisions": [],
                "communication_log": [],
                "current_state": {
                    "active_task": None,
                    "completed_tasks": [],
                    "pending_tasks": [],
                    "next_scheduled_task": None
                }
            }
            self._save_context(default_context)
            return default_context
    
    def _save_context(self, data=None):
        """保存项目背景"""
        if data:
            self.data = data
        with open(self.spec_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
            
        # 同时更新任务列表文件
        self._update_tasks_file()
        
        # 同时更新协作日志
        self._update_log_file()
    
    def _update_tasks_file(self):
        """更新任务列表文件"""
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            f.write("# 项目任务列表\n\n")
            f.write("## 已完成任务\n")
            for task_id in self.data["current_state"]["completed_tasks"]:
                task = self.data["tasks"].get(task_id, {})
                f.write(f"- [x] {task.get('description', task_id)} (完成于 {task.get('completed_at', '')})\n")
            
            f.write("\n## 待完成任务\n")
            for task_id in self.data["current_state"]["pending_tasks"]:
                task = self.data["tasks"].get(task_id, {})
                f.write(f"- [ ] {task.get('description', task_id)}\n")
    
    def _update_log_file(self):
        """更新协作日志文件"""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            f.write("# 协作日志\n\n")
            for log_entry in self.data["collaboration_history"]:
                timestamp = log_entry.get("timestamp", "")
                agent = log_entry.get("agent", "")
                message = log_entry.get("message", "")
                f.write(f"[{timestamp}] [{agent}] {message}\n")
    
    def add_collaboration_log(self, message, agent_name=None):
        """添加协作日志到背景"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "message": message
        }
        self.data["collaboration_history"].append(log_entry)
        self._save_context()
    
    def update_task_status(self, task_id, status, result=None, completed_by=None):
        """更新任务状态到背景"""
        if task_id in self.data["tasks"]:
            self.data["tasks"][task_id].update({
                "status": status,
                "completed_at": datetime.now().isoformat() if status == "completed" else None,
                "result": result,
                "completed_by": completed_by
            })

            if status == "completed":
                # 避免重复添加到已完成列表
                if task_id not in self.data["current_state"]["completed_tasks"]:
                    self.data["current_state"]["completed_tasks"].append(task_id)
                if task_id in self.data["current_state"]["pending_tasks"]:
                    self.data["current_state"]["pending_tasks"].remove(task_id)
            elif status == "in_progress":
                # 更新活动任务
                self.data["current_state"]["active_task"] = task_id

            # 强制立即保存以确保状态同步
            self._save_context()

            # 强制重新加载上下文以确保其他实例能看到最新状态
            self._force_reload_context()

    def _reload_context(self):
        """重新加载上下文以确保数据同步"""
        try:
            if self.spec_file.exists():
                with open(self.spec_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
        except Exception as e:
            print(f"重载上下文失败: {e}")
            # 如果重载失败，保持当前缓存的数据
    
    def create_task(self, task_type, description, assigned_to=None, priority="medium", dependencies=None):
        """创建新任务到背景"""
        task_id = f"{task_type}_{int(time.time())}_{len(self.data['tasks'])}"
        
        task = {
            "id": task_id,
            "type": task_type,
            "description": description,
            "assigned_to": assigned_to,
            "status": "pending",
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "dependencies": dependencies or [],
            "result": None,
            "completed_by": None,
            "completed_at": None
        }
        
        self.data["tasks"][task_id] = task
        self.data["current_state"]["pending_tasks"].append(task_id)
        
        # 更新下一个计划任务
        if self.data["current_state"]["next_scheduled_task"] is None:
            self.data["current_state"]["next_scheduled_task"] = task_id
        
        self._save_context()
        return task_id
    
    def analyze_context_for_next_action(self, agent_name):
        """分析背景以决定下一步行动 - 实现Stigmergy的核心机制"""
        # 为确保分析基于最新状态，强制重新加载背景
        self._force_reload_context()

        # 检查是否有明确分配给当前智能体的任务
        for task_id, task in self.data["tasks"].items():
            if (task["status"] == "pending" and
                task.get("assigned_to") == agent_name):
                return task_id, task

        # 检查是否有未分配的任务，当前智能体可能有能力处理
        for task_id, task in self.data["tasks"].items():
            if (task["status"] == "pending" and
                task.get("assigned_to") is None and
                self._can_handle_task(task, agent_name)):

                # 尝试认领任务（分配给自己）
                self.data["tasks"][task_id]["assigned_to"] = agent_name
                self._save_context()
                return task_id, task

        # 检查是否有需要协助的任务（如审查、优化等）
        for task_id, task in self.data["tasks"].items():
            if (task["status"] == "completed" and
                "review_needed" in task.get("result", "").lower()):

                # 创建审查任务
                review_task_id = self.create_task(
                    "review",
                    "审查任务 " + task_id + " 的结果: " + task.get('result', '')[:200] + "...",
                    assigned_to=agent_name,
                    priority="high"
                )
                return review_task_id, self.data["tasks"][review_task_id]

        return None, None

    def _force_reload_context(self):
        """强制重新加载背景以确保获取最新状态"""
        try:
            if self.spec_file.exists():
                with open(self.spec_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
        except Exception as e:
            print(f"⚠️ 强制重载背景失败，使用缓存数据: {e}")
            # 如果重载失败，保持当前缓存的数据

    def _reload_context_if_needed(self):
        """在分析背景前检查是否需要重新加载以确保最新状态"""
        # 检查文件修改时间戳，如果本地缓存可能已过期则重新加载
        try:
            if self.spec_file.exists():
                import time
                file_modified = self.spec_file.stat().st_mtime
                current_time = time.time()

                # 如果文件在过去3秒内被修改过，则重新加载（考虑到系统调用的时间差）
                time_diff = abs(current_time - file_modified)
                if time_diff < 3:  # 如果文件在最近几秒内被修改
                    with open(self.spec_file, 'r', encoding='utf-8') as f:
                        self.data = json.load(f)
        except Exception as e:
            # 如果重新加载失败，继续使用缓存的数据
            pass
    
    def _can_handle_task(self, task, agent_name):
        """判断当前智能体是否可以处理任务 - 基于能力匹配"""
        description = task["description"].lower()
        
        agent_capabilities = {
            "claude": ["analyze", "logic", "reasoning", "review", "explain", "analysis", "data"],
            "gemini": ["translate", "multilingual", "creative", "document", "writing", "content"],
            "qwen": ["chinese", "中文", "translate", "chat", "question", "answer"],
            "codebuddy": ["code", "function", "program", "bug", "refactor", "debug", "test"],
            "kimi": ["long", "analysis", "research", "content", "report"],
            "qodercli": ["generate", "code", "template", "create", "build"],
            "iflow": ["workflow", "process", "automate", "task", "schedule"],
            "ollama": ["local", "offline", "private", "secure", "model"]
        }
        
        capabilities = agent_capabilities.get(agent_name, [])
        return any(cap in description for cap in capabilities)


class CLICollaborationAgent:
    """CLI协作智能体 - 基于背景的间接协同"""
    
    def __init__(self, agent_name, project_path="."):
        self.agent_name = agent_name
        self.project_context = ProjectContext(project_path)
        self.cli_command = self._determine_cli_command()
    
    def _determine_cli_command(self):
        """确定CLI命令"""
        # 根据智能体名称确定CLI命令
        tool_commands = {
            "claude": "claude",
            "gemini": "gemini", 
            "kimi": "kimi",
            "qwen": "qwen",
            "ollama": "ollama",
            "codebuddy": "codebuddy",
            "qodercli": "qodercli",
            "iflow": "iflow"
        }
        return tool_commands.get(self.agent_name, self.agent_name)
    
    def execute_command(self, command_args):
        """执行CLI命令 - 支持内部协作功能"""
        try:
            # 分析输入中是否包含协作指令
            user_input = " ".join(command_args) if command_args else ""

            # 检查协作意图
            collaboration_match = self._analyze_collaboration_intent(user_input)
            if collaboration_match:
                target_agent, task_desc = collaboration_match

                # 在新窗口中执行目标智能体，当前项目路径
                success = self._execute_collaboration_in_new_window(target_agent, task_desc)
                if success:
                    return True, f"协作任务完成: 已让{target_agent}处理 {task_desc}", ""
                else:
                    return False, "", f"协作任务执行失败: 无法启动{target_agent}，使用原始功能"
            else:
                # 执行原始命令
                result = subprocess.run(
                    [self.cli_command] + command_args,
                    capture_output=True,
                    text=True,
                    timeout=300
                )
                return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            return False, "", str(e)

    def _analyze_collaboration_intent(self, user_input):
        """分析协作意图 - 检查是否需要路由到其他智能体"""
        patterns = [
            # 让<工具名>帮我<任务>
            r'让\s*([a-zA-Z]+)\s*帮我\s*(.+)',
            # 用<工具名><任务>
            r'用\s*([a-zA-Z]+)\s*(.+)',
            # 请<工具名><任务>
            r'请\s*([a-zA-Z]+)\s*(.+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                target_agent = match.group(1).lower().strip()
                task_desc = match.group(2).strip()

                # 检查目标工具是否在系统中可用
                if self._is_target_agent_available(target_agent):
                    return target_agent, task_desc

        return None

    def _is_target_agent_available(self, target_agent):
        """检查目标智能体是否可用"""
        try:
            import platform
            if platform.system().lower() == "windows":
                result = subprocess.run(["where", target_agent],
                                      capture_output=True, text=True, timeout=5)
            else:
                result = subprocess.run(["which", target_agent],
                                      capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False

    def _execute_collaboration_in_new_window(self, target_agent, task_desc):
        """在新窗口中执行协作任务，保持当前项目路径"""
        import platform
        import shutil
        current_dir = os.getcwd()

        # 记录协作任务到项目背景
        task_id = self.project_context.create_task(
            "collaboration",
            f"'{task_desc}' (由 {self.agent_name} 委派给 {target_agent})",
            assigned_to=target_agent,
            priority="medium"
        )

        try:
            system = platform.system().lower()
            if system == "windows":
                # 在新命令提示符窗口中执行目标智能体（保持当前目录）
                import subprocess
                escaped_desc = task_desc.replace('"', "'")  # 避免引号冲突
                cmd = f'start cmd /k "cd /d {current_dir} && {target_agent} {escaped_desc}"'
                subprocess.run(cmd, shell=True)
            elif system == "darwin":  # macOS
                # 在新终端窗口中执行目标智能体
                import tempfile
                with tempfile.NamedTemporaryFile(mode='w', suffix='.scpt', delete=False) as f:
                    script_content = f'''
tell application "Terminal"
    do script "cd {current_dir} && {target_agent} '{task_desc}'"
    activate
end tell
'''
                    f.write(script_content)
                    script_path = f.name

                subprocess.run(['osascript', script_path])
                os.unlink(script_path)
            else:  # Linux
                # 尝试多种终端
                terminals = ['gnome-terminal', 'konsole', 'xfce4-terminal', 'xterm']

                launched = False
                for terminal in terminals:
                    if shutil.which(terminal):
                        try:
                            if terminal == 'gnome-terminal':
                                subprocess.run([terminal, '--', 'bash', '-c', f'cd "{current_dir}" && {target_agent} "{task_desc}"; exec bash'], detach=True)
                            elif terminal == 'konsole':
                                subprocess.run([terminal, '-e', 'bash', '-c', f'cd "{current_dir}" && {target_agent} "{task_desc}"; exec bash'], detach=True)
                            elif terminal == 'xfce4-terminal':
                                subprocess.run([terminal, '-e', f'bash -c "cd \\"{current_dir}\\" && {target_agent} \\"{task_desc}\\"; exec bash"'], detach=True)
                            else:  # xterm
                                subprocess.run([terminal, '-e', f'bash -c "cd \\"{current_dir}\\" && {target_agent} \\"{task_desc}\\"; exec bash"'], detach=True)
                            launched = True
                            print(f"🔄 已在新窗口启动 {target_agent} 处理: {task_desc}")
                            break
                        except:
                            continue

                if not launched:
                    # 如果没有找到图形终端，直接在后台执行
                    result = subprocess.run([target_agent, task_desc],
                                          capture_output=True,
                                          text=True,
                                          encoding='utf-8',
                                          cwd=current_dir)
                    return result.returncode == 0

            print(f"🔄 已在新窗口启动 {target_agent} 处理: {task_desc}")
            print(f"📁 当前工作目录: {current_dir}")
            print(f"📋 任务已记录到协作背景: {task_id}")
            return True
        except Exception as e:
            print(f"❌ 在新窗口启动 {target_agent} 失败: {e}")
            # 备用执行方式 - 直接执行（但不保持新窗口）
            try:
                result = subprocess.run([target_agent, task_desc],
                                      capture_output=True,
                                      text=True,
                                      encoding='utf-8',
                                      cwd=current_dir)
                return result.returncode == 0
            except Exception as e2:
                print(f"   备用执行也失败: {e2}")
                return False
    
    def work_on_context(self):
        """基于背景工作 - Stigmergy的核心实现"""
        # 分析当前背景以决定下一步行动
        task_id, task = self.project_context.analyze_context_for_next_action(self.agent_name)

        if not task_id:
            # 没有直接分配的任务，但可以检查是否有可执行的后续操作
            # 比如检查生成的文件、优化现有代码等
            return self._check_for_opportunistic_work()

        print(f"智能体 {self.agent_name} 找到任务 {task_id}，开始处理...")

        # 为了确保状态同步，在每次操作后立即保存
        # 更新任务状态为进行中
        self.project_context.update_task_status(task_id, "in_progress", completed_by=self.agent_name)
        self.project_context.add_collaboration_log(
            f"开始处理任务 {task_id}: {task['description']}",
            self.agent_name
        )

        # 立即保存状态以确保其他组件可以访问最新状态
        self.project_context._save_context()

        # 执行任务
        success, stdout, stderr = self._execute_task(task)

        print(f"任务 {task_id} 执行结果: success={success}")

        if success:
            # 任务成功完成
            self.project_context.update_task_status(task_id, "completed", stdout, self.agent_name)
            self.project_context.add_collaboration_log(
                f"完成任务 {task_id}", self.agent_name
            )

            # 检查结果，决定是否创建后续任务
            self._analyze_result_and_create_followup_tasks(task_id, task, stdout)

            # 再次保存以确保完成状态被持久化
            self.project_context._save_context()

            print(f"任务 {task_id} 成功完成")
            return True
        else:
            # 任务执行失败
            self.project_context.update_task_status(task_id, "failed", stderr, self.agent_name)
            self.project_context.add_collaboration_log(
                f"任务 {task_id} 执行失败: {stderr}", self.agent_name
            )

            # 立即保存失败状态
            self.project_context._save_context()

            # 尝试将任务委派给其他智能体
            self._try_delegate_failed_task(task_id, task, stderr)
            print(f"任务 {task_id} 执行失败")
            return False
    
    def _execute_task(self, task):
        """执行具体的任务"""
        print(f"智能体 {self.agent_name} 执行任务: {task['type']} - {task['description'][:50]}...")

        # 根据任务类型执行相应操作
        try:
            if task["type"] == "command_execution":
                # 直接执行命令
                args = task["description"].split()
                result = self.execute_command(args)
            elif task["type"] == "code_generation":
                # 代码生成任务
                prompt = f"生成代码: {task['description']}"
                result = self.execute_command([prompt])
            elif task["type"] == "review":
                # 审查任务
                prompt = f"审查并优化: {task['description']}"
                result = self.execute_command([prompt])
            elif task["type"] == "documentation":
                # 文档任务
                prompt = f"生成文档: {task['description']}"
                result = self.execute_command([prompt])
            elif task["type"] == "collaboration":  # 新增：协作任务类型
                # 这是协作任务，需要解析并调用目标工具
                target_tool = task.get("target_tool", task.get("initiating_tool"))

                # 检查目标工具是否可用
                if not self._is_tool_available(target_tool):
                    return False, "", f"目标工具 {target_tool} 不可用"

                # 使用目标工具执行协作任务
                prompt = task["description"]
                result = self.execute_command_target(target_tool, [prompt])

            else:
                # 默认使用描述作为命令
                prompt = task["description"]
                result = self.execute_command([prompt])

            print(f"任务执行结果: {result[0]}")
            return result
        except Exception as e:
            print(f"任务执行异常: {e}")
            # 返回一个类似执行失败的结果
            return False, "", f"任务执行异常: {str(e)}"

    def _is_tool_available(self, tool_name):
        """检查目标工具是否可用"""
        try:
            if self.system == "windows":
                result = subprocess.run(["where", tool_name],
                                      capture_output=True, text=True, timeout=5)
            else:
                result = subprocess.run(["which", tool_name],
                                      capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False

    def execute_command_target(self, target_tool, args):
        """执行指定目标工具的命令"""
        try:
            if self.system == "windows":
                cmd = [target_tool] + args if args else [target_tool]
            else:
                cmd = [target_tool] + args if args else [target_tool]

            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)
            return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            return False, "", f"执行目标工具 {target_tool} 失败: {str(e)}"
    
    def _analyze_result_and_create_followup_tasks(self, task_id, task, result):
        """分析结果并创建后续任务"""
        # 检查结果是否需要进一步处理
        if "code" in task.get("description", "").lower() and len(result) > 100:
            # 生成的代码可能需要测试
            test_task_id = self.project_context.create_task(
                "testing",
                f"为代码生成单元测试: {result[:300]}...",
                assigned_to="codebuddy",  # 代码智能体
                priority="medium"
            )
            self.project_context.add_collaboration_log(
                f"创建后续测试任务 {test_task_id} 基于任务 {task_id} 的结果",
                self.agent_name
            )
        
        if "analysis" in task.get("type", "").lower():
            # 分析结果可能需要可视化或其他处理
            vis_task_id = self.project_context.create_task(
                "visualization",
                f"将分析结果可视化: {result[:200]}...",
                assigned_to=None,  # 任何合适的智能体
                priority="low"
            )
            self.project_context.add_collaboration_log(
                f"创建可视化任务 {vis_task_id}",
                self.agent_name
            )
    
    def _try_delegate_failed_task(self, task_id, task, error_result):
        """尝试将失败的任务委派给其他智能体"""
        # 分析失败原因，找到更适合的智能体
        suggested_agent = self._analyze_error_and_suggest_agent(error_result)
        
        if suggested_agent and suggested_agent != self.agent_name:
            # 更新任务分配
            self.project_context.data["tasks"][task_id]["assigned_to"] = suggested_agent
            self.project_context.data["tasks"][task_id]["status"] = "pending"  # 重新变为待处理
            self.project_context._save_context()
            
            self.project_context.add_collaboration_log(
                f"将任务 {task_id} 委派给 {suggested_agent}", 
                self.agent_name
            )
    
    def _analyze_error_and_suggest_agent(self, error_result):
        """分析错误结果并建议更适合的智能体"""
        error_lower = error_result.lower()
        
        # 基于错误内容建议智能体
        if any(keyword in error_lower for keyword in ["translate", "language", "text"]):
            return "gemini"  # Gemini在语言处理方面可能更好
        elif any(keyword in error_lower for keyword in ["code", "function", "program"]):
            return "codebuddy"  # CodeBuddy在代码方面可能更好
        elif any(keyword in error_lower for keyword in ["analysis", "data", "math"]):
            return "claude"  # Claude在逻辑分析方面可能更好
        elif any(keyword in error_lower for keyword in ["chinese", "中文"]):
            return "qwen"  # Qwen在中文处理方面可能更好
        
        return None
    
    def _check_for_opportunistic_work(self):
        """检查机会性工作 - 智能体根据背景主动寻找可执行的任务"""
        # 检查是否有需要优化的文件
        for file_path in self.project_context.project_path.glob("*.py"):
            if file_path.name != "__pycache__":
                # 检查是否有Python文件需要审查或优化
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if len(content) > 200:  # 文件较大，可能需要审查
                    task_id = self.project_context.create_task(
                        "code_review",
                        f"审查代码文件 {file_path.name}: {content[:500]}...",
                        assigned_to=self.agent_name,
                        priority="low"
                    )
                    self.project_context.add_collaboration_log(
                        f"发现机会性任务: 审查文件 {file_path.name}",
                        self.agent_name
                    )
                    return self.work_on_context()  # 递归调用处理新任务
        
        # 没有发现机会性工作
        return False


def main():
    """主函数 - CLI协作智能体的入口"""
    if len(sys.argv) < 2:
        print("用法: python cli_collaboration_agent.py <agent_name> [options]")
        print("例如: python cli_collaboration_agent.py claude --work")
        return
    
    agent_name = sys.argv[1]
    agent = CLICollaborationAgent(agent_name)
    
    # 处理命令行参数
    if "--work" in sys.argv or "--work-on-context" in sys.argv:
        success = agent.work_on_context()
        sys.exit(0 if success else 1)
    elif len(sys.argv) > 2:
        # 直接执行命令，但同时更新项目背景
        command_args = sys.argv[2:]
        full_command = " ".join(command_args)
        
        # 创建一个任务记录
        task_id = agent.project_context.create_task(
            "command_execution",
            full_command,
            assigned_to=agent_name,
            priority="normal"
        )
        
        # 更新任务为进行中
        agent.project_context.update_task_status(task_id, "in_progress", completed_by=agent_name)
        
        # 执行命令
        success, stdout, stderr = agent.execute_command(command_args)
        
        # 更新任务状态
        if success:
            agent.project_context.update_task_status(task_id, "completed", stdout, agent_name)
            print(stdout)
            
            # 分析结果并可能创建后续任务
            agent._analyze_result_and_create_followup_tasks(task_id, 
                agent.project_context.data["tasks"][task_id], stdout)
        else:
            agent.project_context.update_task_status(task_id, "failed", stderr, agent_name)
            print(stderr, file=sys.stderr)
        
        sys.exit(0 if success else 1)
    else:
        # 默认行为：尝试在背景中工作
        print(f"智能体 {agent_name} 开始在项目背景中工作...")
        success = agent.work_on_context()
        if not success:
            print(f"智能体 {agent_name} 在当前背景中没有找到可执行的任务")

if __name__ == "__main__":
    main()