---
name: price-optimization
description: 动态定价策略技能，提供市场分析、价格模型、动态定价和效果监控的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - pricing-strategy
  - dynamic-pricing
  - revenue-optimization
---

# 动态定价策略 (Price Optimization)

## Overview

定价是跨境电商盈利的核心。本技能提供系统化的定价优化方法，帮助企业制定最优的定价策略，平衡销量和利润。

## Step-by-Step Instructions

### Step 1: 市场分析
分析竞品价格、消费者价格敏感度、市场需求。

**市场分析代码：**
```python
from datetime import datetime, timedelta
from collections import defaultdict
import math

def analyze_market_pricing(product_category, target_market, competitors):
    """
    分析市场价格格局
    
    Args:
        product_category: 产品品类
        target_market: 目标市场
        competitors: 竞争产品列表
    
    Returns:
        dict: 市场分析报告
    """
    # 竞品价格分析
    competitor_prices = analyze_competitor_prices(competitors)
    
    # 消费者价格敏感度分析
    price_sensitivity = analyze_price_sensitivity(target_market, product_category)
    
    # 市场需求分析
    demand_analysis = analyze_demand_trends(product_category, target_market)
    
    # 价格区间分析
    price_tiers = analyze_price_tiers(competitor_prices)
    
    return {
        'competitor_prices': competitor_prices,
        'price_sensitivity': price_sensitivity,
        'demand_analysis': demand_analysis,
        'price_tiers': price_tiers,
        'market_average_price': np.mean([p['price'] for p in competitor_prices]),
        'price_range': {
            'min': min(p['price'] for p in competitor_prices),
            'max': max(p['price'] for p in competitor_prices)
        }
    }

def analyze_competitor_prices(competitors):
    """
    分析竞品价格
    """
    prices = []
    for comp in competitors:
        prices.append({
            'competitor': comp['name'],
            'price': comp.get('price', 0),
            'original_price': comp.get('original_price', comp.get('price', 0)),
            'discount': comp.get('discount', 0),
            'rating': comp.get('rating', 0),
            'review_count': comp.get('review_count', 0)
        })
    
    return prices

def analyze_price_sensitivity(market, category):
    """
    分析价格敏感度
    """
    # 敏感度指标
    sensitivity_data = {
        'US': {'electronics': 0.6, 'fashion': 0.7, 'home': 0.5},
        'EU': {'electronics': 0.5, 'fashion': 0.6, 'home': 0.4},
        'JP': {'electronics': 0.4, 'fashion': 0.5, 'home': 0.3}
    }
    
    sensitivity = sensitivity_data.get(market, {}).get(category, 0.5)
    
    return {
        'sensitivity_score': sensitivity,
        'category': 'high' if sensitivity > 0.6 else 'medium' if sensitivity > 0.4 else 'low',
        'pricing_recommendation': ' competitive pricing' if sensitivity > 0.5 else ' value-based pricing'
    }

def analyze_price_tiers(competitor_prices):
    """
    分析价格层级
    """
    prices = [p['price'] for p in competitor_prices]
    
    # 使用K-means简单分组
    low = np.percentile(prices, 33)
    high = np.percentile(prices, 67)
    
    return {
        'budget': {'min': 0, 'max': low},
        'mid': {'min': low, 'max': high},
        'premium': {'min': high, 'max': max(prices) * 1.2}
    }
```

### Step 2: 价格模型
建立价格弹性模型，计算最优价格点。

**价格模型代码：**
```python
def build_price_elasticity_model(product_data, historical_sales):
    """
    建立价格弹性模型
    
    Args:
        product_data: 产品数据
        historical_sales: 历史销售数据
    
    Returns:
        dict: 价格模型
    """
    # 价格弹性计算
    elasticity = calculate_price_elasticity(historical_sales)
    
    # 最优价格计算
    optimal_price = calculate_optimal_price(
        product_data['cost'],
        product_data['target_margin'],
        elasticity
    )
    
    # 价格区间计算
    price_range = calculate_price_range(
        product_data['cost'],
        elasticity,
        product_data.get('competitor_prices', [])
    )
    
    return {
        'elasticity': elasticity,
        'optimal_price': optimal_price,
        'price_range': price_range,
        'model_confidence': evaluate_model_confidence(historical_sales)
    }

def calculate_price_elasticity(sales_data):
    """
    计算价格弹性
    """
    # 简化计算：价格变化百分比 / 销量变化百分比
    if len(sales_data) < 2:
        return -1.5  # 默认弹性
    
    prices = [d['price'] for d in sales_data]
    quantities = [d['quantity'] for d in sales_data]
    
    # 计算相关系数
    if np.std(prices) == 0 or np.std(quantities) == 0:
        return -1.5
    
    correlation = np.corrcoef(prices, quantities)[0, 1]
    
    # 转换为弹性
    avg_price = np.mean(prices)
    avg_quantity = np.mean(quantities)
    
    if avg_quantity == 0:
        return -1.5
    
    elasticity = correlation * (avg_price / avg_quantity) * (np.mean(quantities) / np.mean(prices))
    
    return max(-5, min(-0.5, elasticity))  # 限制在合理范围

def calculate_optimal_price(cost, target_margin, elasticity):
    """
    计算最优价格（基于目标利润）
    """
    if elasticity >= -1:
        return cost * (1 + target_margin)
    
    # 使用弹性定价公式
    optimal = cost * (1 + target_margin) * (1 + 1/elasticity)
    
    return max(cost * 1.1, optimal)  # 至少保证成本

def calculate_price_range(cost, elasticity, competitor_prices):
    """
    计算价格区间
    """
    min_price = cost * 1.1  # 最低10%毛利
    max_price = cost * 3.0  # 最高300%毛利
    
    if competitor_prices:
        comp_prices = [p['price'] for p in competitor_prices]
        min_price = max(min_price, min(comp_prices) * 0.8)
        max_price = min(max_price, max(comp_prices) * 1.2)
    
    return {
        'floor': round(min_price, 2),
        'ceiling': round(max_price, 2),
        'recommended_range': [
            round(min_price * 1.2, 2),
            round(min_price * 1.5, 2)
        ]
    }
```

### Step 3: 动态定价
根据市场变化实时调整价格。

**动态定价代码：**
```python
class DynamicPricingEngine:
    """
    动态定价引擎
    """
    
    def __init__(self, product_data, pricing_model):
        self.product = product_data
        self.model = pricing_model
        self.current_price = product_data.get('price', 0)
        self.last_update = datetime.now()
    
    def calculate_new_price(self, market_conditions):
        """
        计算新价格
        
        Args:
            market_conditions: 市场条件
        
        Returns:
            dict: 价格建议
        """
        # 基础价格
        base_price = self.model['optimal_price']
        
        # 调整因素
        adjustments = {
            'demand_factor': self.calculate_demand_adjustment(
                market_conditions.get('demand_index', 1.0)
            ),
            'competition_factor': self.calculate_competition_adjustment(
                market_conditions.get('competitor_prices', [])
            ),
            'inventory_factor': self.calculate_inventory_adjustment(
                market_conditions.get('inventory_level', 100)
            ),
            'seasonal_factor': self.calculate_seasonal_adjustment(
                market_conditions.get('season', 'normal')
            )
        }
        
        # 计算最终价格
        total_adjustment = 1.0
        for factor in adjustments.values():
            total_adjustment *= factor
        
        new_price = base_price * total_adjustment
        
        # 应用价格约束
        new_price = self.apply_price_constraints(new_price)
        
        return {
            'current_price': self.current_price,
            'new_price': round(new_price, 2),
            'adjustment_pct': round((new_price - self.current_price) / self.current_price * 100, 2),
            'adjustments': adjustments,
            'reason': self.generate_price_reason(adjustments),
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_demand_adjustment(self, demand_index):
        """
        需求调整
        """
        if demand_index > 1.5:
            return 1.1  # 高需求提价
        elif demand_index < 0.7:
            return 0.9  # 低需求降价
        return 1.0
    
    def calculate_competition_adjustment(self, competitor_prices):
        """
        竞争调整
        """
        if not competitor_prices:
            return 1.0
        
        comp_avg = np.mean([p['price'] for p in competitor_prices])
        my_price = self.current_price
        
        diff_pct = (comp_avg - my_price) / my_price
        
        if diff_pct > 0.15:
            return 0.95  # 竞品便宜太多，降价
        elif diff_pct < -0.15:
            return 1.05  # 竞品贵，可以提价
        return 1.0
    
    def calculate_inventory_adjustment(self, inventory_level):
        """
        库存调整
        """
        if inventory_level > 200:
            return 0.95  # 高库存，促销
        elif inventory_level < 30:
            return 1.1  # 低库存，提价
        return 1.0
    
    def calculate_seasonal_adjustment(self, season):
        """
        季节调整
        """
        seasonal_factors = {
            'peak': 1.15,      # 旺季
            'normal': 1.0,     # 常态
            'off_peak': 0.9,   # 淡季
            'promotion': 0.85  # 促销季
        }
        return seasonal_factors.get(season, 1.0)
    
    def apply_price_constraints(self, price):
        """
        应用价格约束
        """
        floor = self.model['price_range']['floor']
        ceiling = self.model['price_range']['ceiling']
        
        return max(floor, min(ceiling, price))
    
    def generate_price_reason(self, adjustments):
        """
        生成调价原因
        """
        reasons = []
        
        if adjustments['demand_factor'] != 1.0:
            direction = '上涨' if adjustments['demand_factor'] > 1.0 else '下跌'
            reasons.append(f"需求{direction}")
        
        if adjustments['competition_factor'] != 1.0:
            direction = '上涨' if adjustments['competition_factor'] > 1.0 else '下跌'
            reasons.append(f"竞争{direction}")
        
        if adjustments['inventory_factor'] != 1.0:
            direction = '上涨' if adjustments['inventory_factor'] > 1.0 else '下跌'
            reasons.append(f"库存{direction}")
        
        return '、'.join(reasons) if reasons else '例行调整'
```

### Step 4: 效果监控
追踪价格变化对销量和利润的影响。

**效果监控代码：**
```python
def monitor_pricing_effectiveness(pricing_history, sales_data):
    """
    监控定价效果
    
    Args:
        pricing_history: 价格历史
        sales_data: 销售数据
    
    Returns:
        dict: 效果报告
    """
    # 计算关键指标
    metrics = calculate_key_metrics(pricing_history, sales_data)
    
    # 毛利率分析
    margin_analysis = analyze_margin_trends(sales_data)
    
    # 竞争力分析
    competitiveness = analyze_price_competitiveness(
        pricing_history,
        sales_data.get('competitor_prices', [])
    )
    
    # 异常检测
    anomalies = detect_pricing_anomalies(pricing_history, sales_data)
    
    return {
        'metrics': metrics,
        'margin_analysis': margin_analysis,
        'competitiveness': competitiveness,
        'anomalies': anomalies,
        'overall_score': calculate_pricing_score(metrics, margin_analysis, competitiveness)
    }

def calculate_key_metrics(pricing_history, sales_data):
    """
    计算关键指标
    """
    if not pricing_history or not sales_data:
        return {}
    
    prices = [p['price'] for p in pricing_history]
    quantities = [s['quantity'] for s in sales_data]
    revenues = [p['price'] * s['quantity'] for p, s in zip(pricing_history, sales_data)]
    costs = [s['cost'] * s['quantity'] for s in sales_data]
    
    return {
        'avg_price': round(np.mean(prices), 2),
        'price_volatility': round(np.std(prices) / np.mean(prices), 3),
        'total_revenue': sum(revenues),
        'total_profit': sum(revenues) - sum(costs),
        'avg_margin': round((sum(revenues) - sum(costs)) / sum(revenues) * 100, 2) if sum(revenues) > 0 else 0,
        'units_sold': sum(quantities)
    }
```

### Step 5: 策略调整
优化定价策略，最大化ROI。

**策略调整代码：**
```python
def optimize_pricing_strategy(effectiveness_report, business_goals):
    """
    优化定价策略
    
    Args:
        effectiveness_report: 效果报告
        business_goals: 业务目标
    
    Returns:
        dict: 优化建议
    """
    recommendations = []
    
    # 毛利率优化
    current_margin = effectiveness_report['metrics'].get('avg_margin', 0)
    target_margin = business_goals.get('target_margin', 30)
    
    if current_margin < target_margin - 5:
        recommendations.append({
            'type': 'increase_margin',
            'action': '提价',
            'suggestion': f"毛利率{current_margin}%低于目标{target_margin}%，建议提价5-10%",
            'priority': 'high'
        })
    elif current_margin > target_margin + 10:
        recommendations.append({
            'type': 'increase_volume',
            'action': '降价',
            'suggestion': f"毛利率{current_margin}%高于目标，可适当降价提升销量",
            'priority': 'medium'
        })
    
    # 竞争力优化
    competitiveness = effectiveness_report.get('competitiveness', {})
    if competitiveness.get('status') == 'weak':
        recommendations.append({
            'type': 'improve_competitiveness',
            'action': '调整价格',
            'suggestion': '价格竞争力不足，建议降低至竞品90%区间',
            'priority': 'high'
        })
    
    # 异常处理
    anomalies = effectiveness_report.get('anomalies', [])
    if anomalies:
        recommendations.append({
            'type': 'fix_anomalies',
            'action': '检查异常',
            'suggestion': f"发现{len(anomalies)}个价格异常，需要人工检查",
            'priority': 'medium'
        })
    
    return {
        'recommendations': recommendations,
        'next_review_date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
        'expected_improvement': estimate_improvement(recommendations)
    }
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 毛利率 | >30% | (收入-成本)/收入 |
| 价格竞争力 | >市场均值10% | (竞品均价-我方价格)/竞品均价 |
| 定价准确率 | >85% | 实际售价符合模型的比例 |
| 价格响应速度 | <1h | 价格调整响应时间 |

## Success Criteria

- 毛利率保持在30%以上
- 价格竞争力超过市场均值10%
- 建立自动化定价系统
- 定价策略支持业务目标

---

**技能版本：** 1.0.0  
**最后更新：** 2025年