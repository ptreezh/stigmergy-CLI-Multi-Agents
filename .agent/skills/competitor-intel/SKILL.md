---
name: competitor-intel
description: 竞品情报监控技能，提供竞品识别、数据收集、分析和预警的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - competitive-intelligence
  - market-research
  - monitoring
---

# 竞品情报监控 (Competitor Intelligence)

## Overview

竞品情报监控是跨境电商了解市场动态、制定竞争策略的重要手段。本技能提供系统化的竞品分析方法。

## Step-by-Step Instructions

### Step 1: 竞品识别
识别主要竞争对手和潜在进入者。

**竞品识别代码：**
```python
from datetime import datetime, timedelta
from collections import defaultdict

def identify_competitors(product_category, target_market, your_brand):
    """
    识别主要竞争对手
    
    Args:
        product_category: 产品品类
        target_market: 目标市场
        your_brand: 你的品牌
    
    Returns:
        dict: 竞品列表和分类
    """
    # 竞品分类
    competitor_types = {
        'direct': '直接竞争对手 - 同类产品同价位',
        'indirect': '间接竞争对手 - 替代品或相邻品类',
        'potential': '潜在进入者 - 新兴品牌或跨界品牌'
    }
    
    # 竞品数据库（示例）
    competitors = {
        'direct': [
            {'name': 'BrandA', 'market_share': 0.25, 'strengths': ['品牌知名', '渠道广'], 'weaknesses': ['价格高']},
            {'name': 'BrandB', 'market_share': 0.18, 'strengths': ['创新快', '性价比'], 'weaknesses': ['服务差']},
            {'name': 'BrandC', 'market_share': 0.15, 'strengths': ['品质好', '设计优'], 'weaknesses': ['更新慢']}
        ],
        'indirect': [
            {'name': 'SubstituteA', 'market_share': 0.12, 'strengths': ['价格低'], 'weaknesses': ['品质一般']},
            {'name': 'SubstituteB', 'market_share': 0.08, 'strengths': ['功能多'], 'weaknesses': ['复杂']}
        ],
        'potential': [
            {'name': 'NewEntrantX', 'market_share': 0.02, 'strengths': ['资本足'], 'weaknesses': ['经验少']}
        ]
    }
    
    # 竞争格局分析
    total_share = sum(c['market_share'] for c in competitors['direct'])
    market_gap = 1.0 - total_share
    
    return {
        'competitors': competitors,
        'total_market_share_covered': total_share,
        'market_gap': market_gap,
        'top_3_competitors': competitors['direct'][:3],
        'recommended_focus': 'direct'  # 建议重点关注直接竞品
    }
```

### Step 2: 数据收集
监控竞品的价格、产品、营销、促销等活动。

**数据收集代码：**
```python
def collect_competitor_data(competitors, data_sources):
    """
    收集竞品数据
    
    Args:
        competitors: 竞品列表
        data_sources: 数据源配置
    
    Returns:
        dict: 收集的数据
    """
    collected_data = {
        'pricing': {},
        'product': {},
        'marketing': {},
        'reviews': {}
    }
    
    for competitor in competitors:
        comp_name = competitor['name']
        
        # 价格监控
        collected_data['pricing'][comp_name] = {
            'current_prices': fetch_competitor_prices(comp_name),
            'price_history': fetch_price_history(comp_name, days=30),
            'promotional_prices': fetch_promotions(comp_name),
            'discount_depth': calculate_discount_depth(comp_name)
        }
        
        # 产品监控
        collected_data['product'][comp_name] = {
            'product_listings': fetch_product_listings(comp_name),
            'new_launches': fetch_new_products(comp_name, days=30),
            'inventory_levels': estimate_inventory(comp_name)
        }
        
        # 营销监控
        collected_data['marketing'][comp_name] = {
            'ad_spend': estimate_ad_spend(comp_name),
            'campaigns': fetch_active_campaigns(comp_name),
            'social_media_activity': fetch_social_activity(comp_name)
        }
        
        # 评价监控
        collected_data['reviews'][comp_name] = {
            'rating': fetch_avg_rating(comp_name),
            'review_count': fetch_review_count(comp_name),
            'sentiment_analysis': analyze_reviews(comp_name)
        }
    
    return collected_data

def fetch_competitor_prices(competitor_name):
    """
    获取竞品价格
    """
    # 模拟API调用
    return {
        'basic': 29.99,
        'standard': 49.99,
        'premium': 79.99
    }

def fetch_price_history(competitor_name, days):
    """
    获取价格历史
    """
    import random
    history = []
    base_prices = [29.99, 49.99, 79.99]
    
    for i in range(days):
        date = (datetime.now() - timedelta(days=days-i)).strftime('%Y-%m-%d')
        prices = [round(p * random.uniform(0.9, 1.1), 2) for p in base_prices]
        history.append({
            'date': date,
            'prices': prices
        })
    
    return history
```

### Step 3: 数据分析
分析竞品的策略、优势和弱点。

**数据分析代码：**
```python
def analyze_competitor_strategies(competitor_data):
    """
    分析竞品策略
    
    Args:
        competitor_data: 竞品数据
    
    Returns:
        dict: 策略分析结果
    """
    analysis = {}
    
    for comp_name, data in competitor_data['pricing'].items():
        # 价格策略分析
        pricing_strategy = analyze_pricing_strategy(data)
        
        # 价格竞争力评分
        competitiveness = calculate_price_competitiveness(
            data['current_prices'],
            your_price={'basic': 34.99, 'standard': 54.99, 'premium': 89.99}
        )
        
        analysis[comp_name] = {
            'pricing_strategy': pricing_strategy,
            'price_competitiveness': competitiveness,
            'promotional_patterns': analyze_promotional_patterns(data),
            'price_elasticity_estimate': estimate_price_elasticity(data)
        }
    
    # 产品策略分析
    for comp_name, data in competitor_data['product'].items():
        analysis[comp_name]['product_strategy'] = {
            'innovation_rate': calculate_innovation_rate(data.get('new_launches', [])),
            'portfolio_coverage': calculate_portfolio_coverage(data.get('product_listings', [])),
            'product_gaps': identify_product_gaps(data.get('product_listings', []))
        }
    
    # 营销策略分析
    for comp_name, data in competitor_data['marketing'].items():
        analysis[comp_name]['marketing_strategy'] = {
            'ad_intensity': calculate_ad_intensity(data.get('ad_spend', 0)),
            'channel_focus': identify_channel_focus(data.get('campaigns', [])),
            'campaign_type': classify_campaigns(data.get('campaigns', []))
        }
    
    return analysis

def analyze_pricing_strategy(pricing_data):
    """
    分析定价策略类型
    """
    current = pricing_data.get('current_prices', {})
    history = pricing_data.get('price_history', [])
    
    if not history:
        return 'unknown'
    
    # 检查价格波动
    price_variance = calculate_variance([h['prices'][0] for h in history])
    
    if price_variance < 0.05:
        return 'premium_fixed'  # 高端固定价格
    elif price_variance > 0.2:
        return 'discount_heavy'  # 折扣导向
    else:
        return 'competitive'  # 竞争性定价

def calculate_price_competitiveness(competitor_prices, your_price):
    """
    计算价格竞争力
    """
    competitiveness = {}
    
    for tier in competitor_prices:
        comp_price = competitor_prices[tier]
        your = your_price.get(tier, comp_price)
        
        diff_pct = (your - comp_price) / comp_price
        
        if diff_pct > 0.15:
            competitiveness[tier] = 'low'  # 竞争力低
        elif diff_pct > 0:
            competitiveness[tier] = 'medium'  # 中等
        else:
            competitiveness[tier] = 'high'  # 高
    
    return competitiveness
```

### Step 4: 洞察发现
识别市场机会和威胁。

**洞察发现代码：**
```python
def generate_insights(analysis, market_data):
    """
    生成业务洞察
    
    Args:
        analysis: 竞品分析结果
        market_data: 市场数据
    
    Returns:
        dict: 洞察和建议
    """
    insights = {
        'opportunities': [],
        'threats': [],
        'recommendations': []
    }
    
    # 分析竞品弱点发现机会
    for comp_name, comp_analysis in analysis.items():
        competitiveness = comp_analysis.get('price_competitiveness', {})
        
        for tier, level in competitiveness.items():
            if level in ['medium', 'low']:
                insights['opportunities'].append({
                    'type': 'price_gap',
                    'description': f"{comp_name}在{tier}价位竞争力不足",
                    'action': '强化该价位产品优势'
                })
    
    # 分析竞品策略发现威胁
    for comp_name, comp_analysis in analysis.items():
        marketing = comp_analysis.get('marketing_strategy', {})
        
        if marketing.get('ad_intensity') == 'high':
            insights['threats'].append({
                'type': 'increased_competition',
                'description': f"{comp_name}大幅增加广告投入",
                'impact': '可能抢占市场份额'
            })
        
        product = comp_analysis.get('product_strategy', {})
        if product.get('innovation_rate', 0) > 0.3:
            insights['threats'].append({
                'type': 'innovation_gap',
                'description': f"{comp_name}新品推出频繁",
                'impact': '可能引领市场趋势'
            })
    
    # 生成建议
    insights['recommendations'] = generate_strategic_recommendations(insights)
    
    return insights
```

### Step 5: 预警机制
建立竞品动态预警系统。

**预警系统代码：**
```python
import time
from datetime import datetime

class CompetitorAlertSystem:
    """
    竞品预警系统
    """
    
    def __init__(self, competitors, thresholds):
        self.competitors = competitors
        self.thresholds = thresholds
        self.baseline = {}
        self.alerts = []
    
    def set_baseline(self, competitor_data):
        """
        设置基准数据
        """
        self.baseline = {
            'prices': {c: data['current_prices'] for c, data in competitor_data['pricing'].items()},
            'ratings': {c: data['rating'] for c, data in competitor_data['reviews'].items()},
            'product_count': {c: len(data['product_listings']) for c, data in competitor_data['product'].items()}
        }
    
    def check_alerts(self, current_data):
        """
        检查预警
        
        Args:
            current_data: 当前数据
        
        Returns:
            list: 预警列表
        """
        alerts = []
        
        # 价格预警
        for comp_name, prices in current_data.get('pricing', {}).items():
            baseline_prices = self.baseline.get('prices', {}).get(comp_name, {})
            
            for tier, price in prices.items():
                if tier in baseline_prices:
                    baseline = baseline_prices[tier]
                    change_pct = (price - baseline) / baseline
                    
                    if abs(change_pct) > self.thresholds['price_change']:
                        alerts.append({
                            'type': 'price_change',
                            'competitor': comp_name,
                            'tier': tier,
                            'change_pct': round(change_pct * 100, 2),
                            'severity': 'high' if abs(change_pct) > 0.2 else 'medium',
                            'timestamp': datetime.now().isoformat()
                        })
        
        # 新品预警
        for comp_name, products in current_data.get('product', {}).items():
            baseline_count = self.baseline.get('product_count', {}).get(comp_name, 0)
            current_count = len(products.get('product_listings', []))
            
            if current_count > baseline_count + self.thresholds['new_product_threshold']:
                alerts.append({
                    'type': 'new_product',
                    'competitor': comp_name,
                    'new_count': current_count - baseline_count,
                    'severity': 'medium',
                    'timestamp': datetime.now().isoformat()
                })
        
        # 评分预警
        for comp_name, rating in current_data.get('reviews', {}).items():
            baseline_rating = self.baseline.get('ratings', {}).get(comp_name, 0)
            
            if rating > baseline_rating + self.thresholds['rating_improvement']:
                alerts.append({
                    'type': 'rating_upgrade',
                    'competitor': comp_name,
                    'from': baseline_rating,
                    'to': rating,
                    'severity': 'high',
                    'timestamp': datetime.now().isoformat()
                })
        
        self.alerts.extend(alerts)
        return alerts
    
    def get_alert_summary(self):
        """
        获取预警摘要
        """
        if not self.alerts:
            return {'status': 'normal', 'alert_count': 0}
        
        return {
            'status': 'alert',
            'alert_count': len(self.alerts),
            'high_severity': len([a for a in self.alerts if a['severity'] == 'high']),
            'latest_alerts': sorted(self.alerts, key=lambda x: x['timestamp'], reverse=True)[:5]
        }
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 市场变化响应 | <24h | 竞品变化到响应的时间 |
| 情报准确率 | >90% | 情报验证准确的比例 |
| 监控覆盖率 | >80% | 主要竞品监控覆盖 |
| 预警及时率 | >95% | 及时预警的比例 |

## Success Criteria

- 24小时内响应市场变化
- 建立完整的竞品监控体系
- 准确预测竞品动向
- 及时发现市场机会

---

**技能版本：** 1.0.0  
**最后更新：** 2025年