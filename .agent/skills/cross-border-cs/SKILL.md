# Agent Skill: 跨境多语种客服与售后管理

---

**name:** cross-border-cs
**description:** 跨境多语种智能客服Agent技能 - 支持24/7多语言客户服务、售后问题处理、订单跟踪和客户关系管理
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
  - customer_query: string (客户咨询内容)
  - language: string (客户语言)
  - channel: string (沟通渠道)
  - customer_info: object (客户信息)
  - order_info: object (订单信息)
**output_format:**
  - response: string (智能回复)
  - action_plan: array (后续行动)
  - escalation_flag: boolean (是否升级)
  - sentiment: string (客户情绪)
**estimated_time:** 30秒-5分钟
**complexity:** 中级
**tags:**
  - cross-border-compass
  - customer-service
  - multilingual
  - after-sales

---

## 技能概述

本技能为跨境电商提供完整的智能客服解决方案，支持多语言实时翻译、智能问题识别、自动回复生成和售后问题处理，帮助商家提升客户满意度和复购率。

### 核心能力

- **多语言实时翻译**：支持全球主要语言的实时翻译和本地化表达
- **智能问题分类**：自动识别客户问题类型（订单、产品、物流、售后等）
- **自动回复生成**：基于知识库生成符合品牌调性的专业回复
- **售后问题处理**：退货、退款、换货等售后流程自动化
- **客户情绪分析**：实时分析客户情绪，识别潜在风险
- **订单跟踪查询**：自动查询并回复物流状态

### 适用场景

- Amazon、eBay、Shopee、Lazada等平台客户咨询
- 独立站Live Chat客服
- Email邮件咨询处理
- 社交媒体客户互动
- 售后问题处理

---

## 标准作业流程（SOP）

### 阶段一：客户咨询接收（实时）

#### 1.1 多语言识别与翻译

**执行步骤：**

```python
# 语言检测和翻译
class LanguageProcessor:
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'ru'
        ]
    
    def detect_language(self, text):
        """检测客户语言"""
        detected = self.translator.detect(text)
        return detected.lang
    
    def translate_to_chinese(self, text, source_lang):
        """翻译为中文供内部理解"""
        if source_lang == 'zh':
            return text
        translation = self.translator.translate(text, src=source_lang, dest='zh')
        return translation.text
    
    def translate_to_target(self, text, target_lang):
        """翻译为目标语言回复客户"""
        if target_lang == 'zh':
            return text
        translation = self.translator.translate(text, src='zh', dest=target_lang)
        return translation.text
```

**支持语言列表：**

| 语言 | 代码 | 市场覆盖 | 优先级 |
|------|------|----------|--------|
| 英语 | en | 全球 | 高 |
| 西班牙语 | es | 西班牙、拉美 | 高 |
| 法语 | fr | 法国、非洲 | 中 |
| 德语 | de | 德国、奥地利 | 中 |
| 日语 | ja | 日本 | 高 |
| 韩语 | ko | 韩国 | 中 |
| 阿拉伯语 | ar | 中东 | 中 |
| 葡萄牙语 | pt | 巴西 | 中 |
| 俄语 | ru | 俄罗斯、东欧 | 中 |

#### 1.2 客户信息加载

**信息提取：**

```python
# 客户信息管理
class CustomerManager:
    def load_customer_profile(self, customer_id):
        """加载客户档案"""
        profile = {
            'customer_id': customer_id,
            'name': '',
            'email': '',
            'phone': '',
            'language': 'en',
            'timezone': '',
            'vip_level': 'normal',
            'total_orders': 0,
            'total_spent': 0,
            'last_order_date': None,
            'refund_rate': 0,
            'complaint_history': []
        }
        return profile
    
    def get_order_history(self, customer_id, limit=5):
        """获取最近订单"""
        orders = []
        # 从数据库查询最近订单
        return orders
    
    def check_blacklist(self, customer_id):
        """检查黑名单"""
        is_blacklisted = False
        reason = None
        return is_blacklisted, reason
```

---

### 阶段二：问题智能识别（<1分钟）

#### 2.1 问题分类

**分类模型：**

```python
# 问题分类器
class IssueClassifier:
    def __init__(self):
        self.categories = {
            'order_inquiry': ['订单', '订单号', '状态', '发货', 'delivery', 'order'],
            'product_inquiry': ['产品', '规格', '尺寸', '材质', 'product', 'size'],
            'shipping_inquiry': ['物流', '快递', '跟踪', 'tracking', 'shipping'],
            'payment_inquiry': ['支付', '付款', '信用卡', 'payment', 'credit card'],
            'return_request': ['退货', 'return', 'refund'],
            'complaint': ['投诉', '质量', '差评', 'complaint', 'quality'],
            'other': []
        }
    
    def classify(self, query, language):
        """分类客户问题"""
        query_lower = query.lower()
        scores = {}
        
        for category, keywords in self.categories.items():
            score = 0
            for keyword in keywords:
                if keyword in query_lower:
                    score += 1
            scores[category] = score
        
        # 返回得分最高的分类
        top_category = max(scores, key=scores.get)
        return top_category, scores
```

**分类映射表：**

| 问题类型 | 关键词 | 处理优先级 | SLA |
|----------|--------|------------|-----|
| 订单查询 | 订单号、发货、状态 | 中 | 2小时 |
| 产品咨询 | 规格、尺寸、材质 | 低 | 4小时 |
| 物流跟踪 | 快递、运输、跟踪 | 高 | 1小时 |
| 支付问题 | 付款、信用卡、扣款 | 高 | 30分钟 |
| 退货申请 | 退货、退款、换货 | 高 | 2小时 |
| 投诉建议 | 投诉、质量、差评 | 极高 | 15分钟 |

#### 2.2 意图识别

**意图分析：**

```python
# 意图识别器
class IntentRecognizer:
    def __init__(self):
        self.intents = {
            'query': ['查询', '请问', '想知道', 'query', 'ask'],
            'request': ['请求', '希望', '想要', 'request', 'want'],
            'complain': ['投诉', '不满', '差评', 'complain', 'unsatisfied'],
            'cancel': ['取消', '不想', 'cancel'],
            'urgent': ['紧急', '马上', 'urgent', 'immediately']
        }
    
    def recognize_intent(self, query):
        """识别客户意图"""
        query_lower = query.lower()
        detected_intents = []
        
        for intent, keywords in self.intents.items():
            for keyword in keywords:
                if keyword in query_lower:
                    detected_intents.append(intent)
        
        return detected_intents
    
    def detect_urgency(self, query):
        """检测紧急程度"""
        urgent_keywords = ['urgent', 'emergency', 'immediately', '紧急', '马上']
        for keyword in urgent_keywords:
            if keyword in query.lower():
                return 'high'
        return 'normal'
```

#### 2.3 情绪分析

```python
# 情绪分析器
class SentimentAnalyzer:
    def analyze_sentiment(self, query, language):
        """分析客户情绪"""
        # 使用预训练的情感分析模型
        sentiment_scores = {
            'positive': 0.0,
            'neutral': 0.0,
            'negative': 0.0,
            'angry': 0.0,
            'frustrated': 0.0
        }
        
        # 分析关键词和语气
        negative_words = ['bad', 'terrible', 'awful', 'disappointed', 'angry', 
                         '差', '糟糕', '失望', '生气']
        positive_words = ['good', 'great', 'excellent', 'happy', 'satisfied',
                         '好', '优秀', '满意', '高兴']
        
        query_lower = query.lower()
        for word in negative_words:
            if word in query_lower:
                sentiment_scores['negative'] += 1
        
        for word in positive_words:
            if word in query_lower:
                sentiment_scores['positive'] += 1
        
        # 确定主导情绪
        dominant_sentiment = max(sentiment_scores, key=sentiment_scores.get)
        
        return {
            'sentiment': dominant_sentiment,
            'scores': sentiment_scores,
            'risk_level': self.calculate_risk(sentiment_scores)
        }
    
    def calculate_risk(self, scores):
        """计算风险等级"""
        if scores['angry'] > 0 or scores['negative'] > 2:
            return 'high'
        elif scores['negative'] > 0:
            return 'medium'
        else:
            return 'low'
```

---

### 阶段三：智能回复生成（<1分钟）

#### 3.1 知识库检索

```python
# 知识库管理
class KnowledgeBase:
    def __init__(self):
        self.faq_database = {}
        self.response_templates = {}
    
    def search_faq(self, query, category, language):
        """搜索FAQ"""
        # 使用向量相似度搜索
        faq_results = []
        
        # 返回最相关的FAQ
        return faq_results[:5]
    
    def get_response_template(self, category, intent, language):
        """获取回复模板"""
        template_key = f"{category}_{intent}_{language}"
        return self.response_templates.get(template_key)
    
    def get_product_info(self, product_id, language):
        """获取产品信息"""
        product_info = {
            'product_id': product_id,
            'name': '',
            'description': '',
            'specifications': {},
            'images': [],
            'faqs': []
        }
        return product_info
```

#### 3.2 回复生成

```python
# 回复生成器
class ResponseGenerator:
    def __init__(self):
        self.language_processor = LanguageProcessor()
        self.knowledge_base = KnowledgeBase()
    
    def generate_response(self, customer_query, customer_info, issue_type, language):
        """生成智能回复"""
        
        # 1. 检索相关信息
        faq_results = self.knowledge_base.search_faq(customer_query, issue_type, language)
        
        # 2. 获取模板
        template = self.knowledge_base.get_response_template(issue_type, 'query', language)
        
        # 3. 个性化回复
        personalized_response = self.personalize(template, customer_info)
        
        # 4. 翻译为目标语言
        if language != 'zh':
            response = self.language_processor.translate_to_target(personalized_response, language)
        else:
            response = personalized_response
        
        return response
    
    def personalize(self, template, customer_info):
        """个性化回复"""
        # 替换占位符
        personalized = template.replace('{customer_name}', customer_info['name'])
        personalized = personalized.replace('{customer_id}', customer_info['customer_id'])
        
        return personalized
```

**回复模板示例：**

```yaml
订单查询模板:
  en: |
    Dear {customer_name},
    
    Thank you for contacting us. Your order #{order_id} is currently {status}.
    Estimated delivery date: {delivery_date}
    
    Tracking number: {tracking_number}
    You can track your package at: {tracking_url}
    
    If you have any other questions, please let us know.
    
    Best regards,
    {company_name} Customer Service Team
  
  es: |
    Estimado/a {customer_name},
    
    Gracias por contactarnos. Su pedido #{order_id} se encuentra actualmente {status}.
    Fecha de entrega estimada: {delivery_date}
    
    Número de seguimiento: {tracking_number}
    Puede rastrear su paquete en: {tracking_url}
    
    Si tiene alguna otra pregunta, por favor háganoslo saber.
    
    Saludos cordiales,
    Equipo de Atención al Cliente de {company_name}

退货处理模板:
  en: |
    Dear {customer_name},
    
    I'm sorry to hear that you're not satisfied with your purchase. 
    We'd be happy to process your return request.
    
    Return process:
    1. Please pack the item in its original packaging
    2. Print the return label from: {return_label_url}
    3. Drop off at any {carrier} location
    4. We'll process your refund within 3-5 business days
    
    Your return authorization number: {ra_number}
    
    If you need any assistance, please reply to this message.
    
    Best regards,
    {company_name} Customer Service Team
```

---

### 阶段四：售后问题处理（5-30分钟）

#### 4.1 退货申请处理

```python
# 退货处理器
class ReturnProcessor:
    def process_return_request(self, customer_id, order_id, reason, language):
        """处理退货申请"""
        
        # 1. 验证订单
        order = self.validate_order(customer_id, order_id)
        if not order:
            return {'status': 'error', 'message': 'Invalid order'}
        
        # 2. 检查退货政策
        eligible = self.check_return_eligibility(order)
        if not eligible:
            return {'status': 'error', 'message': 'Not eligible for return'}
        
        # 3. 生成退货授权号
        ra_number = self.generate_ra_number(order)
        
        # 4. 生成退货标签
        return_label = self.generate_return_label(order, ra_number)
        
        # 5. 发送退货说明
        instructions = self.generate_return_instructions(order, ra_number, language)
        
        return {
            'status': 'success',
            'ra_number': ra_number,
            'return_label': return_label,
            'instructions': instructions,
            'refund_amount': order['total_amount']
        }
    
    def check_return_eligibility(self, order):
        """检查退货资格"""
        # 检查退货时间窗口（通常30天）
        days_since_delivery = self.calculate_days_since_delivery(order)
        if days_since_delivery > 30:
            return False
        
        # 检查产品类型（某些产品不可退货）
        if order['product_type'] in ['personalized', 'perishable']:
            return False
        
        return True
```

**退货政策模板：**

```yaml
退货政策:
  时间窗口: 30天
  退货条件:
    - 产品未使用
    - 原包装完整
    - 配件齐全
    - 保留购买凭证
  不可退货产品:
    - 定制产品
    - 易腐商品
    - 内衣裤
    - 个人护理用品
  退货流程:
    1. 提交退货申请
    2. 获取退货授权号(RA)
    3. 打印退货标签
    4. 寄回商品
    5. 仓库验收
    6. 退款处理
  退款方式:
    - 原支付方式退款
    - 处理时间: 3-5个工作日
  运费承担:
    - 质量问题: 卖家承担
    - 个人原因: 买家承担
```

#### 4.2 退款处理

```python
# 退款处理器
class RefundProcessor:
    def process_refund(self, ra_number, amount, refund_method):
        """处理退款"""
        
        # 1. 验证退货授权
        ra_info = self.get_ra_info(ra_number)
        if not ra_info or ra_info['status'] != 'received':
            return {'status': 'error', 'message': 'Return not received'}
        
        # 2. 检查商品状态
        inspection_result = self.inspect_returned_item(ra_number)
        if inspection_result['condition'] != 'acceptable':
            return {
                'status': 'partial',
                'message': 'Item condition not acceptable',
                'refund_amount': inspection_result['partial_refund']
            }
        
        # 3. 执行退款
        refund_result = self.execute_refund(
            order_id=ra_info['order_id'],
            amount=amount,
            method=refund_method
        )
        
        # 4. 发送退款通知
        self.send_refund_notification(ra_info['customer_id'], refund_result)
        
        return {
            'status': 'success',
            'refund_id': refund_result['refund_id'],
            'refund_amount': amount,
            'processing_time': '3-5 business days'
        }
```

#### 4.3 换货处理

```python
# 换货处理器
class ExchangeProcessor:
    def process_exchange(self, customer_id, order_id, new_item_id, reason):
        """处理换货申请"""
        
        # 1. 验证订单
        order = self.validate_order(customer_id, order_id)
        
        # 2. 检查库存
        stock_available = self.check_inventory(new_item_id)
        if not stock_available:
            return {'status': 'error', 'message': 'Item out of stock'}
        
        # 3. 生成换货单
        exchange_order = self.create_exchange_order(order, new_item_id)
        
        # 4. 发送退货标签
        return_label = self.generate_return_label(order, exchange_order['exchange_id'])
        
        # 5. 安排新商品发货
        shipping_info = self.schedule_shipment(new_item_id, order['shipping_address'])
        
        return {
            'status': 'success',
            'exchange_id': exchange_order['exchange_id'],
            'return_label': return_label,
            'new_item_tracking': shipping_info['tracking_number']
        }
```

---

### 阶段五：客户关系管理（持续）

#### 5.1 客户档案更新

```python
# 客户档案管理器
class CustomerProfileManager:
    def update_interaction(self, customer_id, interaction_data):
        """更新客户互动记录"""
        
        # 记录互动
        interaction = {
            'timestamp': datetime.now(),
            'channel': interaction_data['channel'],
            'issue_type': interaction_data['issue_type'],
            'sentiment': interaction_data['sentiment'],
            'resolution': interaction_data['resolution'],
            'agent': interaction_data['agent']
        }
        
        # 更新客户档案
        self.add_to_history(customer_id, interaction)
        
        # 更新客户指标
        self.update_customer_metrics(customer_id)
    
    def update_customer_metrics(self, customer_id):
        """更新客户指标"""
        profile = self.get_customer_profile(customer_id)
        
        # 计算满意度
        profile['satisfaction_score'] = self.calculate_satisfaction(customer_id)
        
        # 计算忠诚度
        profile['loyalty_score'] = self.calculate_loyalty(customer_id)
        
        # 更新VIP等级
        profile['vip_level'] = self.determine_vip_level(profile)
        
        return profile
```

#### 5.2 满意度调查

```python
# 满意度调查器
class SatisfactionSurvey:
    def send_survey(self, customer_id, interaction_id):
        """发送满意度调查"""
        
        survey = {
            'survey_id': self.generate_survey_id(),
            'customer_id': customer_id,
            'interaction_id': interaction_id,
            'questions': [
                'How satisfied were you with our service?',
                'How would you rate the agent\'s knowledge?',
                'Was your issue resolved to your satisfaction?',
                'How likely are you to recommend us to others?'
            ],
            'rating_scale': '1-5',
            'sent_at': datetime.now()
        }
        
        # 发送邮件或短信
        self.send_survey_email(customer_id, survey)
        
        return survey['survey_id']
    
    def analyze_survey_results(self, survey_id):
        """分析调查结果"""
        results = self.get_survey_responses(survey_id)
        
        analysis = {
            'average_rating': sum(results) / len(results),
            'nps_score': self.calculate_nps(results),
            'sentiment_distribution': self.analyze_sentiment_distribution(results)
        }
        
        return analysis
```

---

## 关键指标KPI

### 客服质量指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 首次响应时间 | ≤ 30秒 | 首次回复时间 - 咨询时间 | 实时 |
| 平均解决时间 | ≤ 5分钟 | 解决时间 - 咨询时间 | 每日 |
| 一次解决率 | ≥ 80% | 一次解决数 / 总咨询数 | 每日 |
| 客户满意度 | ≥ 4.5/5.0 | 平均满意度评分 | 每周 |
| 转化率 | ≥ 15% | 转化数 / 咨询数 | 每周 |

### 售后指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 退货率 | ≤ 5% | 退货订单数 / 总订单数 | 每月 |
| 退款处理时间 | ≤ 3天 | 退款完成时间 - 退货申请时间 | 每周 |
| 换货成功率 | ≥ 95% | 成功换货数 / 换货申请数 | 每月 |
| 退货成本占比 | ≤ 8% | 退货总成本 / 总销售额 | 每月 |

### 客户关系指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 复购率 | ≥ 30% | 复购客户数 / 总客户数 | 每月 |
| NPS评分 | ≥ 50 | 推荐者% - 贬损者% | 每季度 |
| 客户留存率 | ≥ 75% | 留存客户数 / 期初客户数 | 每月 |
| 平均订单价值 | 增长≥10% | 当前AOV - 上期AOV | 每月 |

---

## 实战示例

### 示例1：订单状态查询（英语）

**场景：** 美国客户查询订单状态

**输入：**
```json
{
  "customer_query": "Hi, I'd like to check the status of my order #12345. When will it be delivered?",
  "language": "en",
  "channel": "email",
  "customer_info": {
    "customer_id": "CUST-001",
    "name": "John Smith",
    "email": "john.smith@email.com"
  },
  "order_info": {
    "order_id": "12345",
    "status": "shipped",
    "tracking_number": "USPS1234567890"
  }
}
```

**处理流程：**

```python
# 1. 语言检测
language = detect_language("Hi, I'd like to check...")  # 返回 'en'

# 2. 问题分类
category = classify_issue("check the status of my order")  # 返回 'order_inquiry'

# 3. 查询订单信息
order_status = get_order_status("12345")
# 返回: {'status': 'shipped', 'tracking': 'USPS1234567890', 'eta': '2026-02-15'}

# 4. 生成回复
response = generate_response(order_status, language)
```

**输出：**
```json
{
  "response": "Dear John Smith,\n\nThank you for contacting us! Your order #12345 has been shipped and is currently in transit.\n\nTracking Number: USPS1234567890\nEstimated Delivery: February 15, 2026\n\nYou can track your package here: https://tools.usps.com/track.html\n\nIf you have any other questions, please don't hesitate to reach out.\n\nBest regards,\nCustomer Service Team",
  "action_plan": ["send_tracking_info", "follow_up_in_3_days"],
  "escalation_flag": false,
  "sentiment": "neutral",
  "response_time": "30 seconds"
}
```

---

### 示例2：退货申请处理（西班牙语）

**场景：** 西班牙客户申请退货

**输入：**
```json
{
  "customer_query": "Hola, recibí mi pedido pero no es lo que esperaba. Quiero devolverlo.",
  "language": "es",
  "channel": "chat",
  "customer_info": {
    "customer_id": "CUST-002",
    "name": "Maria Garcia"
  },
  "order_info": {
    "order_id": "67890",
    "order_date": "2026-01-20",
    "product_id": "PROD-123"
  }
}
```

**处理流程：**

```python
# 1. 翻译为中文
query_zh = translate_to_chinese("Hola, recibí mi pedido...", "es")
# 返回: "你好，我收到了订单但不是我期望的。我想退货。"

# 2. 问题分类
category = classify_issue(query_zh)  # 返回 'return_request'

# 3. 验证退货资格
eligibility = check_return_eligibility("67890")
# 返回: {'eligible': true, 'days_since_delivery': 10}

# 4. 生成退货授权
ra_number = generate_ra_number("67890")  # 返回 "RA-20260212-001"

# 5. 生成西班牙语回复
response_es = generate_return_instructions("RA-20260212-001", "es")
```

**输出：**
```json
{
  "response": "Estimada Maria Garcia,\n\nLamentamos saber que el producto no cumplió con sus expectativas. Estaremos encantados de procesar su devolución.\n\nNúmero de Autorización de Devolución (RA): RA-20260212-001\n\nInstrucciones de devolución:\n1. Por favor empaquete el artículo en su embalaje original\n2. Imprima la etiqueta de devolución desde: [return_label_url]\n3. Entregue el paquete en cualquier oficina de correos\n4. Procesaremos su reembolso dentro de 3-5 días hábiles\n\nSi necesita ayuda adicional, por favor responda a este mensaje.\n\nSaludos cordiales,\nEquipo de Atención al Cliente",
  "action_plan": [
    "send_return_label",
    "update_order_status_to_returning",
    "schedule_refund_processing"
  ],
  "escalation_flag": false,
  "sentiment": "neutral",
  "ra_number": "RA-20260212-001",
  "refund_amount": 29.99
}
```

---

### 示例3：投诉处理（高情绪风险）

**场景：** 客户因延迟发货愤怒投诉

**输入：**
```json
{
  "customer_query": "This is absolutely ridiculous! I ordered 2 weeks ago and still haven't received anything! You guys are thieves! I want my money back NOW!",
  "language": "en",
  "channel": "chat",
  "customer_info": {
    "customer_id": "CUST-003",
    "name": "David Wilson",
    "vip_level": "normal"
  }
}
```

**处理流程：**

```python
# 1. 情绪分析
sentiment = analyze_sentiment(customer_query, "en")
# 返回: {'sentiment': 'angry', 'risk_level': 'high'}

# 2. 识别紧急度
urgency = detect_urgency(customer_query)  # 返回 'high'

# 3. 查询订单详情
order = get_order_details("CUST-003")
# 发现: 订单确实延迟了12天，物流异常

# 4. 升级处理
escalation_flag = True

# 5. 生成道歉和解决方案
response = generate_apology_response(order, urgency)
```

**输出：**
```json
{
  "response": "Dear David Wilson,\n\nI sincerely apologize for the unacceptable delay with your order. I understand how frustrating this must be and I take full responsibility for this situation.\n\nI've personally looked into your order and can see it's been delayed due to a shipping carrier issue. Here's what I'm going to do:\n\n1. EXPEDITE YOUR ORDER: I'm upgrading your shipping to express delivery at no extra cost\n2. REFUND YOUR SHIPPING: I'm issuing a full refund of your shipping charges immediately\n3. $20 GIFT CARD: As a gesture of our apology, I'm adding a $20 gift card to your account\n\nYour updated tracking information shows delivery by February 14th.\n\nI'll personally monitor your order and will send you updates every 24 hours until it arrives.\n\nIf you'd prefer a full refund instead, please let me know and I'll process it immediately.\n\nAgain, I deeply apologize for this experience and thank you for your patience.\n\nSincerely,\nCustomer Service Manager",
  "action_plan": [
    "upgrade_shipping_to_express",
    "refund_shipping_charges",
    "issue_20_gift_card",
    "escalate_to_manager",
    "schedule_daily_follow_up",
    "mark_high_priority_case"
  ],
  "escalation_flag": true,
  "sentiment": "angry",
  "risk_level": "high",
  "compensation_offered": {
    "shipping_refund": 9.99,
    "gift_card": 20.00,
    "total": 29.99
  }
}
```

---

## 边界情况处理

### 1. 语言不支持

**问题：** 客户使用不被支持的语言

**解决方案：**

```python
def handle_unsupported_language(query, detected_lang):
    """处理不支持的语言"""
    
    # 尝试识别相近语言
    similar_languages = find_similar_languages(detected_lang)
    
    if similar_languages:
        # 使用相近语言翻译
        response = translate_to_best_supported(query, similar_languages)
    else:
        # 生成通用回复（使用英语）
        response = generate_multilingual_fallback_response()
    
    return {
        'response': response,
        'language_detected': detected_lang,
        'language_supported': False,
        'fallback_language': 'en'
    }
```

### 2. 客户信息缺失

**问题：** 无法识别客户或获取订单信息

**解决方案：**

```python
def handle_missing_customer_info(query):
    """处理客户信息缺失"""
    
    # 提取可能的订单号
    order_number = extract_order_number(query)
    
    if order_number:
        # 通过订单号查找客户
        customer = find_customer_by_order(order_number)
        if customer:
            return {'status': 'found', 'customer': customer}
    
    # 请求提供更多信息
    response = generate_information_request(query)
    
    return {
        'response': response,
        'information_needed': ['order_number', 'email', 'phone'],
        'status': 'information_required'
    }
```

### 3. 恶意投诉/欺诈

**问题：** 客户恶意投诉或试图欺诈

**解决方案：**

```python
def detect_malicious_behavior(customer_id, query, history):
    """检测恶意行为"""
    
    risk_score = 0
    
    # 检查历史投诉频率
    recent_complaints = count_recent_complaints(customer_id, days=30)
    if recent_complaints > 5:
        risk_score += 3
    
    # 检查退货率
    return_rate = calculate_return_rate(customer_id)
    if return_rate > 0.3:
        risk_score += 2
    
    # 检查退款申请模式
    refund_pattern = analyze_refund_pattern(customer_id)
    if refund_pattern['suspicious']:
        risk_score += 3
    
    # 检查黑名单
    is_blacklisted = check_blacklist(customer_id)
    if is_blacklisted:
        risk_score += 5
    
    # 决策
    if risk_score >= 5:
        return {
            'malicious': True,
            'risk_score': risk_score,
            'action': 'flag_for_review',
            'escalation': True
        }
    
    return {'malicious': False, 'risk_score': risk_score}
```

### 4. 系统故障

**问题：** 客服系统出现故障

**解决方案：**

```python
def handle_system_failure(error_type):
    """处理系统故障"""
    
    fallback_responses = {
        'database_error': "I'm experiencing technical difficulties accessing your information. Please try again in a few minutes or contact us by phone at [phone_number].",
        'translation_error': "I'm having trouble with the translation service. Please try again or contact us in English.",
        'order_system_down': "Our order system is currently down for maintenance. Please try again later or check your order status at [order_tracking_url]."
    }
    
    return {
        'response': fallback_responses.get(error_type, "I'm experiencing technical difficulties. Please try again later."),
        'error_type': error_type,
        'estimated_resolution': '15 minutes',
        'alternative_contact': 'phone: 1-800-XXX-XXXX, email: support@example.com'
    }
```

---

## 质量保证清单

### 回复质量检查

- [ ] 语言准确无误（无语法错误）
- [ ] 语调符合品牌形象
- [ ] 完整回答客户问题
- [ ] 提供明确的下一步指引
- [ ] 包含适当的礼貌用语
- [ ] 遵循公司政策
- [ ] 无承诺超出权限的内容

### 售后处理检查

- [ ] 验证订单有效性
- [ ] 检查退货资格
- [ ] 生成正确的退货授权号
- [ ] 提供准确的退货地址
- [ ] 明确退款方式和时间
- [ ] 更新订单状态
- [ ] 发送确认邮件

### 客户关系检查

- [ ] 更新客户互动记录
- [ ] 记录客户情绪
- [ ] 更新满意度数据
- [ ] 发送后续跟进
- [ ] 识别升级机会
- [ ] 更新VIP等级（如适用）

---

## 数据源和工具清单

### 翻译服务

| 服务 | 语言数量 | 成本 | 准确率 |
|------|----------|------|--------|
| Google Translate API | 100+ | $20/百万字符 | 85-90% |
| DeepL API | 30+ | $5.99/月 | 90-95% |
| Microsoft Translator | 90+ | $10/百万字符 | 85-90% |
| Amazon Translate | 70+ | $15/百万字符 | 85-90% |

### 情绪分析工具

| 工具 | 语言支持 | 成本 | 准确率 |
|------|----------|------|--------|
| Google Cloud NLP | 多语言 | $0.001/文本单元 | 85-90% |
| AWS Comprehend | 多语言 | $0.0001/单位 | 80-85% |
| Azure Text Analytics | 多语言 | $0.001/文本记录 | 85-90% |

### 客服平台集成

| 平台 | API支持 | 成本 | 特性 |
|------|---------|------|------|
| Zendesk | 是 | $50/月起 | 全功能 |
| Intercom | 是 | $79/月起 | 实时聊天 |
| LiveChat | 是 | $16/月起 | 基础功能 |
| Freshdesk | 是 | $15/月起 | 经济实惠 |

---

## 成功标准

### 短期目标（1-3个月）

- ✅ 实现英语、西班牙语、日语、韩语支持
- ✅ 客户满意度 ≥ 4.3/5.0
- ✅ 首次响应时间 ≤ 45秒
- ✅ 一次解决率 ≥ 75%

### 中期目标（3-6个月）

- ✅ 支持10种以上语言
- ✅ 客户满意度 ≥ 4.5/5.0
- ✅ 自动化解决率 ≥ 60%
- ✅ 退货处理时间 ≤ 2天

### 长期目标（6-12个月）

- ✅ 支持20种以上语言
- ✅ 客户满意度 ≥ 4.7/5.0
- ✅ 自动化解决率 ≥ 80%
- ✅ NPS评分 ≥ 60

---

## 相关技能

- **crisis-management** - 危机公关与差评处理
- **localization-cs** - 本地化客服适配
- **compliance-management** - 跨境合规监管与风险控制

---

**技能版本：** 1.0.0  
**最后更新：** 2026-02-12  
**维护团队：** 跨境电商技术团队