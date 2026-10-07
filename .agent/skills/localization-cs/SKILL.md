# Agent Skill: 本地化客服适配

---

**name:** localization-cs
**description:** 跨境客服本地化适配Agent技能 - 深度文化适配、本地化表达习惯、时区管理和节日服务优化
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
  - market: string (目标市场)
  - customer_query: string (客户咨询)
  - customer_context: object (客户背景)
  - channel: string (沟通渠道)
**output_format:**
  - localized_response: string (本地化回复)
  - cultural_notes: array (文化要点)
  - timezone_adjusted_schedule: object (时区调整)
  - cultural_sensitivity_flag: boolean (文化敏感性标记)
**estimated_time:** 30秒-3分钟
**complexity:** 中级
**tags:**
  - cross-border-compass
  - localization
  - cultural-adaptation
  - customer-experience

---

## 技能概述

本技能专注于跨境电商的深度本地化适配，超越简单的语言翻译，深入理解不同市场的文化差异、沟通习惯、商业礼仪和消费心理，提供真正符合当地文化背景的客户服务体验。

### 核心能力

- **文化差异识别**：自动识别和适应不同市场的文化特点
- **本地化表达优化**：使用符合当地习惯的表达方式和语调
- **时区智能管理**：自动处理时区差异，优化服务时间
- **节日习俗适配**：根据当地节日调整服务策略和问候语
- **商业礼仪应用**：应用正确的商业沟通礼仪
- **禁忌词过滤**：避免使用当地文化中的禁忌词汇和表达

### 适用场景

- 进入新市场的客服本地化
- 特定市场的客户沟通优化
- 节日期间的客服策略调整
- 处理文化敏感的客户问题
- 品牌本土化客服体验设计

---

## 标准作业流程（SOP）

### 阶段一：市场文化分析（预处理）

#### 1.1 文化维度识别

```python
# 文化维度分析器
class CulturalDimensionAnalyzer:
    def __init__(self):
        self.hofstede_dimensions = {
            'US': {
                'power_distance': 40,
                'individualism': 91,
                'masculinity': 62,
                'uncertainty_avoidance': 46,
                'long_term_orientation': 26,
                'indulgence': 68
            },
            'JP': {
                'power_distance': 54,
                'individualism': 46,
                'masculinity': 95,
                'uncertainty_avoidance': 92,
                'long_term_orientation': 88,
                'indulgence': 42
            },
            'DE': {
                'power_distance': 35,
                'individualism': 67,
                'masculinity': 66,
                'uncertainty_avoidance': 65,
                'long_term_orientation': 83,
                'indulgence': 40
            },
            'BR': {
                'power_distance': 69,
                'individualism': 38,
                'masculinity': 49,
                'uncertainty_avoidance': 76,
                'long_term_orientation': 44,
                'indulgence': 59
            },
            'AE': {
                'power_distance': 90,
                'individualism': 25,
                'masculinity': 50,
                'uncertainty_avoidance': 80,
                'long_term_orientation': 30,
                'indulgence': 35
            }
        }
    
    def analyze_market_culture(self, market_code):
        """分析市场文化特征"""
        dimensions = self.hofstede_dimensions.get(market_code, {})
        
        culture_profile = {
            'communication_style': self.determine_communication_style(dimensions),
            'formality_level': self.determine_formality(dimensions),
            'decision_making': self.determine_decision_style(dimensions),
            'relationship_orientation': self.determine_relationship_style(dimensions),
            'time_orientation': self.determine_time_orientation(dimensions)
        }
        
        return culture_profile
    
    def determine_communication_style(self, dimensions):
        """确定沟通风格"""
        if dimensions.get('individualism', 50) > 70:
            return 'direct_explicit'
        elif dimensions.get('uncertainty_avoidance', 50) > 70:
            return 'formal_precise'
        else:
            return 'indirect_polite'
```

#### 1.2 本地化特征库

```python
# 本地化特征库
class LocalizationFeatureLibrary:
    def __init__(self):
        self.market_features = {
            'US': {
                'greeting': 'Hi [Name],',
                'closing': 'Best regards,',
                'tone': 'casual_friendly',
                'formality': 'low',
                'directness': 'high',
                'personal_space': 'high',
                'small_talk': 'brief',
                'response_expectation': 'quick',
                'complaint_style': 'direct',
                'appreciation': 'explicit'
            },
            'JP': {
                'greeting': '尊敬的[Name]様，',
                'closing': '敬具',
                'tone': 'polite_humble',
                'formality': 'very_high',
                'directness': 'low',
                'personal_space': 'moderate',
                'small_talk': 'ritualized',
                'response_expectation': 'thorough',
                'complaint_style': 'indirect',
                'appreciation': 'subtle'
            },
            'DE': {
                'greeting': 'Sehr geehrte(r) [Name],',
                'closing': 'Mit freundlichen Grüßen,',
                'tone': 'professional_precise',
                'formality': 'high',
                'directness': 'high',
                'personal_space': 'high',
                'small_talk': 'minimal',
                'response_expectation': 'accurate',
                'complaint_style': 'factual',
                'appreciation': 'reserved'
            },
            'BR': {
                'greeting': 'Olá [Name],',
                'closing': 'Atenciosamente,',
                'tone': 'warm_friendly',
                'formality': 'medium',
                'directness': 'medium',
                'personal_space': 'low',
                'small_talk': 'extended',
                'response_expectation': 'personal',
                'complaint_style': 'emotional',
                'appreciation': 'enthusiastic'
            },
            'AE': {
                'greeting': 'عزيزي [Name]،',
                'closing': 'مع أطيب التحيات،',
                'tone': 'respectful_formal',
                'formality': 'very_high',
                'directness': 'medium',
                'personal_space': 'high',
                'small_talk': 'relationship_building',
                'response_expectation': 'respectful',
                'complaint_style': 'dignified',
                'appreciation': 'gracious'
            }
        }
    
    def get_localization_features(self, market_code):
        """获取本地化特征"""
        return self.market_features.get(market_code, self.market_features['US'])
```

---

### 阶段二：本地化适配（实时）

#### 2.1 语调和礼貌级别调整

```python
# 语调适配器
class ToneAdapter:
    def __init__(self):
        self.tone_templates = {
            'casual_friendly': {
                'greeting': ['Hi', 'Hello', 'Hey'],
                'apology': ['Sorry about that', 'My apologies'],
                'offer': ['Let me help you with that', 'I can definitely help'],
                'closing': ['Best', 'Cheers', 'Thanks']
            },
            'polite_humble': {
                'greeting': ['お世話になっております', 'ありがとうございます'],
                'apology': ['申し訳ございません', '大変失礼いたしました'],
                'offer': ['させていただきます', 'お手伝いさせていただきます'],
                'closing': ['よろしくお願いいたします', '失礼いたします']
            },
            'professional_precise': {
                'greeting': ['Sehr geehrte(r)', 'Guten Tag'],
                'apology': ['Ich bitte vielmals um Entschuldigung', 'Es tut uns leid'],
                'offer': ['Gerne helfe ich Ihnen', 'Ich werde das sofort klären'],
                'closing': ['Mit freundlichen Grüßen', 'Beste Grüße']
            }
        }
    
    def adapt_tone(self, message, target_tone, market):
        """调整语调"""
        features = self.get_localization_features(market)
        
        # 替换问候语
        message = self.replace_greeting(message, features['greeting'])
        
        # 调整礼貌级别
        message = self.adjust_politeness(message, features['formality'])
        
        # 适配直接程度
        message = self.adjust_directness(message, features['directness'])
        
        return message
```

#### 2.2 禁忌词和敏感话题过滤

```python
# 敏感内容过滤器
class SensitiveContentFilter:
    def __init__(self):
        self.taboo_words = {
            'JP': {
                'death_related': ['死', '死ぬ', '死亡'],
                'four': ['四', '4'],  # 不吉利的数字
                'direct_refusal': ['できません', '無理'],
                'negative_numbers': ['九', '9']
            },
            'AE': {
                'religious_insensitive': ['pork', 'alcohol', 'gambling'],
                'gender_inappropriate': ['dear sir/madam', 'he/she assumption'],
                'political_restricted': ['israel', 'palestine']
            },
            'IN': {
                'religious_sensitivity': ['beef', 'cow'],
                'caste_references': ['brahmin', 'dalit'],
                'left_hand': ['left']  # 左手被视为不洁
            }
        }
        
        self.sensitive_topics = {
            'CN': ['politics', 'taiwan', 'tibet', 'falun gong'],
            'RU': ['ukraine', 'sanctions', 'politics'],
            'SA': ['israel', 'alcohol', 'pork', 'dating']
        }
    
    def filter_content(self, message, market):
        """过滤敏感内容"""
        filtered_message = message
        flags = []
        
        # 检查禁忌词
        taboo_words = self.taboo_words.get(market, {})
        for category, words in taboo_words.items():
            for word in words:
                if word.lower() in message.lower():
                    flags.append({
                        'type': 'taboo_word',
                        'category': category,
                        'word': word
                    })
                    filtered_message = self.replace_taboo(filtered_message, word, market)
        
        # 检查敏感话题
        sensitive_topics = self.sensitive_topics.get(market, [])
        for topic in sensitive_topics:
            if topic.lower() in message.lower():
                flags.append({
                    'type': 'sensitive_topic',
                    'topic': topic
                })
        
        return {
            'filtered_message': filtered_message,
            'flags': flags,
            'requires_review': len(flags) > 0
        }
```

---

### 阶段三：时区和节日适配（实时）

#### 3.1 时区智能管理

```python
# 时区管理器
class TimezoneManager:
    def __init__(self):
        self.market_timezones = {
            'US': ['America/New_York', 'America/Chicago', 'America/Los_Angeles'],
            'UK': 'Europe/London',
            'DE': 'Europe/Berlin',
            'JP': 'Asia/Tokyo',
            'AU': 'Australia/Sydney',
            'AE': 'Asia/Dubai',
            'BR': 'America/Sao_Paulo',
            'IN': 'Asia/Kolkata'
        }
        
        self.business_hours = {
            'US': {'start': '09:00', 'end': '17:00'},
            'UK': {'start': '09:00', 'end': '17:00'},
            'DE': {'start': '08:00', 'end': '17:00'},
            'JP': {'start': '09:00', 'end': '18:00'},
            'AE': {'start': '09:00', 'end': '17:00'},
            'BR': {'start': '09:00', 'end': '18:00'}
        }
    
    def get_local_time(self, market, utc_time=None):
        """获取当地时间"""
        if utc_time is None:
            utc_time = datetime.utcnow()
        
        tz = self.market_timezones.get(market, 'UTC')
        local_time = utc_time.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(tz))
        
        return local_time
    
    def is_business_hours(self, market):
        """检查是否在营业时间内"""
        local_time = self.get_local_time(market)
        hours = self.business_hours.get(market, {'start': '09:00', 'end': '17:00'})
        
        current_hour = local_time.hour
        start_hour = int(hours['start'].split(':')[0])
        end_hour = int(hours['end'].split(':')[0])
        
        return start_hour <= current_hour < end_hour
    
    def calculate_response_delay(self, market):
        """计算响应延迟"""
        if self.is_business_hours(market):
            return 'within 2 hours'
        else:
            return 'next business day'
```

#### 3.2 节日习俗适配

```python
# 节日管理器
class HolidayManager:
    def __init__(self):
        self.holidays = {
            'US': {
                'Christmas': {'date': '12-25', 'greeting': 'Merry Christmas', 'impact': 'high'},
                'Thanksgiving': {'date': '11-4th-Thursday', 'greeting': 'Happy Thanksgiving', 'impact': 'high'},
                'Independence Day': {'date': '07-04', 'greeting': 'Happy 4th of July', 'impact': 'medium'}
            },
            'JP': {
                'New Year': {'date': '01-01', 'greeting': '明けましておめでとうございます', 'impact': 'very_high'},
                'Golden Week': {'dates': ['04-29', '05-03', '05-04', '05-05'], 'impact': 'very_high'},
                'Obon': {'date': '08-15', 'greeting': 'お盆', 'impact': 'high'}
            },
            'CN': {
                'Spring Festival': {'date': 'lunar-01-01', 'greeting': '春节快乐', 'impact': 'very_high'},
                'National Day': {'date': '10-01', 'greeting': '国庆快乐', 'impact': 'high'},
                'Mid-Autumn Festival': {'date': 'lunar-08-15', 'greeting': '中秋快乐', 'impact': 'medium'}
            },
            'AE': {
                'Ramadan': {'date': 'varies', 'greeting': 'رمضان مبارك', 'impact': 'very_high'},
                'Eid al-Fitr': {'date': 'varies', 'greeting': 'عيد الفطر مبارك', 'impact': 'very_high'},
                'National Day': {'date': '12-02', 'greeting': 'اليوم الوطني', 'impact': 'high'}
            }
        }
    
    def get_current_holiday(self, market):
        """获取当前节日"""
        today = datetime.now().date()
        market_holidays = self.holidays.get(market, {})
        
        for holiday_name, info in market_holidays.items():
            if self.is_holiday_date(today, info):
                return {
                    'name': holiday_name,
                    'greeting': info['greeting'],
                    'impact': info['impact']
                }
        
        return None
    
    def adjust_service_for_holiday(self, market):
        """根据节日调整服务"""
        holiday = self.get_current_holiday(market)
        
        if holiday:
            adjustments = {
                'greeting': f"{holiday['greeting']}！",
                'response_time': 'extended' if holiday['impact'] in ['high', 'very_high'] else 'normal',
                'staffing': 'reduced' if holiday['impact'] == 'very_high' else 'normal',
                'shipping_notice': 'holiday_shipping_delay' if holiday['impact'] == 'very_high' else None
            }
            return adjustments
        
        return {'greeting': 'standard', 'response_time': 'normal', 'staffing': 'normal'}
```

---

### 阶段四：本地化回复生成（<1分钟）

#### 4.1 完整本地化流程

```python
# 本地化回复生成器
class LocalizedResponseGenerator:
    def __init__(self):
        self.cultural_analyzer = CulturalDimensionAnalyzer()
        self.feature_library = LocalizationFeatureLibrary()
        self.tone_adapter = ToneAdapter()
        self.content_filter = SensitiveContentFilter()
        self.timezone_manager = TimezoneManager()
        self.holiday_manager = HolidayManager()
    
    def generate_localized_response(self, query, market, customer_info):
        """生成完全本地化的回复"""
        
        # 1. 分析市场文化
        culture_profile = self.cultural_analyzer.analyze_market_culture(market)
        
        # 2. 获取本地化特征
        features = self.feature_library.get_localization_features(market)
        
        # 3. 生成基础回复
        base_response = self.generate_base_response(query, customer_info)
        
        # 4. 调整语调
        adapted_response = self.tone_adapter.adapt_tone(
            base_response, 
            features['tone'], 
            market
        )
        
        # 5. 过滤敏感内容
        filtered_result = self.content_filter.filter_content(adapted_response, market)
        
        # 6. 添加节日问候
        holiday_adjustment = self.holiday_manager.adjust_service_for_holiday(market)
        if holiday_adjustment.get('greeting') != 'standard':
            filtered_result['filtered_message'] = (
                f"{holiday_adjustment['greeting']}\n\n" + 
                filtered_result['filtered_message']
            )
        
        # 7. 添加时区相关信息
        response_delay = self.timezone_manager.calculate_response_delay(market)
        if response_delay == 'next business day':
            filtered_result['filtered_message'] += (
                f"\n\nPlease note that our team will respond at the beginning of the next business day."
            )
        
        return {
            'localized_response': filtered_result['filtered_message'],
            'cultural_notes': {
                'communication_style': culture_profile['communication_style'],
                'formality_level': features['formality'],
                'directness': features['directness']
            },
            'timezone_info': {
                'local_time': self.timezone_manager.get_local_time(market),
                'is_business_hours': self.timezone_manager.is_business_hours(market),
                'expected_response': response_delay
            },
            'sensitivity_flags': filtered_result['flags']
        }
```

---

## 关键指标KPI

### 本地化质量指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 本地化准确率 | ≥ 95% | 人工评估准确数 / 总回复数 | 每周 |
| 文化错误率 | ≤ 1% | 文化错误数 / 总回复数 | 每周 |
| 禁忌词触发率 | 0 | 触发次数 | 实时 |
| 客户满意度 | ≥ 4.5/5.0 | 本地化市场客户满意度 | 每月 |

### 时区管理指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 营业时间响应率 | ≥ 95% | 营业时间内响应数 / 总咨询 | 每日 |
| 非营业时间通知准确率 | 100% | 准确通知数 / 非营业咨询 | 每日 |
| 时区转换准确率 | 100% | 准确转换数 / 总转换 | 实时 |

### 节日适配指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 节日问候准确率 | 100% | 准确问候数 / 节日咨询 | 每个节日 |
| 节日服务调整及时性 | 100% | 及时调整数 / 应调整数 | 每个节日 |
| 节日客户满意度 | ≥ 4.5/5.0 | 节日期间客户满意度 | 每个节日 |

---

## 实战示例

### 示例1：日本市场客户咨询

**场景：** 日本客户咨询订单状态

**输入：**
```json
{
  "customer_query": "注文の状況を確認したいです。いつ届きますか？",
  "market": "JP",
  "customer_info": {
    "name": "田中 太郎",
    "customer_id": "JP-001"
  }
}
```

**处理流程：**

```python
# 1. 分析日本文化
culture = analyzer.analyze_market_culture('JP')
# 返回: 高权力距离、集体主义、高不确定性规避、长期导向

# 2. 获取本地化特征
features = library.get_localization_features('JP')
# 返回: 礼貌谦逊、非常正式、低直接度

# 3. 生成基础回复
base = "Your order #12345 has been shipped. Expected delivery: February 15."

# 4. 本地化适配
localized = generator.generate_localized_response(base, 'JP', customer_info)
```

**输出：**
```json
{
  "localized_response": "お世話になっております。\n\n田中太郎様、ご注文の状況についてご案内いたします。\n\nご注文番号 #12345 は発送が完了いたしました。お届け予定日は2月15日となっております。\n\n配送状況は以下のURLからご確認いただけます。\n[配送追跡URL]\n\nその他ご不明な点がございましたら、お気軽にお問い合わせください。\n\n何卒よろしくお願い申し上げます。\n\n敬具",
  "cultural_notes": {
    "communication_style": "indirect_polite",
    "formality_level": "very_high",
    "directness": "low",
    "honorifics_used": ["様", "お世話になっております", "敬具"],
    "politeness_markers": ["いたします", "ございます", "申し上げます"]
  },
  "timezone_info": {
    "local_time": "2026-02-12 18:30 JST",
    "is_business_hours": false,
    "expected_response": "next business day",
    "business_hours": "09:00-18:00 JST"
  },
  "sensitivity_flags": []
}
```

---

### 示例2：阿联酋市场节日咨询

**场景：** 斋月期间客户咨询

**输入：**
```json
{
  "customer_query": "How long will delivery take during Ramadan?",
  "market": "AE",
  "customer_info": {
    "name": "Ahmed Al-Rashid",
    "customer_id": "AE-001"
  }
}
```

**处理流程：**

```python
# 1. 检测节日
holiday = holiday_manager.get_current_holiday('AE')
# 返回: {'name': 'Ramadan', 'greeting': 'رمضان مبارك', 'impact': 'very_high'}

# 2. 获取本地化特征
features = library.get_localization_features('AE')
# 返回: 尊重正式、非常正式、中等直接度

# 3. 生成回复并添加节日问候
response = generator.generate_localized_response(query, 'AE', customer_info)
```

**输出：**
```json
{
  "localized_response": "رمضان مبارك!\n\nDear Ahmed Al-Rashid,\n\nThank you for your inquiry. During the blessed month of Ramadan, we are committed to serving you with care.\n\nDelivery times may be slightly extended during Ramadan due to adjusted working hours. Your order is expected to arrive within 5-7 business days, insha'Allah.\n\nWe appreciate your understanding and patience during this special time.\n\nIf you have any further questions, please do not hesitate to contact us.\n\nمع أطيب التحيات،\nCustomer Service Team",
  "cultural_notes": {
    "communication_style": "formal_respectful",
    "formality_level": "very_high",
    "directness": "medium",
    "religious_sensitivity": "high",
    "cultural_markers": ["insha'Allah", "blessed month"]
  },
  "timezone_info": {
    "local_time": "2026-02-12 14:30 GST",
    "is_business_hours": true,
    "expected_response": "within 2 hours",
    "business_hours": "09:00-17:00 GST"
  },
  "holiday_adjustments": {
    "current_holiday": "Ramadan",
    "greeting": "رمضان مبارك!",
    "service_impact": "very_high",
    "shipping_notice": "extended_delivery_times",
    "staffing": "reduced"
  },
  "sensitivity_flags": []
}
```

---

### 示例3：德国市场退货申请

**场景：** 德国客户申请退货

**输入：**
```json
{
  "customer_query": "I would like to return this product. It does not meet my expectations.",
  "market": "DE",
  "customer_info": {
    "name": "Hans Müller",
    "customer_id": "DE-001"
  }
}
```

**输出：**
```json
{
  "localized_response": "Sehr geehrter Herr Müller,\n\nvielen Dank für Ihre Nachricht. Wir bedauern sehr, dass das Produkt nicht Ihren Erwartungen entspricht.\n\nGerne helfen wir Ihnen bei der Rückgabe:\n\n1. Bitte senden Sie das Produkt in der originalen Verpackung zurück\n2. Verwenden Sie das beigefügte Rücksendeetikett\n3. Wir erstatten Ihnen den Kaufpreis innerhalb von 14 Tagen\n\nRücksendeetikett: [Link]\n\nFür weitere Fragen stehen wir Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen,\nKundenservice-Team",
  "cultural_notes": {
    "communication_style": "professional_precise",
    "formality_level": "high",
    "directness": "high",
    "formal_address": "Sehr geehrter Herr Müller",
    "structured_information": true,
    "clear_steps": true
  },
  "timezone_info": {
    "local_time": "2026-02-12 13:30 CET",
    "is_business_hours": true,
    "expected_response": "within 2 hours",
    "business_hours": "08:00-17:00 CET"
  },
  "legal_compliance": {
    "return_policy": "14-day right of withdrawal",
    "refund_timeframe": "14 days",
    "consumer_protection": "compliant with EU consumer law"
  }
}
```

---

## 边界情况处理

### 1. 文化误解风险

**问题：** 客户表达可能被误解

**解决方案：**

```python
def handle_cultural_ambiguity(query, market):
    """处理文化模糊性"""
    
    # 识别潜在歧义
    ambiguity_score = detect_cultural_ambiguity(query, market)
    
    if ambiguity_score > 0.7:
        # 使用更安全的表达
        safe_response = generate_safe_response(query, market)
        
        # 添加澄清邀请
        clarification_invitation = generate_clarification_invitation(market)
        
        return {
            'response': safe_response + '\n\n' + clarification_invitation,
            'ambiguity_detected': True,
            'safety_level': 'high'
        }
    
    return {'ambiguity_detected': False}
```

### 2. 时区边界情况

**问题：** 跨越时区边界的服务

**解决方案：**

```python
def handle_timezone_boundary(customer_timezone, agent_timezone):
    """处理时区边界"""
    
    # 计算时差
    time_difference = calculate_time_difference(customer_timezone, agent_timezone)
    
    # 如果时差超过12小时，使用自动回复
    if abs(time_difference) > 12:
        return {
            'use_auto_response': True,
            'scheduled_response_time': 'next_business_day',
            'timezone_notice': f'Time zone difference: {time_difference} hours'
        }
    
    return {'use_auto_response': False}
```

### 3. 宗教禁忌触发

**问题：** 内容可能触犯宗教禁忌

**解决方案：**

```python
def handle_religious_sensitivity(content, market):
    """处理宗教敏感性"""
    
    religious_context = get_religious_context(market)
    
    # 检查内容
    violations = check_religious_violations(content, religious_context)
    
    if violations:
        # 生成替代内容
        alternative = generate_religiously_neutral_alternative(content, market)
        
        return {
            'original_content': content,
            'alternative_content': alternative,
            'violations': violations,
            'requires_human_review': True
        }
    
    return {'violations': []}
```

---

## 质量保证清单

### 本地化质量检查

- [ ] 语言符合当地习惯
- [ ] 礼貌级别适当
- [ ] 无文化禁忌
- [ ] 时区信息准确
- [ ] 节日问候正确
- [ ] 商业礼仪符合当地标准
- [ ] 无敏感内容

### 时区管理检查

- [ ] 时区转换准确
- [ ] 营业时间判断正确
- [ ] 响应时间预期合理
- [ ] 节日调整适当

### 文化适配检查

- [ ] 语调符合当地文化
- [ ] 直接程度适当
- [ ] 个人空间尊重
- [ ] 社交礼仪应用
- [ ] 禁忌词过滤

---

## 数据源和工具清单

### 文化数据库

| 资源 | 覆盖范围 | 成本 | 准确性 |
|------|----------|------|--------|
| Hofstede Insights | 全球 | 免费/付费 | 高 |
| Cultural Atlas | 全球 | $99/月 | 高 |
| Kwintessential | 全球 | 免费 | 中 |

### 时区API

| 服务 | 覆盖范围 | 成本 | 准确性 |
|------|----------|------|--------|
| Google Maps Timezone | 全球 | $5/1000次 | 高 |
| TimeZoneDB | 全球 | $0.001/次 | 高 |
| WorldTimeAPI | 全球 | 免费 | 中 |

### 节日数据库

| 资源 | 覆盖范围 | 成本 | 更新频率 |
|------|----------|------|----------|
| Calendarific | 全球 | $99/年 | 实时 |
| Holiday API | 全球 | $9.99/月 | 每月 |
| Python holidays | 全球 | 免费 | 每年 |

---

## 成功标准

### 短期目标（1-3个月）

- ✅ 支持5个主要市场本地化
- ✅ 本地化准确率 ≥ 90%
- ✅ 文化错误率 ≤ 2%
- ✅ 客户满意度 ≥ 4.3/5.0

### 中期目标（3-6个月）

- ✅ 支持10个市场本地化
- ✅ 本地化准确率 ≥ 95%
- ✅ 文化错误率 ≤ 1%
- ✅ 客户满意度 ≥ 4.5/5.0

### 长期目标（6-12个月）

- ✅ 支持20个市场本地化
- ✅ 本地化准确率 ≥ 98%
- ✅ 文化错误率 ≤ 0.5%
- ✅ 客户满意度 ≥ 4.7/5.0

---

## 相关技能

- **cross-border-cs** - 跨境多语种客服与售后管理
- **crisis-management** - 危机公关与差评处理
- **compliance-management** - 跨境合规监管与风险控制

---

**技能版本：** 1.0.0  
**最后更新：** 2026-02-12  
**维护团队：** 跨境电商技术团队