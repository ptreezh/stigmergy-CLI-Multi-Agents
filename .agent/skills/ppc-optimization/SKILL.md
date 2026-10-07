---
name: ppc-optimization
description: 跨境广告投放优化技能，提供Google Ads、Amazon Ads等平台的广告投放优化方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
allowed-tools:
  - web_search
  - data_analysis
  - python
  - excel
  - api_integration
input_format:
  - campaign_data: dict (广告活动数据)
  - keywords: list (关键词列表)
  - budget: float (预算设置)
  - goals: dict (广告目标)
output_format:
  - optimization_strategy: dict (优化策略)
  - bid_recommendations: list (出价建议)
  - performance_report: dict (效果报告)
estimated_time: 2-3小时
complexity: 中级
tags:
  - cross-border-commerce
  - ppc-advertising
  - google-ads
  - amazon-ads
---

# 跨境广告投放优化 (PPC Optimization)

## Overview

跨境广告投放优化是跨境电商获取流量和转化的关键手段。本技能提供系统化的PPC广告优化方法，帮助企业优化Google Ads、Amazon Ads等平台的广告投放，提升ROI，降低获客成本。

**核心价值：**
- 提升广告ROI，增加销售转化
- 降低点击成本，提高广告效率
- 精准定位目标客户
- 数据驱动优化决策

## Prerequisites

### 必备条件
1. **广告账户配置**
   - Google Ads/Microsoft Ads账户
   - Amazon Advertising账户
   - Facebook Ads账户
   - 广告API访问权限

2. **数据基础**
   - 历史广告数据（至少30天）
   - 转化跟踪设置
   - 受众数据

3. **技术工具**
   - 广告管理平台
   - 数据分析工具
   - 关键词研究工具
   - A/B测试工具

### 建议配置
- 广告优化团队：1-2人
- 月度预算：根据业务规模设定
- 关键词库：1000+关键词

## Step-by-Step Instructions

### Step 1: 关键词研究 (30-45分钟)

**目标：** 发现高价值关键词

**关键词研究流程：**

```python
from collections import Counter, defaultdict

def keyword_research(product_info, target_market, seed_keywords):
    """
    关键词研究
    
    Args:
        product_info: 产品信息
        target_market: 目标市场
        seed_keywords: 种子关键词列表
    
    Returns:
        dict: 关键词研究结果
    """
    # 1. 种子关键词扩展
    expanded_keywords = expand_keywords(seed_keywords)
    
    # 2. 搜索量和竞争度分析
    keyword_metrics = analyze_keyword_metrics(expanded_keywords, target_market)
    
    # 3. 关键词分类
    classified_keywords = classify_keywords(keyword_metrics)
    
    # 4. 机会识别
    opportunity_keywords = identify_opportunities(classified_keywords)
    
    return {
        'total_keywords': len(expanded_keywords),
        'high_value_keywords': classified_keywords['high_value'],
        'opportunity_keywords': opportunity_keywords,
        'negative_keywords': suggest_negative_keywords(expanded_keywords),
        'keyword_metrics': keyword_metrics
    }

def expand_keywords(seed_keywords):
    """
    扩展关键词
    """
    expanded = []
    
    for seed in seed_keywords:
        # 基础扩展
        expanded.append(seed.lower())
        expanded.append(seed.title())
        
        # 添加修饰词
        modifiers = [
            'cheap', 'best', 'top', 'buy', 'online', 'discount',
            'sale', 'deal', 'review', 'vs', 'alternative'
        ]
        
        for modifier in modifiers:
            expanded.append(f'{modifier} {seed}')
            expanded.append(f'{seed} {modifier}')
        
        # 添加地域修饰
        geo_modifiers = ['US', 'UK', 'EU', 'global', 'international']
        for geo in geo_modifiers:
            expanded.append(f'{seed} {geo}')
    
    return list(set(expanded))

def analyze_keyword_metrics(keywords, target_market):
    """
    分析关键词指标
    """
    metrics = []
    
    for keyword in keywords:
        # 模拟API调用获取关键词数据
        # 实际应用中使用Google Ads API或第三方工具
        data = {
            'keyword': keyword,
            'search_volume': estimate_search_volume(keyword, target_market),
            'competition': estimate_competition(keyword),
            'cpc': estimate_cpc(keyword),
            'difficulty': estimate_difficulty(keyword)
        }
        
        # 计算机会分数
        data['opportunity_score'] = calculate_opportunity_score(data)
        
        metrics.append(data)
    
    return pd.DataFrame(metrics)

def estimate_search_volume(keyword, market):
    """
    估算搜索量（简化版）
    """
    # 实际应用中应使用Google Keyword Planner或SimilarWeb API
    import random
    base_volume = random.randint(100, 50000)
    return base_volume

def estimate_competition(keyword):
    """
    估算竞争度
    """
    import random
    return random.uniform(0.1, 1.0)

def estimate_cpc(keyword):
    """
    估算CPC
    """
    import random
    return random.uniform(0.5, 5.0)

def estimate_difficulty(keyword):
    """
    估算难度
    """
    import random
    return random.uniform(0.1, 1.0)

def calculate_opportunity_score(data):
    """
    计算机会分数
    """
    # 综合搜索量、竞争度、CPC计算机会分数
    search_volume_score = min(data['search_volume'] / 10000, 1)
    competition_score = 1 - data['competition']
    cpc_score = 1 - (data['cpc'] / 5)  # 假设5为高CPC阈值
    
    opportunity_score = (
        search_volume_score * 0.4 +
        competition_score * 0.3 +
        cpc_score * 0.3
    )
    
    return round(opportunity_score * 100, 2)

def classify_keywords(keyword_metrics):
    """
    分类关键词
    """
    classified = {
        'high_value': [],
        'medium_value': [],
        'low_value': []
    }
    
    for _, row in keyword_metrics.iterrows():
        if row['opportunity_score'] >= 70:
            classified['high_value'].append(row.to_dict())
        elif row['opportunity_score'] >= 40:
            classified['medium_value'].append(row.to_dict())
        else:
            classified['low_value'].append(row.to_dict())
    
    # 按机会分数排序
    for category in classified:
        classified[category].sort(
            key=lambda x: x['opportunity_score'],
            reverse=True
        )
    
    return classified

def identify_opportunities(classified_keywords):
    """
    识别机会关键词
    """
    opportunities = []
    
    # 高搜索量低竞争的关键词
    high_search_low_competition = [
        kw for kw in classified_keywords['high_value']
        if kw['search_volume'] > 5000 and kw['competition'] < 0.5
    ]
    
    # 低CPC高转化的关键词
    low_cpc_high_conversion = [
        kw for kw in classified_keywords['medium_value']
        if kw['cpc'] < 1.0 and kw['competition'] < 0.3
    ]
    
    opportunities = {
        'high_search_low_competition': high_search_low_competition[:10],
        'low_cpc_high_conversion': low_cpc_high_conversion[:10]
    }
    
    return opportunities

def suggest_negative_keywords(keywords):
    """
    建议否定关键词
    """
    negative_keywords = [
        'free', 'cheap', 'discount', 'wholesale', 'bulk',
        'used', 'secondhand', 'repair', 'manual', 'pdf',
        'download', 'torrent', 'crack', 'hack'
    ]
    
    # 基于关键词建议否定词
    auto_negatives = []
    for keyword in keywords:
        words = keyword.split()
        for word in words:
            if len(word) < 3 or word.lower() in negative_keywords:
                auto_negatives.append(word)
    
    return list(set(auto_negatives))
```

### Step 2: 广告活动结构设计 (30-45分钟)

**目标：** 设计高效的广告活动结构

**结构设计原则：**

```python
def design_campaign_structure(product_info, target_keywords, budget):
    """
    设计广告活动结构
    
    Args:
        product_info: 产品信息
        target_keywords: 目标关键词
        budget: 总预算
    
    Returns:
        dict: 广告活动结构
    """
    # 1. 按产品线分组
    campaigns = organize_by_product_line(product_info, target_keywords)
    
    # 2. 为每个活动分配预算
    budget_allocation = allocate_budget(campaigns, budget)
    
    # 3. 创建广告组
    ad_groups = create_ad_groups(campaigns)
    
    # 4. 设置受众定位
    targeting = setup_targeting(product_info['target_market'])
    
    return {
        'campaigns': campaigns,
        'budget_allocation': budget_allocation,
        'ad_groups': ad_groups,
        'targeting': targeting
    }

def organize_by_product_line(product_info, keywords):
    """
    按产品线组织活动
    """
    campaigns = []
    
    # 主活动
    main_campaign = {
        'name': f"{product_info['brand']} - {product_info['product_name']}",
        'type': 'Search',
        'objective': 'Sales',
        'status': 'Active',
        'keywords': keywords['high_value'][:50]  # 前50个高价值关键词
    }
    campaigns.append(main_campaign)
    
    # 长尾关键词活动
    longtail_campaign = {
        'name': f"{product_info['brand']} - Long-tail Keywords",
        'type': 'Search',
        'objective': 'Sales',
        'status': 'Active',
        'keywords': keywords['medium_value'] + keywords['low_value']
    }
    campaigns.append(longtail_campaign)
    
    # 竞品活动
    competitor_campaign = {
        'name': f"{product_info['brand']} - Competitor Keywords",
        'type': 'Search',
        'objective': 'Sales',
        'status': 'Active',
        'keywords': extract_competitor_keywords(product_info['competitors'])
    }
    campaigns.append(competitor_campaign)
    
    return campaigns

def allocate_budget(campaigns, total_budget):
    """
    分配预算
    """
    # 预算分配比例
    allocation_ratios = {
        'main': 0.5,      # 主活动50%
        'longtail': 0.3,  # 长尾30%
        'competitor': 0.2 # 竞品20%
    }
    
    budget_allocation = {}
    
    for i, campaign in enumerate(campaigns):
        if i == 0:
            ratio = allocation_ratios['main']
        elif i == 1:
            ratio = allocation_ratios['longtail']
        else:
            ratio = allocation_ratios['competitor']
        
        budget_allocation[campaign['name']] = {
            'daily_budget': round(total_budget * ratio / 30, 2),
            'monthly_budget': round(total_budget * ratio, 2),
            'allocation_ratio': ratio
        }
    
    return budget_allocation

def create_ad_groups(campaigns):
    """
    创建广告组
    """
    ad_groups = []
    
    for campaign in campaigns:
        # 按主题分组关键词
        keyword_clusters = cluster_keywords(campaign['keywords'])
        
        for cluster_name, cluster_keywords in keyword_clusters.items():
            ad_group = {
                'campaign_name': campaign['name'],
                'ad_group_name': cluster_name,
                'keywords': cluster_keywords,
                'ads': generate_ad_variations(cluster_name)
            }
            ad_groups.append(ad_group)
    
    return ad_groups

def cluster_keywords(keywords):
    """
    关键词聚类
    """
    clusters = {}
    
    for keyword_data in keywords:
        keyword = keyword_data['keyword']
        
        # 简单聚类：按词根分组
        words = keyword.split()
        if words:
            root = words[0].lower()
            
            if root not in clusters:
                clusters[root] = []
            clusters[root].append(keyword_data)
    
    # 重命名簇
    cluster_names = {
        root: f"{root.capitalize()} Keywords"
        for root in clusters.keys()
    }
    
    return {cluster_names[root]: clusters[root] for root in clusters}

def generate_ad_variations(ad_group_name):
    """
    生成广告变体
    """
    base_text = ad_group_name.replace(' Keywords', '')
    
    variations = [
        {
            'headline': f"Best {base_text} - Shop Now",
            'description': f"Discover our top-rated {base_text}. Free shipping on orders over $50.",
            'display_url': 'www.yourstore.com/' + base_text.lower().replace(' ', '-')
        },
        {
            'headline': f"{base_text} - Quality Guaranteed",
            'description': f"Premium {base_text} at competitive prices. 30-day money-back guarantee.",
            'display_url': 'www.yourstore.com/' + base_text.lower().replace(' ', '-')
        }
    ]
    
    return variations

def setup_targeting(target_market):
    """
    设置受众定位
    """
    targeting = {
        'locations': [target_market],
        'languages': ['en'],
        'demographics': {
            'age_range': '18-65',
            'gender': 'all'
        },
        'devices': ['desktop', 'mobile', 'tablet'],
        'schedule': {
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'hours': '8:00 AM - 10:00 PM'
        }
    }
    
    return targeting
```

### Step 3: 出价策略优化 (30-45分钟)

**目标：** 优化出价策略，提升ROI

**出价优化方法：**

```python
def optimize_bidding_strategy(campaign_performance, goals):
    """
    优化出价策略
    
    Args:
        campaign_performance: 广告活动表现数据
        goals: 广告目标
    
    Returns:
        dict: 出价策略建议
    """
    bidding_strategy = {
        'strategy_type': None,
        'bid_adjustments': {},
        'recommendations': []
    }
    
    # 根据目标选择策略
    if goals['primary'] == 'maximize_conversions':
        bidding_strategy['strategy_type'] = 'Maximize Conversions'
        bidding_strategy['target_cpa'] = calculate_optimal_cpa(campaign_performance)
        
    elif goals['primary'] == 'maximize_revenue':
        bidding_strategy['strategy_type'] = 'Maximize Conversion Value'
        bidding_strategy['target_roas'] = calculate_optimal_roas(campaign_performance)
        
    elif goals['primary'] == 'target_cpa':
        bidding_strategy['strategy_type'] = 'Target CPA'
        bidding_strategy['target_cpa'] = goals['target_cpa_value']
        
    else:  # 手动出价
        bidding_strategy['strategy_type'] = 'Manual CPC'
        bidding_strategy['keyword_bids'] = calculate_keyword_bids(campaign_performance)
    
    # 计算出价调整
    bidding_strategy['bid_adjustments'] = calculate_bid_adjustments(campaign_performance)
    
    # 生成建议
    bidding_strategy['recommendations'] = generate_bidding_recommendations(campaign_performance)
    
    return bidding_strategy

def calculate_optimal_cpa(performance_data):
    """
    计算最优CPA
    """
    avg_cpa = performance_data['cost'] / performance_data['conversions']
    
    # 目标CPA为平均CPA的90%
    optimal_cpa = avg_cpa * 0.9
    
    return round(optimal_cpa, 2)

def calculate_optimal_roas(performance_data):
    """
    计算最优ROAS
    """
    current_roas = performance_data['revenue'] / performance_data['cost']
    
    # 目标ROAS为当前ROAS的110%
    optimal_roas = current_roas * 1.1
    
    return round(optimal_roas, 2)

def calculate_keyword_bids(performance_data):
    """
    计算关键词出价
    """
    keyword_bids = {}
    
    for keyword, metrics in performance_data['keywords'].items():
        # 基于转化率和CPC计算出价
        conversion_rate = metrics['conversions'] / metrics['clicks'] if metrics['clicks'] > 0 else 0
        current_cpc = metrics['cost'] / metrics['clicks'] if metrics['clicks'] > 0 else 0
        
        # 高转化率关键词提高出价
        if conversion_rate > 0.05:  # 5%以上转化率
            suggested_bid = current_cpc * 1.2
        elif conversion_rate > 0.02:  # 2-5%转化率
            suggested_bid = current_cpc * 1.1
        else:
            suggested_bid = current_cpc * 0.9
        
        keyword_bids[keyword] = round(suggested_bid, 2)
    
    return keyword_bids

def calculate_bid_adjustments(performance_data):
    """
    计算出价调整
    """
    adjustments = {
        'device': {},
        'location': {},
        'time': {}
    }
    
    # 设备调整
    if 'device_performance' in performance_data:
        for device, metrics in performance_data['device_performance'].items():
            if metrics['roas'] > performance_data['avg_roas'] * 1.2:
                adjustments['device'][device] = '+20%'
            elif metrics['roas'] < performance_data['avg_roas'] * 0.8:
                adjustments['device'][device] = '-20%'
    
    # 地理调整
    if 'location_performance' in performance_data:
        for location, metrics in performance_data['location_performance'].items():
            if metrics['roas'] > performance_data['avg_roas'] * 1.3:
                adjustments['location'][location] = '+30%'
            elif metrics['roas'] < performance_data['avg_roas'] * 0.7:
                adjustments['location'][location] = '-30%'
    
    # 时间调整
    if 'hour_performance' in performance_data:
        best_hours = [
            hour for hour, metrics in performance_data['hour_performance'].items()
            if metrics['roas'] > performance_data['avg_roas'] * 1.5
        ]
        
        for hour in best_hours:
            adjustments['time'][hour] = '+25%'
    
    return adjustments

def generate_bidding_recommendations(performance_data):
    """
    生成出价建议
    """
    recommendations = []
    
    # 整体CPA建议
    current_cpa = performance_data['cost'] / performance_data['conversions']
    target_cpa = current_cpa * 0.9
    
    recommendations.append({
        'type': 'CPA_OPTIMIZATION',
        'description': f'当前CPA为${current_cpa:.2f}，建议降低至${target_cpa:.2f}',
        'action': '优化关键词和广告创意',
        'priority': 'HIGH'
    })
    
    # 低效关键词建议
    low_performance_keywords = [
        kw for kw, metrics in performance_data['keywords'].items()
        if metrics['clicks'] > 50 and metrics['conversions'] == 0
    ]
    
    if low_performance_keywords:
        recommendations.append({
            'type': 'KEYWORD_CLEANUP',
            'description': f'{len(low_performance_keywords)}个关键词无转化，建议降低出价或移除',
            'keywords': low_performance_keywords[:5],
            'action': '降低出价50%或移除',
            'priority': 'HIGH'
        })
    
    return recommendations
```

### Step 4: 广告创意优化 (30-45分钟)

**目标：** 优化广告创意，提升点击率和转化率

**创意优化流程：**

```python
def optimize_ad_creatives(performance_data, product_info):
    """
    优化广告创意
    
    Args:
        performance_data: 广告表现数据
        product_info: 产品信息
    
    Returns:
        dict: 创意优化建议
    """
    # 分析表现最好的广告
    top_performers = analyze_top_performers(performance_data)
    
    # 识别改进机会
    improvement_opportunities = identify_improvement_opportunities(
        performance_data, top_performers
    )
    
    # 生成新创意变体
    new_variations = generate_new_variations(
        top_performers, improvement_opportunities, product_info
    )
    
    # A/B测试建议
    ab_test_plan = design_ab_test(new_variations)
    
    return {
        'top_performers': top_performers,
        'improvement_opportunities': improvement_opportunities,
        'new_variations': new_variations,
        'ab_test_plan': ab_test_plan
    }

def analyze_top_performers(performance_data):
    """
    分析表现最好的广告
    """
    ads = performance_data.get('ads', [])
    
    # 按ROAS排序
    sorted_ads = sorted(
        ads,
        key=lambda x: x.get('roas', 0),
        reverse=True
    )
    
    top_performers = sorted_ads[:3]
    
    # 分析共同特征
    common_patterns = analyze_common_patterns(top_performers)
    
    return {
        'ads': top_performers,
        'common_patterns': common_patterns
    }

def analyze_common_patterns(top_ads):
    """
    分析共同模式
    """
    patterns = {
        'headline_length': [],
        'includes_price': False,
        'includes_discount': False,
        'includes_urgency': False,
        'sentiment': []
    }
    
    for ad in top_ads:
        headline = ad['headline']
        patterns['headline_length'].append(len(headline))
        
        # 检查价格
        if any(c.isdigit() for c in headline):
            patterns['includes_price'] = True
        
        # 检查折扣
        if any(word in headline.lower() for word in ['discount', 'save', 'off', 'deal']):
            patterns['includes_discount'] = True
        
        # 检查紧迫感
        if any(word in headline.lower() for word in ['now', 'today', 'limited', 'hurry']):
            patterns['includes_urgency'] = True
    
    # 计算平均长度
    if patterns['headline_length']:
        patterns['avg_headline_length'] = sum(patterns['headline_length']) / len(patterns['headline_length'])
    
    return patterns

def identify_improvement_opportunities(performance_data, top_performers):
    """
    识别改进机会
    """
    opportunities = []
    
    # 低点击率广告
    low_ctr_ads = [
        ad for ad in performance_data.get('ads', [])
        if ad.get('ctr', 0) < 0.02
    ]
    
    if low_ctr_ads:
        opportunities.append({
            'type': 'LOW_CTR',
            'description': f'{len(low_ctr_ads)}个广告CTR低于2%',
            'ads': [ad['ad_id'] for ad in low_ctr_ads],
            'recommendation': '优化标题和描述'
        })
    
    # 低转化率广告
    low_cvr_ads = [
        ad for ad in performance_data.get('ads', [])
        if ad.get('conversions', 0) == 0 and ad.get('clicks', 0) > 50
    ]
    
    if low_cvr_ads:
        opportunities.append({
            'type': 'LOW_CVR',
            'description': f'{len(low_cvr_ads)}个广告无转化',
            'ads': [ad['ad_id'] for ad in low_cvr_ads],
            'recommendation': '检查Landing Page或产品定价'
        })
    
    return opportunities

def generate_new_variations(top_performers, opportunities, product_info):
    """
    生成新创意变体
    """
    new_variations = []
    
    # 基于top performers生成变体
    for ad in top_performers['ads'][:2]:
        # 变体1：强调价值
        variation_1 = {
            'headline': f"Premium {product_info['product_name']} - Quality Guaranteed",
            'description': f"Trusted by 10,000+ customers. Free returns & fast shipping.",
            'based_on': ad['ad_id'],
            'variation_type': 'value_emphasis'
        }
        
        # 变体2：强调优惠
        variation_2 = {
            'headline': f"Save 20% on {product_info['product_name']} - Limited Time",
            'description': f"Best price guaranteed. Order today for exclusive discount.",
            'based_on': ad['ad_id'],
            'variation_type': 'discount_emphasis'
        }
        
        # 变体3：紧迫感
        variation_3 = {
            'headline': f"{product_info['product_name']} in Stock - Order Now",
            'description': f"Limited inventory available. Free shipping on all orders.",
            'based_on': ad['ad_id'],
            'variation_type': 'urgency'
        }
        
        new_variations.extend([variation_1, variation_2, variation_3])
    
    return new_variations

def design_ab_test(variations):
    """
    设计A/B测试
    """
    ab_test_plan = {
        'test_name': f"Ad Creative Test - {datetime.now().strftime('%Y%m%d')}",
        'test_duration': 14,  # 14天
        'confidence_level': 95,
        'minimum_sample_size': 1000,
        'test_groups': []
    }
    
    # 将变体分成2组
    group_a = variations[:len(variations)//2]
    group_b = variations[len(variations)//2:]
    
    ab_test_plan['test_groups'] = [
        {
            'group_name': 'Group A',
            'variations': group_a,
            'traffic_allocation': 50
        },
        {
            'group_name': 'Group B',
            'variations': group_b,
            'traffic_allocation': 50
        }
    ]
    
    return ab_test_plan
```

### Step 5: 效果监控与持续优化 (持续进行)

**目标：** 监控广告效果，持续优化

**监控体系：**

```python
def setup_monitoring_dashboard(campaign_data):
    """
    设置监控仪表盘
    
    Args:
        campaign_data: 广告活动数据
    
    Returns:
        dict: 监控配置
    """
    monitoring_config = {
        'kpi_metrics': [],
        'alert_rules': [],
        'reporting_schedule': {}
    }
    
    # 定义关键指标
    monitoring_config['kpi_metrics'] = [
        {
            'name': 'Impressions',
            'target': 100000,
            'current': campaign_data.get('impressions', 0)
        },
        {
            'name': 'Clicks',
            'target': 10000,
            'current': campaign_data.get('clicks', 0)
        },
        {
            'name': 'CTR',
            'target': 0.03,
            'current': campaign_data.get('ctr', 0)
        },
        {
            'name': 'Conversions',
            'target': 500,
            'current': campaign_data.get('conversions', 0)
        },
        {
            'name': 'CPA',
            'target': 20,
            'current': campaign_data.get('cpa', 0)
        },
        {
            'name': 'ROAS',
            'target': 3.0,
            'current': campaign_data.get('roas', 0)
        }
    ]
    
    # 设置预警规则
    monitoring_config['alert_rules'] = [
        {
            'metric': 'CPA',
            'condition': '>',
            'threshold': 30,
            'severity': 'HIGH',
            'action': 'Review campaign settings'
        },
        {
            'metric': 'CTR',
            'condition': '<',
            'threshold': 0.01,
            'severity': 'MEDIUM',
            'action': 'Optimize ad creatives'
        },
        {
            'metric': 'ROAS',
            'condition': '<',
            'threshold': 2.0,
            'severity': 'HIGH',
            'action': 'Pause underperforming keywords'
        }
    ]
    
    # 报告周期
    monitoring_config['reporting_schedule'] = {
        'daily': ['Impressions', 'Clicks', 'CTR'],
        'weekly': ['Conversions', 'CPA', 'ROAS'],
        'monthly': ['Overall Performance', 'Trends', 'Opportunities']
    }
    
    return monitoring_config

def generate_performance_report(campaign_data, monitoring_config):
    """
    生成效果报告
    """
    report = {
        'report_date': datetime.now().isoformat(),
        'period': 'Last 30 Days',
        'summary': {},
        'detailed_metrics': {},
        'recommendations': []
    }
    
    # 汇总信息
    report['summary'] = {
        'total_spend': campaign_data.get('cost', 0),
        'total_revenue': campaign_data.get('revenue', 0),
        'roas': campaign_data.get('roas', 0),
        'cpa': campaign_data.get('cpa', 0),
        'conversions': campaign_data.get('conversions', 0)
    }
    
    # 详细指标
    for metric_config in monitoring_config['kpi_metrics']:
        metric_name = metric_config['name']
        current_value = metric_config['current']
        target_value = metric_config['target']
        
        achievement_rate = (current_value / target_value * 100) if target_value > 0 else 0
        
        report['detailed_metrics'][metric_name] = {
            'current': current_value,
            'target': target_value,
            'achievement_rate': round(achievement_rate, 2),
            'status': 'ON_TRACK' if achievement_rate >= 90 else 'BELOW_TARGET'
        }
    
    # 生成建议
    report['recommendations'] = generate_optimization_recommendations(report)
    
    return report

def generate_optimization_recommendations(report):
    """
    生成优化建议
    """
    recommendations = []
    
    # CPA分析
    if report['summary']['cpa'] > 25:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'COST_OPTIMIZATION',
            'description': f"CPA过高(${report['summary']['cpa']:.2f})，建议优化关键词出价",
            'action': '降低低效关键词出价，提高高转化关键词出价'
        })
    
    # ROAS分析
    if report['summary']['roas'] < 2.5:
        recommendations.append({
            'priority': 'HIGH',
            'category': 'ROI_OPTIMIZATION',
            'description': f"ROAS低于目标({report['summary']['roas']:.2f})",
            'action': '暂停表现最差的20%关键词'
        })
    
    # CTR分析
    ctr = report['detailed_metrics'].get('CTR', {}).get('current', 0)
    if ctr < 0.02:
        recommendations.append({
            'priority': 'MEDIUM',
            'category': 'CTR_IMPROVEMENT',
            'description': f"CTR偏低({ctr:.2%})",
            'action': 'A/B测试新的广告创意'
        })
    
    return recommendations
```

## Examples

### Example 1: Google Ads搜索广告优化

**场景：** 电子产品Google Ads广告优化

**执行步骤：**

1. **关键词研究**
```python
product_info = {
    'product_name': 'Wireless Earbuds',
    'brand': 'AudioPro',
    'competitors': ['Sony', 'Bose', 'JBL']
}

seed_keywords = ['wireless earbuds', 'bluetooth headphones', 'wireless earphones']

research_result = keyword_research(
    product_info=product_info,
    target_market='US',
    seed_keywords=seed_keywords
)
```

2. **设计广告结构**
```python
target_keywords = research_result['high_value']

campaign_structure = design_campaign_structure(
    product_info=product_info,
    target_keywords=target_keywords,
    budget=3000  # 月预算$3000
)
```

3. **优化出价策略**
```python
bidding_strategy = optimize_bidding_strategy(
    campaign_performance=campaign_data,
    goals={'primary': 'maximize_revenue'}
)
```

### Example 2: Amazon Sponsored Products优化

**场景：** 亚马逊Sponsored Products广告优化

**执行步骤：**

1. **ASIN关键词研究**
```python
# 亚马逊特有关键词研究
amazon_keywords = amazon_keyword_research(
    asin='B08XXXXXXX',
    target_market='US'
)
```

2. **亚马逊广告结构**
```python
amazon_campaign = {
    'campaign_type': 'Sponsored Products',
    'targeting_type': 'Automatic',  # 或 'Manual'
    'daily_budget': 50,
    'start_date': datetime.now(),
    'end_date': datetime.now() + timedelta(days=30)
}
```

3. **亚马逊出价优化**
```python
amazon_bidding = {
    'strategy': 'Dynamic Bids - Down Only',
    'default_bid': 0.75,
    'adjustments': {
        'placement': {'top_of_search': '+50%'},
        'product': {'related': '+20%'}
    }
}
```

### Example 3: 多平台综合优化

**场景：** 同时优化Google Ads和Facebook Ads

**执行步骤：**

1. **平台策略对比**
```python
platform_strategies = {
    'google_ads': {
        'focus': 'High-intent search',
        'budget_allocation': 0.6,
        'objective': 'Sales'
    },
    'facebook_ads': {
        'focus': 'Brand awareness & retargeting',
        'budget_allocation': 0.4,
        'objective': 'Conversions'
    }
}
```

2. **跨平台归因分析**
```python
cross_platform_attribution = analyze_cross_platform_attribution(
    google_data=google_performance,
    facebook_data=facebook_performance,
    sales_data=sales_data
)
```

## Edge Cases

### Case 1: 季节性需求波动

**场景：** 产品有明显的季节性需求

**处理方案：**
```python
def handle_seasonal_demand(historical_data, current_period):
    """
    处理季节性需求
    """
    # 识别季节性模式
    seasonal_pattern = identify_seasonal_pattern(historical_data)
    
    # 调整预算
    budget_multiplier = seasonal_pattern.get(current_period, 1.0)
    
    # 调整出价
    bid_adjustment = {
        'increase_periods': seasonal_pattern.get('peak_months', []),
        'decrease_periods': seasonal_pattern.get('low_months', []),
        'adjustment_factor': 1.5
    }
    
    return {
        'budget_multiplier': budget_multiplier,
        'bid_adjustment': bid_adjustment
    }
```

### Case 2: 竞争加剧导致CPC飙升

**场景：** 竞争激烈导致CPC大幅上涨

**处理方案：**
```python
def handle_increased_competition(current_cpc, target_cpa, conversion_rate):
    """
    应对竞争加剧
    """
    # 计算最大可承受CPC
    max_affordable_cpc = target_cpa * conversion_rate
    
    if current_cpc > max_affordable_cpc:
        return {
            'situation': 'CRITICAL',
            'actions': [
                '降低出价至最大可承受水平',
                '增加长尾关键词',
                '提升广告质量得分',
                '考虑其他广告渠道'
            ],
            'max_affordable_cpc': max_affordable_cpc
        }
    else:
        return {
            'situation': 'MONITOR',
            'actions': ['持续监控CPC变化']
        }
```

### Case 3: 转化跟踪故障

**场景：** 转化数据不准确或丢失

**处理方案：**
```python
def handle_conversion_tracking_issues(performance_data):
    """
    处理转化跟踪问题
    """
    # 检查转化率异常
    expected_cvr = 0.03  # 预期转化率3%
    actual_cvr = performance_data['conversions'] / performance_data['clicks']
    
    if actual_cvr < expected_cvr * 0.5:
        return {
            'issue': 'POSSIBLE_TRACKING_PROBLEM',
            'evidence': {
                'expected_cvr': expected_cvr,
                'actual_cvr': actual_cvr,
                'drop_percentage': (1 - actual_cvr/expected_cvr) * 100
            },
            'actions': [
                '验证转化跟踪代码',
                '检查跨域追踪设置',
                '验证转化事件配置',
                '使用Google Analytics交叉验证'
            ]
        }
    return {'status': 'OK'}
```

## Quality Assurance Checklist

### 关键词质量检查
- [ ] 关键词相关性验证
- [ ] 搜索量数据准确
- [ ] 竞争度分析合理
- [ ] 否定关键词设置完整
- [ ] 关键词分组逻辑清晰

### 广告创意检查
- [ ] 标题描述符合政策
- [ ] 价值主张清晰
- [ ] CTA明确有效
- [ ] A/B测试设计合理
- [ ] 品牌一致性保持

### 出价策略检查
- [ ] 出价策略与目标匹配
- [ ] 预算分配合理
- [ ] 出价调整逻辑正确
- [ ] CPA/ROAS目标现实
- [ ] 竞价策略可执行

## KPI Indicators

### 核心指标
| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| ROAS | >3.0 | 收入/成本 |
| CPA | <目标值的120% | 成本/转化数 |
| CTR | >2% | 点击/展示 |
| CVR | >3% | 转化/点击 |
| 质量得分 | >7/10 | Google Ads质量得分 |

### 监控指标
| 指标名称 | 频率 | 用途 |
|---------|------|------|
| 实时CTR | 每小时 | 广告效果监控 |
| 转化率 | 每日 | 转化效果分析 |
| CPA趋势 | 每周 | 成本控制 |
| ROAS趋势 | 每周 | ROI监控 |
| 竞争度指数 | 每月 | 市场分析 |

## Success Criteria

### 定量标准
- ROAS达到3.0以上
- CPA控制在目标值的120%以内
- CTR超过2%
- CVR超过3%
- 质量得分高于7分

### 定性标准
- 广告策略与业务目标一致
- 关键词覆盖精准
- 广告创意吸引有效
- 出价策略合理高效
- 持续优化机制建立

## References

### 官方资源
1. **Google Ads**
   - Google Ads Help Center
   - Google Ads API Documentation

2. **Amazon Advertising**
   - Amazon Advertising Learning Console
   - Amazon Ads API

### 学习资源
1. **Google Skillshop**
   - Google Ads Certification
   - Google Analytics Certification

2. **Amazon Learning**
   - Amazon Sponsored Ads Certification

### 实用工具
1. **关键词工具**
   - Google Keyword Planner
   - SEMrush
   - Ahrefs

2. **广告管理**
   - Google Ads Editor
   - Amazon Advertising Console
   - Optmyzr

## Related Skills

- **content-marketing** - 内容营销（广告创意配合）
- **data-analytics** - 数据分析（广告数据分析）
- **competitor-intel** - 竞品情报（竞品广告分析）
- **price-optimization** - 定价优化（广告与定价配合）

---

**技能版本：** 1.0.0  
**最后更新：** 2025年  
**维护者：** Cross-Border E-Commerce Specialist