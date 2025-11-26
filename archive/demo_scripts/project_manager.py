#!/usr/bin/env python3
"""
AI CLI 项目协同管理系统
支持项目宪法生成、状态管理、间接协作等功能

核心功能：
1. 项目宪法 (PROJECT_CONSTITUTION) 生成和管理
2. 项目状态文件 (PROJECT_STATE) 管理
3. 任务池和协作协议
4. CLI工具协同钩子集成
5. 项目初始化和管理命令
"""

import os
import json
import hashlib
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
import logging
import uuid
import threading
import fcntl

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Task:
    """任务定义"""
    id: str
    title: str
    description: str
    status: str  # pending, in_progress, completed, failed, blocked
    priority: str  # low, normal, high, critical
    assigned_to: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = ""
    updated_at: str = ""
    due_date: Optional[str] = None
    tags: List[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.metadata is None:
            self.metadata = {}
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()
        if not self.updated_at:
            self.updated_at = self.created_at

@dataclass
class ProjectState:
    """项目状态定义"""
    project_id: str
    project_name: str
    version: str
    status: str  # active, paused, completed, archived
    created_at: str = ""
    updated_at: str = ""
    last_activity: str = ""
    active_tasks: List[str] = None
    completed_tasks: List[str] = None
    blocked_tasks: List[str] = None
    participants: List[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.active_tasks is None:
            self.active_tasks = []
        if self.completed_tasks is None:
            self.completed_tasks = []
        if self.blocked_tasks is None:
            self.blocked_tasks = []
        if self.participants is None:
            self.participants = []
        if self.metadata is None:
            self.metadata = {}
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()
        if not self.updated_at:
            self.updated_at = self.created_at
        if not self.last_activity:
            self.last_activity = self.created_at

class ProjectConstitution:
    """项目宪法管理器"""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.constitution_file = project_root / "PROJECT_CONSTITUTION.json"
        self.state_file = project_root / "PROJECT_STATE.json"
        self.tasks_file = project_root / "TASKS.json"
        self.collaboration_file = project_root / "COLLABORATION_LOG.json"

    def initialize_project(self, project_name: str, description: str = "", **kwargs) -> bool:
        """初始化项目，生成项目宪法"""
        try:
            project_id = self._generate_project_id(project_root)

            constitution = {
                "project_id": project_id,
                "project_name": project_name,
                "description": description,
                "version": "1.0.0",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "project_root": str(project_root),
                "collaboration_config": {
                    "enabled": True,
                    "protocol_version": "1.0",
                    "auto_task_assignment": True,
                    "conflict_resolution": "timestamp_priority",
                    "status_sync_interval": 30  # 秒
                },
                "cli_preferences": {
                    "primary_cli": "claude",
                    "task_priorities": {
                        "claude": ["code_review", "architecture", "documentation"],
                        "gemini": ["research", "analysis", "testing"],
                        "codex": ["code_generation", "optimization", "refactoring"],
                        "qwencode": ["code_completion", "snippet_generation", "pattern_matching"],
                        "codebuddy": ["project_setup", "build_management", "tooling"],
                        "iflow": ["workflow_automation", "process_optimization", "integration"]
                    },
                    "collaboration_keywords": [
                        "协同", "协作", "合作", "配合", "协调",
                        "collaborate", "coordinate", "assist", "help", "支持"
                    ]
                },
                "status_management": {
                    "auto_save": True,
                    "max_task_history": 1000,
                    "cleanup_interval": 3600,  # 1小时
                    "backup_count": 10
                },
                **kwargs
            }

            # 创建初始项目状态
            project_state = ProjectState(
                project_id=project_id,
                project_name=project_name,
                version="1.0.0",
                status="active"
            )

            # 保存文件
            self._save_constitution(constitution)
            self._save_state(project_state)
            self._initialize_tasks()

            logger.info(f"✅ 项目宪法已生成: {self.constitution_file}")
            logger.info(f"✅ 项目状态已创建: {self.state_file}")
            logger.info(f"✅ 任务管理已初始化: {self.tasks_file}")

            return True

        except Exception as e:
            logger.error(f"❌ 项目初始化失败: {e}")
            return False

    def _generate_project_id(self, project_root: Path) -> str:
        """生成项目ID"""
        # 使用项目根目录的哈希值生成唯一ID
        root_str = str(project_root.absolute())
        return hashlib.md5(root_str.encode()).hexdigest()[:12]

    def _save_constitution(self, constitution: Dict):
        """保存项目宪法"""
        with open(self.constitution_file, 'w', encoding='utf-8') as f:
            json.dump(constitution, f, indent=2, ensure_ascii=False)

    def _save_state(self, state: ProjectState):
        """保存项目状态"""
        state.updated_at = datetime.now(timezone.utc).isoformat()
        state.last_activity = state.updated_at

        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(state), f, indent=2, ensure_ascii=False)

    def _initialize_tasks(self):
        """初始化任务文件"""
        tasks = {
            "version": "1.0",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "tasks": [],
            "next_id": 1,
            "completed_count": 0,
            "active_count": 0
        }

        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            json.dump(tasks, f, indent=2, ensure_ascii=False)

class TaskManager:
    """任务管理器"""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.tasks_file = project_root / "TASKS.json"
        self.lock_file = project_root / ".tasks.lock"

    def _acquire_lock(self):
        """获取文件锁"""
        if os.name == 'posix':
            try:
                self.lock_fd = open(self.lock_file, 'w')
                fcntl.flock(self.lock_fd.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                return True
            except (IOError, OSError):
                return False
        else:
            # Windows系统简化处理
            try:
                if not os.path.exists(self.lock_file):
                    open(self.lock_file, 'w').close()
                return True
            except:
                return False

    def _release_lock(self):
        """释放文件锁"""
        if os.name == 'posix' and hasattr(self, 'lock_fd'):
            fcntl.flock(self.lock_fd.fileno(), fcntl.LOCK_UN)
            self.lock_fd.close()

    def load_tasks(self) -> Dict:
        """加载任务数据"""
        if not self.tasks_file.exists():
            return {"tasks": [], "next_id": 1, "completed_count": 0, "active_count": 0}

        try:
            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"加载任务文件失败: {e}")
            return {"tasks": [], "next_id": 1, "completed_count": 0, "active_count": 0}

    def save_tasks(self, tasks_data: Dict):
        """保存任务数据"""
        tasks_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        if self._acquire_lock():
            try:
                with open(self.tasks_file, 'w', encoding='utf-8') as f:
                    json.dump(tasks_data, f, indent=2, ensure_ascii=False)
            finally:
                self._release_lock()
        else:
            logger.warning("无法获取文件锁，保存任务可能失败")

    def create_task(self, title: str, description: str, **kwargs) -> Task:
        """创建新任务"""
        tasks_data = self.load_tasks()

        task_id = f"task_{tasks_data['next_id']:04d}"
        task = Task(
            id=task_id,
            title=title,
            description=description,
            **kwargs
        )

        tasks_data["tasks"].append(asdict(task))
        tasks_data["next_id"] += 1
        tasks_data["active_count"] += 1

        self.save_tasks(tasks_data)
        logger.info(f"✅ 创建任务: {task_id} - {title}")

        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        """获取特定任务"""
        tasks_data = self.load_tasks()

        for task_data in tasks_data["tasks"]:
            if task_data["id"] == task_id:
                return Task(**task_data)

        return None

    def update_task(self, task_id: str, **kwargs) -> Optional[Task]:
        """更新任务"""
        tasks_data = self.load_tasks()

        for i, task_data in enumerate(tasks_data["tasks"]):
            if task_data["id"] == task_id:
                # 更新字段
                task_data.update(kwargs)
                task_data["updated_at"] = datetime.now(timezone.utc).isoformat()

                # 更新统计
                if "status" in kwargs:
                    old_status = tasks_data["tasks"][i].get("status")
                    new_status = kwargs["status"]

                    if old_status == "pending" and new_status == "in_progress":
                        pass
                    elif old_status in ["pending", "in_progress"] and new_status == "completed":
                        tasks_data["completed_count"] += 1
                        tasks_data["active_count"] -= 1
                        tasks_data["tasks"][i]["completed_at"] = datetime.now(timezone.utc).isoformat()
                    elif old_status == "completed" and new_status in ["pending", "in_progress"]:
                        tasks_data["completed_count"] -= 1
                        tasks_data["active_count"] += 1

                tasks_data["tasks"][i] = task_data
                self.save_tasks(tasks_data)

                return Task(**task_data)

        return None

    def list_tasks(self, status: Optional[str] = None, assigned_to: Optional[str] = None) -> List[Task]:
        """列出任务"""
        tasks_data = self.load_tasks()
        tasks = [Task(**task_data) for task_data in tasks_data["tasks"]]

        # 过滤条件
        if status:
            tasks = [t for t in tasks if t.status == status]

        if assigned_to:
            tasks = [t for t in tasks if t.assigned_to == assigned_to]

        return tasks

    def get_next_pending_task(self, cli_name: str) -> Optional[Task]:
        """获取下一个待处理任务"""
        tasks_data = self.load_tasks()
        constitution = ProjectConstitution(self.project_root)
        constitution_data = constitution.load_constitution()

        # 获取CLI偏好
        cli_preferences = constitution_data.get("cli_preferences", {})
        cli_priority = cli_preferences.get("task_priorities", {}).get(cli_name, [])

        pending_tasks = [Task(**t) for t in tasks_data["tasks"] if t["status"] == "pending"]

        if not pending_tasks:
            return None

        # 按优先级和CLI偏好排序
        def task_score(task: Task) -> int:
            score = 0

            # 优先级评分
            priority_scores = {"critical": 4, "high": 3, "normal": 2, "low": 1}
            score += priority_scores.get(task.priority, 2)

            # CLI偏好评分
            if task.tags:
                for tag in task.tags:
                    if tag in cli_priority:
                        score += 2  # 偏好任务加分

            # 时间因素
            if task.created_at:
                created_time = datetime.fromisoformat(task.created_at.replace('Z', '+00:00'))
                age_hours = (datetime.now() - created_time).total_seconds() / 3600
                if age_hours > 24:  # 超过1天的任务加分
                    score += 1

            return score

        pending_tasks.sort(key=task_score, reverse=True)
        return pending_tasks[0]

class CollaborationLogger:
    """协作日志记录器"""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.log_file = project_root / "COLLABORATION_LOG.json"

    def log_activity(self, cli_name: str, action: str, details: Dict[str, Any] = None):
        """记录协作活动"""
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "cli": cli_name,
            "action": action,
            "details": details or {}
        }

        try:
            logs = []
            if self.log_file.exists():
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    logs = json.load(f)

            logs.append(log_entry)

            # 限制日志大小
            if len(logs) > 1000:
                logs = logs[-1000:]

            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(logs, f, indent=2, ensure_ascii=False)

        except Exception as e:
            logger.error(f"记录协作日志失败: {e}")

class ProjectManager:
    """项目管理器主类"""

    def __init__(self, project_root: Optional[Path] = None):
        if project_root is None:
            project_root = Path.cwd()

        self.project_root = project_root
        self.constitution = ProjectConstitution(project_root)
        self.task_manager = TaskManager(project_root)
        self.collaboration_logger = CollaborationLogger(project_root)

        logger.info(f"📁 项目管理器初始化: {project_root}")

    def initialize(self, project_name: str, description: str = "", **kwargs) -> bool:
        """初始化项目"""
        if self.constitution.constitution_file.exists():
            logger.warning("项目已存在，跳过初始化")
            return False

        return self.constitution.initialize_project(project_name, description, **kwargs)

    def is_project_initialized(self) -> bool:
        """检查项目是否已初始化"""
        return self.constitution.constitution_file.exists()

    def get_constitution(self) -> Dict:
        """获取项目宪法"""
        if not self.constitution.constitution_file.exists():
            return {}

        with open(self.constitution.constitution_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_constitution(self) -> Dict:
        """加载项目宪法（向后兼容）"""
        return self.get_constitution()

    def update_constitution(self, updates: Dict) -> bool:
        """更新项目宪法"""
        try:
            constitution = self.get_constitution()
            constitution.update(updates)
            constitution["updated_at"] = datetime.now(timezone.utc).isoformat()

            with open(self.constitution.constitution_file, 'w', encoding='utf-8') as f:
                json.dump(constitution, f, indent=2, ensure_ascii=False)

            return True
        except Exception as e:
            logger.error(f"更新项目宪法失败: {e}")
            return False

    def create_task(self, title: str, description: str, **kwargs) -> Task:
        """创建任务"""
        return self.task_manager.create_task(title, description, **kwargs)

    def update_task(self, task_id: str, **kwargs) -> Optional[Task]:
        """更新任务"""
        task = self.task_manager.update_task(task_id, **kwargs)

        # 记录协作日志
        if "status" in kwargs:
            self.collaboration_logger.log_activity(
                cli_name="project_manager",
                action="task_status_update",
                details={
                    "task_id": task_id,
                    "new_status": kwargs["status"],
                    "task_title": task.title if task else "Unknown"
                }
            )

        return task

    def get_next_task(self, cli_name: str) -> Optional[Task]:
        """获取CLI的下一个任务"""
        return self.task_manager.get_next_pending_task(cli_name)

    def list_tasks(self, **filters) -> List[Task]:
        """列出任务"""
        return self.task_manager.list_tasks(**filters)

    def get_project_status(self) -> Dict:
        """获取项目状态"""
        constitution = self.get_constitution()
        state_file = self.constitution.state_file

        if not state_file.exists():
            return {"error": "项目状态文件不存在"}

        with open(state_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def complete_task(self, task_id: str, result: str = "", **kwargs):
        """完成任务"""
        update_data = {
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "result": result
        }
        update_data.update(kwargs)

        task = self.update_task(task_id, **update_data)

        # 记录协作日志
        self.collaboration_logger.log_activity(
            cli_name="project_manager",
            action="task_completed",
            details={
                "task_id": task_id,
                "task_title": task.title if task else "Unknown",
                "result": result[:100] + "..." if len(result) > 100 else result
            }
        )

        return task

def main():
    """命令行接口"""
    parser = argparse.ArgumentParser(description="AI CLI 项目协同管理系统")
    parser.add_argument("command", choices=["init", "task", "status", "list", "complete"], help="命令")
    parser.add_argument("--project-root", "-p", type=Path, help="项目根目录 (默认为当前目录)")
    parser.add_argument("--title", "-t", help="任务标题")
    parser.add_argument("--description", "-d", help="任务描述")
    parser.add_argument("--status", "-s", help="任务状态筛选")
    parser.add_argument("--assigned-to", help="指派给筛选")
    parser.add_argument("--cli-name", "-c", help="CLI工具名称")
    parser.add_argument("--project-name", "-n", help="项目名称")
    parser.add_argument("--result", "-r", help="任务完成结果")

    args = parser.parse_args()

    pm = ProjectManager(args.project_root)

    try:
        if args.command == "init":
            if not args.project_name:
                print("❌ 初始化项目需要提供 --project-name")
                return

            success = pm.initialize(args.project_name, args.description or "")
            if success:
                print(f"✅ 项目 '{args.project_name}' 初始化成功")
                print(f"📁 项目目录: {pm.project_root}")
            else:
                print("❌ 项目初始化失败")

        elif args.command == "task":
            if not args.title:
                print("❌ 创建任务需要提供 --title")
                return

            task = pm.create_task(args.title, args.description or "")
            print(f"✅ 任务创建成功: {task.id}")
            print(f"   标题: {task.title}")
            print(f"   状态: {task.status}")

        elif args.command == "list":
            filters = {}
            if args.status:
                filters["status"] = args.status
            if args.assigned_to:
                filters["assigned_to"] = args.assigned_to

            tasks = pm.list_tasks(**filters)
            if tasks:
                print(f"📋 找到 {len(tasks)} 个任务:")
                for task in tasks:
                    status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅", "failed": "❌"}.get(task.status, "❓")
                    print(f"  {status_emoji} {task.id} - {task.title}")
                    if task.assigned_to:
                        print(f"     指派给: {task.assigned_to}")
            else:
                print("📭 没有找到匹配的任务")

        elif args.command == "status":
            if args.cli_name:
                # 获取CLI的下一个任务
                task = pm.get_next_task(args.cli_name)
                if task:
                    print(f"📋 下一个任务 ({args.cli_name}):")
                    print(f"  ID: {task.id}")
                    print(f"  标题: {task.title}")
                    print(f"  描述: {task.description}")
                    print(f"  优先级: {task.priority}")
                else:
                    print(f"📭 {args.cli_name} 没有待处理任务")
            else:
                # 显示项目整体状态
                status = pm.get_project_status()
                if "error" not in status:
                    print(f"📊 项目状态: {status['project_name']}")
                    print(f"   状态: {status['status']}")
                    print(f"   版本: {status['version']}")
                    print(f"   更新时间: {status['updated_at']}")
                else:
                    print("❌ 无法读取项目状态")

        elif args.command == "complete":
            if not hasattr(args, 'current_task_id'):
                # 需要先通过status获取任务ID
                if not args.cli_name:
                    print("❌ 完成任务需要提供 --cli-name")
                    return

                task = pm.get_next_task(args.cli_name)
                if not task:
                    print(f"📭 {args.cli_name} 没有待处理任务")
                    return

                task_id = task.id
            else:
                task_id = args.current_task_id

            result = args.result or "任务完成"
            task = pm.complete_task(task_id, result)
            if task:
                print(f"✅ 任务完成: {task_id}")
                print(f"   标题: {task.title}")
                print(f"   结果: {result}")

    except Exception as e:
        logger.error(f"❌ 执行失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()