#!/usr/bin/env python3
"""
Stigmergy Wiki协同编辑器
支持多用户协同编辑、版本控制、冲突解决
"""

import json
import re
import sys
import threading
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import hashlib

@dataclass
class EditOperation:
    """编辑操作数据结构"""
    operation_id: str
    user_id: str
    timestamp: datetime
    operation_type: str  # insert, delete, replace
    position: int
    content: str
    length: int = 0
    checksum: str = ""

@dataclass
class WikiPage:
    """Wiki页面数据结构"""
    topic: str
    content: str
    version: int
    created_at: datetime
    updated_at: datetime
    author: str
    collaborators: List[str] = field(default_factory=list)
    edit_history: List[EditOperation] = field(default_factory=list)
    locks: Dict[str, str] = field(default_factory=dict)  # user -> timestamp

@dataclass
class ConflictInfo:
    """冲突信息数据结构"""
    conflict_id: str
    topic: str
    operations: List[EditOperation]
    detected_at: datetime
    resolution_strategy: str = ""
    resolved: bool = False
    resolution_content: str = ""

class CollaborativeEditor:
    """协同编辑器主类"""
    
    def __init__(self):
        self.pages: Dict[str, WikiPage] = {}
        self.active_users: Dict[str, Dict[str, Any]] = {}
        self.conflicts: List[ConflictInfo] = []
        self.edit_queue = []
        self.lock_timeout = 300  # 5分钟锁超时
        self.max_conflict_retries = 3
        
        # 线程安全锁
        self.pages_lock = threading.RLock()
        self.conflicts_lock = threading.RLock()
        
    def create_page(self, topic: str, initial_content: str, author: str) -> WikiPage:
        """创建新Wiki页面"""
        with self.pages_lock:
            if topic in self.pages:
                raise ValueError(f"Topic {topic} already exists")
            
            page = WikiPage(
                topic=topic,
                content=initial_content,
                version=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                author=author,
                collaborators=[author]
            )
            
            self.pages[topic] = page
            return page
    
    def get_page(self, topic: str) -> Optional[WikiPage]:
        """获取Wiki页面"""
        with self.pages_lock:
            return self.pages.get(topic)
    
    def edit_page(self, topic: str, operation: EditOperation, user_id: str) -> Tuple[bool, str]:
        """编辑Wiki页面"""
        with self.pages_lock:
            page = self.pages.get(topic)
            if not page:
                return False, "Page not found"
            
            # 检查锁
            if self._is_locked(topic, user_id):
                return False, "Page is locked by another user"
            
            # 检测冲突
            conflicts = self._detect_conflicts(page, operation)
            if conflicts:
                conflict_info = ConflictInfo(
                    conflict_id=self._generate_conflict_id(),
                    topic=topic,
                    operations=conflicts,
                    detected_at=datetime.now()
                )
                
                with self.conflicts_lock:
                    self.conflicts.append(conflict_info)
                
                return False, f"Conflict detected: {conflict_info.conflict_id}"
            
            # 应用编辑
            success, message = self._apply_edit(page, operation)
            if success:
                page.updated_at = datetime.now()
                page.version += 1
                
                # 记录编辑历史
                page.edit_history.append(operation)
                
                # 更新协作者列表
                if user_id not in page.collaborators:
                    page.collaborators.append(user_id)
            
            return success, message
    
    def _detect_conflicts(self, page: WikiPage, new_operation: EditOperation) -> List[EditOperation]:
        """检测编辑冲突"""
        conflicts = []
        
        # 检查最近的编辑操作
        recent_operations = [op for op in page.edit_history 
                           if (datetime.now() - op.timestamp).total_seconds() < 60]
        
        for recent_op in recent_operations:
            # 检查位置重叠
            if self._operations_overlap(recent_op, new_operation):
                # 检查内容冲突
                if not self._operations_compatible(recent_op, new_operation):
                    conflicts.append(recent_op)
        
        return conflicts
    
    def _operations_overlap(self, op1: EditOperation, op2: EditOperation) -> bool:
        """检查操作是否重叠"""
        pos1_end = op1.position + op1.length
        pos2_end = op2.position + op2.length
        
        return not (pos1_end <= op2.position or pos2_end <= op1.position)
    
    def _operations_compatible(self, op1: EditOperation, op2: EditOperation) -> bool:
        """检查操作是否兼容"""
        # 简单的兼容性检查
        if op1.operation_type == "delete" and op2.operation_type == "delete":
            return False
        
        if op1.operation_type == "replace" and op2.operation_type == "replace":
            if op1.position == op2.position:
                return False
        
        return True
    
    def _apply_edit(self, page: WikiPage, operation: EditOperation) -> Tuple[bool, str]:
        """应用编辑操作"""
        try:
            content = page.content
            
            if operation.operation_type == "insert":
                # 插入操作
                page.content = content[:operation.position] + operation.content + content[operation.position:]
                
            elif operation.operation_type == "delete":
                # 删除操作
                end_pos = operation.position + operation.length
                page.content = content[:operation.position] + content[end_pos:]
                
            elif operation.operation_type == "replace":
                # 替换操作
                end_pos = operation.position + operation.length
                page.content = content[:operation.position] + operation.content + content[end_pos:]
                
            else:
                return False, f"Unknown operation type: {operation.operation_type}"
            
            return True, "Edit applied successfully"
            
        except Exception as e:
            return False, f"Edit failed: {str(e)}"
    
    def lock_page(self, topic: str, user_id: str) -> bool:
        """锁定页面"""
        with self.pages_lock:
            page = self.pages.get(topic)
            if not page:
                return False
            
            # 检查是否已被锁定
            current_time = datetime.now()
            for lock_user, lock_time in page.locks.items():
                if (current_time - lock_time).total_seconds() < self.lock_timeout:
                    if lock_user != user_id:
                        return False
            
            # 设置锁
            page.locks[user_id] = current_time
            return True
    
    def unlock_page(self, topic: str, user_id: str) -> bool:
        """解锁页面"""
        with self.pages_lock:
            page = self.pages.get(topic)
            if not page:
                return False
            
            if user_id in page.locks:
                del page.locks[user_id]
                return True
            
            return False
    
    def _is_locked(self, topic: str, user_id: str) -> bool:
        """检查页面是否被其他用户锁定"""
        page = self.pages.get(topic)
        if not page:
            return False
        
        current_time = datetime.now()
        for lock_user, lock_time in page.locks.items():
            if lock_user != user_id:
                if (current_time - lock_time).total_seconds() < self.lock_timeout:
                    return True
        
        return False
    
    def resolve_conflict(self, conflict_id: str, resolution_strategy: str, 
                        resolver_id: str) -> Tuple[bool, str]:
        """解决冲突"""
        with self.conflicts_lock:
            conflict = None
            for c in self.conflicts:
                if c.conflict_id == conflict_id:
                    conflict = c
                    break
            
            if not conflict:
                return False, "Conflict not found"
            
            if conflict.resolved:
                return False, "Conflict already resolved"
            
            # 根据策略解决冲突
            success, resolution_content = self._apply_resolution_strategy(
                conflict, resolution_strategy, resolver_id
            )
            
            if success:
                conflict.resolved = True
                conflict.resolution_strategy = resolution_strategy
                conflict.resolution_content = resolution_content
                
                # 从冲突列表中移除
                self.conflicts.remove(conflict)
                
                return True, "Conflict resolved successfully"
            else:
                return False, "Conflict resolution failed"
    
    def _apply_resolution_strategy(self, conflict: ConflictInfo, strategy: str, 
                                 resolver_id: str) -> Tuple[bool, str]:
        """应用冲突解决策略"""
        page = self.pages.get(conflict.topic)
        if not page:
            return False, "Page not found"
        
        if strategy == "manual":
            # 手动解决，需要用户提供具体内容
            return True, "Manual resolution - content provided by user"
        
        elif strategy == "latest_wins":
            # 最新操作获胜
            latest_op = max(conflict.operations, key=lambda op: op.timestamp)
            success, _ = self._apply_edit(page, latest_op)
            return success, page.content if success else ""
        
        elif strategy == "merge":
            # 智能合并
            merged_content = self._merge_conflicting_operations(conflict.operations)
            page.content = merged_content
            return True, merged_content
        
        elif strategy == "original_wins":
            # 原始内容获胜
            return True, page.content
        
        else:
            return False, f"Unknown resolution strategy: {strategy}"
    
    def _merge_conflicting_operations(self, operations: List[EditOperation]) -> str:
        """合并冲突的操作"""
        # 简单的合并策略：按时间顺序应用操作
        sorted_ops = sorted(operations, key=lambda op: op.timestamp)
        
        # 这里应该有更复杂的合并逻辑
        # 为了简化，我们返回一个合并提示
        return f"<<<<MERGE_CONFLICT: {len(sorted_ops)} conflicting operations>>>>"
    
    def get_active_users(self, topic: str) -> List[Dict[str, Any]]:
        """获取活跃用户列表"""
        page = self.pages.get(topic)
        if not page:
            return []
        
        active_users = []
        current_time = datetime.now()
        
        for collaborator in page.collaborators:
            # 检查用户最近活动
            recent_edits = [op for op in page.edit_history 
                          if op.user_id == collaborator and 
                          (current_time - op.timestamp).total_seconds() < 300]  # 5分钟内
            
            if recent_edits:
                last_edit = max(recent_edits, key=lambda op: op.timestamp)
                active_users.append({
                    'user_id': collaborator,
                    'last_activity': last_edit.timestamp.isoformat(),
                    'edit_count': len(recent_edits),
                    'status': 'active'
                })
            else:
                active_users.append({
                    'user_id': collaborator,
                    'last_activity': None,
                    'edit_count': 0,
                    'status': 'inactive'
                })
        
        return active_users
    
    def get_page_history(self, topic: str, limit: int = 50) -> List[Dict[str, Any]]:
        """获取页面编辑历史"""
        page = self.pages.get(topic)
        if not page:
            return []
        
        history = []
        for op in page.edit_history[-limit:]:
            history.append({
                'operation_id': op.operation_id,
                'user_id': op.user_id,
                'timestamp': op.timestamp.isoformat(),
                'operation_type': op.operation_type,
                'position': op.position,
                'content_preview': op.content[:50] + "..." if len(op.content) > 50 else op.content,
                'length': op.length
            })
        
        return history
    
    def get_conflicts(self, topic: str = None) -> List[Dict[str, Any]]:
        """获取冲突列表"""
        with self.conflicts_lock:
            conflicts = []
            for conflict in self.conflicts:
                if topic is None or conflict.topic == topic:
                    conflicts.append({
                        'conflict_id': conflict.conflict_id,
                        'topic': conflict.topic,
                        'detected_at': conflict.detected_at.isoformat(),
                        'operations_count': len(conflict.operations),
                        'resolved': conflict.resolved,
                        'resolution_strategy': conflict.resolution_strategy
                    })
            
            return conflicts
    
    def _generate_conflict_id(self) -> str:
        """生成冲突ID"""
        timestamp = datetime.now().isoformat()
        random_str = hashlib.md5(timestamp.encode()).hexdigest()[:8]
        return f"conflict_{timestamp}_{random_str}"
    
    def generate_edit_operation(self, user_id: str, operation_type: str, 
                             position: int, content: str, length: int = 0) -> EditOperation:
        """生成编辑操作"""
        return EditOperation(
            operation_id=f"op_{datetime.now().isoformat()}_{hashlib.md5(content.encode()).hexdigest()[:8]}",
            user_id=user_id,
            timestamp=datetime.now(),
            operation_type=operation_type,
            position=position,
            content=content,
            length=length,
            checksum=hashlib.md5(f"{operation_type}{position}{content}".encode()).hexdigest()
        )
    
    def cleanup_expired_locks(self):
        """清理过期锁"""
        with self.pages_lock:
            current_time = datetime.now()
            
            for page in self.pages.values():
                expired_locks = []
                for user_id, lock_time in page.locks.items():
                    if (current_time - lock_time).total_seconds() > self.lock_timeout:
                        expired_locks.append(user_id)
                
                for user_id in expired_locks:
                    del page.locks[user_id]
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        with self.pages_lock:
            total_pages = len(self.pages)
            total_edits = sum(len(page.edit_history) for page in self.pages.values())
            total_collaborators = sum(len(page.collaborators) for page in self.pages.values())
            
            with self.conflicts_lock:
                active_conflicts = len([c for c in self.conflicts if not c.resolved])
                resolved_conflicts = len([c for c in self.conflicts if c.resolved])
        
        return {
            'total_pages': total_pages,
            'total_edits': total_edits,
            'total_collaborators': total_collaborators,
            'active_conflicts': active_conflicts,
            'resolved_conflicts': resolved_conflicts,
            'average_edits_per_page': total_edits / max(total_pages, 1),
            'average_collaborators_per_page': total_collaborators / max(total_pages, 1)
        }

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python collaborative_editor.py --action 'action' [parameters]")
        print("可用操作:")
        print("  --action create --topic 'topic' --content 'content' --author 'author'")
        print("  --action edit --topic 'topic' --user 'user' --type 'type' --pos 'position' --content 'content'")
        print("  --action lock --topic 'topic' --user 'user'")
        print("  --action unlock --topic 'topic' --user 'user'")
        print("  --action conflicts [--topic 'topic']")
        print("  --action history --topic 'topic'")
        print("  --action stats")
        sys.exit(1)
    
    editor = CollaborativeEditor()
    
    # 解析参数
    action = sys.argv[2]
    
    if action == "create":
        # 创建页面
        topic = sys.argv[4]
        content = sys.argv[6]
        author = sys.argv[8]
        
        try:
            page = editor.create_page(topic, content, author)
            print(f"页面创建成功: {topic}")
            print(f"版本: {page.version}")
            print(f"作者: {page.author}")
        except Exception as e:
            print(f"创建失败: {str(e)}")
    
    elif action == "edit":
        # 编辑页面
        topic = sys.argv[4]
        user = sys.argv[6]
        op_type = sys.argv[8]
        position = int(sys.argv[10])
        content = sys.argv[12]
        
        operation = editor.generate_edit_operation(user, op_type, position, content)
        success, message = editor.edit_page(topic, operation, user)
        
        if success:
            print(f"编辑成功: {message}")
        else:
            print(f"编辑失败: {message}")
    
    elif action == "lock":
        # 锁定页面
        topic = sys.argv[4]
        user = sys.argv[6]
        
        success = editor.lock_page(topic, user)
        print(f"锁定{'成功' if success else '失败'}: {topic}")
    
    elif action == "unlock":
        # 解锁页面
        topic = sys.argv[4]
        user = sys.argv[6]
        
        success = editor.unlock_page(topic, user)
        print(f"解锁{'成功' if success else '失败'}: {topic}")
    
    elif action == "conflicts":
        # 获取冲突
        topic = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] == "--topic" else None
        if topic:
            topic = sys.argv[5]
        
        conflicts = editor.get_conflicts(topic)
        print(f"找到 {len(conflicts)} 个冲突:")
        for conflict in conflicts:
            print(f"  {conflict['conflict_id']}: {conflict['topic']} ({'已解决' if conflict['resolved'] else '未解决'})")
    
    elif action == "history":
        # 获取历史
        topic = sys.argv[4]
        
        history = editor.get_page_history(topic)
        print(f"页面 {topic} 的编辑历史:")
        for edit in history[-10:]:  # 显示最近10条
            print(f"  {edit['timestamp']}: {edit['user_id']} - {edit['operation_type']}")
    
    elif action == "stats":
        # 统计信息
        stats = editor.get_statistics()
        print("协同编辑统计:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
    
    else:
        print(f"未知操作: {action}")

if __name__ == "__main__":
    main()