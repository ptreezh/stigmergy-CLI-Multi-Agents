"""
AI CLI 协同钩子系统
为每个CLI工具提供项目协同感知能力
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from dataclasses import asdict
import threading
import time

logger = logging.getLogger(__name__)

class CollaborationHook:
    """协同钩子基类"""

    def __init__(self, cli_name: str, project_root: Optional[Path] = None):
        self.cli_name = cli_name
        self.project_root = project_root or Path.cwd()
        self.constitution_file = self.project_root / "PROJECT_CONSTITUTION.json"
        self.state_file = self.project_root / "PROJECT_STATE.json"
        self.tasks_file = self.project_root / "TASKS.json"
        self.collaboration_file = self.project_root / "COLLABORATION_LOG.json"

        self.constitution_cache = {}
        self.state_cache = {}
        self.cache_timestamp = 0
        self.cache_ttl = 30  # 缓存30秒

        logger.info(f"协同钩子初始化: {cli_name} @ {self.project_root}")

    def is_project_enabled(self) -> bool:
        """检查项目是否启用协同功能"""
        if not self.constitution_file.exists():
            return False

        try:
            with open(self.constitution_file, 'r', encoding='utf-8') as f:
                constitution = json.load(f)
                return constitution.get("collaboration_config", {}).get("enabled", False)
        except Exception:
            return False

    def _refresh_cache(self):
        """刷新缓存"""
        current_time = time.time()
        if current_time - self.cache_timestamp > self.cache_ttl:
            self.cache_timestamp = current_time

            # 重新加载项目宪法
            if self.constitution_file.exists():
                try:
                    with open(self.constitution_file, 'r', encoding='utf-8') as f:
                        self.constitution_cache = json.load(f)
                except Exception as e:
                    logger.warning(f"加载项目宪法失败: {e}")

            # 重新加载项目状态
            if self.state_file.exists():
                try:
                    with open(self.state_file, 'r', encoding='utf-8') as f:
                        self.state_cache = json.load(f)
                except Exception as e:
                    logger.warning(f"加载项目状态失败: {e}")

    def get_project_constitution(self) -> Dict:
        """获取项目宪法"""
        self._refresh_cache()
        return self.constitution_cache

    def get_project_state(self) -> Dict:
        """获取项目状态"""
        self._refresh_cache()
        return self.state_cache

    def detect_collaboration_intent(self, user_input: str) -> Dict:
        """检测协作意图"""
        if not self.is_project_enabled():
            return {"intent": False}

        constitution = self.get_project_constitution()
        collaboration_keywords = constitution.get("cli_preferences", {}).get("collaboration_keywords", [])

        # 检测协作关键词
        user_input_lower = user_input.lower()
        for keyword in collaboration_keywords:
            if keyword in user_input_lower:
                return {
                    "intent": True,
                    "keyword": keyword,
                    "detected_at": datetime.now(timezone.utc).isoformat()
                }

        return {"intent": False}

    def get_next_task(self) -> Optional[Dict]:
        """获取下一个任务"""
        if not self.is_project_enabled():
            return None

        # 这里应该调用任务管理器获取任务
        # 为了简化，直接检查任务文件
        if not self.tasks_file.exists():
            return None

        try:
            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)

            # 获取CLI优先级
            constitution = self.get_project_constitution()
            cli_preferences = constitution.get("cli_preferences", {})
            task_priorities = cli_preferences.get("task_priorities", {}).get(self.cli_name, [])

            # 查找待处理任务
            pending_tasks = [task for task in tasks_data.get("tasks", [])
                            if task.get("status") == "pending"]

            if not pending_tasks:
                return None

            # 简单优先级排序
            priority_scores = {"critical": 4, "high": 3, "normal": 2, "low": 1}

            def task_score(task):
                score = priority_scores.get(task.get("priority", "normal"), 2)

                # CLI偏好加分
                if task.get("tags"):
                    for tag in task.get("tags", []):
                        if tag in task_priorities:
                            score += 2

                return score

            pending_tasks.sort(key=task_score, reverse=True)
            return pending_tasks[0]

        except Exception as e:
            logger.error(f"获取下一个任务失败: {e}")
            return None

    def create_task(self, title: str, description: str, **kwargs) -> bool:
        """创建新任务"""
        if not self.is_project_enabled():
            logger.warning("项目未启用协同功能")
            return False

        try:
            # 这里应该调用任务管理器创建任务
            # 为了简化，直接修改任务文件
            tasks_data = {"tasks": [], "next_id": 1}

            if self.tasks_file.exists():
                with open(self.tasks_file, 'r', encoding='utf-8') as f:
                    tasks_data = json.load(f)

            # 创建新任务
            task_id = f"task_{tasks_data['next_id']:04d}"
            task = {
                "id": task_id,
                "title": title,
                "description": description,
                "status": "pending",
                "priority": "normal",
                "assigned_to": self.cli_name,
                "created_by": self.cli_name,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "tags": [],
                "metadata": kwargs
            }

            tasks_data["tasks"].append(task)
            tasks_data["next_id"] += 1

            with open(self.tasks_file, 'w', encoding='utf-8') as f:
                json.dump(tasks_data, f, indent=2, ensure_ascii=False)

            # 记录协作日志
            self._log_activity("task_created", {
                "task_id": task_id,
                "title": title,
                "assigned_to": self.cli_name
            })

            logger.info(f"✅ 任务创建成功: {task_id}")
            return True

        except Exception as e:
            logger.error(f"创建任务失败: {e}")
            return False

    def update_task_status(self, task_id: str, status: str, **kwargs) -> bool:
        """更新任务状态"""
        if not self.is_project_enabled():
            return False

        try:
            if not self.tasks_file.exists():
                return False

            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)

            # 查找并更新任务
            for task in tasks_data.get("tasks", []):
                if task.get("id") == task_id:
                    task["status"] = status
                    task["updated_at"] = datetime.now(timezone.utc).isoformat()
                    task.update(kwargs)

                    # 如果任务完成，记录完成时间
                    if status == "completed":
                        task["completed_at"] = datetime.now(timezone.utc).isoformat()

                        # 记录协作日志
                        self._log_activity("task_completed", {
                            "task_id": task_id,
                            "title": task.get("title", ""),
                            "assigned_to": task.get("assigned_to", "")
                        })
                    else:
                        # 记录协作日志
                        self._log_activity("task_status_updated", {
                            "task_id": task_id,
                            "old_status": task.get("status"),
                            "new_status": status,
                            "assigned_to": task.get("assigned_to", "")
                        })

                    break

            with open(self.tasks_file, 'w', encoding='utf-8') as f:
                json.dump(tasks_data, f, indent=2, ensure_ascii=False)

            logger.info(f"✅ 任务状态更新: {task_id} -> {status}")
            return True

        except Exception as e:
            logger.error(f"更新任务状态失败: {e}")
            return False

    def _log_activity(self, action: str, details: Dict):
        """记录协作活动"""
        try:
            log_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "cli": self.cli_name,
                "action": action,
                "details": details
            }

            logs = []
            if self.collaboration_file.exists():
                with open(self.collaboration_file, 'r', encoding='utf-8') as f:
                    logs = json.load(f)

            logs.append(log_entry)

            # 限制日志大小
            if len(logs) > 1000:
                logs = logs[-1000:]

            with open(self.collaboration_file, 'w', encoding='utf-8') as f:
                json.dump(logs, f, indent=2, ensure_ascii=False)

        except Exception as e:
            logger.error(f"记录协作日志失败: {e}")

class CLICollaborationHooks:
    """CLI协作钩子集合"""

    _hooks = {}
    _lock = threading.Lock()

    @classmethod
    def register_hook(cls, cli_name: str, hook: CollaborationHook):
        """注册协作钩子"""
        with cls._lock:
            cls._hooks[cli_name] = hook
            logger.info(f"注册协作钩子: {cli_name}")

    @classmethod
    def get_hook(cls, cli_name: str) -> Optional[CollaborationHook]:
        """获取协作钩子"""
        with cls._lock:
            return cls._hooks.get(cli_name)

    @classmethod
    def initialize_hook(cls, cli_name: str, project_root: Optional[Path] = None):
        """初始化协作钩子"""
        if cls.get_hook(cli_name) is None:
            hook = CollaborationHook(cli_name, project_root)
            cls.register_hook(cli_name, hook)
            logger.info(f"初始化协作钩子: {cli_name}")
            return hook

        return cls.get_hook(cli_name)

# 预定义的CLI工具钩子
def initialize_standard_hooks():
    """初始化标准CLI工具的协作钩子"""

    standard_clis = ["claude", "gemini", "codex", "qwencode", "codebuddy", "iflow", "qoder", "copilot"]

    for cli_name in standard_clis:
        CLICollaborationHooks.initialize_hook(cli_name)

# 全局初始化
initialize_standard_hooks()