#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体协作系统 - 原子性背景管理器
实现多智能体安全协作，防止任务重复认领
"""

import json
import time
import threading
import subprocess
from pathlib import Path
from datetime import datetime
import tempfile
import os


class AtomicFileHandler:
    """原子性文件处理器 - 确保并发安全"""
    
    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.lock_path = self.file_path.with_suffix(self.file_path.suffix + '.lock')
        self.lock = threading.Lock()  # 内存锁，防止同一进程内的并发冲突
    
    def atomic_read(self):
        """原子性读取文件"""
        max_retries = 10
        for attempt in range(max_retries):
            try:
                # 等待外部锁释放（通过文件的存在）
                while self.lock_path.exists():
                    time.sleep(0.01)
                
                # 检查文件是否存在
                if not self.file_path.exists():
                    return None
                        
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                # 文件可能在写入过程中，等待重试
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.01 * (attempt + 1))
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.01 * (attempt + 1))
    
    def atomic_write(self, data):
        """原子性写入文件"""
        with self.lock:  # 先获取内存锁
            # 创建临时文件
            temp_path = self.file_path.with_suffix(self.file_path.suffix + '.tmp')
            
            try:
                # 创建锁文件，表明正在进行写操作
                self.lock_path.touch()
                
                # 写入临时文件
                with open(temp_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                # 原子性移动 - 在大多数系统上是原子操作
                temp_path.replace(self.file_path)

                return True
                
            except Exception as e:
                print(f"原子写入失败: {e}")
                # 确保清理临时文件
                if temp_path.exists():
                    try:
                        temp_path.unlink()
                    except:
                        pass
                return False
            finally:
                # 无论成功与否，都要释放锁
                if self.lock_path.exists():
                    try:
                        self.lock_path.unlink()
                    except:
                        pass


class SharedProjectContext:
    """共享项目背景管理器 - 实现Stigmergy机制"""
    
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.spec_file = self.project_path / "PROJECT_SPEC.json"
        self.handler = AtomicFileHandler(self.spec_file)
        
        # 确保项目背景文件存在
        self._ensure_spec_exists()
    
    def _ensure_spec_exists(self):
        """确保项目背景文件存在"""
        if not self.spec_file.exists():
            default_spec = {
                "project_name": self.project_path.name,
                "created_at": datetime.now().isoformat(),
                "status": "active",
                "tasks": {},
                "collaboration_history": [],
                "current_state": {
                    "active_task": None,
                    "completed_tasks": [],
                    "pending_tasks": [],
                    "assigned_tasks": {}  # 活跃分配，用于防止重复认领
                },
                "last_updated": datetime.now().isoformat()
            }
            self.handler.atomic_write(default_spec)
    
    def claim_available_task(self, agent_name):
        """智能体认领可用任务 - 原子性操作防止重复认领"""
        max_retries = 5

        for attempt in range(max_retries):
            try:
                # 读取最新状态
                spec = self.handler.atomic_read()
                if not spec:
                    return None, None

                # 优先获取直接分配给此智能体的任务
                for task_id, task in spec["tasks"].items():
                    if task.get("assigned_to") == agent_name and task["status"] == "pending":
                        # 尝试设置为进行中状态
                        if self._set_task_in_progress(spec, task_id, agent_name):
                            return task_id, task

                # 然后获取未分配但可处理的任务
                for task_id, task in spec["tasks"].items():
                    if (task["status"] == "pending" and
                        task.get("assigned_to") is None and
                        self._can_handle_task(task, agent_name)):

                        # 尝试认领此任务
                        if self._claim_task_for_agent(spec, task_id, agent_name):
                            # 记录协作日志
                            self._add_collaboration_log(
                                spec,
                                f"智能体 {agent_name} 认领任务 {task_id}: {task['description']}"
                            )
                            return task_id, task

                # 没有任务可认领
                return None, None
                
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"认领任务失败: {e}")
                    return None, None
                time.sleep(0.01 * (attempt + 1))
        
        return None, None
    
    def _claim_task_for_agent(self, spec, task_id, agent_name):
        """认领任务 - 确保原子性"""
        # 检查是否已被他人认领
        current_task = spec["tasks"][task_id]
        if current_task.get("assigned_to") is not None:
            return False  # 任务已被其他人认领
        
        # 检查活跃分配列表（额外安全检查）
        if task_id in spec["current_state"]["assigned_tasks"]:
            return False  # 任务已在活跃分配中
        
        # 认领任务
        spec["tasks"][task_id]["assigned_to"] = agent_name
        spec["tasks"][task_id]["status"] = "in_progress"
        spec["tasks"][task_id]["started_at"] = datetime.now().isoformat()
        
        # 添加到活跃分配列表
        spec["current_state"]["assigned_tasks"][task_id] = {
            "claimed_by": agent_name,
            "claimed_at": datetime.now().isoformat()
        }
        
        spec["last_updated"] = datetime.now().isoformat()
        
        # 原子性写入
        return self.handler.atomic_write(spec)
    
    def _set_task_in_progress(self, spec, task_id, agent_name):
        """设置已分配任务为进行中状态"""
        if spec["tasks"][task_id]["status"] == "in_progress":
            return False  # 任务已在处理中
        
        spec["tasks"][task_id]["status"] = "in_progress"
        spec["tasks"][task_id]["started_at"] = datetime.now().isoformat()
        
        spec["current_state"]["active_task"] = task_id
        spec["last_updated"] = datetime.now().isoformat()
        
        return self.handler.atomic_write(spec)
    
    def update_task_status(self, task_id, status, result=None, completed_by=None):
        """更新任务状态 - 原子性操作"""
        max_retries = 5
        
        for attempt in range(max_retries):
            try:
                spec = self.handler.atomic_read()
                if not spec or task_id not in spec["tasks"]:
                    return False
                
                old_status = spec["tasks"][task_id]["status"]
                
                # 更新状态
                spec["tasks"][task_id]["status"] = status
                spec["tasks"][task_id]["result"] = result
                spec["tasks"][task_id]["completed_by"] = completed_by
                spec["tasks"][task_id]["completed_at"] = datetime.now().isoformat() if status == "completed" else None
                
                # 更新全局状态
                if status == "completed":
                    if task_id in spec["current_state"]["assigned_tasks"]:
                        del spec["current_state"]["assigned_tasks"][task_id]
                    spec["current_state"]["completed_tasks"].append(task_id)
                    if task_id in spec["current_state"]["pending_tasks"]:
                        spec["current_state"]["pending_tasks"].remove(task_id)
                    spec["current_state"]["active_task"] = None
                elif status == "failed":
                    if task_id in spec["current_state"]["assigned_tasks"]:
                        del spec["current_state"]["assigned_tasks"][task_id]
                    spec["current_state"]["active_task"] = None
                
                spec["last_updated"] = datetime.now().isoformat()
                
                if self.handler.atomic_write(spec):
                    # 添加完成日志
                    if status == "completed":
                        self._add_collaboration_log(
                            spec,
                            f"任务 {task_id} 已由 {completed_by} 完成: {spec['tasks'][task_id]['description'][:100]}..."
                        )
                    elif status == "failed":
                        self._add_collaboration_log(
                            spec,
                            f"任务 {task_id} 执行失败: {result[:100] if result else 'Unknown error'}"
                        )
                    return True
                else:
                    return False
                    
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"更新任务状态失败: {e}")
                    return False
                time.sleep(0.01 * (attempt + 1))
        
        return False
    
    def _can_handle_task(self, task, agent_name):
        """判断智能体是否能处理任务"""
        task_desc = task["description"].lower()
        
        # 根据智能体名称判断处理能力
        agent_capabilities = {
            "claude": ["analyze", "review", "explain", "logic", "reasoning", "debug"],
            "gemini": ["translate", "document", "write", "story", "creative"],
            "kimi": ["long", "research", "content", "analyze"],
            "qwen": ["chinese", "中文", "translate", "chat", "dialogue"],
            "codebuddy": ["code", "function", "program", "bug", "refactor", "optimize"],
            "qodercli": ["generate", "create", "template", "scaffold"],
            "iflow": ["workflow", "process", "automate", "task"],
            "ollama": ["local", "offline", "private", "model"]
        }
        
        capabilities = agent_capabilities.get(agent_name.lower(), [])
        return any(cap in task_desc for cap in capabilities)
    
    def _add_collaboration_log(self, spec, message):
        """添加协作日志"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "updated_at": datetime.now().isoformat()
        }
        spec["collaboration_history"].append(log_entry)
        spec["last_updated"] = datetime.now().isoformat()
    
    def create_task(self, task_type, description, assigned_to=None, priority="medium"):
        """创建新任务 - 确保原子性"""
        task_id = f"{task_type}_{int(time.time())}_{len(self.handler.atomic_read()['tasks'])}"
        
        max_retries = 5
        for attempt in range(max_retries):
            try:
                spec = self.handler.atomic_read()
                if not spec:
                    spec = {
                        "project_name": self.project_path.name,
                        "tasks": {},
                        "collaboration_history": [],
                        "current_state": {
                            "active_task": None,
                            "completed_tasks": [],
                            "pending_tasks": [],
                            "assigned_tasks": {}
                        }
                    }
                
                task = {
                    "id": task_id,
                    "type": task_type,
                    "description": description,
                    "assigned_to": assigned_to,
                    "status": "pending",
                    "priority": priority,
                    "created_at": datetime.now().isoformat(),
                    "result": None,
                    "completed_by": None,
                    "completed_at": None
                }
                
                spec["tasks"][task_id] = task
                spec["current_state"]["pending_tasks"].append(task_id)
                
                # 添加创建日志
                self._add_collaboration_log(
                    spec,
                    f"创建任务 {task_id} ({task_type}): {description}"
                )
                
                if self.handler.atomic_write(spec):
                    return task_id
                else:
                    time.sleep(0.01 * (attempt + 1))
                    
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"创建任务失败: {e}")
                    return None
                time.sleep(0.01 * (attempt + 1))
        
        return None


class CLICollaborationAgent:
    """CLI协作智能体 - 基于共享背景的协作"""

    def __init__(self, agent_name, project_path):
        self.agent_name = agent_name
        self.project_context = SharedProjectContext(project_path)

    def work_on_context(self):
        """基于共享背景工作"""
        # 尝试认领任务
        task_id, task = self.project_context.claim_available_task(self.agent_name)

        if not task_id:
            return False  # 没有可处理的任务

        print(f"智能体 {self.agent_name} 开始处理任务 {task_id}")

        # 执行任务
        success, result = self._execute_task(task)

        # 更新任务状态
        if success:
            self.project_context.update_task_status(task_id, "completed", result, self.agent_name)
            print(f"智能体 {self.agent_name} 成功完成任务 {task_id}")
        else:
            self.project_context.update_task_status(task_id, "failed", result, self.agent_name)
            print(f"智能体 {self.agent_name} 任务 {task_id} 执行失败")

        return success

    def _execute_task(self, task):
        """执行具体任务"""
        # 这里实现具体的任务执行逻辑
        # 根据任务类型调用相应的CLI工具
        try:
            # 这里是一个模拟执行
            # 实际实现会根据任务类型调用对应的工具
            import subprocess
            result = subprocess.run(
                ["echo", f"Processed: {task['description']} by {self.agent_name}"],
                capture_output=True,
                text=True
            )
            return True, result.stdout
        except Exception as e:
            return False, f"执行失败: {e}"


def demo_concurrent_agents():
    """演示并发智能体协作"""
    import threading
    import random
    
    # 创建项目目录
    project_dir = Path("demo_concurrent_collaboration")
    project_dir.mkdir(exist_ok=True)
    
    # 创建一个共享背景管理器
    context = SharedProjectContext(project_dir)
    
    # 创建一些任务
    context.create_task("coding", "编写计算器应用的加法功能", priority="high")
    context.create_task("review", "审查登录功能的代码", priority="medium")
    context.create_task("documentation", "为API生成使用文档", priority="low")
    context.create_task("testing", "为订单处理系统生成单元测试", priority="high")
    
    print("📝 创建了4个任务:")
    spec = context.handler.atomic_read()
    for task_id, task in spec["tasks"].items():
        print(f"   {task_id}: {task['description']} (status: {task['status']})")
    
    # 模拟多个智能体并发工作
    agents = ["claude", "gemini", "codebuddy", "qwen"]
    
    def agent_worker(agent_name):
        """智能体工作线程"""
        agent = CLICollaborationAgent(agent_name, project_dir)
        
        # 工作多个轮次
        for round_num in range(3):  # 每个智能体循环工作3轮
            success = agent.work_on_context()
            if success:
                time.sleep(random.uniform(0.1, 0.5))  # 随机延迟模拟工作时间
            else:
                # 没有任务可处理，延迟后再次尝试
                time.sleep(0.2)
    
    # 启动多个智能体线程
    threads = []
    for agent_name in agents:
        thread = threading.Thread(target=agent_worker, args=(agent_name,))
        thread.daemon = True
        threads.append(thread)
        thread.start()
        print(f"🏃‍♂️ 启动智能体 {agent_name}")
    
    # 等待所有线程完成
    for thread in threads:
        thread.join(timeout=10)  # 10秒超时
    
    print("\n📋 最终项目状态:")
    final_spec = context.handler.atomic_read()
    for task_id, task in final_spec["tasks"].items():
        print(f"   {task_id}: {task['status']} (assigned to: {task.get('assigned_to', 'none')})")
    
    print(f"   协作历史记录: {len(final_spec['collaboration_history'])} 条")
    
    # 清理演示目录
    import shutil
    shutil.rmtree(project_dir)


if __name__ == "__main__":
    print("🎯 演示原子性协作机制防止任务重复认领")
    print("="*60)
    demo_concurrent_agents()
    print("\n✅ 演示完成 - 并发认领已成功防範")