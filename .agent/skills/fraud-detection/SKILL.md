---
name: fraud-detection
description: 跨境欺诈检测与防控技能，提供风险识别、模型构建、实时检测和处置追踪的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - fraud-detection
  - risk-management
  - security
---

# 跨境欺诈检测与防控 (Fraud Detection)

## Overview

欺诈检测是跨境电商保护资金安全的重要环节。本技能提供系统化的欺诈检测方法，帮助企业识别和防范各类欺诈行为。

## Step-by-Step Instructions

### Step 1: 风险识别
识别常见的欺诈类型和风险点。

### Step 2: 模型构建
建立欺诈检测模型（规则引擎、机器学习）。

### Step 3: 实时检测
对每笔交易进行实时风险评估。

**实时检测代码：**
```python
import time
from datetime import datetime
from enum import Enum

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class FraudDetectionEngine:
    """
    实时欺诈检测引擎
    """
    
    def __init__(self, rules_model, ml_model):
        self.rules_engine = rules_model
        self.ml_model = ml_model
        self.risk_weights = {
            'rules_score': 0.4,
            'ml_score': 0.6
        }
    
    def analyze_transaction(self, transaction_data):
        """
        分析单笔交易
        
        Args:
            transaction_data: 交易数据
        
        Returns:
            dict: 风险评估结果
        """
        start_time = time.time()
        
        # 规则引擎检测
        rules_result = self.rules_engine.evaluate(transaction_data)
        
        # ML模型检测
        ml_result = self.ml_model.predict(transaction_data)
        
        # 综合评分
        combined_score = (
            rules_result['risk_score'] * self.risk_weights['rules_score'] +
            ml_result['risk_score'] * self.risk_weights['ml_score']
        )
        
        # 风险等级判定
        risk_level = self.determine_risk_level(combined_score, transaction_data)
        
        # 生成建议
        recommendations = self.generate_recommendations(
            rules_result, ml_result, risk_level
        )
        
        processing_time = time.time() - start_time
        
        return {
            'transaction_id': transaction_data.get('id'),
            'risk_score': round(combined_score, 2),
            'risk_level': risk_level.value,
            'rules_flags': rules_result.get('triggered_rules', []),
            'ml_indicators': ml_result.get('indicators', []),
            'recommendations': recommendations,
            'processing_time_ms': round(processing_time * 1000, 2),
            'requires_manual_review': risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL],
            'timestamp': datetime.now().isoformat()
        }
    
    def determine_risk_level(self, score, transaction_data):
        """
        判定风险等级
        """
        # 基本风险等级
        if score >= 80:
            return RiskLevel.CRITICAL
        elif score >= 60:
            return RiskLevel.HIGH
        elif score >= 30:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def batch_analyze(self, transactions):
        """
        批量分析交易
        """
        results = []
        high_risk_count = 0
        
        for transaction in transactions:
            result = self.analyze_transaction(transaction)
            results.append(result)
            
            if result['risk_level'] in ['high', 'critical']:
                high_risk_count += 1
        
        return {
            'total_analyzed': len(transactions),
            'results': results,
            'high_risk_count': high_risk_count,
            'high_risk_rate': round(high_risk_count / len(transactions) * 100, 2) if transactions else 0,
            'avg_processing_time': round(
                sum(r['processing_time_ms'] for r in results) / len(results), 2
            ) if results else 0
        }
```

### Step 4: 人工审核
对高风险交易进行人工审核。

**人工审核代码：**
```python
class ManualReviewSystem:
    """
    人工审核系统
    """
    
    def __init__(self):
        self.review_queue = []
        self.reviewers = {}
    
    def add_to_review_queue(self, transaction_result, priority='normal'):
        """
        添加到审核队列
        
        Args:
            transaction_result: 交易风险评估结果
            priority: 优先级
        """
        review_item = {
            'id': len(self.review_queue) + 1,
            'transaction': transaction_result,
            'priority': priority,
            'status': 'pending',
            'assigned_to': None,
            'created_at': datetime.now().isoformat()
        }
        
        # 高优先级置顶
        if priority == 'high':
            self.review_queue.insert(0, review_item)
        else:
            self.review_queue.append(review_item)
        
        return review_item['id']
    
    def assign_reviewer(self, review_id, reviewer_id):
        """
        分配审核人员
        """
        for item in self.review_queue:
            if item['id'] == review_id:
                item['assigned_to'] = reviewer_id
                item['status'] = 'in_progress'
                break
    
    def submit_review_decision(self, review_id, decision, notes=''):
        """
        提交审核决定
        
        Args:
            review_id: 审核项ID
            decision: 决定（approve/reject/review_more）
            notes: 备注
        """
        for item in self.review_queue:
            if item['id'] == review_id:
                item['status'] = 'completed'
                item['decision'] = decision
                item['notes'] = notes
                item['completed_at'] = datetime.now().isoformat()
                break
    
    def get_review_queue(self, status=None, reviewer_id=None):
        """
        获取审核队列
        """
        queue = self.review_queue
        
        if status:
            queue = [item for item in queue if item['status'] == status]
        
        if reviewer_id:
            queue = [item for item in queue if item['assigned_to'] == reviewer_id]
        
        return queue
    
    def generate_review_summary(self, date_range):
        """
        生成审核摘要
        """
        completed = [item for item in self.review_queue if item['status'] == 'completed']
        
        decisions = {'approve': 0, 'reject': 0, 'review_more': 0}
        for item in completed:
            decisions[item.get('decision', 'approve')] += 1
        
        return {
            'total_reviewed': len(completed),
            'decisions': decisions,
            'approval_rate': round(decisions['approve'] / len(completed) * 100, 2) if completed else 0,
            'rejection_rate': round(decisions['reject'] / len(completed) * 100, 2) if completed else 0
        }
```

### Step 5: 处置追踪
处理欺诈案例，追踪处置结果。

**处置追踪代码：**
```python
class FraudCaseManagement:
    """
    欺诈案例管理
    """
    
    def __init__(self):
        self.cases = {}
        self.case_id_counter = 1
    
    def create_case(self, fraud_detection_result, initial_action='investigation'):
        """
        创建欺诈案例
        """
        case_id = f"FRAUD-{self.case_id_counter:06d}"
        self.case_id_counter += 1
        
        case = {
            'case_id': case_id,
            'transaction_id': fraud_detection_result['transaction_id'],
            'risk_score': fraud_detection_result['risk_score'],
            'risk_level': fraud_detection_result['risk_level'],
            'status': 'open',
            'priority': 'high' if fraud_detection_result['risk_level'] == 'critical' else 'normal',
            'actions_taken': [{
                'action': initial_action,
                'timestamp': datetime.now().isoformat(),
                'description': f"初始{self.get_action_description(initial_action)}"
            }],
            'evidence': [],
            'financial_impact': 0,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        self.cases[case_id] = case
        return case_id
    
    def add_case_action(self, case_id, action, description, evidence=None):
        """
        添加案例操作
        """
        if case_id in self.cases:
            case = self.cases[case_id]
            
            case_action = {
                'action': action,
                'timestamp': datetime.now().isoformat(),
                'description': description,
                'evidence': evidence or []
            }
            
            case['actions_taken'].append(case_action)
            case['updated_at'] datetime.now().isoformat()
    
    def close_case(self, case_id, resolution, final_status, financial_impact=0):
        """
        关闭案例
        """
        if case_id in self.cases:
            case = self.cases[case_id]
            
            case['status'] = 'closed'
            case['resolution'] = resolution
            case['final_status'] = final_status
            case['financial_impact'] = financial_impact
            case['closed_at'] = datetime.now().isoformat()
            
            return case
    
    def get_case_statistics(self, time_period=None):
        """
        获取案例统计
        """
        cases = list(self.cases.values())
        
        if time_period:
            cases = [
                c for c in cases 
                if datetime.fromisoformat(c['created_at']) >= time_period
            ]
        
        status_counts = {}
        resolution_counts = {}
        total_impact = 0
        
        for case in cases:
            status_counts[case['status']] = status_counts.get(case['status'], 0) + 1
            
            if case.get('final_status'):
                resolution_counts[case['final_status']] = (
                    resolution_counts.get(case['final_status'], 0) + 1
                )
            
            total_impact += case.get('financial_impact', 0)
        
        return {
            'total_cases': len(cases),
            'by_status': status_counts,
            'by_resolution': resolution_counts,
            'total_financial_impact': total_impact,
            'avg_resolution_time_hours': self.calculate_avg_resolution_time(cases)
        }
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 欺诈拦截率 | >95% | 成功拦截的欺诈/总欺诈 |
| 误拦截率 | <1% | 误拦截的正常订单/总订单 |
| 检测响应时间 | <1s | 交易到风险评估的时间 |
| 欺诈损失率 | <0.1% | 欺诈损失/总交易额 |

## Success Criteria

- 欺诈拦截率达到95%以上
- 误拦截率控制在1%以内
- 建立实时检测系统
- 欺诈损失率低于0.1%

---

**技能版本：** 1.0.0  
**最后更新：** 2025年