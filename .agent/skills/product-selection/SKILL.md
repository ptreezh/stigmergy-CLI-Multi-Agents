# Agent Skill: 跨境电商选品策略

---

**name:** product-selection
**description:** 智能选品策略Agent技能 - 基于多维度数据分析，实现市场机会识别、竞品分析和ROI预测的全流程选品决策
**version:** 1.0.0
**author:** cross-border-ecommerce-team
**tags:** [ecommerce, product-selection, market-analysis, cross-border]
**category:** business-intelligence
**requires:** [market-data-provider, competitor-monitoring, profit-calculator]
**compatibility:** [amazon, shopee, lazada, temu, shein]
**language:** zh-CN
**last_updated:** 2026-02-12

---

## 技能概述

本技能为跨境电商提供完整的智能选品解决方案，整合市场分析、竞品调研、需求预测和ROI评估四大核心能力，帮助商家在复杂多变的跨境市场中快速识别高潜力产品。

### 核心能力

- **市场机会识别**：基于大数据分析发现蓝海市场机会
- **竞品智能分析**：自动追踪竞品动态，识别竞争空白点
- **需求精准预测**：运用机器学习预测产品需求趋势
- **ROI快速评估**：实时计算产品投资回报率和盈利周期

### 适用场景

- 新品开发与选品决策
- 季节性产品选品规划
- 平台新品发布选品
- 市场扩张选品策略

---

## 标准作业流程（SOP）

### 阶段一：市场分析（2-3天）

#### 1.1 市场机会扫描

**执行步骤：**

1. **数据源接入**
   ```bash
   # 连接市场数据API
   - Amazon Best Sellers API
   - Google Trends API
   - Shopee Trending Products API
   - 社交媒体趋势监控（TikTok/Instagram）
   ```

2. **关键词热度分析**
   ```python
   # 关键词热度评分算法
   def calculate_keyword_score(search_volume, growth_rate, competition):
       """
       计算关键词热度得分
       - search_volume: 月搜索量
       - growth_rate: 增长率（%）
       - competition: 竞争度指数（1-100）
       """
       volume_score = min(search_volume / 10000, 100)  # 搜索量得分
       growth_score = min(growth_rate * 2, 100)  # 增长率得分
       competition_penalty = competition  # 竞争度惩罚
       
       final_score = (volume_score * 0.4 + growth_score * 0.4 + competition_penalty * 0.2)
       return final_score
   ```

3. **趋势识别**
   - 季节性趋势识别
   - 新兴趋势预警
   - 跨品类趋势交叉分析

**输出交付物：**
- 市场机会报告（JSON格式）
- 热门关键词清单（Top 100）
- 趋势分析图表

**关键指标：**
- 关键词热度得分 ≥ 70分
- 月搜索量 ≥ 10,000
- 增长率 ≥ 20%

#### 1.2 目标市场选择

**评估维度：**

| 维度 | 权重 | 评估标准 |
|------|------|----------|
| 市场规模 | 30% | 年GMV ≥ 1000万美元 |
| 增长潜力 | 25% | 年增长率 ≥ 15% |
| 竞争强度 | 20% | CR5 ≤ 40% |
| 物流成本 | 15% | 平均物流成本占比 ≤ 20% |
| 政策风险 | 10% | 风险评级 ≤ B级 |

**决策矩阵：**
```
市场综合得分 = Σ(维度得分 × 权重)
≥ 80分：高优先级市场
70-79分：中优先级市场
< 70分：低优先级市场
```

---

### 阶段二：竞品分析（2-3天）

#### 2.1 竞品识别

**工具与方法：**

```python
# 竞品识别算法
def identify_competitors(product_category, platform):
    """
    识别主要竞品
    """
    competitors = []
    
    # 方法1: 搜索结果Top 20
    top_results = search_top_listings(category, platform, limit=20)
    competitors.extend(top_results[:10])
    
    # 方法2: 广告竞品追踪
    ad_competitors = track_ad_keywords(category, platform)
    competitors.extend(ad_competitors[:5])
    
    # 方法3: 关联产品推荐
    related_products = get_related_products(category, platform)
    competitors.extend(related_products[:5])
    
    # 去重并排序
    competitors = deduplicate_and_rank(competitors)
    
    return competitors
```

#### 2.2 竞品深度分析

**分析框架：**

```yaml
竞品分析报告模板:
  基本信息:
    ASIN/SKU: "XXXXXXXX"
    产品名称: "示例产品"
    品牌: "示例品牌"
    上架时间: "2024-01-01"
  
  销售表现:
    月销量: 5,000
    月GMV: $100,000
    销售增长率: 15%
    评分: 4.5/5.0
    评论数: 1,200
  
  定价策略:
    当前价格: $19.99
    价格历史: [$22.99, $21.99, $20.99, $19.99]
    促销频率: 每月2次
    促销力度: -20%
  
  产品特征:
    核心卖点: ["卖点1", "卖点2", "卖点3"]
    差异化特征: ["特色1", "特色2"]
    用户痛点: ["痛点1", "痛点2"]
  
  营销策略:
    广告投放: 是
    社交媒体: 是
    KOL合作: 是
    内容营销: 是
  
  SWOT分析:
    优势: ["优势1", "优势2"]
    劣势: ["劣势1", "劣势2"]
    机会: ["机会1", "机会2"]
    威胁: ["威胁1", "威胁2"]
```

**数据采集工具：**

```bash
# 竞品数据采集脚本
pip install helium selenium requests beautifulsoup4

# 运行采集
python competitor_analyzer.py \
  --category "home decor" \
  --platform amazon \
  --output competitors_data.json
```

#### 2.3 竞争空白点识别

**识别方法：**

1. **评论分析**
   - 提取负面评论 → 识别未满足需求
   - 提取正面评论 → 确认核心价值点
   - 提取建议评论 → 发现改进机会

2. **对比分析**
   - 功能对比：竞品缺失的功能
   - 价格对比：价格空白带
   - 服务对比：服务空白点

3. **市场细分**
   - 未覆盖的细分人群
   - 未满足的场景需求
   - 未开发的价格区间

**输出交付物：**
- 竞品分析报告（详细）
- 竞争空白点清单（优先级排序）
- 差异化策略建议

---

### 阶段三：需求预测（1-2天）

#### 3.1 历史数据分析

**数据准备：**

```python
# 需求预测数据模型
class DemandPredictor:
    def __init__(self):
        self.historical_data = []
        self.seasonal_patterns = {}
        self.trend_model = None
    
    def load_data(self, time_range='2y'):
        """加载历史数据"""
        # 数据来源：平台销售数据、Google Trends、搜索数据
        pass
    
    def analyze_seasonality(self):
        """分析季节性模式"""
        # 使用时间序列分解
        pass
    
    def predict_demand(self, forecast_period=180):
        """预测未来需求"""
        # 使用Prophet或LSTM模型
        pass
```

**预测模型：**

| 模型 | 适用场景 | 准确率 | 计算成本 |
|------|----------|--------|----------|
| ARIMA | 短期预测（1-3个月） | 75-85% | 低 |
| Prophet | 中期预测（3-12个月） | 80-88% | 中 |
| LSTM | 长期预测（12个月以上） | 85-92% | 高 |
| Ensemble | 综合预测 | 88-95% | 高 |

#### 3.2 需求预测报告

**报告模板：**

```yaml
需求预测报告:
  产品信息:
    类目: "家居装饰"
    子类目: "桌面收纳"
  
  预测结果:
    预测周期: "2026-02至2026-08"
    预测月销量:
      2026-02: 500
      2026-03: 800
      2026-04: 1,200
      2026-05: 1,500
      2026-06: 1,800
      2026-07: 2,000
      2026-08: 1,600
    
    峰值月份: 2026-07
    峰值销量: 2,000
    季节性系数: 2.5
    
  预测可信度:
    模型准确率: 87%
    数据充足度: 高
    置信区间: ±15%
    
  风险评估:
    需求波动性: 中等
    季节性风险: 高
    竞争风险: 中等
```

---

### 阶段四：ROI评估（1天）

#### 4.1 成本计算

**成本结构模型：**

```python
# ROI计算器
class ROICalculator:
    def __init__(self):
        self.costs = {}
        self.revenue = {}
    
    def calculate_total_cost(self, product):
        """计算总成本"""
        costs = {
            '采购成本': product.purchase_price,
            '运费': product.shipping_cost,
            '关税': product.duty_fee,
            '平台佣金': product.platform_fee_rate * product.selling_price,
            'FBA费用': product.fba_fee,
            '广告费用': product.ad_budget,
            '退货损耗': product.return_rate * product.selling_price,
            '仓储费用': product.storage_fee,
            '其他费用': product.misc_cost
        }
        return sum(costs.values())
    
    def calculate_profit_margin(self, selling_price, total_cost):
        """计算利润率"""
        profit = selling_price - total_cost
        margin = (profit / selling_price) * 100
        return margin
    
    def calculate_roi(self, investment, profit):
        """计算投资回报率"""
        roi = (profit / investment) * 100
        return roi
    
    def calculate_payback_period(self, investment, monthly_profit):
        """计算回本周期"""
        payback_months = investment / monthly_profit
        return payback_months
```

**成本清单模板：**

```yaml
成本分析表:
  一次性成本:
    产品研发: $5,000
    模具费用: $3,000
    认证费用: $1,000
    拍摄制作: $500
    总计: $9,500
  
  单件成本:
    采购价格: $5.00
    运费: $2.00
    关税: $1.50
    包装: $0.30
    单件总计: $8.80
  
  运营成本:
    平台佣金: 15% (售价)
    FBA费用: $3.50
    广告费用: $2.00
    退货损耗: 2%
    仓储费用: $0.50
    运营总计: $8.50
  
  总单件成本: $17.30
```

#### 4.2 收益预测

**收益模型：**

```python
# 收益预测模型
def calculate_revenue_forecast(demand_data, pricing_strategy):
    """
    计算收益预测
    """
    monthly_revenue = []
    cumulative_revenue = 0
    
    for month, demand in demand_data.items():
        price = pricing_strategy.get_price(month)
        revenue = demand * price
        monthly_revenue.append(revenue)
        cumulative_revenue += revenue
    
    return {
        'monthly_revenue': monthly_revenue,
        'cumulative_revenue': cumulative_revenue,
        'total_revenue': cumulative_revenue
    }
```

#### 4.3 ROI报告

**报告模板：**

```yaml
ROI评估报告:
  产品信息:
    产品名称: "智能桌面收纳盒"
    销售价格: $29.99
    单件成本: $17.30
    单件利润: $12.67
    利润率: 42.2%
  
  投资规模:
    初始投资: $9,500
    备货资金: $8,800 (500件 × $17.30)
    总投资: $18,300
  
  收益预测:
    第1个月: 500件 × $12.67 = $6,335
    第2个月: 800件 × $12.67 = $10,136
    第3个月: 1,200件 × $12.67 = $15,204
    第4个月: 1,500件 × $12.67 = $19,005
    第5个月: 1,800件 × $12.67 = $22,806
    第6个月: 2,000件 × $12.67 = $25,340
    
    6个月总利润: $98,826
  
  ROI指标:
    6个月ROI: 540%
    回本周期: 1.8个月
    年化ROI: 1080%
    净现值(NPV): $75,000 (折现率10%)
  
  风险调整后ROI:
    保守预测(70%): 378%
    基准预测(100%): 540%
    乐观预测(130%): 702%
```

**ROI决策标准：**

| ROI等级 | 6个月ROI | 回本周期 | 决策建议 |
|---------|----------|----------|----------|
| 优秀 | ≥ 500% | ≤ 2个月 | 立即投入 |
| 良好 | 300-499% | 2-3个月 | 优先考虑 |
| 一般 | 150-299% | 3-6个月 | 谨慎评估 |
| 较差 | < 150% | > 6个月 | 不建议 |

---

## 数据源和工具清单

### 市场数据源

| 数据源 | 类型 | 访问方式 | 成本 | 更新频率 |
|--------|------|----------|------|----------|
| Amazon Best Sellers | 销售数据 | API/爬虫 | 免费 | 每日 |
| Google Trends | 搜索趋势 | API | 免费 | 实时 |
| Jungle Scout | 市场数据 | API | $69/月 | 每日 |
| Helium 10 | 竞品数据 | API | $99/月 | 每日 |
| Shopee Trending | 平台趋势 | API | 免费 | 每日 |
| TikTok Trending | 社交趋势 | API | 免费 | 实时 |

### 分析工具

| 工具 | 用途 | 技术栈 | 成本 |
|------|------|--------|------|
| Python + Pandas | 数据处理 | Python | 免费 |
| Jupyter Notebook | 数据分析 | Python | 免费 |
| Prophet | 需求预测 | Python/R | 免费 |
| Tableau | 数据可视化 | Desktop | $70/月 |
| Power BI | 数据可视化 | Desktop | 免费 |
| ChatGPT API | 文本分析 | API | $20/月 |

### 自动化脚本

```bash
# 安装依赖
pip install pandas numpy matplotlib seaborn scikit-learn fbprophet requests beautifulsoup4 selenium helium

# 克隆工具库
git clone https://github.com/ecommerce-tools/product-selection-toolkit.git
cd product-selection-toolkit

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入API密钥

# 运行选品分析
python main.py \
  --category "home decor" \
  --platform amazon \
  --market US \
  --output results/
```

---

## 关键指标KPI

### 选品质量指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 选品成功率 | ≥ 80% | 成功选品数 / 总选品数 | 月度 |
| 新品上架成功率 | ≥ 75% | 成功上架数 / 尝试上架数 | 月度 |
| 平均上架时间 | ≤ 7天 | 总上架时间 / 上架产品数 | 月度 |
| 选品准确率 | ≥ 85% | 预测准确达标数 / 总选品数 | 季度 |

### 业务绩效指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 平均ROI | ≥ 300% | 总利润 / 总投资 | 月度 |
| 平均回本周期 | ≤ 90天 | 总回本天数 / 产品数 | 月度 |
| 产品生命周期 | ≥ 180天 | 产品在售天数平均值 | 月度 |
| 复购率 | ≥ 25% | 复购用户数 / 总用户数 | 月度 |

### 市场竞争力指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 类目排名提升 | ≥ Top 50 | 产品类目排名 | 每周 |
| 评分 | ≥ 4.3/5.0 | 用户评分平均值 | 每周 |
| 评论数增长率 | ≥ 15% | 评论增长数 / 总评论数 | 月度 |
| 价格竞争力指数 | ≤ 1.2 | 产品价格 / 竞品平均价格 | 每周 |

---

## 实战示例

### 示例1：季节性产品选品

**场景：** 为2026年夏季选品，目标市场美国Amazon

**执行流程：**

```python
# 完整选品流程
class ProductSelector:
    """产品选择器（不依赖外部库）"""
    
    def __init__(self, platform='amazon', market='US', season=None):
        self.platform = platform
        self.market = market
        self.season = season
    
    def scan_market(self, time_range='90d', categories=None):
        """市场扫描"""
        # 返回模拟数据
        return [
            {'name': 'Outdoor Water Gun', 'category': 'outdoor', 'demand_score': 85},
            {'name': 'Garden Umbrella', 'category': 'garden', 'demand_score': 78},
            {'name': 'Portable Fan', 'category': 'electronics', 'demand_score': 82}
        ]
    
    def analyze_competitors(self, opportunity):
        """竞品分析"""
        return [{'name': 'Competitor A', 'rating': 4.5, 'reviews': 500}]
    
    def identify_gaps(self, opportunity, competitors):
        """识别市场空白"""
        return {'gap': 'price', 'recommendation': 'Mid-range pricing'}

# 1. 初始化选品器
selector = ProductSelector(
    platform='amazon',
    market='US',
    season='summer'
)

# 2. 市场扫描
opportunities = selector.scan_market(
    time_range='90d',
    categories=['outdoor', 'garden', 'sports']
)

# 3. 竞品分析
top_opportunities = opportunities[:10]
for opp in top_opportunities:
    competitors = selector.analyze_competitors(opp)
    gap_analysis = selector.identify_gaps(opp, competitors)
    opp.gap_analysis = gap_analysis

# 4. 需求预测
for opp in top_opportunities:
    demand_forecast = selector.predict_demand(opp, months=6)
    opp.demand_forecast = demand_forecast

# 5. ROI评估
for opp in top_opportunities:
    roi_report = selector.calculate_roi(opp)
    opp.roi_report = roi_report

# 6. 排序和推荐
recommended_products = selector.rank_products(top_opportunities)

# 输出结果
selector.export_report(recommended_products, 'summer_selection_2026.json')
```

**输出结果：**

```json
{
  "recommended_products": [
    {
      "product_name": "便携式户外LED灯串",
      "category": "outdoor lighting",
      "monthly_demand": [3000, 5000, 8000, 6000, 4000, 2000],
      "peak_month": "2026-07",
      "roi_6months": 650,
      "payback_period": 1.5,
      "confidence_score": 0.88,
      "ranking": 1
    },
    {
      "product_name": "智能浇花控制器",
      "category": "garden tools",
      "monthly_demand": [2000, 3500, 5000, 4500, 3000, 1500],
      "peak_month": "2026-06",
      "roi_6months": 520,
      "payback_period": 2.0,
      "confidence_score": 0.82,
      "ranking": 2
    }
  ]
}
```

---

### 示例2：蓝海产品发现

**场景：** 寻找竞争较小的细分市场

**执行流程：**

```python
# 蓝海市场发现器（不依赖外部库）
class BlueOceanHunter:
    """蓝海产品发现器"""
    
    def __init__(self, platform='amazon', min_search_volume=5000, max_competition=50, min_growth_rate=20):
        self.platform = platform
        self.min_search_volume = min_search_volume
        self.max_competition = max_competition
        self.min_growth_rate = min_growth_rate
    
    def scan_market(self):
        """扫描蓝海机会"""
        # 返回模拟数据
        return [
            {'name': 'Niche Gadget', 'volume': 8000, 'competition': 30, 'growth': 25},
            {'name': 'Specialized Tool', 'volume': 6000, 'competition': 20, 'growth': 35}
        ]
    
    def filter_by_criteria(self, products, criteria):
        """按条件过滤"""
        filtered = []
        for p in products:
            if p.get('price_range') and criteria.get('price_range'):
                if criteria['price_range'][0] <= p['price'] <= criteria['price_range'][1]:
                    filtered.append(p)
        return filtered

hunter = BlueOceanHunter(
    platform='amazon',
    min_search_volume=5000,
    max_competition=50,
    min_growth_rate=20
)

# 扫描蓝海机会
blue_oceans = hunter.scan_market()

# 过滤和排序
filtered = hunter.filter_by_criteria(blue_oceans, {
    'price_range': [20, 50],
    'profit_margin': 30,
    'shipping_feasible': True
})

# 深度分析
for opportunity in filtered:
    deep_analysis = hunter.deep_dive(opportunity)
    opportunity.deep_analysis = deep_analysis

# 推荐清单
recommendations = hunter.get_recommendations(filtered, top_n=5)
```

---

## 边界情况处理

### 1. 数据不足

**问题：** 新产品类目缺乏历史数据

**解决方案：**

```python
def handle_insufficient_data(product):
    """处理数据不足的情况"""
    # 方案1: 使用相似产品数据
    similar_products = find_similar_products(product)
    if similar_products:
        return estimate_from_similar(product, similar_products)
    
    # 方案2: 使用跨平台数据
    cross_platform_data = get_cross_platform_data(product)
    if cross_platform_data:
        return estimate_from_cross_platform(product, cross_platform_data)
    
    # 方案3: 专家评估模型
    expert_estimates = get_expert_assessment(product)
    return combine_expert_judgment(expert_estimates)
```

### 2. 市场突变

**问题：** 突发事件导致市场需求骤变

**解决方案：**

```python
def handle_market_change(product, event_type):
    """处理市场突变"""
    if event_type == 'policy_change':
        return reevaluate_after_policy(product)
    elif event_type == 'competitor_entry':
        return reassess_competitive_landscape(product)
    elif event_type == 'trend_shift':
        return adjust_for_new_trend(product)
    elif event_type == 'supply_chain_disruption':
        return recalculate_costs_and_pricing(product)
```

### 3. 竞品价格战

**问题：** 竞品突然降价

**解决方案：**

```python
def handle_price_war(product, competitor_price):
    """处理价格战"""
    current_profit = product.selling_price - product.cost
    new_profit = competitor_price * 0.95 - product.cost  # 比竞品低5%
    
    if new_profit > 0 and new_profit >= current_profit * 0.7:
        # 跟随降价
        return {
            'action': 'match_price',
            'new_price': competitor_price * 0.95,
            'expected_roi_change': 'moderate'
        }
    else:
        # 差异化策略
        return {
            'action': 'differentiate',
            'strategy': 'focus_on_value_add',
            'expected_roi_change': 'minimal'
        }
```

---

## 持续优化

### 反馈循环

```python
def continuous_improvement(product):
    """持续改进机制"""
    # 1. 收集实际销售数据
    actual_data = get_actual_sales_data(product)
    
    # 2. 对比预测数据
    prediction_accuracy = compare_with_forecast(product, actual_data)
    
    # 3. 更新预测模型
    update_model_based_on_feedback(product, prediction_accuracy)
    
    # 4. 调整选品策略
    adjust_selection_criteria(product)
    
    # 5. 记录学习
    log_learning(product, prediction_accuracy)
```

### A/B测试

```python
def ab_test_product_selection():
    """选品策略A/B测试"""
    # 策略A: 传统选品方法
    strategy_a = traditional_method()
    
    # 策略B: AI增强选品方法
    strategy_b = ai_enhanced_method()
    
    # 对比测试结果
    results = compare_strategies(strategy_a, strategy_b)
    
    # 更新最佳实践
    if results.b_outperforms_a:
        update_best_practice(strategy_b)
```

---

## 成功标准

### 短期目标（1-3个月）

- ✅ 完成至少20个产品的选品分析
- ✅ 选品成功率 ≥ 80%
- ✅ 平均ROI ≥ 300%
- ✅ 平均回本周期 ≤ 90天

### 中期目标（3-6个月）

- ✅ 建立完整的选品知识库
- ✅ 预测准确率 ≥ 85%
- ✅ 自动化程度 ≥ 70%
- ✅ 跨平台扩展（至少3个平台）

### 长期目标（6-12个月）

- ✅ 打造选品AI模型
- ✅ 实现全自动选品流程
- ✅ 预测准确率 ≥ 90%
- ✅ 成为行业标准工具

---

## 附录

### A. 数据格式规范

```json
{
  "product_id": "PROD-001",
  "name": "产品名称",
  "category": "产品类目",
  "market": "目标市场",
  "platform": "销售平台",
  "selection_date": "2026-02-12",
  "analysis": {
    "market_score": 85,
    "competition_score": 45,
    "demand_forecast": [1000, 1500, 2000, 1800, 1500, 1200],
    "roi_6months": 450,
    "payback_period": 2.5,
    "confidence_level": 0.85
  },
  "recommendation": "approve",
  "risk_level": "medium"
}
```

### B. API接口文档

```yaml
API Endpoints:
  /api/product-selection/market-scan:
    method: POST
    parameters:
      category: string
      platform: string
      time_range: string
    response: MarketScanResult
  
  /api/product-selection/competitor-analysis:
    method: POST
    parameters:
      product_id: string
      platform: string
    response: CompetitorAnalysisResult
  
  /api/product-selection/demand-forecast:
    method: POST
    parameters:
      product_id: string
      forecast_period: integer
    response: DemandForecastResult
  
  /api/product-selection/roi-calculation:
    method: POST
    parameters:
      product_id: string
      investment_amount: number
    response: ROICalculationResult
```

### C. 常见问题FAQ

**Q1: 如何处理数据缺失？**
A: 使用相似产品数据、跨平台数据或专家评估模型进行估算。

**Q2: 如何提高预测准确率？**
A: 持续收集实际数据，定期更新模型，结合多种预测方法。

**Q3: 如何应对竞品突然降价？**
A: 评估利润空间，选择跟随降价或差异化策略。

**Q4: 选品周期多长合适？**
A: 根据产品类型，一般为7-14天，季节性产品可提前3-6个月规划。

---

**技能版本：** 1.0.0  
**最后更新：** 2026-02-12  
**维护团队：** 跨境电商技术团队