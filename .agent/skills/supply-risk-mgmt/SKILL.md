---
name: supply-risk-mgmt
description: 供应链风险管理技能，提供风险识别、评估、应对和持续监控的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - supply-chain
  - risk-management
  - business-continuity
---

# 供应链风险管理 (Supply Risk Management)

## Overview

供应链风险管理是跨境电商确保业务连续性的关键。本技能提供系统化的供应链风险管理方法，帮助企业识别、评估和应对供应链风险。

## Step-by-Step Instructions

### Step 1: 风险识别
识别供应链各环节的潜在风险（供应商、物流、政治、自然等）。

**风险识别代码：**
```python
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict

class RiskCategory(Enum):
    SUPPLIER = "supplier"
    LOGISTICS = "logistics"
    POLITICAL = "political"
    NATURAL = "natural"
    ECONOMIC = "economic"
    REGULATORY = "regulatory"

def identify_supply_risks(supply_chain_data):
    """
    识别供应链风险
    
    Args:
        supply_chain_data: 供应链数据
    
    Returns:
        dict: 风险清单
    """
    risks = {
        'supplier_risks': identify_supplier_risks(supply_chain_data.get('suppliers', [])),
        'logistics_risks': identify_logistics_risks(supply_chain_data.get('logistics', [])),
        'external_risks': identify_external_risks(supply_chain_data.get('markets', []))
    }
    
    return {
        'identified_risks': risks,
        'risk_count': sum(len(v) for v in risks.values()),
        'critical_risks': [r for r in flatten_risks(risks) if r['severity'] == 'critical'],
        'recommendations': generate_risk_recommendations(risks)
    }

def identify_supplier_risks(suppliers):
    """
    识别供应商风险
    """
    supplier_risks = []
    
    for supplier in suppliers:
        risks = []
        
        # 财务风险
        if supplier.get('financial_health', 100) < 60:
            risks.append({
                'type': 'financial_instability',
                'description': f"供应商{supplier['name']}财务状况不佳",
                'severity': 'high',
                'indicator': f"财务健康指数: {supplier.get('financial_health')}"
            })
        
        # 产能风险
        if supplier.get('capacity_utilization', 0) > 90:
            risks.append({
                'type': 'capacity_constraint',
                'description': f"供应商{supplier['name']}产能利用率过高",
                'severity': 'medium',
                'indicator': f"产能利用率: {supplier.get('capacity_utilization')}%"
            })
        
        # 质量风险
        if supplier.get('quality_score', 100) < 95:
            risks.append({
                'type': 'quality_issues',
                'description': f"供应商{supplier['name']}质量分数低于标准",
                'severity': 'high',
                'indicator': f"质量分数: {supplier.get('quality_score')}"
            })
        
        # 地理风险
        if supplier.get('country') in ['CN', 'IN', 'VN']:
            risks.append({
                'type': 'geopolitical',
                'description': f"供应商位于{supplier.get('country')}，存在地缘政治风险",
                'severity': 'medium'
            })
        
        for risk in risks:
            risk['supplier'] = supplier['name']
            risk['category'] = RiskCategory.SUPPLIER.value
        
        supplier_risks.extend(risks)
    
    return supplier_risks

def identify_logistics_risks(logistics_routes):
    """
    识别物流风险
    """
    logistics_risks = []
    
    for route in logistics_routes:
        risks = []
        
        # 运输时间风险
        if route.get('reliability', 100) < 90:
            risks.append({
                'type': 'transit_delay',
                'description': f"路线{route['name']}可靠性低于90%",
                'severity': 'medium',
                'indicator': f"准点率: {route.get('reliability')}%"
            })
        
        # 成本风险
        if route.get('cost_volatility', 0) > 20:
            risks.append({
                'type': 'cost_increase',
                'description': f"路线{route['name']}成本波动大",
                'severity': 'medium',
                'indicator': f"波动率: {route.get('cost_volatility')}%"
            })
        
        # 中断风险
        if route.get('disruption_history', 0) > 2:
            risks.append({
                'type': 'route_disruption',
                'description': f"路线{route['name']}历史中断次数多",
                'severity': 'high',
                'indicator': f"历史中断: {route.get('disruption_history')}次"
            })
        
        for risk in risks:
            risk['route'] = route['name']
            risk['category'] = RiskCategory.LOGISTICS.value
        
        logistics_risks.extend(risks)
    
    return logistics_risks

def identify_external_risks(markets):
    """
    识别外部风险（政治、经济、监管）
    """
    external_risks = []
    
    # 政治风险
    high_risk_countries = ['RU', 'UA', 'IR', 'KP']
    
    for market in markets:
        if market.get('country') in high_risk_countries:
            external_risks.append({
                'type': 'political_instability',
                'description': f"市场{market['country']}政治不稳定",
                'severity': 'critical',
                'category': RiskCategory.POLITICAL.value
            })
        
        # 经济风险
        if market.get('economic_indicator', 0) < 40:
            external_risks.append({
                'type': 'economic_decline',
                'description': f"市场{market['country']}经济下滑",
                'severity': 'high',
                'category': RiskCategory.ECONOMIC.value
            })
        
        # 监管风险
        if market.get('regulatory_risk', 0) > 70:
            external_risks.append({
                'type': 'regulatory_change',
                'description': f"市场{market['country']}监管风险高",
                'severity': 'medium',
                'category': RiskCategory.REGULATORY.value
            })
    
    return external_risks
```

### Step 2: 风险评估
评估风险发生的可能性和影响程度。

**风险评估代码：**
```python
def assess_risk_impact(identified_risks, business_impact_factors):
    """
    评估风险影响
    
    Args:
        identified_risks: 已识别的风险
        business_impact_factors: 业务影响因子
    
    Returns:
        dict: 风险评估结果
    """
    risk_scores = []
    
    for risk in identified_risks:
        # 可能性评分 (1-10)
        likelihood = calculate_likelihood(risk)
        
        # 影响评分 (1-10)
        impact = calculate_impact(risk, business_impact_factors)
        
        # 风险评分 = 可能性 × 影响
        risk_score = likelihood * impact
        
        risk_scores.append({
            'risk': risk,
            'likelihood': likelihood,
            'impact': impact,
            'risk_score': risk_score,
            'priority': determine_priority(risk_score)
        })
    
    # 按风险评分排序
    risk_scores.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return {
        'risk_assessment': risk_scores,
        'high_priority_count': len([r for r in risk_scores if r['priority'] == 'high']),
        'total_risk_exposure': sum(r['risk_score'] for r in risk_scores),
        'recommended_focus': [r['risk'] for r in risk_scores[:5]]
    }

def calculate_likelihood(risk):
    """
    计算风险发生可能性
    """
    # 基于风险类型和指标计算
    base_likelihood = {
        'financial_instability': 6,
        'capacity_constraint': 5,
        'quality_issues': 4,
        'transit_delay': 5,
        'cost_increase': 6,
        'route_disruption': 4,
        'political_instability': 3,
        'economic_decline': 4,
        'regulatory_change': 5
    }
    
    likelihood = base_likelihood.get(risk.get('type', ''), 5)
    
    # 根据严重程度调整
    if risk.get('severity') == 'critical':
        likelihood = min(10, likelihood + 2)
    elif risk.get('severity') == 'high':
        likelihood = min(10, likelihood + 1)
    
    return likelihood

def calculate_impact(risk, impact_factors):
    """
    计算风险影响程度
    """
    # 基本影响值
    impact_types = {
        'supplier': impact_factors.get('supply_disruption_impact', 8),
        'logistics': impact_factors.get('logistics_disruption_impact', 6),
        'political': impact_factors.get('market_disruption_impact', 7),
        'economic': impact_factors.get('revenue_impact', 7),
        'regulatory': impact_factors.get('compliance_impact', 6)
    }
    
    category = risk.get('category', 'supplier')
    base_impact = impact_types.get(category, 5)
    
    # 根据风险类型调整
    if risk.get('type') == 'financial_instability':
        base_impact = max(base_impact, 9)
    
    return base_impact

def determine_priority(risk_score):
    """
    确定风险优先级
    """
    if risk_score >= 60:
        return 'critical'
    elif risk_score >= 40:
        return 'high'
    elif risk_score >= 20:
        return 'medium'
    else:
        return 'low'
```

### Step 3: 风险应对
制定风险应对策略（规避、减轻、转移、接受）。

**风险应对代码：**
```python
class RiskResponseStrategy:
    """
    风险应对策略
    """
    
    @staticmethod
    def develop_response_plan(risk_assessment, available_resources):
        """
        制定应对计划
        
        Args:
            risk_assessment: 风险评估结果
            available_resources: 可用资源
        
        Returns:
            dict: 应对计划
        """
        response_plans = []
        
        for risk_item in risk_assessment['risk_assessment']:
            risk = risk_item['risk']
            priority = risk_item['priority']
            
            # 选择应对策略
            strategy = RiskResponseStrategy.select_strategy(
                risk, priority, available_resources
            )
            
            # 生成具体措施
            actions = RiskResponseStrategy.define_actions(
                strategy, risk, available_resources
            )
            
            response_plans.append({
                'risk': risk,
                'priority': priority,
                'strategy': strategy,
                'actions': actions,
                'estimated_cost': sum(a.get('cost', 0) for a in actions),
                'effectiveness': RiskResponseStrategy.estimate_effectiveness(
                    strategy, risk_item['risk_score']
                )
            })
        
        return {
            'response_plans': response_plans,
            'total_estimated_cost': sum(p['estimated_cost'] for p in response_plans),
            'priority_actions': [p for p in response_plans if p['priority'] in ['critical', 'high']]
        }
    
    @staticmethod
    def select_strategy(risk, priority, resources):
        """
        选择应对策略
        """
        if priority == 'critical':
            # 关键风险：优先规避或转移
            if resources.get('budget', 0) > 100000:
                return 'mitigate'  # 有足够资源则减轻
            else:
                return 'avoid'  # 资源有限则规避
        
        elif priority == 'high':
            # 高风险：减轻或转移
            return 'mitigate' if resources.get('alternative_suppliers', 0) > 0 else 'transfer'
        
        elif priority == 'medium':
            # 中风险：转移或接受
            return 'transfer' if resources.get('insurance_available', False) else 'accept'
        
        else:
            # 低风险：接受
            return 'accept'
    
    @staticmethod
    def define_actions(strategy, risk, resources):
        """
        定义具体措施
        """
        action_templates = {
            'avoid': [
                {'action': '寻找替代供应商', 'cost': 50000, 'timeline': '3个月'},
                {'action': '调整采购策略', 'cost': 10000, 'timeline': '1个月'}
            ],
            'mitigate': [
                {'action': '增加安全库存', 'cost': 30000, 'timeline': '1个月'},
                {'action': '建立备选供应渠道', 'cost': 40000, 'timeline': '2个月'},
                {'action': '加强质量检测', 'cost': 15000, 'timeline': '1个月'}
            ],
            'transfer': [
                {'action': '购买供应链保险', 'cost': 20000, 'timeline': '1个月'},
                {'action': '签订风险分担合同', 'cost': 5000, 'timeline': '2周'}
            ],
            'accept': [
                {'action': '建立应急基金', 'cost': 10000, 'timeline': '立即'},
                {'action': '制定应急预案', 'cost': 5000, 'timeline': '1个月'}
            ]
        }
        
        return action_templates.get(strategy, [])
```

### Step 4: 持续监控
建立风险监控系统，实时监测风险指标。

**监控系统代码：**
```python
class SupplyRiskMonitor:
    """
    供应链风险监控
    """
    
    def __init__(self, risk_assessment):
        self.risks = risk_assessment['risk_assessment']
        self.thresholds = self.initialize_thresholds()
        self.alert_history = []
    
    def initialize_thresholds(self):
        """
        初始化监控阈值
        """
        return {
            'supplier': {
                'financial_health': 60,
                'quality_score': 95,
                'on_time_delivery': 90
            },
            'logistics': {
                'reliability': 90,
                'cost_volatility': 20,
                'transit_time_variance': 0.3
            },
            'external': {
                'political_stability': 70,
                'economic_indicator': 50,
                'regulatory_risk': 60
            }
        }
    
    def monitor_risks(self, current_data):
        """
        监控风险
        
        Args:
            current_data: 当前数据
        
        Returns:
            dict: 监控报告
        """
        alerts = []
        
        # 供应商监控
        for supplier in current_data.get('suppliers', []):
            supplier_alerts = self.check_supplier_metrics(supplier)
            alerts.extend(supplier_alerts)
        
        # 物流监控
        for route in current_data.get('logistics', []):
            route_alerts = self.check_logistics_metrics(route)
            alerts.extend(route_alerts)
        
        # 外部风险监控
        for market in current_data.get('markets', []):
            market_alerts = self.check_external_metrics(market)
            alerts.extend(market_alerts)
        
        self.alert_history.extend(alerts)
        
        return {
            'monitoring_status': 'active',
            'alerts_generated': len(alerts),
            'critical_alerts': [a for a in alerts if a['severity'] == 'critical'],
            'recent_alerts': alerts[-10:] if alerts else [],
            'alert_trend': self.calculate_alert_trend()
        }
    
    def check_supplier_metrics(self, supplier):
        """
        检查供应商指标
        """
        alerts = []
        
        if supplier.get('financial_health', 100) < self.thresholds['supplier']['financial_health']:
            alerts.append({
                'type': 'supplier_financial',
                'severity': 'high',
                'supplier': supplier['name'],
                'message': f"供应商{supplier['name']}财务健康指数低于阈值",
                'value': supplier.get('financial_health'),
                'threshold': self.thresholds['supplier']['financial_health'],
                'timestamp': datetime.now().isoformat()
            })
        
        return alerts
    
    def generate_risk_dashboard(self):
        """
        生成风险仪表板
        """
        return {
            'overall_risk_score': self.calculate_overall_score(),
            'risk_distribution': self.get_risk_distribution(),
            'trend_analysis': self.analyze_risk_trend(),
            'top_risks': self.get_top_risks(5),
            'monitoring_coverage': {
                'suppliers_monitored': len([r for r in self.risks if r['risk'].get('category') == 'supplier']),
                'routes_monitored': len([r for r in self.risks if r['risk'].get('category') == 'logistics']),
                'markets_monitored': len([r for r in self.risks if r['risk'].get('category') in ['political', 'economic']])
            }
        }
```

### Step 5: 优化改进
定期复盘风险管理效果，持续优化。

**优化改进代码：**
```python
def optimize_risk_management(monitoring_data, response_effectiveness):
    """
    优化风险管理
    
    Args:
        monitoring_data: 监控数据
        response_effectiveness: 应对效果
    
    Returns:
        dict: 优化建议
    """
    # 分析监控数据
    alert_analysis = analyze_alerts(monitoring_data.get('alerts', []))
    
    # 评估响应效果
    effectiveness评估 = evaluate_response_effectiveness(response_effectiveness)
    
    # 生成优化建议
    optimizations = []
    
    # 基于误报优化
    if alert_analysis['false_positive_rate'] > 0.3:
        optimizations.append({
            'area': 'monitoring_threshold',
            'recommendation': '降低监控阈值灵敏度，减少误报',
            'priority': 'high',
            'expected_improvement': '减少30%误报'
        })
    
    # 基于响应时间优化
    if effectiveness评估['avg_response_time'] > 24:
        optimizations.append({
            'area': 'response_process',
            'recommendation': '简化应急响应流程，建立快速响应团队',
            'priority': 'high',
            'expected_improvement': '缩短50%响应时间'
        })
    
    # 基于成本效益优化
    if effectiveness评估['cost_effectiveness'] < 0.7:
        optimizations.append({
            'area': 'resource_allocation',
            'recommendation': '重新评估风险应对资源分配',
            'priority': 'medium',
            'expected_improvement': '提升20%成本效益'
        })
    
    return {
        'current_performance': {
            'alert_accuracy': alert_analysis['accuracy'],
            'response_time': effectiveness评估['avg_response_time'],
            'cost_effectiveness': effectiveness评估['cost_effectiveness']
        },
        'optimizations': optimizations,
        'next_review_date': (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')
    }
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 供应中断次数 | <1次/年 | 实际中断次数 |
| 备选供应商覆盖率 | 100% | 有备选供应商的关键物料比例 |
| 风险识别率 | >90% | 成功识别的风险/实际风险 |
| 应急响应时间 | <24h | 风险发生到响应的时间 |

## Success Criteria

- 供应中断次数少于1次/年
- 所有关键供应商都有备选方案
- 建立完善的风险预警系统
- 应急响应时间小于24小时

---

**技能版本：** 1.0.0  
**最后更新：** 2025年