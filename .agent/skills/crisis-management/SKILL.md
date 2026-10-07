# Agent Skill: 危机公关与差评处理

---

**name:** crisis-management
**description:** 跨境电商危机公关与差评处理Agent技能 - 智能识别负面舆情、自动化差评处理、危机预警和公关响应
**version:** 1.0.0
**author:** Cross-Border E-Commerce Specialist
**compatibility:**
  - claude
  - gpt-4
  - qwen
**allowed-tools:**
  - web_search
  - web_fetch
  - data_analysis
  - python
  - excel
**input_format:**
  - review_text: string (评论内容)
  - rating: integer (评分)
  - platform: string (平台)
  - product_id: string (产品ID)
  - customer_info: object (客户信息)
  - urgency: string (紧急程度)
**output_format:**
  - crisis_level: string (危机等级)
  - response_strategy: object (应对策略)
  - generated_response: string (生成回复)
  - action_plan: array (行动计划)
  - follow_up_required: boolean (是否需要跟进)
**estimated_time:** 15分钟-2小时
**complexity:** 高级
**tags:**
  - cross-border-compass
  - crisis-management
  - reputation-management
  - review-management

---

## 技能概述

本技能为跨境电商提供完整的危机公关和差评处理解决方案，包括负面评论智能分析、危机等级评估、自动化回复生成、多渠道舆情监控和品牌声誉保护，帮助商家有效应对危机，维护品牌形象。

### 核心能力

- **负面评论智能识别**：自动识别和分析平台差评
- **危机等级评估**：根据影响范围和严重程度评估危机等级
- **智能回复生成**：基于AI生成专业的公关回复
- **多渠道监控**：实时监控各平台和社交媒体的负面舆情
- **声誉影响评估**：量化评估危机对品牌声誉的影响
- **预防性建议**：提供危机预防和品牌保护建议

### 适用场景

- Amazon、eBay等平台差评处理
- 社交媒体负面舆情应对
- 产品质量危机处理
- 物流问题危机应对
- 客户投诉升级处理
- 媒体负面报道回应

---

## 标准作业流程（SOP）

### 阶段一：负面评论监控（实时）

#### 1.1 多平台评论监控

```python
# 负面评论监控器
class NegativeReviewMonitor:
    def __init__(self):
        self.platforms = {
            'amazon': AmazonReviewAPI(),
            'ebay': EbayReviewAPI(),
            'shopee': ShopeeReviewAPI(),
            'lazada': LazadaReviewAPI(),
            'etsy': EtsyReviewAPI()
        }
        self.alert_threshold = 2  # 2星及以下
    
    def monitor_all_platforms(self):
        """监控所有平台"""
        negative_reviews = []
        
        for platform, api in self.platforms.items():
            reviews = api.fetch_reviews(since='24h')
            negative = self.filter_negative_reviews(reviews)
            negative_reviews.extend(negative)
        
        return negative_reviews
    
    def filter_negative_reviews(self, reviews):
        """筛选负面评论"""
        negative = []
        
        for review in reviews:
            # 筛选低评分评论
            if review['rating'] <= self.alert_threshold:
                negative.append(review)
                continue
            
            # 分析评论情感
            sentiment = self.analyze_sentiment(review['text'])
            if sentiment['sentiment'] == 'negative' and sentiment['confidence'] > 0.7:
                negative.append(review)
        
        return negative
```

#### 1.2 社交媒体舆情监控

```python
# 社交媒体舆情监控器
class SocialMediaMonitor:
    def __init__(self):
        self.platforms = {
            'twitter': TwitterAPI(),
            'facebook': FacebookAPI(),
            'instagram': InstagramAPI(),
            'tiktok': TikTokAPI(),
            'reddit': RedditAPI()
        }
    
    def monitor_brand_mentions(self, brand_name):
        """监控品牌提及"""
        mentions = []
        
        for platform, api in self.platforms.items():
            # 搜索品牌提及
            results = api.search(brand_name, time_range='24h')
            
            # 筛选负面内容
            for result in results:
                sentiment = self.analyze_sentiment(result['text'])
                if sentiment['sentiment'] == 'negative':
                    mentions.append({
                        'platform': platform,
                        'text': result['text'],
                        'author': result['author'],
                        'timestamp': result['timestamp'],
                        'engagement': result['engagement'],
                        'sentiment_score': sentiment['score']
                    })
        
        return mentions
    
    def monitor_product_mentions(self, product_name, product_id):
        """监控产品提及"""
        # 类似品牌提及监控
        pass
```

---

### 阶段二：危机等级评估（<30分钟）

#### 2.1 评论严重度分析

```python
# 评论严重度分析器
class ReviewSeverityAnalyzer:
    def __init__(self):
        self.severity_keywords = {
            'critical': [
                'dangerous', 'hazardous', 'unsafe', 'injury', 'burn', 'fire',
                'poison', 'toxic', 'electric shock', 'explosion', 'lethal',
                '危险', '伤害', '烧伤', '火灾', '中毒', '触电', '爆炸'
            ],
            'high': [
                'broken', 'damaged', 'defective', 'useless', 'waste of money',
                'garbage', 'trash', 'scam', 'fraud', 'never buy again',
                '破损', '损坏', '缺陷', '无用', '垃圾', '诈骗', '再也不买'
            ],
            'medium': [
                'disappointed', 'not as described', 'poor quality',
                'slow shipping', 'wrong item', 'missing parts',
                '失望', '描述不符', '质量差', '发货慢', '错件', '缺件'
            ],
            'low': [
                'ok', 'average', 'could be better', 'minor issues',
                '还行', '一般', '可以更好', '小问题'
            ]
        }
    
    def analyze_severity(self, review_text, rating):
        """分析评论严重度"""
        text_lower = review_text.lower()
        
        severity_scores = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        # 关键词匹配
        for severity, keywords in self.severity_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    severity_scores[severity] += 1
        
        # 评分权重
        if rating == 1:
            severity_scores['critical'] += 2
            severity_scores['high'] += 2
        elif rating == 2:
            severity_scores['medium'] += 2
        
        # 确定严重度等级
        if severity_scores['critical'] > 0:
            return 'critical', severity_scores
        elif severity_scores['high'] > 0:
            return 'high', severity_scores
        elif severity_scores['medium'] > 0:
            return 'medium', severity_scores
        else:
            return 'low', severity_scores
```

#### 2.2 危机等级评估

```python
# 危机等级评估器
class CrisisLevelAssessor:
    def __init__(self):
        self.levels = {
            'level_1': {
                'name': '正常',
                'threshold': 0,
                'response_time': '24小时',
                'team': '客服团队'
            },
            'level_2': {
                'name': '关注',
                'threshold': 3,
                'response_time': '12小时',
                'team': '客服主管'
            },
            'level_3': {
                'name': '警戒',
                'threshold': 5,
                'response_time': '4小时',
                'team': '危机处理小组'
            },
            'level_4': {
                'name': '严重',
                'threshold': 10,
                'response_time': '1小时',
                'team': '管理层'
            },
            'level_5': {
                'name': '紧急',
                'threshold': 20,
                'response_time': '30分钟',
                'team': 'CEO及全员'
            }
        }
    
    def assess_crisis_level(self, incidents, time_window='24h'):
        """评估危机等级"""
        
        # 计算危机指标
        crisis_score = self.calculate_crisis_score(incidents)
        
        # 根据分数确定等级
        crisis_level = self.determine_level(crisis_score)
        
        # 评估影响范围
        impact_scope = self.assess_impact_scope(incidents)
        
        # 预测发展趋势
        trend = self.predict_trend(incidents)
        
        return {
            'crisis_level': crisis_level,
            'crisis_score': crisis_score,
            'impact_scope': impact_scope,
            'trend': trend,
            'response_time': self.levels[crisis_level]['response_time'],
            'responsible_team': self.levels[crisis_level]['team']
        }
    
    def calculate_crisis_score(self, incidents):
        """计算危机分数"""
        score = 0
        
        for incident in incidents:
            # 严重度权重
            severity_weights = {
                'critical': 10,
                'high': 5,
                'medium': 2,
                'low': 1
            }
            score += severity_weights.get(incident['severity'], 1)
            
            # 曝光度权重
            if incident['engagement'] > 1000:
                score += 5
            elif incident['engagement'] > 100:
                score += 2
            
            # 传播度权重
            if incident['viral']:
                score += 10
        
        return score
```

**危机等级矩阵：**

| 等级 | 分数范围 | 描述 | 响应时间 | 处理团队 |
|------|----------|------|----------|----------|
| Level 1 正常 | 0-2 | 零星负面评论 | 24小时 | 客服团队 |
| Level 2 关注 | 3-4 | 多个类似投诉 | 12小时 | 客服主管 |
| Level 3 警戒 | 5-9 | 产品质量问题 | 4小时 | 危机处理小组 |
| Level 4 严重 | 10-19 | 安全隐患 | 1小时 | 管理层 |
| Level 5 紧急 | ≥20 | 重大安全/法律问题 | 30分钟 | CEO及全员 |

---

### 阶段三：智能回复生成（<1小时）

#### 3.1 评论类型识别

```python
# 评论类型分类器
class ReviewTypeClassifier:
    def __init__(self):
        self.categories = {
            'product_quality': ['quality', 'defect', 'broken', 'damaged', '质量', '缺陷', '破损'],
            'shipping_logistics': ['shipping', 'delivery', 'late', 'lost', 'shipping', '发货', '物流', '延迟'],
            'customer_service': ['service', 'support', 'rude', 'unhelpful', '服务', '客服', '态度'],
            'description_mismatch': ['not as described', 'different', 'misleading', '描述不符', '不符'],
            'price_value': ['expensive', 'overpriced', 'not worth', '贵', '不值'],
            'safety_issue': ['dangerous', 'unsafe', 'hazardous', '危险', '不安全'],
            'fake_counterfeit': ['fake', 'counterfeit', 'not genuine', '假货', '仿冒']
        }
    
    def classify_review(self, review_text):
        """分类评论类型"""
        text_lower = review_text.lower()
        
        detected_types = []
        for category, keywords in self.categories.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if category not in detected_types:
                        detected_types.append(category)
        
        return detected_types
```

#### 3.2 回复策略选择

```python
# 回复策略选择器
class ResponseStrategySelector:
    def __init__(self):
        self.strategies = {
            'apologize_compensate': {
                'applicable': ['product_quality', 'shipping_logistics', 'safety_issue'],
                'elements': ['道歉', '解释', '补偿', '改进承诺']
            },
            'clarify_correct': {
                'applicable': ['description_mismatch', 'misunderstanding'],
                'elements': ['澄清', '提供证据', '解释差异', '提供帮助']
            },
            'resolve_immediately': {
                'applicable': ['customer_service'],
                'elements': ['道歉', '立即解决', '内部调查', '承诺改进']
            },
            'legal_protect': {
                'applicable': ['fake_counterfeit', 'legal_threat'],
                'elements': ['事实澄清', '法律保护', '提供证据', '官方声明']
            }
        }
    
    def select_strategy(self, review_type, crisis_level, severity):
        """选择回复策略"""
        
        # 基于评论类型选择策略
        strategy = None
        for strat_name, config in self.strategies.items():
            if review_type in config['applicable']:
                strategy = strat_name
                break
        
        # 高危机等级升级策略
        if crisis_level in ['level_4', 'level_5']:
            strategy = 'crisis_response'
        
        return {
            'strategy_name': strategy,
            'elements': self.strategies.get(strategy, {}).get('elements', []),
            'tone': self.determine_tone(crisis_level, severity)
        }
    
    def determine_tone(self, crisis_level, severity):
        """确定回复语调"""
        if crisis_level in ['level_4', 'level_5'] or severity == 'critical':
            return 'formal_sincere'
        elif crisis_level == 'level_3':
            return 'professional_empathetic'
        else:
            return 'friendly_helpful'
```

#### 3.3 AI回复生成

```python
# AI回复生成器
class AIResponseGenerator:
    def __init__(self):
        self.templates = self.load_templates()
        self.llm_client = OpenAI()  # 或其他LLM API
    
    def generate_response(self, review, strategy, language='en'):
        """生成AI回复"""
        
        # 构建提示词
        prompt = self.build_prompt(review, strategy, language)
        
        # 生成回复
        response = self.llm_client.generate(
            prompt=prompt,
            max_tokens=500,
            temperature=0.7
        )
        
        # 验证回复质量
        validated = self.validate_response(response)
        
        return {
            'response_text': validated['text'],
            'confidence': validated['confidence'],
            'suggestions': validated['suggestions']
        }
    
    def build_prompt(self, review, strategy, language):
        """构建提示词"""
        prompt = f"""
You are a customer service representative responding to a negative review.

Review Information:
- Rating: {review['rating']}/5
- Review Text: "{review['text']}"
- Customer: {review['customer_name']}
- Product: {review['product_name']}

Response Strategy: {strategy['strategy_name']}
Required Elements: {', '.join(strategy['elements'])}
Tone: {strategy['tone']}

Language: {language}

Guidelines:
1. Start with a sincere apology
2. Acknowledge the customer's frustration
3. Provide a clear explanation or solution
4. Offer appropriate compensation if applicable
5. Commit to improvement
6. Invite further communication
7. Keep it professional but empathetic
8. Length: 150-250 words

Generate the response:
"""
        return prompt
```

**回复模板示例：**

```yaml
产品问题回复模板:
  en: |
    Dear {customer_name},
    
    I sincerely apologize that you received a defective product. This is absolutely not the experience we want our customers to have, and I completely understand your frustration.
    
    I've immediately escalated this to our quality control team for investigation. In the meantime, I'd like to make this right for you by:
    
    1. Sending you a brand new replacement immediately (free expedited shipping)
    2. Issuing a full refund for your original purchase
    3. Adding a $20 store credit as a gesture of our apology
    
    You don't need to return the defective product - please dispose of it properly.
    
    I've also sent you a separate email with the tracking information for your replacement, which should arrive within 2-3 business days.
    
    We take quality very seriously and are already working to prevent this from happening again. If there's anything else I can do, please don't hesitate to contact me directly at {contact_email}.
    
    Thank you for bringing this to our attention and for giving us the chance to make it right.
    
    Best regards,
    {your_name}
    Customer Service Manager
    {company_name}

安全问题回复模板:
  en: |
    Dear {customer_name},
    
    Thank you for bringing this to our immediate attention. I am extremely concerned about your experience and want to personally ensure this is addressed promptly and thoroughly.
    
    Your safety is our top priority. I have immediately:
    
    1. Initiated a full safety investigation of this product batch
    2. Contacted the appropriate regulatory authorities
    3. Temporarily suspended sales of this product pending investigation
    4. Notified all recent customers of potential concerns
    
    I would like to personally speak with you to better understand what happened and ensure your well-being. Could you please contact me directly at {phone_number} at your earliest convenience?
    
    We will provide you with a full refund and compensation for any inconvenience or concern this has caused. You do not need to return the product - we will arrange for its safe collection if needed.
    
    Please accept my sincerest apologies. We take this matter extremely seriously and are committed to resolving it completely and transparently.
    
    Sincerely,
    {ceo_name}
    CEO
    {company_name}
```

---

### 阶段四：行动执行（2-24小时）

#### 4.1 回复发布

```python
# 回复发布器
class ResponsePublisher:
    def __init__(self):
        self.platforms = {
            'amazon': AmazonPublisher(),
            'ebay': EbayPublisher(),
            'shopee': ShopeePublisher(),
            'twitter': TwitterPublisher(),
            'facebook': FacebookPublisher()
        }
    
    def publish_response(self, response_data):
        """发布回复"""
        results = []
        
        for target in response_data['targets']:
            platform = target['platform']
            publisher = self.platforms.get(platform)
            
            if publisher:
                result = publisher.publish(
                    review_id=target['review_id'],
                    response_text=response_data['response'],
                    public=response_data.get('public', True)
                )
                results.append(result)
        
        return results
    
    def schedule_follow_up(self, review_id, follow_up_date):
        """安排后续跟进"""
        pass
```

#### 4.2 内部行动触发

```python
# 内部行动触发器
class InternalActionTrigger:
    def __init__(self):
        self.actions = {
            'quality_investigation': QualityInvestigation(),
            'refund_processing': RefundProcessor(),
            'replacement_shipment': ReplacementShipper(),
            'notification_team': NotificationSystem()
        }
    
    def trigger_actions(self, crisis_assessment, action_plan):
        """触发内部行动"""
        results = []
        
        for action in action_plan:
            action_name = action['action']
            action_handler = self.actions.get(action_name)
            
            if action_handler:
                result = action_handler.execute(action['params'])
                results.append({
                    'action': action_name,
                    'status': result['status'],
                    'result': result
                })
        
        return results
```

#### 4.3 舆情追踪

```python
# 舆情追踪器
class SentimentTracker:
    def __init__(self):
        self.baseline_sentiment = self.calculate_baseline()
    
    def track_sentiment_after_response(self, crisis_id, time_period='7d'):
        """追踪回应后的舆情变化"""
        
        # 获取回复后的数据
        post_response_reviews = self.get_reviews_since_response(crisis_id)
        
        # 计算情感分数
        current_sentiment = self.calculate_sentiment(post_response_reviews)
        
        # 对比基线
        sentiment_change = current_sentiment - self.baseline_sentiment
        
        # 分析趋势
        trend = self.analyze_trend(crisis_id, time_period)
        
        return {
            'baseline': self.baseline_sentiment,
            'current': current_sentiment,
            'change': sentiment_change,
            'trend': trend,
            'improvement': sentiment_change > 0
        }
```

---

## 关键指标KPI

### 危机响应指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 危机识别时间 | ≤ 30分钟 | 识别时间 - 发生时间 | 实时 |
| 首次响应时间 | ≤ 2小时 | 响应时间 - 识别时间 | 实时 |
| 危机解决时间 | ≤ 24小时 | 解决时间 - 识别时间 | 每日 |
| 回复质量评分 | ≥ 4.5/5.0 | 人工评分 | 每周 |

### 声誉影响指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 品牌评分 | ≥ 4.3/5.0 | 平均产品评分 | 每日 |
| 负面评论率 | ≤ 5% | 负面评论数 / 总评论数 | 每周 |
| 社交媒体情感 | 正向 | 正向提及 / 总提及 | 每日 |
| 危机后恢复时间 | ≤ 7天 | 恢复到基线的时间 | 每次危机 |

### 客户满意度指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 差评修改率 | ≥ 30% | 修改差评数 / 处理差评数 | 每月 |
| 投诉解决率 | ≥ 95% | 解决投诉数 / 总投诉数 | 每月 |
| 客户留存率 | ≥ 80% | 留存客户数 / 受影响客户数 | 每月 |

---

## 实战示例

### 示例1：产品质量问题（Level 3）

**场景：** 多个客户反映同一产品存在质量问题

**输入：**
```json
{
  "reviews": [
    {
      "review_id": "REV001",
      "rating": 1,
      "text": "The product broke after 2 days! Complete waste of money. Will never buy from this seller again!",
      "platform": "amazon",
      "product_id": "PROD123"
    },
    {
      "review_id": "REV002",
      "rating": 2,
      "text": "Arrived damaged. The quality is terrible. Very disappointed.",
      "platform": "amazon",
      "product_id": "PROD123"
    },
    {
      "review_id": "REV003",
      "rating": 1,
      "text": "Garbage! Don't buy this. It fell apart when I opened it.",
      "platform": "amazon",
      "product_id": "PROD123"
    }
  ]
}
```

**处理流程：**

```python
# 1. 监控识别
negative_reviews = monitor.detect_negative_reviews()
# 发现3个关于同一产品的差评

# 2. 严重度分析
for review in negative_reviews:
    severity = analyzer.analyze_severity(review['text'], review['rating'])
    # REV001: high, REV002: medium, REV003: high

# 3. 危机等级评估
crisis_level = assessor.assess_crisis_level(negative_reviews)
# 返回: {'crisis_level': 'level_3', 'crisis_score': 8, 'response_time': '4小时'}

# 4. 生成回复策略
strategy = selector.select_strategy('product_quality', 'level_3', 'high')

# 5. 生成回复
response = generator.generate_response(negative_reviews[0], strategy)

# 6. 执行行动
actions = [
    {'action': 'refund_processing', 'params': {'customers': ['CUST001', 'CUST002', 'CUST003']}},
    {'action': 'quality_investigation', 'params': {'product_id': 'PROD123'}},
    {'action': 'notification_team', 'params': {'team': 'quality_control'}}
]
trigger.trigger_actions(crisis_level, actions)
```

**输出：**
```json
{
  "crisis_level": "level_3",
  "crisis_score": 8,
  "response_strategy": {
    "strategy_name": "apologize_compensate",
    "elements": ["道歉", "解释", "补偿", "改进承诺"],
    "tone": "professional_empathetic"
  },
  "generated_response": "Dear Customer,\n\nI sincerely apologize that you received a defective product. This is absolutely not the experience we want our customers to have.\n\nI've immediately escalated this to our quality control team for investigation. In the meantime, I'd like to make this right by:\n\n1. Sending you a brand new replacement immediately (free expedited shipping)\n2. Issuing a full refund for your original purchase\n3. Adding a $20 store credit as a gesture of our apology\n\nWe take quality very seriously and are already working to prevent this from happening again. Please contact us directly if you need anything.\n\nBest regards,\nCustomer Service Manager",
  "action_plan": [
    "process_full_refund_for_all_affected_customers",
    "send_replacement_products",
    "initiate_quality_investigation",
    "suspend_product_sales_until_issue_resolved",
    "notify_quality_control_team"
  ],
  "follow_up_required": true,
  "follow_up_date": "2026-02-19"
}
```

---

### 示例2：安全隐患危机（Level 5）

**场景：** 客户报告产品存在安全隐患

**输入：**
```json
{
  "review": {
    "review_id": "REV999",
    "rating": 1,
    "text": "DANGER! This product overheated and started smoking while charging. Could have caused a fire! DO NOT BUY! Reporting to consumer safety agency!",
    "platform": "amazon",
    "product_id": "PROD456",
    "viral": true,
    "engagement": 5000
  }
}
```

**处理流程：**

```python
# 1. 严重度分析
severity = analyzer.analyze_severity(review['text'], 1)
# 返回: ('critical', {'critical': 3, 'high': 2})

# 2. 危机等级评估
crisis_level = assessor.assess_crisis_level([review])
# 返回: {'crisis_level': 'level_5', 'response_time': '30分钟'}

# 3. 立即升级
escalate_to_ceo(review, crisis_level)

# 4. 生成官方声明
statement = generator.generate_official_statement(review)

# 5. 执行紧急行动
emergency_actions = [
    {'action': 'suspend_all_sales', 'params': {'product_id': 'PROD456'}},
    {'action': 'notify_regulatory_authorities', 'params': {}},
    {'action': 'contact_all_customers', 'params': {'message': 'safety_warning'}},
    {'action': 'initiate_recall', 'params': {'product_id': 'PROD456'}}
]
trigger.trigger_actions(crisis_level, emergency_actions)
```

**输出：**
```json
{
  "crisis_level": "level_5",
  "crisis_score": 25,
  "response_strategy": {
    "strategy_name": "crisis_response",
    "elements": ["严肃道歉", "安全承诺", "立即行动", "透明沟通"],
    "tone": "formal_sincere"
  },
  "generated_response": "Dear Customer,\n\nThank you for bringing this to our immediate attention. I am extremely concerned about your experience and want to personally ensure this is addressed promptly and thoroughly.\n\nYour safety is our top priority. I have immediately:\n\n1. Initiated a full safety investigation of this product\n2. Temporarily suspended all sales of this product\n3. Contacted the appropriate regulatory authorities\n4. Notified all recent customers of potential safety concerns\n\nWe will provide you with a full refund and arrange for the safe collection of the product. You do not need to return it - we will contact you to arrange collection.\n\nPlease contact me directly at [CEO_PHONE] to discuss this matter further.\n\nWe take this matter extremely seriously and are committed to resolving it completely and transparently.\n\nSincerely,\n[CEO_NAME]\nCEO\n[COMPANY_NAME]",
  "action_plan": [
    "IMMEDIATE: Suspend all product sales",
    "IMMEDIATE: Contact CPSC and other regulatory bodies",
    "IMMEDIATE: Notify all customers who purchased this product",
    "IMMEDIATE: Initiate product recall process",
    "IMMEDIATE: Post safety notice on all platforms",
    "URGENT: Conduct full safety investigation",
    "URGENT: Issue full refunds to all affected customers",
    "URGENT: Prepare official press release",
    "URGENT: Set up dedicated crisis hotline"
  ],
  "follow_up_required": true,
  "follow_up_frequency": "daily",
  "crisis_team": "CEO, Legal, PR, Quality Control, Customer Service"
}
```

---

## 边界情况处理

### 1. 虚假差评

**问题：** 竞争对手或恶意用户发布虚假差评

**解决方案：**

```python
def detect_fake_review(review):
    """检测虚假差评"""
    
    risk_score = 0
    flags = []
    
    # 检查评论历史
    if review['reviewer']['total_reviews'] < 5:
        risk_score += 2
        flags.append('新账号')
    
    # 检查评论速度
    if review['time_since_purchase'] < '1h':
        risk_score += 3
        flags.append('评论过快')
    
    # 检查语言模式
    if is_template_language(review['text']):
        risk_score += 2
        flags.append('模板化语言')
    
    # 检查竞争对手IP
    if is_competitor_ip(review['ip_address']):
        risk_score += 5
        flags.append('竞争对手IP')
    
    # 决策
    if risk_score >= 5:
        return {
            'is_fake': True,
            'confidence': 'high',
            'risk_score': risk_score,
            'flags': flags,
            'action': 'report_to_platform'
        }
    
    return {'is_fake': False, 'risk_score': risk_score}
```

### 2. 媒体负面报道

**问题：** 媒体发布关于品牌的负面报道

**解决方案：**

```python
def handle_media_coverage(coverage):
    """处理媒体负面报道"""
    
    # 评估影响范围
    impact = assess_media_impact(coverage)
    
    # 准备官方回应
    official_response = prepare_official_response(coverage)
    
    # 分发回应
    distribute_response(official_response, coverage['outlets'])
    
    # 监控报道传播
    monitor_coverage_spread(coverage)
    
    # 准备FAQ
    prepare_faq(coverage)
    
    return {
        'response_published': True,
        'media_outlets_contacted': len(coverage['outlets']),
        'statement_released': True
    }
```

### 3. 危机连锁反应

**问题：** 一个危机引发多个相关危机

**解决方案：**

```python
def handle_crisis_cascade(initial_crisis):
    """处理危机连锁反应"""
    
    # 识别关联风险点
    related_risks = identify_related_risks(initial_crisis)
    
    # 预防性措施
    preventive_actions = []
    for risk in related_risks:
        if risk['probability'] > 0.5:
            preventive_actions.append({
                'risk': risk,
                'action': generate_preventive_action(risk)
            })
    
    # 创建危机指挥中心
    crisis_command_center = establish_command_center()
    
    # 统一信息发布
    unified_messaging = develop_unified_messaging(initial_crisis, related_risks)
    
    return {
        'related_risks_identified': len(related_risks),
        'preventive_actions': preventive_actions,
        'command_center_active': True
    }
```

---

## 质量保证清单

### 回复质量检查

- [ ] 语言专业且真诚
- [ ] 完整回应客户关切
- [ ] 提供具体解决方案
- [ ] 符合公司政策和法律要求
- [ ] 无引发更大争议的措辞
- [ ] 适当表达歉意和同理心
- [ ] 包含明确的后续行动

### 危机处理检查

- [ ] 正确评估危机等级
- [ ] 在规定时间内响应
- [ ] 通知合适的处理团队
- [ ] 采取适当的内部行动
- [ ] 保护客户安全（如适用）
- [ ] 遵守法律法规
- [ ] 记录完整处理过程

### 后续跟进检查

- [ ] 验证问题已解决
- [ ] 跟进客户满意度
- [ ] 监控舆情变化
- [ ] 总结经验教训
- [ ] 更新预防措施
- [ ] 更新知识库

---

## 数据源和工具清单

### 情感分析工具

| 工具 | 语言 | 成本 | 准确率 |
|------|------|------|--------|
| Google Cloud NLP | 多语言 | $0.001/文本单元 | 85-90% |
| AWS Comprehend | 多语言 | $0.0001/单位 | 80-85% |
| IBM Watson | 多语言 | $0.003/文本 | 85-90% |

### 媒体监控工具

| 工具 | 覆盖范围 | 成本 | 实时性 |
|------|----------|------|--------|
| Meltwater | 全球 | $3500/月起 | 实时 |
| Brandwatch | 全球 | $1000/月起 | 实时 |
| Mention | 全球 | $99/月起 | 近实时 |

### 社交媒体监控

| 工具 | 平台数量 | 成本 | 功能 |
|------|----------|------|------|
| Hootsuite | 10+ | $99/月起 | 全功能 |
| Sprout Social | 10+ | $249/月起 | 高级分析 |
| Buffer | 6+ | $15/月起 | 基础功能 |

---

## 成功标准

### 短期目标（1-3个月）

- ✅ 危机识别时间 ≤ 30分钟
- ✅ 首次响应时间 ≤ 2小时
- ✅ 差评修改率 ≥ 25%
- ✅ 品牌评分保持 ≥ 4.2/5.0

### 中期目标（3-6个月）

- ✅ 自动化回复准确率 ≥ 85%
- ✅ 危机解决时间 ≤ 12小时
- ✅ 差评修改率 ≥ 35%
- ✅ 品牌评分提升至 ≥ 4.4/5.0

### 长期目标（6-12个月）

- ✅ 危机预测准确率 ≥ 70%
- ✅ 危机后恢复时间 ≤ 3天
- ✅ 差评修改率 ≥ 50%
- ✅ 品牌评分提升至 ≥ 4.6/5.0

---

## 相关技能

- **cross-border-cs** - 跨境多语种客服与售后管理
- **localization-cs** - 本地化客服适配
- **compliance-management** - 跨境合规监管与风险控制

---

**技能版本：** 1.0.0  
**最后更新：** 2026-02-12  
**维护团队：** 跨境电商技术团队