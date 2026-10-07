---
name: influencer-marketing
description: 海外红人营销与KOL合作技能，提供红人筛选、合作洽谈、内容创作和效果追踪的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
allowed-tools:
  - web_search
  - social_media_apis
  - data_analysis
  - excel
input_format:
  - product_info: dict (产品信息)
  - target_audience: dict (目标受众)
  - budget: float (营销预算)
  - goals: dict (营销目标)
output_format:
  - influencer_list: list (红人名单)
  - collaboration_plan: dict (合作方案)
  - content_guidelines: dict (内容指南)
  - tracking_setup: dict (追踪设置)
estimated_time: 3-5天
complexity: 中级
tags:
  - cross-border-commerce
  - influencer-marketing
  - social-media
  - kollaboration
---

# 海外红人营销与KOL合作 (Influencer Marketing)

## Overview

海外红人营销是跨境电商品牌出海的重要策略，通过与国际KOL（Key Opinion Leaders）合作，快速建立品牌认知，获取精准流量，提升转化率。本技能提供系统化的红人营销方法，帮助企业筛选合适的红人、策划有效的合作内容、追踪营销效果。

**核心价值：**
- 快速提升品牌海外认知度
- 获取高精准度的目标受众
- 提升产品可信度和转化率
- 建立长期的品牌合作关系

## Prerequisites

### 必备条件
1. **市场准备**
   - 明确的目标市场定位
   - 完善的品牌资料
   - 高质量的产品素材

2. **资源准备**
   - 红人营销预算
   - 产品样品库
   - 合作条款模板

3. **工具支持**
   - 红人搜索工具
   - 社交媒体监测工具
   - 追踪链接和UTM参数

### 建议配置
- 红人营销团队：1-2人
- 月度预算：根据规模设定
- 红人合作数量：5-20人/月

## Step-by-Step Instructions

### Step 1: 红人筛选与评估 (1-2天)

**目标：** 找到与品牌匹配的红人

**筛选标准：**

```python
from datetime import datetime, timedelta
from collections import defaultdict

def discover_influencers(product_info, target_audience, search_criteria):
    """
    发现和筛选红人
    
    Args:
        product_info: 产品信息
        target_audience: 目标受众
        search_criteria: 搜索条件
    
    Returns:
        dict: 红人候选名单
    """
    # 1. 关键词搜索
    influencer_candidates = search_by_keywords(search_criteria['keywords'])
    
    # 2. 平台搜索
    platform_candidates = search_by_platform(
        platforms=search_criteria['platforms'],
        niches=search_criteria['niches']
    )
    
    # 3. 合并去重
    all_candidates = merge_and_deduplicate(influencer_candidates, platform_candidates)
    
    # 4. 初步筛选
    filtered_candidates = initial_filter(
        all_candidates, 
        min_followers=search_criteria['min_followers'],
        max_followers=search_criteria['max_followers'],
        engagement_rate=search_criteria['min_engagement_rate']
    )
    
    # 5. 深度评估
    evaluated_candidates = evaluate_influencers(
        filtered_candidates,
        product_info,
        target_audience
    )
    
    return {
        'total_discovered': len(all_candidates),
        'after_filter': len(evaluated_candidates),
        'candidates': evaluated_candidates
    }

def search_by_keywords(keywords):
    """
    通过关键词搜索红人
    """
    # 模拟搜索结果
    candidates = []
    
    for keyword in keywords:
        # 实际应用中使用API搜索：
        # - Instagram Basic Display API
        # - YouTube Data API
        # - TikTok Creator Marketplace
        candidates.extend(mock_search_influencers(keyword))
    
    return candidates

def mock_search_influencers(keyword):
    """
    模拟红人搜索（实际应用中应使用真实API）
    """
    import random
    
    mock_influencers = []
    for i in range(20):
        mock_influencers.append({
            'influencer_id': f"INF_{keyword}_{i}",
            'name': f"Influencer {i}",
            'platform': random.choice(['Instagram', 'YouTube', 'TikTok']),
            'followers': random.randint(10000, 1000000),
            'engagement_rate': random.uniform(0.01, 0.10),
            'niche': keyword,
            'profile_url': f"https://example.com/{keyword}_{i}"
        })
    
    return mock_influencers

def evaluate_influencers(candidates, product_info, target_audience):
    """
    评估红人匹配度
    """
    evaluated = []
    
    for candidate in candidates:
        # 受众匹配度
        audience_match = calculate_audience_match(
            candidate,
            target_audience
        )
        
        # 品牌契合度
        brand_fit = calculate_brand_fit(
            candidate,
            product_info
        )
        
        # 合作潜力
        collaboration_potential = assess_collaboration_potential(
            candidate
        )
        
        # 综合评分
        overall_score = (
            audience_match * 0.4 +
            brand_fit * 0.3 +
            collaboration_potential * 0.3
        )
        
        evaluated.append({
            **candidate,
            'audience_match': round(audience_match * 100, 2),
            'brand_fit': round(brand_fit * 100, 2),
            'collaboration_potential': round(collaboration_potential * 100, 2),
            'overall_score': round(overall_score * 100, 2),
            'tier': determine_tier(overall_score)
        })
    
    # 按评分排序
    evaluated.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return evaluated

def calculate_audience_match(influencer, target_audience):
    """
    计算受众匹配度
    """
    # 简化版本：实际应使用API获取受众数据
    match_score = 0.7  # 基础匹配度
    
    # 受众年龄匹配
    if influencer.get('audience_age_range') == target_audience.get('age_range'):
        match_score += 0.1
    
    # 受众地理位置匹配
    if influencer.get('audience_location') == target_audience.get('location'):
        match_score += 0.1
    
    # 兴趣匹配
    influencer_interests = set(influencer.get('interests', []))
    target_interests = set(target_audience.get('interests', []))
    
    if influencer_interests & target_interests:
        match_score += 0.1
    
    return min(match_score, 1.0)

def calculate_brand_fit(influencer, product_info):
    """
    计算品牌契合度
    """
    fit_score = 0.6  # 基础契合度
    
    # 品牌价值观匹配
    if influencer.get('brand_affinity') == product_info.get('brand'):
        fit_score += 0.2
    
    # 历史合作内容质量
    if influencer.get('content_quality', 0) >= 4:  # 5分制
        fit_score += 0.1
    
    # 合作专业性
    if influencer.get('professionalism', 0) >= 4:
        fit_score += 0.1
    
    return min(fit_score, 1.0)

def assess_collaboration_potential(influencer):
    """
    评估合作潜力
    """
    potential_score = 0.7  # 基础潜力
    
    # 回复率
    if influencer.get('response_rate', 0) >= 0.8:
        potential_score += 0.1
    
    # 合作历史
    if influencer.get('collaboration_history', 0) >= 3:
        potential_score += 0.1
    
    # 价格合理性
    if influencer.get('price_reasonable', True):
        potential_score += 0.1
    
    return min(potential_score, 1.0)

def determine_tier(score):
    """
    确定红人等级
    """
    if score >= 85:
        return 'S-TIER'
    elif score >= 70:
        return 'A-TIER'
    elif score >= 55:
        return 'B-TIER'
    else:
        return 'C-TIER'
```

### Step 2: 合作洽谈与协议 (2-3天)

**目标：** 与红人达成合作意向

**洽谈流程：**

```python
def initiate_collaboration(influencer, product_info, collaboration_terms):
    """
    发起合作洽谈
    
    Args:
        influencer: 红人信息
        product_info: 产品信息
        collaboration_terms: 合作条款
    
    Returns:
        dict: 洽谈记录
    """
    # 1. 准备合作邀请
    outreach_message = craft_outreach_message(
        influencer,
        product_info,
        collaboration_terms
    )
    
    # 2. 发送邀请
    sent = send_outreach(
        influencer=influencer,
        message=outreach_message
    )
    
    # 3. 跟进安排
    follow_up_schedule = create_follow_up_schedule(
        sent_date=datetime.now()
    )
    
    return {
        'influencer_id': influencer['influencer_id'],
        'outreach_message': outreach_message,
        'sent_date': datetime.now().isoformat(),
        'follow_up_schedule': follow_up_schedule,
        'status': 'OUTREACH_SENT'
    }

def craft_outreach_message(influencer, product_info, terms):
    """
    撰写合作邀请消息
    """
    message_template = f"""
Hi {influencer.get('name', 'there')},

I'm {product_info.get('contact_person')} from {product_info.get('brand')}, and I've been following your content on {influencer.get('platform')}. 

I love your recent posts about {influencer.get('niche')} - your content really resonates with our target audience!

We'd love to collaborate with you on promoting our {product_info.get('product_name')}. 

Here's what we're offering:
- Free product worth ${terms.get('product_value')}
- Compensation: ${terms.get('payment')}
- Flexible content creation timeline
- Exclusive discount code for your followers

Our brand aligns perfectly with your content style, and we believe this partnership would be mutually beneficial.

Would you be interested in learning more? Let's schedule a quick call to discuss details.

Best regards,
{product_info.get('contact_person')}
{product_info.get('company_name')}
"""
    
    return message_template.strip()

def negotiate_terms(influencer, initial_terms, influencer_response):
    """
    协商合作条款
    """
    negotiation = {
        'influencer_id': influencer['influencer_id'],
        'initial_terms': initial_terms,
        'counter_offer': influencer_response.get('counter_offer'),
        'negotiation_rounds': 0,
        'final_terms': None
    }
    
    # 分析对方还价
    counter_offer = influencer_response.get('counter_offer', {})
    
    # 判断是否可接受
    acceptable = evaluate_offer_acceptability(
        initial_terms,
        counter_offer,
        budget_limit=initial_terms.get('max_budget')
    )
    
    if acceptable:
        negotiation['final_terms'] = counter_offer
        negotiation['status'] = 'ACCEPTED'
    else:
        # 还价
        negotiation['counter_offer'] = make_counter_offer(
            initial_terms,
            counter_offer
        )
        negotiation['status'] = 'NEGOTIATING'
    
    negotiation['negotiation_rounds'] += 1
    
    return negotiation

def create_agreement(influencer, terms, content_requirements):
    """
    创建合作协议
    """
    agreement = {
        'agreement_id': f"AGR_{datetime.now().strftime('%Y%m%d')}_{influencer['influencer_id']}",
        'parties': {
            'brand': terms.get('brand_name'),
            'influencer': influencer.get('name')
        },
        'collaboration_details': {
            'campaign_name': terms.get('campaign_name'),
            'campaign_period': terms.get('campaign_period'),
            'product_provided': terms.get('product_details'),
            'compensation': {
                'payment': terms.get('payment'),
                'payment_schedule': terms.get('payment_schedule'),
                'payment_method': terms.get('payment_method')
            }
        },
        'content_requirements': content_requirements,
        'deliverables': {
            'number_of_posts': content_requirements.get('post_count', 1),
            'post_types': content_requirements.get('post_types', ['post', 'story']),
            'hashtags': content_requirements.get('hashtags', []),
            'mentions': content_requirements.get('mentions', [])
        },
        'performance_metrics': terms.get('performance_metrics', {}),
        'rights_and_usage': terms.get('rights_and_usage', {}),
        'timeline': terms.get('timeline', {}),
        'created_date': datetime.now().isoformat(),
        'status': 'DRAFT'
    }
    
    return agreement
```

### Step 3: 内容创作指导 (2-3天)

**目标：** 协助红人创作高质量内容

**内容指导流程：**

```python
def provide_content_guidelines(product_info, campaign_objectives, brand_guidelines):
    """
    提供内容创作指南
    
    Args:
        product_info: 产品信息
        campaign_objectives: 活动目标
        brand_guidelines: 品牌指南
    
    Returns:
        dict: 内容指南
    """
    guidelines = {
        'brand_voice': brand_guidelines.get('voice', 'Professional yet approachable'),
        'key_messages': generate_key_messages(product_info, campaign_objectives),
        'content_themes': suggest_content_themes(product_info, campaign_objectives),
        'visual_guidelines': {
            'brand_colors': brand_guidelines.get('colors', []),
            'logo_usage': brand_guidelines.get('logo_usage', 'Clear and visible'),
            'product_shots': brand_guidelines.get('product_shots', 'High quality, well-lit')
        },
        'content_formats': recommend_content_formats(product_info),
        'do_and_dont': create_do_and_dont_list(brand_guidelines),
        'hashtag_strategy': develop_hashtag_strategy(product_info, campaign_objectives),
        'cta_guidelines': generate_cta_guidelines(campaign_objectives)
    }
    
    return guidelines

def generate_key_messages(product_info, objectives):
    """
    生成核心信息
    """
    key_messages = []
    
    # 产品价值主张
    key_messages.append({
        'message': f"{product_info['product_name']} helps you {product_info.get('benefit', 'achieve your goals')}",
        'priority': 'HIGH',
        'type': 'VALUE_PROPOSITION'
    })
    
    # 差异化优势
    for advantage in product_info.get('unique_selling_points', []):
        key_messages.append({
            'message': f"Unlike others, {product_info['product_name']} {advantage}",
            'priority': 'MEDIUM',
            'type': 'DIFFERENTIATION'
        })
    
    # 用户证明
    if product_info.get('testimonials'):
        key_messages.append({
            'message': f"Join {product_info.get('customer_count', 'thousands')} of satisfied customers",
            'priority': 'MEDIUM',
            'type': 'SOCIAL_PROOF'
        })
    
    return key_messages

def suggest_content_themes(product_info, objectives):
    """
    建议内容主题
    """
    themes = []
    
    # 使用场景主题
    themes.append({
        'theme': 'Product in Action',
        'description': 'Show how the product is used in daily life',
        'examples': [
            'Morning routine with the product',
            'Using the product for work/school',
            'Evening relaxation with the product'
        ]
    })
    
    # 评测主题
    if objectives.get('include_reviews', True):
        themes.append({
            'theme': 'Honest Review',
            'description': 'Share genuine experience with the product',
            'examples': [
                'First impressions',
                'After using for 1 week',
                'Pros and cons'
            ]
        })
    
    # 比较主题
    if objectives.get('allow_comparisons', False):
        themes.append({
            'theme': 'Product Comparison',
            'description': 'Compare with similar products',
            'examples': [
                'Brand X vs Brand Y',
                'Price vs Quality comparison',
                'Feature showdown'
            ]
        })
    
    return themes

def recommend_content_formats(product_info):
    """
    推荐内容格式
    """
    formats = []
    
    # Instagram
    formats.append({
        'platform': 'Instagram',
        'types': [
            {'type': 'Feed Post', 'description': 'High-quality image with caption', 'optimal_time': 'Evening'},
            {'type': 'Instagram Reel', 'description': 'Short video showcasing product', 'optimal_time': 'Weekend'},
            {'type': 'Instagram Story', 'description': 'Behind-the-scenes content', 'optimal_time': 'Afternoon'}
        ]
    })
    
    # YouTube
    formats.append({
        'platform': 'YouTube',
        'types': [
            {'type': 'Review Video', 'description': 'In-depth product review', 'duration': '5-10 min'},
            {'type': 'Unboxing', 'description': 'Product unboxing experience', 'duration': '3-5 min'},
            {'type': 'Tutorial', 'description': 'How-to video', 'duration': '5-15 min'}
        ]
    })
    
    # TikTok
    formats.append({
        'platform': 'TikTok',
        'types': [
            {'type': 'Short Tutorial', 'description': 'Quick how-to', 'duration': '15-60 sec'},
            {'type': 'Before/After', 'description': 'Transformation content', 'duration': '30-60 sec'},
            {'type': 'Trend Integration', 'description': 'Product in trending format', 'duration': '15-45 sec'}
        ]
    })
    
    return formats

def create_do_and_dont_list(brand_guidelines):
    """
    创建注意事项列表
    """
    return {
        'do': [
            'Show the product in real-life situations',
            'Include personal genuine experience',
            'Use natural, authentic language',
            'Engage with followers in comments',
            'Post during peak engagement times',
            'Include clear call-to-action'
        ],
        'dont': [
            'Make unrealistic promises',
            'Use overly promotional language',
            'Ignore negative comments',
            'Post poor quality content',
            'Violate platform guidelines',
            'Misrepresent product features'
        ]
    }
```

### Step 4: 发布与推广 (持续)

**目标：** 协助红人发布并推广内容

**发布管理：**

```python
def manage_content_publishing(influencer, content_plan):
    """
    管理内容发布
    """
    publishing_schedule = []
    
    for content in content_plan:
        # 确定最佳发布时间
        optimal_time = find_optimal_posting_time(
            influencer['platform'],
            influencer['audience_timezone']
        )
        
        # 创建发布任务
        task = {
            'content_id': content['content_id'],
            'platform': influencer['platform'],
            'scheduled_time': optimal_time,
            'status': 'SCHEDULED',
            'content_url': None,
            'promoted': False
        }
        
        publishing_schedule.append(task)
    
    return {
        'influencer_id': influencer['influencer_id'],
        'schedule': publishing_schedule,
        'total_content': len(publishing_schedule),
        'estimated_reach': estimate_total_reach(influencer, len(publishing_schedule))
    }

def amplify_content(content, amplification_strategy):
    """
    放大内容效果
    """
    amplification_actions = []
    
    # 品牌账号互动
    amplification_actions.append({
        'action': 'BRAND_ENGAGEMENT',
        'description': 'Brand account likes, comments, and shares',
        'timing': 'Within 1 hour of posting'
    })
    
    # 粉丝互动激励
    if amplification_strategy.get('encourage_comments'):
        amplification_actions.append({
            'action': 'COMMENT_PROMPT',
            'description': 'Ask engaging questions in comments',
            'timing': 'Ongoing for 24-48 hours'
        })
    
    # 跨平台分享
    amplification_actions.append({
        'action': 'CROSS_PLATFORM',
        'description': 'Share on brand\'s other social accounts',
        'timing': 'Within 24 hours'
    })
    
    # 付费推广
    if amplification_strategy.get('boost_with_ads'):
        amplification_actions.append({
            'action': 'PAID_PROMOTION',
            'description': 'Boost post with targeted ads',
            'budget': amplification_strategy.get('ad_budget'),
            'duration': '3-7 days'
        })
    
    return {
        'content_id': content['content_id'],
        'amplification_actions': amplification_actions,
        'total_actions': len(amplification_actions)
    }
```

### Step 5: 效果追踪与分析 (持续)

**目标：** 追踪营销效果，分析ROI

**效果分析：**

```python
def track_campaign_performance(campaign_id, tracking_config):
    """
    追踪活动效果
    """
    performance_data = {
        'campaign_id': campaign_id,
        'tracking_period': tracking_config.get('period'),
        'metrics': {},
        'influencer_performance': {}
    }
    
    # 收集各平台数据
    for platform in tracking_config['platforms']:
        platform_metrics = collect_platform_metrics(
            platform,
            campaign_id,
            tracking_config['start_date'],
            tracking_config['end_date']
        )
        performance_data['metrics'][platform] = platform_metrics
    
    # 收集红人级别的数据
    for influencer_id in tracking_config['influencers']:
        influencer_metrics = collect_influencer_metrics(
            influencer_id,
            campaign_id
        )
        performance_data['influencer_performance'][influencer_id] = influencer_metrics
    
    # 汇总指标
    performance_data['summary'] = calculate_campaign_summary(performance_data)
    
    return performance_data

def calculate_roi(campaign_performance, campaign_cost):
    """
    计算ROI
    """
    # 总收入
    total_revenue = campaign_performance['summary']['total_revenue']
    
    # 总成本
    total_cost = campaign_cost
    
    # ROI
    roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
    
    # ROAS
    roas = total_revenue / total_cost if total_cost > 0 else 0
    
    return {
        'total_revenue': total_revenue,
        'total_cost': total_cost,
        'profit': total_revenue - total_cost,
        'roi_percentage': round(roi, 2),
        'roas': round(roas, 2),
        'break_even_revenue': total_cost
    }

def generate_performance_report(campaign_performance):
    """
    生成效果报告
    """
    report = {
        'report_date': datetime.now().isoformat(),
        'campaign_summary': campaign_performance['summary'],
        'top_performing_influencers': identify_top_performers(campaign_performance),
        'content_insights': analyze_content_performance(campaign_performance),
        'recommendations': generate_optimization_recommendations(campaign_performance)
    }
    
    return report
```

## Examples

### Example 1: Instagram美妆红人合作

**场景：** 美妆品牌与Instagram美妆博主合作

**执行步骤：**

1. **红人筛选**
```python
product_info = {
    'product_name': 'Natural Glow Foundation',
    'brand': 'GlowBeauty',
    'niche': 'Beauty',
    'target_audience': 'Women 18-35, US'
}

search_criteria = {
    'keywords': ['makeup', 'beauty', 'foundation', 'skincare'],
    'platforms': ['Instagram'],
    'niches': ['Beauty', 'Makeup'],
    'min_followers': 10000,
    'max_followers': 500000,
    'min_engagement_rate': 0.03
}

influencers = discover_influencers(product_info, target_audience, search_criteria)
```

2. **合作洽谈**
```python
collaboration_terms = {
    'product_value': 50,
    'payment': 300,
    'campaign_name': 'GlowBeauty Foundation Launch',
    'campaign_period': '30 days'
}

# 联系Top 10红人
top_influencers = influencers['candidates'][:10]
for influencer in top_influencers:
    collaboration = initiate_collaboration(influencer, product_info, collaboration_terms)
```

### Example 2: YouTube科技博主评测

**场景：** 电子产品与YouTube科技博主合作

**执行步骤：**

1. **内容规划**
```python
content_requirements = {
    'post_count': 1,
    'post_types': ['video'],
    'video_duration': '5-10 minutes',
    'content_type': 'Review',
    'key_points': [
        'Product unboxing',
        'Feature demonstration',
        'Performance test',
        'Comparison with competitors',
        'Final verdict'
    ]
}
```

2. **追踪设置**
```python
tracking_config = {
    'tracking_links': generate_unique_links(influencer_id),
    'promo_codes': {
        'influencer_code': f"GLOW{influencer_id.upper()}",
        'discount': 15,
        'duration': '30 days'
    },
    'conversion_events': ['purchase', 'add_to_cart']
}
```

### Example 3: TikTok达人短视频推广

**场景：** 时尚品牌与TikTok达人合作

**执行步骤：**

1. **病毒式内容策划**
```python
viral_content_strategy = {
    'format': 'Short video (15-30 seconds)',
    'trend': 'Outfit transition',
    'music': 'Popular trending song',
    'hashtag': '#FashionTransformation',
    'call_to_action': 'Link in bio for 20% off'
}
```

## Edge Cases

### Case 1: 红人突然取消合作

**场景：** 红人在合作前突然取消

**处理方案：**
```python
def handle_cancellation(influencer_id, reason):
    """
    处理红人取消
    """
    return {
        'immediate_actions': [
            'Review cancellation terms',
            'Check if compensation is owed',
            'Find replacement influencer'
        ],
        'communication': [
            'Send professional response',
            'Maintain relationship for future',
            'Request feedback if appropriate'
        ],
        'backup_plan': 'Activate backup influencer list'
    }
```

### Case 2: 内容不符合预期

**场景：** 发布的内容质量不符合要求

**处理方案：**
```python
def handle_unsatisfactory_content(content_id, issues):
    """
    处理不满意内容
    """
    if issues['severity'] == 'MINOR':
        return {
            'action': 'REQUEST_EDIT',
            'timeline': '3 days',
            'specific_changes': issues['required_changes']
        }
    elif issues['severity'] == 'MAJOR':
        return {
            'action': 'REQUEST_REPOST',
            'timeline': '7 days',
            'compensation_adjustment': 'Partial refund'
        }
    else:
        return {
            'action': 'TERMINATE_PARTNERSHIP',
            'compensation': 'Full refund',
            'legal_review': 'If applicable'
        }
```

## KPI Indicators

### 核心指标
| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| ROI | >200% | (收入-成本)/成本 × 100% |
| ROAS | >2.0 | 收入/成本 |
| 粉丝转化率 | >5% | 新增粉丝/红人粉丝数 |
| 互动率 | >3% | (点赞+评论+分享)/展示 |
| CTR | >1% | 点击/展示 |

## Success Criteria

### 定量标准
- ROI达到200%以上
- ROAS超过2.0
- 粉丝转化率超过5%
- 内容互动率高于3%
- 获得至少10个高质量红人合作

### 定性标准
- 品牌认知度显著提升
- 获得用户正面反馈
- 建立长期红人合作关系
- 内容符合品牌调性
- 红人满意度高

## References

### 官方资源
1. **Creator Platforms**
   - Instagram Creator Studio
   - YouTube Studio
   - TikTok Creator Marketplace

2. **Influencer Marketing Tools**
   - AspireIQ
   - Creator.co
   - Upfluence

### 学习资源
1. **Influencer Marketing Hub**
   - Industry benchmarks
   - Best practices
   - Case studies

## Related Skills

- **content-marketing** - 内容营销
- **social-media-ops** - 社交媒体运营
- **brand-positioning** - 品牌定位
- **affiliate-management** - 联盟营销

---

**技能版本：** 1.0.0  
**最后更新：** 2025年  
**维护者：** Cross-Border E-Commerce Specialist