# Token消耗监控和管理系统

import json
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class TaskStatus(Enum):
    """任务状态枚举"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TokenUsage:
    """Token使用情况数据类"""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    timestamp: float = 0.0
    
    def __post_init__(self):
        if self.total_tokens == 0:
            self.total_tokens = self.prompt_tokens + self.completion_tokens
        if self.timestamp == 0.0:
            self.timestamp = time.time()


@dataclass
class TaskInfo:
    """任务信息数据类"""
    task_id: str
    name: str
    description: str
    parent_task_id: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    token_budget: int = 0
    token_usage: TokenUsage = None
    children: List[str] = None
    created_at: float = 0.0
    started_at: float = 0.0
    completed_at: float = 0.0
    
    def __post_init__(self):
        if self.token_usage is None:
            self.token_usage = TokenUsage()
        if self.children is None:
            self.children = []
        if self.created_at == 0.0:
            self.created_at = time.time()


class TokenBudgetManager:
    """Token预算管理器"""
    
    def __init__(self, total_context_limit: int = 128000):
        """
        初始化Token预算管理器
        
        Args:
            total_context_limit: 总上下文限制，默认128k tokens
        """
        self.total_context_limit = total_context_limit
        self.global_used_tokens = 0
        self.task_token_usage: Dict[str, TokenUsage] = {}
        self.budget_allocations: Dict[str, int] = {}
        
    def allocate_budget(self, task_id: str, budget: int) -> bool:
        """
        为任务分配Token预算
        
        Args:
            task_id: 任务ID
            budget: 预算大小
            
        Returns:
            是否分配成功
        """
        if self.global_used_tokens + budget > self.total_context_limit:
            return False
        
        self.budget_allocations[task_id] = budget
        self.global_used_tokens += budget
        return True
    
    def record_usage(self, task_id: str, usage: TokenUsage) -> bool:
        """
        记录任务的Token使用情况
        
        Args:
            task_id: 任务ID
            usage: Token使用情况
            
        Returns:
            是否记录成功
        """
        if task_id not in self.budget_allocations:
            return False
            
        allocated_budget = self.budget_allocations[task_id]
        if usage.total_tokens > allocated_budget:
            return False  # 超出预算
            
        self.task_token_usage[task_id] = usage
        return True
    
    def get_remaining_budget(self, task_id: str) -> int:
        """获取任务剩余预算"""
        if task_id not in self.budget_allocations:
            return 0
        allocated = self.budget_allocations[task_id]
        used = self.task_token_usage.get(task_id, TokenUsage()).total_tokens
        return max(0, allocated - used)
    
    def get_global_remaining_tokens(self) -> int:
        """获取全局剩余Token数"""
        used = sum(usage.total_tokens for usage in self.task_token_usage.values())
        return max(0, self.total_context_limit - used)


class TaskMonitor:
    """任务监控器"""
    
    def __init__(self, token_budget_manager: TokenBudgetManager):
        self.token_manager = token_budget_manager
        self.tasks: Dict[str, TaskInfo] = {}
        self.hierarchy: Dict[str, List[str]] = {}  # 父任务 -> 子任务列表
        self.status_counts: Dict[TaskStatus, int] = {}
        
    def register_task(self, task_info: TaskInfo) -> bool:
        """
        注册新任务
        
        Args:
            task_info: 任务信息
            
        Returns:
            是否注册成功
        """
        if task_info.task_id in self.tasks:
            return False
            
        # 分配预算
        if not self.token_manager.allocate_budget(task_info.task_id, task_info.token_budget):
            return False
            
        self.tasks[task_info.task_id] = task_info
        
        # 更新层级关系
        if task_info.parent_task_id:
            if task_info.parent_task_id not in self.hierarchy:
                self.hierarchy[task_info.parent_task_id] = []
            self.hierarchy[task_info.parent_task_id].append(task_info.task_id)
            
        # 更新状态计数
        self._update_status_count(task_info.status, increment=True)
        
        return True
    
    def update_task_status(self, task_id: str, new_status: TaskStatus) -> bool:
        """
        更新任务状态
        
        Args:
            task_id: 任务ID
            new_status: 新状态
            
        Returns:
            是否更新成功
        """
        if task_id not in self.tasks:
            return False
            
        old_status = self.tasks[task_id].status
        self.tasks[task_id].status = new_status
        self.tasks[task_id].completed_at = time.time() if new_status == TaskStatus.COMPLETED else 0.0
        
        # 更新状态计数
        self._update_status_count(old_status, increment=False)
        self._update_status_count(new_status, increment=True)
        
        return True
    
    def record_task_token_usage(self, task_id: str, usage: TokenUsage) -> bool:
        """
        记录任务Token使用情况
        
        Args:
            task_id: 任务ID
            usage: Token使用情况
            
        Returns:
            是否记录成功
        """
        if task_id not in self.tasks:
            return False
            
        success = self.token_manager.record_usage(task_id, usage)
        if success:
            self.tasks[task_id].token_usage = usage
            
        return success
    
    def get_task_summary(self, task_id: str) -> Optional[Dict]:
        """获取任务摘要信息"""
        if task_id not in self.tasks:
            return None
            
        task = self.tasks[task_id]
        remaining_budget = self.token_manager.get_remaining_budget(task_id)
        
        return {
            "task_id": task.task_id,
            "name": task.name,
            "status": task.status.value,
            "token_budget": task.token_budget,
            "token_used": task.token_usage.total_tokens,
            "remaining_budget": remaining_budget,
            "completion_percentage": (
                (task.token_usage.total_tokens / task.token_budget) * 100 
                if task.token_budget > 0 else 0
            ),
            "duration": (
                task.completed_at - task.started_at 
                if task.completed_at > 0 and task.started_at > 0 
                else time.time() - task.started_at if task.started_at > 0 
                else 0
            )
        }
    
    def get_hierarchy_summary(self, root_task_id: str) -> Dict:
        """获取任务层级摘要"""
        def collect_task_info(task_id: str) -> Dict:
            task_summary = self.get_task_summary(task_id)
            children_summaries = []
            
            for child_id in self.hierarchy.get(task_id, []):
                children_summaries.append(collect_task_info(child_id))
                
            return {
                "info": task_summary,
                "children": children_summaries
            }
        
        return collect_task_info(root_task_id)
    
    def _update_status_count(self, status: TaskStatus, increment: bool):
        """更新状态计数"""
        if increment:
            self.status_counts[status] = self.status_counts.get(status, 0) + 1
        else:
            self.status_counts[status] = max(0, self.status_counts.get(status, 0) - 1)
    
    def get_global_status(self) -> Dict:
        """获取全局状态信息"""
        total_tasks = len(self.tasks)
        completed_tasks = self.status_counts.get(TaskStatus.COMPLETED, 0)
        in_progress_tasks = self.status_counts.get(TaskStatus.IN_PROGRESS, 0)
        failed_tasks = self.status_counts.get(TaskStatus.FAILED, 0)
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "failed_tasks": failed_tasks,
            "completion_rate": completed_tasks / total_tasks if total_tasks > 0 else 0,
            "global_remaining_tokens": self.token_manager.get_global_remaining_tokens(),
            "global_used_tokens": sum(t.token_usage.total_tokens for t in self.tasks.values()),
            "global_token_utilization": (
                sum(t.token_usage.total_tokens for t in self.tasks.values()) / self.token_manager.total_context_limit
                if self.token_manager.total_context_limit > 0 else 0
            )
        }


class ContextManager:
    """上下文管理器"""
    
    def __init__(self, max_context_size: int = 128000):
        self.max_context_size = max_context_size
        self.current_context_parts: List[Tuple[str, str]] = []  # (part_id, content)
        self.context_part_sizes: Dict[str, int] = {}  # part_id -> size in tokens
        
    def add_context_part(self, part_id: str, content: str, size_estimate: int) -> bool:
        """
        添加上下文部分
        
        Args:
            part_id: 部分ID
            content: 内容
            size_estimate: 大小估计（tokens）
            
        Returns:
            是否添加成功
        """
        current_total = sum(self.context_part_sizes.values())
        if current_total + size_estimate > self.max_context_size:
            return False  # 超出上下文限制
            
        self.current_context_parts.append((part_id, content))
        self.context_part_sizes[part_id] = size_estimate
        return True
    
    def remove_context_part(self, part_id: str) -> bool:
        """移除上下文部分"""
        if part_id not in self.context_part_sizes:
            return False
            
        del self.context_part_sizes[part_id]
        self.current_context_parts = [(pid, content) for pid, content in self.current_context_parts if pid != part_id]
        return True
    
    def compress_context(self, target_reduction: int) -> int:
        """
        压缩上下文以释放空间
        
        Args:
            target_reduction: 目标减少量
            
        Returns:
            实际减少量
        """
        reduction_target = min(target_reduction, sum(self.context_part_sizes.values()))
        if reduction_target <= 0:
            return 0
            
        # 按大小降序排列，优先移除较大的部分
        sorted_parts = sorted(
            self.context_part_sizes.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        actual_reduction = 0
        for part_id, size in sorted_parts:
            if actual_reduction >= reduction_target:
                break
                
            self.remove_context_part(part_id)
            actual_reduction += size
            
        return actual_reduction
    
    def get_current_context_size(self) -> int:
        """获取当前上下文大小"""
        return sum(self.context_part_sizes.values())
    
    def get_available_context_space(self) -> int:
        """获取可用上下文空间"""
        return max(0, self.max_context_size - self.get_current_context_size())


def create_system_engineering_monitor() -> Tuple[TokenBudgetManager, TaskMonitor, ContextManager]:
    """
    创建系统工程任务监控系统
    
    Returns:
        Token预算管理器、任务监控器、上下文管理器的元组
    """
    token_manager = TokenBudgetManager()
    monitor = TaskMonitor(token_manager)
    context_manager = ContextManager()
    
    return token_manager, monitor, context_manager


# 使用示例
if __name__ == "__main__":
    # 创建监控系统
    token_manager, monitor, context_manager = create_system_engineering_monitor()
    
    # 注册根任务
    root_task = TaskInfo(
        task_id="project-root",
        name="系统工程任务",
        description="复杂的系统工程任务分解和执行",
        token_budget=50000
    )
    monitor.register_task(root_task)
    
    # 注册子任务
    subtask1 = TaskInfo(
        task_id="subtask-1",
        name="需求分析",
        description="分析系统需求",
        parent_task_id="project-root",
        token_budget=15000
    )
    monitor.register_task(subtask1)
    
    subtask2 = TaskInfo(
        task_id="subtask-2",
        name="系统设计",
        description="设计系统架构",
        parent_task_id="project-root",
        token_budget=20000
    )
    monitor.register_task(subtask2)
    
    # 更新任务状态
    monitor.update_task_status("subtask-1", TaskStatus.IN_PROGRESS)
    
    # 记录Token使用情况
    usage1 = TokenUsage(prompt_tokens=8000, completion_tokens=2000, total_tokens=10000)
    monitor.record_task_token_usage("subtask-1", usage1)
    
    # 获取任务摘要
    summary = monitor.get_task_summary("subtask-1")
    print("Subtask 1 Summary:", json.dumps(summary, indent=2, ensure_ascii=False))
    
    # 获取全局状态
    global_status = monitor.get_global_status()
    print("Global Status:", json.dumps(global_status, indent=2, ensure_ascii=False))
    
    # 获取层级摘要
    hierarchy_summary = monitor.get_hierarchy_summary("project-root")
    print("Hierarchy Summary:", json.dumps(hierarchy_summary, indent=2, ensure_ascii=False))