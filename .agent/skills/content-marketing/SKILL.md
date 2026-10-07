---
name: content-marketing
description: 本地化内容营销技能，提供内容规划、创作、发布和效果分析的完整方案
version: 1.0.0
author: Cross-Border E-Commerce Specialist
compatibility:
  - claude
  - gpt-4
  - qwen
tags:
  - cross-border-commerce
  - content-marketing
  - localization
  - seo
---

# 本地化内容营销 (Content Marketing)

## Overview

本地化内容营销是跨境电商建立品牌权威、获取自然流量的重要策略。本技能提供系统化的内容营销方法，帮助企业在海外市场创作高质量、本地化的内容。

## Step-by-Step Instructions

### Step 1: 内容规划
制定内容日历，确定内容主题和发布频率。

**内容规划代码：**
```python
from datetime import datetime, timedelta
from collections import defaultdict

def plan_content_strategy(target_market, product_categories, business_goals):
    """
    规划内容策略
    
    Args:
        target_market: 目标市场
        product_categories: 产品品类
        business_goals: 业务目标
    
    Returns:
        dict: 内容策略计划
    """
    # 内容主题库
    content_themes = generate_content_themes(product_categories)
    
    # 内容日历
    content_calendar = create_content_calendar(content_themes, 30)
    
    # 发布频率规划
    publishing_schedule = plan_publishing_frequency(target_market)
    
    # 内容类型组合
    content_mix = calculate_content_mix(business_goals)
    
    return {
        'content_themes': content_themes,
        'content_calendar': content_calendar,
        'publishing_schedule': publishing_schedule,
        'content_mix': content_mix,
        'monthly_output': calculate_monthly_output(content_mix)
    }

def generate_content_themes(product_categories):
    """
    生成内容主题库
    """
    theme_templates = {
        'educational': [
            '使用教程', '技巧分享', '常见问题解答', '专业知识科普',
            '产品原理', '选择指南', '保养知识'
        ],
        'promotional': [
            '新品发布', '促销活动', '限时优惠', '用户福利',
            '新品评测', '产品对比', '热销推荐'
        ],
        'brand_story': [
            '品牌故事', '团队介绍', '客户案例', '用户评价',
            '幕后花絮', '企业文化', '社会责任'
        ],
        'lifestyle': [
            '使用场景', '生活方式', '搭配推荐', '潮流趋势',
            '节日特辑', '季节推荐', '兴趣相关'
        ]
    }
    
    themes = {}
    for category in product_categories:
        category_themes = {}
        for content_type, templates in theme_templates.items():
            category_themes[content_type] = [
                f"{template} - {category}" for template in templates[:3]
            ]
        themes[category] = category_themes
    
    return themes

def create_content_calendar(themes, days):
    """
    创建内容日历
    """
    calendar = []
    
    for day in range(1, days + 1):
        date = datetime.now() + timedelta(days=day)
        
        # 每周内容类型分布
        week_day = date.weekday()
        
        if week_day in [0, 1, 2]:  # 周一到周三
            content_type = 'educational'
        elif week_day == 3:  # 周四
            content_type = 'promotional'
        else:  # 周五到周日
            content_type = 'lifestyle'
        
        calendar.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%A'),
            'content_type': content_type,
            'suggested_theme': themes[list(themes.keys())[0]][content_type][day % 3],
            'platform': get_best_platform(date)
        })
    
    return calendar

def get_best_platform(date):
    """
    获取最佳发布平台
    """
    weekday = date.weekday()
    
    platform_schedule = {
        'blog': [1, 3, 5],      # 周二、四、六
        'social': [0, 2, 4, 6],  # 其他日期
        'email': [1, 4]         # 周二、五
    }
    
    for platform, days in platform_schedule.items():
        if weekday in days:
            return platform
    
    return 'social'

def calculate_content_mix(goals):
    """
    计算内容类型配比
    """
    # 基于目标调整配比
    base_mix = {
        'educational': 0.40,
        'promotional': 0.25,
        'brand_story': 0.15,
        'lifestyle': 0.20
    }
    
    if goals.get('primary_goal') == 'conversion':
        base_mix['promotional'] += 0.15
        base_mix['educational'] -= 0.10
        base_mix['lifestyle'] -= 0.05
    elif goals.get('primary_goal') == 'awareness':
        base_mix['lifestyle'] += 0.15
        base_mix['brand_story'] += 0.10
        base_mix['promotional'] -= 0.15
        base_mix['educational'] -= 0.10
    
    # 归一化
    total = sum(base_mix.values())
    base_mix = {k: round(v/total, 2) for k, v in base_mix.items()}
    
    return base_mix

def calculate_monthly_output(content_mix):
    """
    计算月输出量
    """
    total_posts = 12  # 每月12篇
    
    output = {}
    for content_type, ratio in content_mix.items():
        output[content_type] = int(total_posts * ratio)
    
    return output
```

### Step 2: 本地化创作
适配目标市场的语言、文化和消费习惯。

**本地化创作代码：**
```python
class ContentLocalizer:
    """
    内容本地化工具
    """
    
    def __init__(self, target_market):
        self.target_market = target_market
        self.localization_rules = self.load_localization_rules()
    
    def load_localization_rules(self):
        """
        加载本地化规则
        """
        rules = {
            'US': {
                'language': 'en-US',
                'tone': 'casual_confident',
                'cultural_refs': ['American holidays', 'US celebrities', 'US trends'],
                'format': 'direct',
                'cta_style': 'Shop Now'
            },
            'UK': {
                'language': 'en-GB',
                'tone': 'polite_professional',
                'cultural_refs': ['British holidays', 'UK culture'],
                'format': 'elegant',
                'cta_style': 'Buy Now'
            },
            'DE': {
                'language': 'de-DE',
                'tone': 'direct_detailed',
                'cultural_refs': ['German holidays', 'European values'],
                'format': 'technical',
                'cta_style': 'Jetzt kaufen'
            },
            'JP': {
                'language': 'ja-JP',
                'tone': 'humble_detailed',
                'cultural_refs': ['Japanese seasons', 'Japanese aesthetics'],
                'format': 'polite',
                'cta_style': '今すぐ購入'
            }
        }
        
        return rules.get(self.target_market, rules['US'])
    
    def localize_content(self, original_content):
        """
        本地化内容
        """
        localized = {
            'language': self.localization_rules['language'],
            'tone': self.localization_rules['tone'],
            'headline': self.localize_headline(original_content['headline']),
            'body': self.localize_body(original_content['body']),
            'cta': self.localize_cta(original_content.get('cta', 'Learn More')),
            'cultural_adaptations': self.apply_cultural_adaptations(original_content)
        }
        
        return localized
    
    def localize_headline(self, headline):
        """
        本地化标题
        """
        # 翻译并适配
        translations = {
            'US': headline,
            'UK': headline.replace('Shop', 'Buy').replace('amazing', 'brilliant'),
            'DE': headline.replace('Shop', 'Entdecken'),
            'JP': f"✨ {headline} ✨"
        }
        
        return translations.get(self.target_market, headline)
    
    def localize_body(self, body):
        """
        本地化正文
        """
        # 调整长度和风格
        length_adjustments = {
            'US': 1.0,
            'UK': 1.1,
            'DE': 1.2,
            'JP': 0.8
        }
        
        multiplier = length_adjustments.get(self.target_market, 1.0)
        
        # 根据风格调整
        if self.localization_rules['tone'] == 'humble_detailed':
            body = self.add_humble_phrases(body)
        elif self.localization_rules['tone'] == 'direct_detailed':
            body = self.add_detailed_info(body)
        
        return body
    
    def localize_cta(self, cta):
        """
        本地化行动号召
        """
        cta_translations = {
            'US': 'Shop Now',
            'UK': 'Buy Now',
            'DE': 'Jetzt kaufen',
            'JP': '今すぐ購入',
            'FR': 'Acheter maintenant',
            'ES': 'Comprar ahora'
        }
        
        return cta_translations.get(self.target_market, cta)
    
    def apply_cultural_adaptations(self, content):
        """
        应用文化适配
        """
        adaptations = []
        
        # 图片偏好
        adaptations.append({
            'aspect': 'imagery',
            'change': '使用本地模特和场景' if self.target_market in ['US', 'UK'] else '使用目标市场审美'
        })
        
        # 颜色适配
        color_adaptations = {
            'US': '明亮鲜艳',
            'EU': '柔和经典',
            'JP': '清新简洁'
        }
        adaptations.append({
            'aspect': 'color_scheme',
            'change': color_adaptations.get(self.target_market, '标准')
        })
        
        return adaptations
```

### Step 3: SEO优化
优化关键词、元数据，提升搜索引擎排名。

**SEO优化代码：**
```python
class ContentSEO:
    """
    内容SEO优化工具
    """
    
    def __init__(self):
        self.keyword_research = {}
        self.seo_rules = self.load_seo_rules()
    
    def load_seo_rules(self):
        """
        加载SEO规则
        """
        return {
            'title_length': (30, 60),
            'description_length': (150, 160),
            'heading_structure': ['h1', 'h2', 'h3'],
            'keyword_density': (0.5, 2.5),
            'internal_links': (2, 5),
            'external_links': (1, 3),
            'word_count': (300, 2500)
        }
    
    def optimize_content(self, content, target_keywords):
        """
        优化内容SEO
        
        Args:
            content: 原始内容
            target_keywords: 目标关键词
        
        Returns:
            dict: 优化后的内容和SEO评分
        """
        optimized = content.copy()
        
        # 标题优化
        optimized['title'] = self.optimize_title(
            content.get('title', ''), 
            target_keywords
        )
        
        # 元描述优化
        optimized['meta_description'] = self.optimize_description(
            content.get('body', ''),
            target_keywords
        )
        
        # 正文优化
        optimized['body'] = self.optimize_body(
            content.get('body', ''),
            target_keywords
        )
        
        # 结构化数据
        optimized['structured_data'] = self.generate_structured_data(
            content, target_keywords
        )
        
        # SEO评分
        seo_score = self.calculate_seo_score(optimized, target_keywords)
        
        return {
            'optimized_content': optimized,
            'seo_score': seo_score,
            'recommendations': self.generate_seo_recommendations(seo_score)
        }
    
    def optimize_title(self, title, keywords):
        """
        优化标题
        """
        # 包含主关键词
        primary_keyword = keywords[0] if keywords else ''
        
        if primary_keyword and primary_keyword.lower() not in title.lower():
            title = f"{primary_keyword}: {title}"
        
        # 长度检查
        title_length = len(title)
        if title_length < self.seo_rules['title_length'][0]:
            title = f"{title} - 完整指南"
        elif title_length > self.seo_rules['title_length'][1]:
            title = title[:self.seo_rules['title_length'][1]]
        
        return title
    
    def optimize_description(self, body, keywords):
        """
        优化元描述
        """
        # 从正文提取
        description = body[:200]
        
        # 包含关键词
        for keyword in keywords[:2]:
            if keyword.lower() not in description.lower():
                description = f"{keyword} - {description}"
        
        # 长度限制
        if len(description) > self.seo_rules['description_length'][1]:
            description = description[:self.seo_rules['description_length'][1]] + '...'
        
        return description
    
    def optimize_body(self, body, keywords):
        """
        优化正文
        """
        optimized_body = body
        
        # 关键词密度检查
        word_count = len(body.split())
        
        for keyword in keywords:
            keyword_count = body.lower().count(keyword.lower())
            density = (keyword_count / word_count * 100) if word_count > 0 else 0
            
            if density < self.seo_rules['keyword_density'][0]:
                # 关键词不足，添加
                optimized_body = self.add_keyword_usage(optimized_body, keyword)
            elif density > self.seo_rules['keyword_density'][1]:
                # 关键词过多，稀释
                optimized_body = self.reduce_keyword_usage(optimized_body, keyword)
        
        return optimized_body
    
    def calculate_seo_score(self, content, keywords):
        """
        计算SEO评分
        """
        score = 0
        max_score = 100
        
        # 标题评分
        title = content.get('title', '')
        if any(k.lower() in title.lower() for k in keywords):
            score += 15
        if self.seo_rules['title_length'][0] <= len(title) <= self.seo_rules['title_length'][1]:
            score += 10
        
        # 描述评分
        meta_desc = content.get('meta_description', '')
        if any(k.lower() in meta_desc.lower() for k in keywords):
            score += 10
        if self.seo_rules['description_length'][0] <= len(meta_desc) <= self.seo_rules['description_length'][1]:
            score += 10
        
        # 内容评分
        word_count = len(content.get('body', '').split())
        if self.seo_rules['word_count'][0] <= word_count <= self.seo_rules['word_count'][1]:
            score += 20
        
        # 关键词密度
        for keyword in keywords[:2]:
            density = content.get('body', '').lower().count(keyword.lower()) / max(word_count, 1) * 100
            if self.seo_rules['keyword_density'][0] <= density <= self.seo_rules['keyword_density'][1]:
                score += 15
        
        # 结构化数据
        if content.get('structured_data'):
            score += 20
        
        return {
            'total_score': score,
            'grade': 'A' if score >= 80 else 'B' if score >= 60 else 'C',
            'breakdown': {
                'title': min(25, score),
                'description': min(20, score - 25) if score > 25 else 0,
                'content': min(30, max(0, score - 45)) if score > 45 else 0,
                'structure': min(25, max(0, score - 75)) if score > 75 else 0
            }
        }
```

### Step 4: 多渠道发布
在博客、社交媒体、内容平台同步发布。

**多渠道发布代码：**
```python
class MultiChannelPublisher:
    """
    多渠道发布管理器
    """
    
    def __init__(self):
        self.channels = self.initialize_channels()
        self.publishing_queue = []
    
    def initialize_channels(self):
        """
        初始化渠道配置
        """
        return {
            'blog': {
                'platform': 'WordPress',
                'format': 'article',
                'optimal_length': (800, 2000),
                'schedule': {'day': [1, 3, 5], 'time': '10:00'}
            },
            'social': {
                'Instagram': {
                    'format': 'image_carousel',
                    'optimal_length': (100, 300),
                    'schedule': {'day': [0, 2, 4, 6], 'time': '18:00'}
                },
                'Facebook': {
                    'format': 'post_video',
                    'optimal_length': (200, 500),
                    'schedule': {'day': [1, 3, 5], 'time': '12:00'}
                },
                'TikTok': {
                    'format': 'video',
                    'optimal_length': (30, 90),
                    'schedule': {'day': [1, 3, 5], 'time': '20:00'}
                }
            },
            'email': {
                'platform': 'Mailchimp',
                'format': 'newsletter',
                'optimal_length': (300, 800),
                'schedule': {'day': [2, 5], 'time': '09:00'}
            }
        }
    
    def prepare_for_channel(self, content, channel):
        """
        为特定渠道准备内容
        """
        channel_config = self.channels.get(channel, {})
        
        adapted_content = {
            'title': self.adapt_title(content['title'], channel),
            'body': self.adapt_body(content['body'], channel),
            'media': self.select_media(content, channel),
            'metadata': self.generate_metadata(content, channel)
        }
        
        return adapted_content
    
    def schedule_publishing(self, content, channels, publish_dates):
        """
        安排发布计划
        """
        schedule = []
        
        for channel in channels:
            for date in publish_dates:
                scheduled_item = {
                    'content': self.prepare_for_channel(content, channel),
                    'channel': channel,
                    'scheduled_time': date.strftime('%Y-%m-%d %H:%M'),
                    'status': 'scheduled'
                }
                schedule.append(scheduled_item)
                self.publishing_queue.append(scheduled_item)
        
        return schedule
    
    def publish_content(self, scheduled_item):
        """
        发布内容
        """
        channel = scheduled_item['channel']
        
        # 模拟发布API调用
        publish_result = {
            'status': 'published',
            'channel': channel,
            'content_id': f"{channel}_{datetime.now().strftime('%Y%m%d%H%M')}",
            'published_at': datetime.now().isoformat()
        }
        
        return publish_result
```

### Step 5: 效果分析
追踪内容表现，优化内容策略。

**效果分析代码：**
```python
def analyze_content_performance(content_data, metrics_data):
    """
    分析内容效果
    
    Args:
        content_data: 内容数据
        metrics_data: 指标数据
    
    Returns:
        dict: 效果分析报告
    """
    # 基础指标
    basic_metrics = calculate_basic_metrics(metrics_data)
    
    # 内容类型效果
    content_type_performance = analyze_by_content_type(content_data, metrics_data)
    
    # 渠道效果
    channel_performance = analyze_by_channel(content_data, metrics_data)
    
    # SEO效果
    seo_performance = analyze_seo_performance(content_data, metrics_data)
    
    # ROI分析
    roi_analysis = calculate_content_roi(content_data, metrics_data)
    
    # 优化建议
    recommendations = generate_optimization_recommendations(
        basic_metrics, content_type_performance, channel_performance
    )
    
    return {
        'basic_metrics': basic_metrics,
        'content_type_performance': content_type_performance,
        'channel_performance': channel_performance,
        'seo_performance': seo_performance,
        'roi_analysis': roi_analysis,
        'recommendations': recommendations
    }

def calculate_basic_metrics(metrics_data):
    """
    计算基础指标
    """
    return {
        'total_views': sum(m.get('views', 0) for m in metrics_data),
        'total_engagement': sum(m.get('likes', 0) + m.get('comments', 0) + m.get('shares', 0) for m in metrics_data),
        'total_conversions': sum(m.get('conversions', 0) for m in metrics_data),
        'avg_engagement_rate': round(
            sum(m.get('engagement_rate', 0) for m in metrics_data) / len(metrics_data), 2
        ) if metrics_data else 0,
        'avg_conversion_rate': round(
            sum(m.get('conversion_rate', 0) for m in metrics_data) / len(metrics_data), 2
        ) if metrics_data else 0
    }

def analyze_by_content_type(content_data, metrics_data):
    """
    按内容类型分析
    """
    type_metrics = {}
    
    for content, metrics in zip(content_data, metrics_data):
        content_type = content.get('type', 'unknown')
        
        if content_type not in type_metrics:
            type_metrics[content_type] = {'views': 0, 'conversions': 0, 'count': 0}
        
        type_metrics[content_type]['views'] += metrics.get('views', 0)
        type_metrics[content_type]['conversions'] += metrics.get('conversions', 0)
        type_metrics[content_type]['count'] += 1
    
    # 计算各类型效果
    for content_type, data in type_metrics.items():
        data['avg_views'] = round(data['views'] / data['count'], 0)
        data['avg_conversions'] = round(data['conversions'] / data['count'], 2)
        data['conversion_rate'] = round(
            data['conversions'] / data['views'] * 100, 2
        ) if data['views'] > 0 else 0
    
    return type_metrics

def calculate_content_roi(content_data, metrics_data):
    """
    计算内容ROI
    """
    total_cost = sum(c.get('cost', 0) for c in content_data)
    total_revenue = sum(m.get('revenue', 0) for m in metrics_data)
    
    roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
    
    return {
        'total_cost': total_cost,
        'total_revenue': total_revenue,
        'roi_percentage': round(roi, 2),
        'cost_per_view': round(total_cost / max(sum(m.get('views', 0) for m in metrics_data), 1), 4),
        'cost_per_conversion': round(total_cost / max(sum(m.get('conversions', 0) for m in metrics_data), 1), 2)
    }
```

## KPI Indicators

| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 内容转化率 | >3% | 转化/内容浏览 |
| 内容互动率 | >5% | (点赞+评论+分享)/浏览 |
| SEO排名提升 | Top 10 | 目标关键词排名 |
| 内容ROI | >200% | 内容带来收入/内容成本 |

## Success Criteria

- 内容转化率超过3%
- 月均发布10+篇高质量内容
- 至少20个关键词进入Top 10
- 建立稳定的内容创作团队

---

**技能版本：** 1.0.0  
**最后更新：** 2025年