---
name: inventory-management
description: 跨境库存智能管理技能，提供需求预测、库存规划、补货管理和库存监控的完整解决方案
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
  - sales_data: DataFrame (历史销售数据)
  - current_inventory: dict (当前库存)
  - lead_time: dict (补货周期)
  - service_level: float (服务水平, 0-1)
output_format:
  - demand_forecast: dict (需求预测)
  - inventory_plan: dict (库存计划)
  - replenishment_orders: list (补货建议)
  - inventory_health: dict (库存健康度)
estimated_time: 2-3小时
complexity: 中级
tags:
  - cross-border-commerce
  - inventory
  - supply-chain
  - demand-forecasting
---

# 跨境库存智能管理 (Inventory Management)

## Overview

跨境库存智能管理是跨境电商运营的核心环节，直接影响销售转化、资金占用和客户体验。本技能提供系统化的库存管理方法，帮助企业准确预测需求、科学规划库存、智能补货、实时监控库存状态，实现库存最优化。

**核心价值：**
- 降低库存成本，减少资金占用
- 提高库存周转率，加速资金回笼
- 避免缺货和积压，提升销售效率
- 数据驱动决策，降低人为失误

## Prerequisites

### 必备条件
1. **数据基础**
   - 历史销售数据（至少6个月）
   - 当前库存数据（各仓库）
   - 供应商交货周期数据
   - 商品生命周期数据

2. **技术环境**
   - 库存管理系统或ERP
   - 数据分析工具
   - 预测算法库
   - API接口（与供应商、电商平台对接）

3. **业务知识**
   - 库存管理基础理论
   - 产品生命周期理解
   - 市场趋势判断能力

### 建议配置
- 库存管理团队：1-2人
- 库存系统：自动化库存管理软件
- 供应商网络：3-5家主要供应商

## Step-by-Step Instructions

### Step 1: 需求预测 (30-45分钟)

**目标：** 基于历史数据预测未来需求

**预测模型选择：**

```python
from datetime import datetime, timedelta
from collections import defaultdict
import math

def demand_forecasting(sales_data, product_id, forecast_periods=12):
    """
    需求预测（使用简单移动平均，不依赖外部库）
    
    Args:
        sales_data: 历史销售数据（字典列表）
        product_id: 产品ID
        forecast_periods: 预测周期（月）
    
    Returns:
        dict: 预测结果
    """
    # 提取该产品的销售数据
    product_sales = [s for s in sales_data if s.get('product_id') == product_id]
    
    # 按月汇总销售数据（不使用pandas groupby）
    monthly_sales = defaultdict(int)
    for sale in product_sales:
        month_key = sale.get('date', '')[:7]  # 提取年月
        monthly_sales[month_key] += sale.get('quantity', 0)
    
    # 按日期排序
    sorted_months = sorted(monthly_sales.keys())
    sales_values = [monthly_sales[m] for m in sorted_months]
    
    # 简单移动平均预测
    window = min(3, len(sales_values))
    recent_avg = sum(sales_values[-window:]) / window if sales_values else 0
    
    # 考虑趋势
    if len(sales_values) >= 2:
        trend = (sales_values[-1] - sales_values[0]) / len(sales_values)
    else:
        trend = 0
    
    # 生成预测
    forecasts = []
    for i in range(1, forecast_periods + 1):
        forecast_value = recent_avg + (trend * i)
        forecasts.append(max(0, forecast_value))  # 确保非负
    
    return {
        'product_id': product_id,
        'historical_months': sorted_months,
        'historical_sales': sales_values,
        'forecast_periods': forecast_periods,
        'forecasts': forecasts,
        'method': 'simple_moving_average'
    }
    product_sales['month'] = pd.to_datetime(product_sales['order_date']).dt.to_period('M')
    monthly_sales = product_sales.groupby('month')['quantity'].sum().reset_index()
    monthly_sales['month'] = monthly_sales['month'].astype(str)
    
    # 检查数据量
    if len(monthly_sales) < 12:
        # 数据不足，使用简单移动平均
        forecast = simple_moving_average(monthly_sales['quantity'], forecast_periods)
        method = 'SMA'
    else:
        # 使用Holt-Winters指数平滑
        try:
            forecast = holt_winters_forecast(monthly_sales['quantity'], forecast_periods)
            method = 'HOLT_WINTERS'
        except:
            # 如果Holt-Winters失败，使用线性回归
            forecast = linear_regression_forecast(monthly_sales['quantity'], forecast_periods)
            method = 'LINEAR_REGRESSION'
    
    # 计算置信区间
    mean_forecast = forecast.mean()
    std_forecast = forecast.std()
    confidence_interval = {
        'lower_95': mean_forecast - 1.96 * std_forecast,
        'upper_95': mean_forecast + 1.96 * std_forecast
    }
    
    # 季节性分析
    seasonality = analyze_seasonality(monthly_sales['quantity'])
    
    return {
        'product_id': product_id,
        'forecast_method': method,
        'forecast_periods': forecast_periods,
        'monthly_forecast': forecast.tolist(),
        'mean_forecast': mean_forecast,
        'confidence_interval': confidence_interval,
        'seasonality': seasonality,
        'forecast_date': datetime.now().isoformat()
    }

def simple_moving_average(data, periods):
    """
    简单移动平均预测
    """
    # 使用最近3个月的平均值
    recent_avg = data.tail(3).mean()
    forecast = np.array([recent_avg] * periods)
    return forecast

def holt_winters_forecast(data, periods):
    """
    Holt-Winters指数平滑预测
    """
    # 季节性周期（假设12个月）
    seasonal_periods = min(12, len(data) // 2)
    
    # 拟合模型
    model = ExponentialSmoothing(
        data,
        trend='add',
        seasonal='add',
        seasonal_periods=seasonal_periods
    ).fit()
    
    # 预测
    forecast = model.forecast(periods)
    
    # 确保预测值为正数
    forecast = np.maximum(forecast, 0)
    
    return forecast

def linear_regression_forecast(data, periods):
    """
    线性回归预测
    """
    # 准备数据
    X = np.arange(len(data)).reshape(-1, 1)
    y = data.values
    
    # 拟合模型
    model = LinearRegression()
    model.fit(X, y)
    
    # 预测
    future_X = np.arange(len(data), len(data) + periods).reshape(-1, 1)
    forecast = model.predict(future_X)
    
    # 确保预测值为正数
    forecast = np.maximum(forecast, 0)
    
    return forecast

def analyze_seasonality(data):
    """
    分析季节性
    """
    if len(data) < 12:
        return {
            'has_seasonality': False,
            'seasonal_pattern': None
        }
    
    # 计算每月平均值
    monthly_avg = data.groupby(data.index % 12).mean()
    
    # 计算季节性指数
    overall_avg = data.mean()
    seasonal_index = (monthly_avg / overall_avg * 100).round(2)
    
    # 判断是否存在季节性
    has_seasonality = seasonal_index.std() > 10  # 标准差超过10认为有季节性
    
    return {
        'has_seasonality': has_seasonality,
        'seasonal_index': seasonal_index.to_dict(),
        'peak_month': int(seasonal_index.idxmax()),
        'low_month': int(seasonal_index.idxmin())
    }
```

### Step 2: 库存规划 (30-45分钟)

**目标：** 根据需求预测制定库存规划

**库存参数计算：**

```python
def calculate_inventory_parameters(forecast_result, lead_time, service_level=0.95):
    """
    计算库存参数
    
    Args:
        forecast_result: 需求预测结果
        lead_time: 交货周期（天）
        service_level: 服务水平（0-1）
    
    Returns:
        dict: 库存参数
    """
    from scipy import stats
    
    # 平均月需求
    avg_monthly_demand = forecast_result['mean_forecast']
    
    # 转换为日需求
    avg_daily_demand = avg_monthly_demand / 30
    
    # 需求标准差
    forecast_std = np.std(forecast_result['monthly_forecast'])
    daily_demand_std = forecast_std / np.sqrt(30)
    
    # 安全库存计算
    z_score = stats.norm.ppf(service_level)  # 服务水平对应的Z值
    safety_stock = z_score * daily_demand_std * np.sqrt(lead_time)
    
    # 再订货点
    reorder_point = avg_daily_demand * lead_time + safety_stock
    
    # 经济订货批量（EOQ）
    # 假设：订货成本=100，持有成本=20%/年
    ordering_cost = 100
    holding_cost_rate = 0.20
    unit_cost = 50  # 假设单位成本
    holding_cost_per_unit = unit_cost * holding_cost_rate / 12  # 月持有成本
    
    eoq = np.sqrt((2 * avg_monthly_demand * ordering_cost) / holding_cost_per_unit)
    
    # 目标库存水平
    max_inventory_level = reorder_point + eoq
    
    return {
        'avg_daily_demand': avg_daily_demand,
        'avg_monthly_demand': avg_monthly_demand,
        'demand_std': daily_demand_std,
        'service_level': service_level,
        'z_score': z_score,
        'safety_stock': int(np.round(safety_stock)),
        'reorder_point': int(np.round(reorder_point)),
        'eoq': int(np.round(eoq)),
        'max_inventory_level': int(np.round(max_inventory_level))
    }

def create_inventory_plan(product_id, current_inventory, inventory_params):
    """
    创建库存计划
    
    Args:
        product_id: 产品ID
        current_inventory: 当前库存
        inventory_params: 库存参数
    
    Returns:
        dict: 库存计划
    """
    # 当前库存水平
    current_level = current_inventory.get(product_id, 0)
    
    # 判断库存状态
    inventory_status = 'NORMAL'
    action_required = None
    action_priority = 'NONE'
    
    if current_level <= inventory_params['safety_stock'] * 0.5:
        inventory_status = 'CRITICAL'
        action_required = 'IMMEDIATE_REORDER'
        action_priority = 'URGENT'
    elif current_level <= inventory_params['safety_stock']:
        inventory_status = 'LOW'
        action_required = 'REORDER'
        action_priority = 'HIGH'
    elif current_level >= inventory_params['max_inventory_level'] * 1.5:
        inventory_status = 'OVERSTOCK'
        action_required = 'REDUCE_ORDER'
        action_priority = 'MEDIUM'
    
    # 计算建议补货量
    if action_required in ['IMMEDIATE_REORDER', 'REORDER']:
        suggested_order_qty = max(
            inventory_params['eoq'],
            inventory_params['max_inventory_level'] - current_level
        )
    else:
        suggested_order_qty = 0
    
    # 计算库存周转率（年化）
    annual_demand = inventory_params['avg_monthly_demand'] * 12
    inventory_turnover = annual_demand / current_level if current_level > 0 else 0
    
    return {
        'product_id': product_id,
        'current_inventory': current_level,
        'inventory_status': inventory_status,
        'action_required': action_required,
        'action_priority': action_priority,
        'suggested_order_qty': suggested_order_qty,
        'inventory_turnover': round(inventory_turnover, 2),
        'days_of_inventory': current_level / inventory_params['avg_daily_demand'] if inventory_params['avg_daily_demand'] > 0 else 0,
        'inventory_params': inventory_params
    }
```

### Step 3: 补货管理 (30-45分钟)

**目标：** 生成补货建议，优化补货决策

**补货策略：**

```python
def generate_replenishment_orders(inventory_plans, supplier_info):
    """
    生成补货订单
    
    Args:
        inventory_plans: 库存计划列表
        supplier_info: 供应商信息
    
    Returns:
        list: 补货订单列表
    """
    replenishment_orders = []
    
    for plan in inventory_plans:
        # 只处理需要补货的计划
        if plan['action_required'] in ['IMMEDIATE_REORDER', 'REORDER']:
            # 获取供应商信息
            supplier = supplier_info.get(plan['product_id'], {})
            
            # 计算预计到货日期
            lead_time = supplier.get('lead_time', 30)
            eta_date = datetime.now() + timedelta(days=lead_time)
            
            # 检查供应商是否有最小起订量（MOQ）
            moq = supplier.get('moq', 1)
            order_qty = max(plan['suggested_order_qty'], moq)
            
            # 创建补货订单
            replenishment_order = {
                'order_id': f"PO-{datetime.now().strftime('%Y%m%d')}-{plan['product_id']}",
                'product_id': plan['product_id'],
                'supplier': supplier.get('name', 'Default Supplier'),
                'order_quantity': order_qty,
                'unit_price': supplier.get('unit_price', 0),
                'total_value': order_qty * supplier.get('unit_price', 0),
                'lead_time_days': lead_time,
                'eta_date': eta_date.isoformat(),
                'priority': plan['action_priority'],
                'order_date': datetime.now().isoformat(),
                'status': 'PENDING'
            }
            
            replenishment_orders.append(replenishment_order)
    
    # 按优先级排序
    priority_order = {'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    replenishment_orders.sort(key=lambda x: priority_order.get(x['priority'], 99))
    
    return replenishment_orders

def optimize_replenishment_batch(replenishment_orders, max_orders_per_supplier=5):
    """
    优化补货批次（合并同一供应商的订单）
    
    Args:
        replenishment_orders: 补货订单列表
        max_orders_per_supplier: 每个供应商最大订单数
    
    Returns:
        list: 优化后的补货订单列表
    """
    # 按供应商分组
    supplier_groups = {}
    for order in replenishment_orders:
        supplier = order['supplier']
        if supplier not in supplier_groups:
            supplier_groups[supplier] = []
        supplier_groups[supplier].append(order)
    
    optimized_orders = []
    
    # 为每个供应商创建合并订单
    for supplier, orders in supplier_groups.items():
        # 如果订单数量超过限制，按优先级合并
        if len(orders) > max_orders_per_supplier:
            # 按优先级分组
            urgent_orders = [o for o in orders if o['priority'] == 'URGENT']
            high_priority_orders = [o for o in orders if o['priority'] == 'HIGH']
            other_orders = [o for o in orders if o['priority'] not in ['URGENT', 'HIGH']]
            
            # 优先级订单单独发，其他订单合并
            for order in urgent_orders + high_priority_orders:
                optimized_orders.append(order)
            
            # 合并其他订单
            if other_orders:
                batched_order = create_batched_order(other_orders, supplier)
                optimized_orders.append(batched_order)
        else:
            optimized_orders.extend(orders)
    
    return optimized_orders

def create_batched_order(orders, supplier):
    """
    创建批量订单
    """
    total_quantity = sum(o['order_quantity'] for o in orders)
    total_value = sum(o['total_value'] for o in orders)
    
    # 取最长的交货期
    max_lead_time = max(o['lead_time_days'] for o in orders)
    eta_date = datetime.now() + timedelta(days=max_lead_time)
    
    return {
        'order_id': f"PO-BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'supplier': supplier,
        'order_quantity': total_quantity,
        'total_value': total_value,
        'lead_time_days': max_lead_time,
        'eta_date': eta_date.isoformat(),
        'priority': 'MEDIUM',
        'order_date': datetime.now().isoformat(),
        'status': 'PENDING',
        'batched_products': [
            {'product_id': o['product_id'], 'quantity': o['order_quantity']}
            for o in orders
        ]
    }
```

### Step 4: 库存监控 (持续进行)

**目标：** 实时监控库存状态，预警异常

**监控指标：**

```python
def setup_inventory_monitoring(inventory_plans):
    """
    设置库存监控
    
    Args:
        inventory_plans: 库存计划
    
    Returns:
        dict: 监控配置
    """
    monitoring_config = {
        'alert_rules': []
    }
    
    for plan in inventory_plans:
        # 设置低库存预警
        alert_rule = {
            'product_id': plan['product_id'],
            'current_inventory': plan['current_inventory'],
            'reorder_point': plan['inventory_params']['reorder_point'],
            'safety_stock': plan['inventory_params']['safety_stock'],
            'alert_thresholds': {
                'critical': plan['inventory_params']['safety_stock'] * 0.5,
                'warning': plan['inventory_params']['safety_stock'],
                'overstock': plan['inventory_params']['max_inventory_level'] * 1.5
            }
        }
        monitoring_config['alert_rules'].append(alert_rule)
    
    return monitoring_config

def check_inventory_health(current_inventory, monitoring_config):
    """
    检查库存健康度
    
    Args:
        current_inventory: 当前库存
        monitoring_config: 监控配置
    
    Returns:
        dict: 库存健康报告
    """
    health_report = {
        'overall_score': 0,
        'alerts': [],
        'product_health': {}
    }
    
    total_score = 0
    product_count = 0
    
    for alert_rule in monitoring_config['alert_rules']:
        product_id = alert_rule['product_id']
        current_stock = current_inventory.get(product_id, 0)
        
        # 判断健康状态
        if current_stock <= alert_rule['alert_thresholds']['critical']:
            status = 'CRITICAL'
            score = 0
            alert = {
                'product_id': product_id,
                'type': 'CRITICAL_LOW_STOCK',
                'severity': 'URGENT',
                'current_stock': current_stock,
                'threshold': alert_rule['alert_thresholds']['critical'],
                'message': f'产品{product_id}库存危急，低于安全库存50%'
            }
            health_report['alerts'].append(alert)
            
        elif current_stock <= alert_rule['alert_thresholds']['warning']:
            status = 'WARNING'
            score = 40
            alert = {
                'product_id': product_id,
                'type': 'LOW_STOCK',
                'severity': 'HIGH',
                'current_stock': current_stock,
                'threshold': alert_rule['alert_thresholds']['warning'],
                'message': f'产品{product_id}库存偏低，低于安全库存'
            }
            health_report['alerts'].append(alert)
            
        elif current_stock >= alert_rule['alert_thresholds']['overstock']:
            status = 'OVERSTOCK'
            score = 60
            alert = {
                'product_id': product_id,
                'type': 'OVERSTOCK',
                'severity': 'MEDIUM',
                'current_stock': current_stock,
                'threshold': alert_rule['alert_thresholds']['overstock'],
                'message': f'产品{product_id}库存过剩'
            }
            health_report['alerts'].append(alert)
        else:
            status = 'HEALTHY'
            score = 100
        
        health_report['product_health'][product_id] = {
            'status': status,
            'score': score,
            'current_stock': current_stock
        }
        
        total_score += score
        product_count += 1
    
    # 计算总体健康得分
    health_report['overall_score'] = round(total_score / product_count, 2) if product_count > 0 else 0
    
    return health_report
```

### Step 5: 库存分析与优化 (30-45分钟)

**目标：** 分析库存效率，识别优化机会

**库存效率分析：**

```python
def analyze_inventory_efficiency(sales_data, inventory_plans):
    """
    分析库存效率
    
    Args:
        sales_data: 销售数据
        inventory_plans: 库存计划
    
    Returns:
        dict: 效率分析报告
    """
    efficiency_report = {
        'turnover_analysis': {},
        'stockout_analysis': {},
        'optimization_opportunities': []
    }
    
    # 周转率分析
    for plan in inventory_plans:
        product_id = plan['product_id']
        annual_demand = plan['inventory_params']['avg_monthly_demand'] * 12
        avg_inventory = plan['current_inventory']
        
        if avg_inventory > 0:
            turnover_rate = annual_demand / avg_inventory
            efficiency_report['turnover_analysis'][product_id] = {
                'turnover_rate': round(turnover_rate, 2),
                'performance': evaluate_turnover(turnover_rate)
            }
    
    # 识别优化机会
    overall_turnover = np.mean([
        v['turnover_rate'] 
        for v in efficiency_report['turnover_analysis'].values()
    ])
    
    if overall_turnover < 4:
        efficiency_report['optimization_opportunities'].append({
            'type': 'LOW_TURNOVER',
            'description': f'整体库存周转率{overall_turnover:.1f}偏低，建议优化SKU结构',
            'potential_savings': '10-20%库存成本',
            'priority': 'HIGH'
        })
    
    # 识别滞销商品
    for plan in inventory_plans:
        if plan['inventory_turnover'] < 2:
            efficiency_report['optimization_opportunities'].append({
                'type': 'SLOW_MOVING',
                'product_id': plan['product_id'],
                'description': f'产品{plan["product_id"]}周转率仅{plan["inventory_turnover"]:.1f}，建议清仓或淘汰',
                'priority': 'MEDIUM'
            })
    
    return efficiency_report

def evaluate_turnover(turnover_rate):
    """
    评估周转率表现
    """
    if turnover_rate >= 8:
        return 'EXCELLENT'
    elif turnover_rate >= 6:
        return 'GOOD'
    elif turnover_rate >= 4:
        return 'AVERAGE'
    elif turnover_rate >= 2:
        return 'BELOW_AVERAGE'
    else:
        return 'POOR'
```

## Examples

### Example 1: 单品库存管理

**场景：** 某电子产品SKU-001的库存管理

**执行步骤：**

1. **需求预测**
```python
# 假设已有历史销售数据
sales_data = pd.read_csv('sales_history.csv')

# 预测未来12个月需求
forecast = demand_forecasting(
    sales_data=sales_data,
    product_id='SKU-001',
    forecast_periods=12
)

# 结果示例
# {
#     'mean_forecast': 500,  # 月均需求500件
#     'monthly_forecast': [480, 520, 490, 510, 500, 530, 510, 490, 520, 500, 510, 530],
#     'seasonality': {'has_seasonality': True, 'peak_month': 11, 'low_month': 2}
# }
```

2. **库存规划**
```python
# 计算库存参数
inventory_params = calculate_inventory_parameters(
    forecast_result=forecast,
    lead_time=30,  # 交货周期30天
    service_level=0.95  # 95%服务水平
)

# 当前库存
current_inventory = {'SKU-001': 300}

# 创建库存计划
inventory_plan = create_inventory_plan(
    product_id='SKU-001',
    current_inventory=current_inventory,
    inventory_params=inventory_params
)

# 结果示例
# {
#     'current_inventory': 300,
#     'inventory_status': 'LOW',
#     'action_required': 'REORDER',
#     'suggested_order_qty': 400,
#     'inventory_turnover': 20.0
# }
```

3. **生成补货订单**
```python
# 供应商信息
supplier_info = {
    'SKU-001': {
        'name': 'TechSupplier Co.',
        'lead_time': 30,
        'moq': 100,
        'unit_price': 25
    }
}

# 生成补货订单
replenishment_orders = generate_replenishment_orders(
    inventory_plans=[inventory_plan],
    supplier_info=supplier_info
)
```

### Example 2: 多SKU批量管理

**场景：** 管理100个SKU的库存

**执行步骤：**

1. **批量预测**
```python
# 获取所有SKU
all_skus = sales_data['product_id'].unique()

# 批量预测
all_forecasts = {}
for sku in all_skus:
    forecast = demand_forecasting(sales_data, sku, 12)
    all_forecasts[sku] = forecast
```

2. **批量规划**
```python
# 批量计算库存参数
inventory_plans = []
for sku, forecast in all_forecasts.items():
    inventory_params = calculate_inventory_parameters(
        forecast, lead_time=30, service_level=0.95
    )
    
    plan = create_inventory_plan(
        sku, current_inventory, inventory_params
    )
    inventory_plans.append(plan)
```

3. **生成批量补货订单**
```python
replenishment_orders = generate_replenishment_orders(
    inventory_plans, supplier_info
)

# 优化批次
optimized_orders = optimize_replenishment_batch(
    replenishment_orders, max_orders_per_supplier=5
)
```

### Example 3: 季节性商品管理

**场景：** 季节性商品（如圣诞礼品）的库存管理

**执行步骤：**

1. **识别季节性**
```python
forecast = demand_forecasting(sales_data, 'SKU-CHRISTMAS-001', 12)

# 季节性分析结果
# {
#     'has_seasonality': True,
#     'seasonal_index': {0: 50, 1: 60, ..., 10: 200, 11: 180},
#     'peak_month': 11,  # 11月（11月需求最高）
#     'low_month': 2    # 2月需求最低
# }
```

2. **季节性库存规划**
```python
# 根据季节性调整安全库存
seasonal_multiplier = 1.5  # 旺季增加50%安全库存

inventory_params = calculate_inventory_parameters(
    forecast, lead_time=30, service_level=0.95
)

# 调整安全库存
inventory_params['safety_stock'] *= seasonal_multiplier
inventory_params['reorder_point'] *= seasonal_multiplier
```

## Edge Cases

### Case 1: 新品上市（无历史数据）

**场景：** 新产品没有历史销售数据

**处理方案：**
```python
def handle_new_product(product_info, market_research_data):
    """
    处理新品库存
    
    Args:
        product_info: 产品信息
        market_research_data: 市场调研数据
    
    Returns:
        dict: 新品库存计划
    """
    # 基于市场调研预估需求
    estimated_monthly_demand = market_research_data.get('estimated_demand', 100)
    
    # 使用保守策略
    initial_inventory = estimated_monthly_demand * 2  # 初始库存为2个月需求
    
    # 安全库存设为月需求的50%
    safety_stock = estimated_monthly_demand * 0.5
    
    return {
        'strategy': 'CONSERVATIVE',
        'initial_inventory': initial_inventory,
        'safety_stock': safety_stock,
        'reorder_point': safety_stock,
        'monitoring_frequency': 'WEEKLY',  # 新品每周监控
        'adjustment_strategy': 'AGGRESSIVE'  # 积极调整
    }
```

### Case 2: 供应商延迟交货

**场景：** 供应商实际交货周期超过预期

**处理方案：**
```python
def handle_supplier_delay(inventory_plan, actual_lead_time, planned_lead_time):
    """
    处理供应商延迟
    
    Args:
        inventory_plan: 库存计划
        actual_lead_time: 实际交货周期
        planned_lead_time: 计划交货周期
    
    Returns:
        dict: 调整后的计划
    """
    delay_ratio = actual_lead_time / planned_lead_time
    
    # 调整安全库存
    adjusted_safety_stock = inventory_plan['inventory_params']['safety_stock'] * delay_ratio
    
    # 调整再订货点
    adjusted_reorder_point = inventory_plan['inventory_params']['reorder_point'] * delay_ratio
    
    # 增加缓冲库存
    buffer_stock = adjusted_safety_stock * 0.2
    
    return {
        'adjusted_safety_stock': adjusted_safety_stock,
        'adjusted_reorder_point': adjusted_reorder_point,
        'buffer_stock': buffer_stock,
        'supplier_risk': 'HIGH',
        'recommendation': '寻找备选供应商'
    }
```

### Case 3: 突然激增的需求

**场景：** 某产品因营销活动需求突然激增

**处理方案：**
```python
def handle_demand_surge(inventory_plan, current_sales_rate, normal_sales_rate):
    """
    处理需求激增
    
    Args:
        inventory_plan: 库存计划
        current_sales_rate: 当前销售率
        normal_sales_rate: 正常销售率
    
    Returns:
        dict: 应对方案
    """
    surge_ratio = current_sales_rate / normal_sales_rate
    
    if surge_ratio > 2:  # 需求增长超过2倍
        return {
            'alert_level': 'CRITICAL',
            'actions': [
                '立即联系供应商加急补货',
                '寻找临时供应商',
                '考虑空运替代海运',
                '告知客户可能的延迟',
                '暂停该产品促销'
            ],
            'estimated_stockout_days': calculate_stockout_days(
                inventory_plan['current_inventory'],
                current_sales_rate
            ),
            'priority': 'URGENT'
        }
    elif surge_ratio > 1.5:
        return {
            'alert_level': 'HIGH',
            'actions': [
                '增加补货频率',
                '提高安全库存水平',
                '监控库存状态'
            ],
            'priority': 'HIGH'
        }
    else:
        return {
            'alert_level': 'NORMAL',
            'actions': ['持续监控'],
            'priority': 'MEDIUM'
        }

def calculate_stockout_days(current_inventory, daily_sales_rate):
    """
    计算预计缺货天数
    """
    return current_inventory / daily_sales_rate if daily_sales_rate > 0 else 0
```

## Quality Assurance Checklist

### 预测准确性检查
- [ ] 历史数据完整可靠
- [ ] 预测模型选择合适
- [ ] 预测结果验证合理
- [ ] 季节性因素考虑充分
- [ ] 异常值处理得当

### 库存计划检查
- [ ] 安全库存计算准确
- [ ] 再订货点设置合理
- [ ] EOQ计算正确
- [ ] 服务水平设定恰当
- [ ] 库存状态判断准确

### 补货执行检查
- [ ] 补货订单信息完整
- [ ] 供应商交货期准确
- [ ] MOQ要求满足
- [ ] 订单优先级正确
- [ ] 批次优化合理

## KPI Indicators

### 核心指标
| 指标名称 | 目标值 | 计算方法 |
|---------|--------|---------|
| 库存周转率 | >6次/年 | 年销货成本/平均库存 |
| 缺货率 | <2% | 缺货次数/总订单 |
| 库存准确率 | >99% | 实际库存/系统库存 |
| 安全库存覆盖率 | >95% | 库存不低于安全库存天数/总天数 |
| 补货及时率 | >95% | 按时补货次数/总补货次数 |

### 监控指标
| 指标名称 | 频率 | 用途 |
|---------|------|------|
| 库存健康得分 | 每周 | 整体库存状况 |
| 周转率趋势 | 每月 | 库存效率变化 |
| 滞销SKU占比 | 每月 | SKU结构优化 |
| 供应商准时率 | 每月 | 供应商绩效 |
| 安全库存使用率 | 每周 | 安全库存合理性 |

## Success Criteria

### 定量标准
- 库存周转率达到6次/年以上
- 缺货率控制在2%以内
- 库存准确率超过99%
- 安全库存覆盖95%以上的天数
- 补货及时率超过95%

### 定性标准
- 库存决策数据驱动
- 预测准确性持续提升
- 供应商关系稳定可靠
- 库存流程标准化
- 团队能力持续提升

## References

### 官方资源
1. **供应链管理协会**
   - APICS（美国运营管理协会）
   - CSCMP（供应链管理专业协会）

2. **库存管理标准**
   - ISO 9001质量管理体系
   - ISO 14001环境管理体系

### 学术资源
1. Silver, E. A., et al. (2016). *Inventory Management and Production Planning and Scheduling*. Wiley.
2. Chopra, S., & Meindl, P. (2016). *Supply Chain Management: Strategy, Planning, and Operation*. Pearson.

### 实用工具
1. **库存管理软件**
   - Fishbowl Inventory
   - NetSuite
   - SAP Inventory Management

2. **预测工具**
   - Prophet (Facebook)
   - ARIMA (statsmodels)
   - LSTM (TensorFlow)

## Related Skills

- **logistics-optimization** - 物流优化（与库存配合）
- **data-analytics** - 数据分析（销售数据分析）
- **supply-risk-mgmt** - 供应链风险管理（供应商风险）
- **product-selection** - 产品选品（库存结构优化）

---

**技能版本：** 1.0.0  
**最后更新：** 2025年  
**维护者：** Cross-Border E-Commerce Specialist