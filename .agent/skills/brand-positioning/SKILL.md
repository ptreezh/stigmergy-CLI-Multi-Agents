---
name: brand-positioning
description: 跨境品牌定位与本土化技能，提供市场分析、品牌定位、视觉设计和传播策略的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - brand-positioning
  - localization
  - brand-strategy
---

# 跨境品牌定位与本土化 (Brand Positioning)

## Overview

品牌定位是跨境电商成功出海的核心。本技能提供系统化的品牌定位方法，帮助企业在海外市场建立清晰、有吸引力的品牌形象。

## Step-by-Step Instructions

### Step 1: 市场分析
分析目标市场的竞争格局、消费者需求和品牌机会。

**市场分析代码：**
```python
from collections import Counter, defaultdict

def analyze_market(target_market, product_category, competitors):
    """
    分析目标市场的竞争格局和机会
    
    Args:
        target_market: 目标市场
        product_category: 产品品类
        competitors: 竞争品牌列表
    
    Returns:
        dict: 市场分析报告
    """
    # 市场份额估算
    market_size = estimate_market_size(target_market, product_category)
    
    # 竞争分析
    competitive_analysis = []
    for competitor in competitors:
        analysis = {
            'name': competitor['name'],
            'strengths': competitor.get('strengths', []),
            'weaknesses': competitor.get('weaknesses', []),
            'positioning': competitor.get('positioning', ''),
            'price_range': competitor.get('price_range', [0, 0]),
            'market_share_estimate': competitor.get('market_share', 0)
        }
        competitive_analysis.append(analysis)
    
    # 消费者需求分析
    consumer_insights = analyze_consumer_needs(target_market, product_category)
    
    # 机会识别
    opportunities = identify_opportunities(competitive_analysis, consumer_insights)
    
    return {
        'market_size': market_size,
        'growth_rate': market_size.get('growth_rate', 0),
        'competitive_landscape': competitive_analysis,
        'consumer_insights': consumer_insights,
        'opportunities': opportunities,
        'recommendations': generate_recommendations(opportunities, consumer_insights)
    }

def estimate_market_size(market, category):
    """
    估算市场规模
    """
    # 简化估算（实际需要API数据）
    market_data = {
        'US': {
            'electronics': {'size': 450000000, 'growth': 0.08},
            'fashion': {'size': 380000000, 'growth': 0.12},
            'home': {'size': 290000000, 'growth': 0.06}
        },
        'EU': {
            'electronics': {'size': 320000000, 'growth': 0.05},
            'fashion': {'size': 350000000, 'growth': 0.07},
            'home': {'size': 210000000, 'growth': 0.04}
        }
    }
    
    return market_data.get(market, {}).get(category, {'size': 100000000, 'growth': 0.05})

def analyze_consumer_needs(market, category):
    """
    分析消费者需求
    """
    # 消费者画像数据
    consumer_segments = {
        'segment_1': {
            'name': '品质追求者',
            'percentage': 0.35,
            'priorities': ['质量', '品牌', '设计'],
            'price_sensitivity': 'low',
            'channels': ['官网', '旗舰店']
        },
        'segment_2': {
            'name': '性价比用户',
            'percentage': 0.40,
            'priorities': ['价格', '功能', '评价'],
            'price_sensitivity': 'high',
            'channels': ['电商平台', '折扣店']
        },
        'segment_3': {
            'name': '潮流跟随者',
            'percentage': 0.25,
            'priorities': ['新品', '社交媒体', '网红推荐'],
            'price_sensitivity': 'medium',
            'channels': ['社交媒体', '直播']
        }
    }
    
    return consumer_segments

def identify_opportunities(competitive_analysis, consumer_insights):
    """
    识别市场机会
    """
    opportunities = []
    
    # 分析竞争空白
    positioning_gaps = set()
    for comp in competitive_analysis:
        positioning_gaps.add(comp.get('positioning', ''))
    
    all_positions = ['高端', '性价比', '创新', '传统', '环保', '个性化']
    gaps = [p for p in all_positions if p not in positioning_gaps]
    
    if gaps:
        opportunities.append({
            'type': 'positioning_gap',
            'description': f"定位空白: {', '.join(gaps)}",
            'priority': 'high'
        })
    
    # 分析消费者需求缺口
    for segment_id, segment in consumer_insights.items():
        opportunities.append({
            'type': 'segment_unmet_need',
            'segment': segment['name'],
            'needs': segment['priorities'],
            'priority': 'medium'
        })
    
    return opportunities
```

### Step 2: 品牌定位
确定品牌的核心价值、差异化优势和目标受众。

**品牌定位代码：**
```python
def define_brand_positioning(product_info, market_analysis, target_segments):
    """
    定义品牌定位
    
    Args:
        product_info: 产品信息
        market_analysis: 市场分析结果
        target_segments: 目标细分市场
    
    Returns:
        dict: 品牌定位策略
    """
    # 核心价值主张
    core_values = generate_core_values(product_info)
    
    # 差异化优势
    differentiation = identify_differentiation(product_info, market_analysis)
    
    # 品牌个性
    brand_personality = define_brand_personality(target_segments)
    
    # 品牌承诺
    brand_promise = generate_brand_promise(core_values, differentiation)
    
    # 品牌定位声明
    positioning_statement = create_positioning_statement(
        brand_personality,
        differentiation,
        target_segments
    )
    
    return {
        'core_values': core_values,
        'differentiation': differentiation,
        'brand_personality': brand_personality,
        'brand_promise': brand_promise,
        'positioning_statement': positioning_statement
    }

def generate_core_values(product_info):
    """
    生成核心价值
    """
    # 基于产品特性生成价值
    value_map = {
        'quality': ['卓越品质', '精工细作', '匠心之作'],
        'innovation': ['创新科技', '引领未来', '突破传统'],
        'design': ['美学设计', '独特风格', '品味之选'],
        'value': ['物超所值', '性价比之王', '实惠之选'],
        'sustainability': ['环保理念', '可持续发展', '绿色生活']
    }
    
    product_features = product_info.get('features', [])
    core_values = []
    
    for feature in product_features:
        if feature in value_map:
            core_values.append(value_map[feature][0])
    
    return core_values[:3] if core_values else ['品质保证', '值得信赖']

def identify_differentiation(product_info, market_analysis):
    """
    识别差异化优势
    """
    competitors = market_analysis.get('competitive_landscape', [])
    
    differentiation = {
        'product_differentiation': [],
        'service_differentiation': [],
        'experience_differentiation': []
    }
    
    # 分析竞争对手弱点
    competitor_weaknesses = []
    for comp in competitors:
        competitor_weaknesses.extend(comp.get('weaknesses', []))
    
    # 找到差异化点
    common_weaknesses = Counter(competitor_weaknesses).most_common(3)
    
    differentiation['product_differentiation'] = [
        f"解决{c[0]}问题" for c in common_weaknesses
    ]
    
    return differentiation

def create_positioning_statement(personality, differentiation, target_segments):
    """
    创建品牌定位声明
    """
    segment_names = [s['name'] for s in target_segments[:2]]
    
    statement = f"对于{segment_names[0]}来说，{personality['brand_name']}是"
    statement += f"一个{differentiation['product_differentiation'][0]}"
    statement += f"的品牌，因为我们{personality['tone_of_voice']}。"
    
    return statement
```

### Step 3: 视觉设计
设计符合本地审美的Logo、配色和视觉系统。

**视觉设计代码：**
```python
def design_brand_visual_system(brand_positioning, target_market):
    """
    设计品牌视觉系统
    
    Args:
        brand_positioning: 品牌定位
        target_market: 目标市场
    
    Returns:
        dict: 视觉系统设计
    """
    # 市场色彩偏好
    color_preferences = {
        'US': {'primary': '蓝色', 'secondary': '橙色', 'accent': '红色'},
        'EU': {'primary': '蓝色', 'secondary': '白色', 'accent': '金色'},
        'JP': {'primary': '白色', 'secondary': '红色', 'accent': '黑色'},
        'CN': {'primary': '红色', 'secondary': '金色', 'accent': '黑色'}
    }
    
    # 本土化调整
    localization = adjust_for_market(brand_positioning, target_market)
    
    # 视觉元素
    visual_elements = {
        'logo_design': generate_logo_requirements(brand_positioning),
        'color_palette': generate_color_palette(localization),
        'typography': generate_typography(localization),
        'imagery_style': generate_imagery_style(brand_positioning)
    }
    
    return {
        'localization': localization,
        'visual_elements': visual_elements,
        'brand_guidelines': create_brand_guidelines(visual_elements)
    }

def adjust_for_market(positioning, market):
    """
    本土化调整
    """
    adjustments = {
        'US': {
            'color_tweak': '更鲜艳',
            'tone': '直接、自信',
            'imagery': '生活方式导向'
        },
        'EU': {
            'color_tweak': '更柔和',
            'tone': '优雅、含蓄',
            'imagery': '品质导向'
        },
        'JP': {
            'color_tweak': '更简洁',
            'tone': '谦逊、精致',
            'imagery': '细节导向'
        }
    }
    
    return adjustments.get(market, adjustments['US'])
```

### Step 4: 传播策略
制定品牌故事、传播渠道和营销信息。

**传播策略代码：**
```python
def develop_communication_strategy(brand_positioning, visual_system, target_market):
    """
    制定传播策略
    
    Args:
        brand_positioning: 品牌定位
        visual_system: 视觉系统
        target_market: 目标市场
    
    Returns:
        dict: 传播策略
    """
    # 品牌故事
    brand_story = create_brand_story(brand_positioning)
    
    # 关键信息
    key_messages = generate_key_messages(brand_positioning)
    
    # 渠道策略
    channel_strategy = develop_channel_strategy(target_market)
    
    # 内容策略
    content_calendar = create_content_calendar(brand_story, key_messages)
    
    return {
        'brand_story': brand_story,
        'key_messages': key_messages,
        'channel_strategy': channel_strategy,
        'content_calendar': content_calendar
    }

def create_brand_story(positioning):
    """
    创建品牌故事
    """
    story = {
        'origin': f"{positioning.get('brand_personality', {}).get('brand_name', '品牌')}始于对{positioning.get('core_values', ['卓越'])[0]}的追求",
        'mission': f"我们的使命是{positioning.get('brand_promise', '为客户创造价值')}",
        'vision': f"我们致力于成为{positioning.get('differentiation', {}).get('product_differentiation', ['行业领先'])[0]}"
    }
    
    return story

def develop_channel_strategy(market):
    """
    制定渠道策略
    """
    channel_preferences = {
        'US': ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Email'],
        'EU': ['Instagram', 'Facebook', 'Pinterest', 'Email', 'Google'],
        'JP': ['Instagram', 'LINE', 'Twitter', 'YouTube'],
        'CN': ['微信', '微博', '抖音', '小红书', 'B站']
    }
    
    channels = channel_preferences.get(market, channel_preferences['US'])
    
    return {
        'primary_channels': channels[:3],
        'secondary_channels': channels[3:],
        'budget_allocation': {c: 60/len(channels[:3]) for c in channels[:3]}
    }
```

### Step 5: 效果评估
监测品牌认知度和市场反馈。

**效果评估代码：**
```python
def measure_brand_performance(brand_metrics, goals):
    """
    衡量品牌绩效
    
    Args:
        brand_metrics: 品牌指标数据
        goals: 目标值
    
    Returns:
        dict: 绩效评估报告
    """
    results = {}
    
    # 品牌认知度
    awareness = brand_metrics.get('awareness', 0)
    results['awareness'] = {
        'current': awareness,
        'goal': goals.get('awareness', 0.30),
        'achievement_rate': awareness / goals.get('awareness', 0.30) if goals.get('awareness') else 0,
        'status': '✅ 达成' if awareness >= goals.get('awareness', 0.30) else '❌ 未达成'
    }
    
    # 品牌好感度
    sentiment = brand_metrics.get('sentiment', 0)
    results['sentiment'] = {
        'current': sentiment,
        'goal': goals.get('sentiment', 0.70),
        'achievement_rate': sentiment / goals.get('sentiment', 0.70) if goals.get('sentiment') else 0,
        'status': '✅ 达成' if sentiment >= goals.get('sentiment', 0.70) else '❌ 未达成'
    }
    
    # 溢价能力
    premium = brand_metrics.get('premium_rate', 0)
    results['premium'] = {
        'current': premium,
        'goal': goals.get('premium', 0.20),
        'achievement_rate': premium / goals.get('premium', 0.20) if goals.get('premium') else 0,
        'status': '✅ 达成' if premium >= goals.get('premium', 0.20) else '❌ 未达成'
    }
    
    # 综合评分
    overall_score = (
        results['awareness']['achievement_rate'] * 0.3 +
        results['sentiment']['achievement_rate'] * 0.3 +
        results['premium']['achievement_rate'] * 0.4
    )
    
    results['overall'] = {
        'score': round(overall_score * 100, 1),
        'grade': 'A' if overall_score >= 0.9 else 'B' if overall_score >= 0.7 else 'C',
        'recommendations': generate_optimization_recommendations(results)
    }
    
    return results
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 品牌认知度 | >30% | 认知品牌的目标受众占比 |
| 品牌好感度 | >70% | 对品牌有好感的受众占比 |
| 溢价率 | >20% | (品牌价-市场价)/市场价 |
| 品牌搜索量 | 持续增长 | 月度品牌搜索趋势 |

## Success Criteria

- 品牌认知度超过30%
- 品牌溢价率达到20%以上
- 建立完整的品牌视觉系统
- 品牌故事被目标受众记住

---

**技能版本：** 1.0.0  
**最后更新：** 2025年