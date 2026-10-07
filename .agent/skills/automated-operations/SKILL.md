# Agent Skill: 跨境电商自动化运营

---

**name:** automated-operations
**description:** 跨境电商多Agent协同自动化运营技能 - 实现流程编排、任务自动化、监控预警和异常处理的全自动运营体系
**version:** 1.0.0
**author:** cross-border-ecommerce-team
**tags:** [ecommerce, automation, multi-agent, workflow-orchestration, cross-border]
**category:** operations-management
**requires:** [task-scheduler, monitoring-service, alert-system, exception-handler]
**compatibility:** [amazon, shopee, lazada, shopify, woocommerce]
**language:** zh-CN
**last_updated:** 2026-02-12

---

## 技能概述

本技能提供完整的跨境电商自动化运营解决方案，通过多Agent协同、流程编排和智能决策，实现选品、上架、客服、物流、营销等核心业务的全自动运营，大幅降低人力成本，提升运营效率。

### 核心能力

- **流程编排**：可视化配置业务流程，灵活编排自动化任务
- **任务自动化**：自动执行重复性任务，解放人力
- **监控预警**：实时监控业务状态，及时发现异常
- **异常处理**：智能识别和处理业务异常

### 适用场景

- 多店铺统一管理
- 24小时无人值守运营
- 大规模产品上架
- 自动化客服响应
- 智能库存管理

---

## 标准作业流程（SOP）

### 阶段一：流程编排（3-5天）

#### 1.1 业务流程梳理

**核心业务流程定义：**

```python
business_processes = {
    'product_launch': {
        'name': '产品上架流程',
        'description': '从选品到产品上架的完整流程',
        'steps': [
            '选品分析',
            'Listing优化',
            '图片处理',
            '价格设置',
            '库存配置',
            '上架发布',
            '初始化广告'
        ],
        'agents': ['product-selector', 'listing-optimizer', 'image-processor', 'pricing-agent', 'inventory-manager', 'publisher', 'ad-manager']
    },
    'order_processing': {
        'name': '订单处理流程',
        'description': '从订单创建到发货的完整流程',
        'steps': [
            '订单接收',
            '库存检查',
            '支付验证',
            '拣货',
            '打包',
            '发货',
            '物流跟踪',
            '确认收货'
        ],
        'agents': ['order-receiver', 'inventory-checker', 'payment-verifier', 'picker', 'packer', 'shipper', 'tracker', 'delivery-confirm']
    },
    'customer_service': {
        'name': '客服服务流程',
        'description': '客户咨询到问题解决的完整流程',
        'steps': [
            '消息接收',
            '意图识别',
            '知识库检索',
            '答案生成',
            '人工接管判断',
            '发送回复',
            '满意度跟踪'
        ],
        'agents': ['message-receiver', 'intent-recognizer', 'kb-searcher', 'answer-generator', 'human-handoff', 'reply-sender', 'satisfaction-tracker']
    },
    'inventory_management': {
        'name': '库存管理流程',
        'description': '库存监控和补货流程',
        'steps': [
            '库存监控',
            '销量预测',
            '补货计算',
            '供应商下单',
            '到货确认',
            '库存更新'
        ],
        'agents': ['inventory-monitor', 'sales-predictor', 'reorder-calculator', 'supplier-orderer', 'arrival-confirm', 'inventory-updater']
    },
    'price_optimization': {
        'name': '价格优化流程',
        'description': '动态定价和促销管理',
        'steps': [
            '竞品价格监控',
            '需求分析',
            '价格计算',
            '价格调整',
            '促销配置',
            '效果评估'
        ],
        'agents': ['price-monitor', 'demand-analyzer', 'price-calculator', 'price-adjuster', 'promo-config', 'effect-evaluator']
    }
}
```

#### 1.2 工作流引擎配置

**工作流定义：**

```python
# 工作流引擎实现（不依赖外部库）
class WorkflowEngine:
    """自动化工作流引擎"""
    def __init__(self):
        self.workflows = {}
    
    def register(self, workflow):
        self.workflows[workflow.name] = workflow
    
    def execute(self, workflow_name, context):
        wf = self.workflows.get(workflow_name)
        if wf:
            return wf.execute(context)
        return None

class Workflow:
    def __init__(self, name, description, trigger=None):
        self.name = name
        self.description = description
        self.trigger = trigger
        self.tasks = []
    
    def add_task(self, task):
        self.tasks.append(task)
    
    def execute(self, context):
        results = []
        for task in self.tasks:
            results.append(task.execute(context))
        return results

class Task:
    def __init__(self, name, agent, input_data, output):
        self.name = name
        self.agent = agent
        self.input = input_data
        self.output = output
    
    def execute(self, context):
        return {'status': 'completed', 'task': self.name}

class Condition:
    def __init__(self, field, operator, value):
        self.field = field
        self.operator = operator
        self.value = value

class Parallel:
    def __init__(self, tasks):
        self.tasks = tasks

class Sequential:
    def __init__(self, tasks):
        self.tasks = tasks

# 创建工作流引擎
engine = WorkflowEngine()

# 定义产品上架工作流
product_launch_workflow = Workflow(
    name='product_launch',
    description='自动产品上架流程',
    trigger={
        'type': 'event',
        'event': 'product_selected'
    }
)

# 定义任务
tasks = [
    Task(
        name='select_product',
        agent='product-selector',
        input={'category': input_category},
        output={'product_data': 'selected_product'}
    ),
    Task(
        name='optimize_listing',
        agent='listing-optimizer',
        input={'product': '${select_product.product_data}'},
        output={'listing': 'optimized_listing'}
    ),
    Task(
        name='process_images',
        agent='image-processor',
        input={'product': '${select_product.product_data}'},
        output={'images': 'processed_images'}
    ),
    Task(
        name='set_pricing',
        agent='pricing-agent',
        input={'product': '${select_product.product_data}', 'listing': '${optimize_listing.listing}'},
        output={'pricing': 'optimized_pricing'}
    ),
    Task(
        name='configure_inventory',
        agent='inventory-manager',
        input={'product': '${select_product.product_data}'},
        output={'inventory': 'inventory_config'}
    ),
    Task(
        name='publish_listing',
        agent='publisher',
        input={
            'listing': '${optimize_listing.listing}',
            'images': '${process_images.images}',
            'pricing': '${set_pricing.pricing}',
            'inventory': '${configure_inventory.inventory}'
        },
        output={'published': True}
    ),
    Task(
        name='initialize_ads',
        agent='ad-manager',
        input={'listing': '${optimize_listing.listing}'},
        output={'ads': 'ad_campaigns'}
    )
]

# 添加任务到工作流
for task in tasks:
    product_launch_workflow.add_task(task)

# 注册工作流
engine.register_workflow(product_launch_workflow)

# 启动工作流
engine.start_workflow('product_launch', input_data)
```

#### 1.3 条件分支和并行处理

**复杂流程配置：**

```python
# 定义带条件分支的工作流
order_processing_workflow = Workflow(
    name='order_processing',
    description='自动订单处理流程'
)

# 条件判断：库存充足？
inventory_check = Condition(
    name='check_inventory',
    condition=lambda ctx: ctx['inventory_available'] >= ctx['order_quantity'],
    true_branch='process_order',
    false_branch='handle_out_of_stock'
)

# 并行处理：同时执行多个任务
parallel_tasks = Parallel(
    name='parallel_preparation',
    tasks=[
        Task(name='verify_payment', agent='payment-verifier'),
        Task(name='prepare_shipping_label', agent='label-generator'),
        Task(name='notify_customer', agent='notification-sender')
    ]
)

# 添加到工作流
order_processing_workflow.add_task(inventory_check)
order_processing_workflow.add_task(parallel_tasks)
```

---

### 阶段二：任务自动化（4-6天）

#### 2.1 重复性任务识别

**任务分类：**

```python
task_categories = {
    'high_frequency': {
        'description': '高频重复性任务',
        'tasks': [
            {'name': '价格监控', 'frequency': '每小时', 'complexity': 'low'},
            {'name': '库存检查', 'frequency': '每2小时', 'complexity': 'low'},
            {'name': '订单同步', 'frequency': '每5分钟', 'complexity': 'medium'},
            {'name': '消息接收', 'frequency': '实时', 'complexity': 'low'}
        ],
        'automation_priority': 'high'
    },
    'medium_frequency': {
        'description': '中频周期性任务',
        'tasks': [
            {'name': 'Listing优化', 'frequency': '每周', 'complexity': 'high'},
            {'name': '销量分析', 'frequency': '每日', 'complexity': 'medium'},
            {'name': '广告优化', 'frequency': '每日', 'complexity': 'high'},
            {'name': '报表生成', 'frequency': '每日', 'complexity': 'medium'}
        ],
        'automation_priority': 'medium'
    },
    'low_frequency': {
        'description': '低频策略性任务',
        'tasks': [
            {'name': '选品分析', 'frequency': '每月', 'complexity': 'very_high'},
            {'name': '竞品分析', 'frequency': '每周', 'complexity': 'high'},
            {'name': '价格策略调整', 'frequency': '每月', 'complexity': 'high'},
            {'name': '季度总结', 'frequency': '每季度', 'complexity': 'medium'}
        ],
        'automation_priority': 'medium'
    }
}
```

#### 2.2 自动化任务配置

**任务调度配置：**

```python
class TaskScheduler:
    """任务调度器（不依赖外部库）"""
    def __init__(self):
        self.tasks = []
    
    def schedule_task(self, name, agent, schedule, input_data):
        self.tasks.append({
            'name': name,
            'agent': agent,
            'schedule': schedule,
            'input': input_data
        })
        return {'status': 'scheduled', 'name': name}

scheduler = TaskScheduler()

# 配置价格监控任务
scheduler.schedule_task(
    name='price_monitoring',
    agent='price-monitor',
    schedule='0 * * * *',  # 每小时执行
    input={
        'products': 'all_products',
        'competitors': 'main_competitors'
    },
    on_success='update_prices',
    on_failure='alert_team',
    retry=3,
    timeout=300
)

# 配置库存检查任务
scheduler.schedule_task(
    name='inventory_check',
    agent='inventory-checker',
    schedule='0 */2 * * *',  # 每2小时执行
    input={
        'products': 'all_products'
    },
    on_success='update_inventory',
    on_failure='create_reorder_task',
    retry=3,
    timeout=600
)

# 配置订单同步任务
scheduler.schedule_task(
    name='order_sync',
    agent='order-syncer',
    schedule='*/5 * * * *',  # 每5分钟执行
    input={
        'platforms': ['amazon', 'shopee', 'lazada']
    },
    on_success='process_orders',
    on_failure='retry_later',
    retry=5,
    timeout=120
)

# 配置Listing优化任务
scheduler.schedule_task(
    name='listing_optimization',
    agent='listing-optimizer',
    schedule='0 9 * * 1',  # 每周一上午9点
    input={
        'products': 'low_ranking_products',
        'strategy': 'weekly_optimization'
    },
    on_success='update_listings',
    on_failure='review_manually',
    retry=1,
    timeout=1800
)
```

#### 2.3 Agent协同配置

**多Agent协同模式：**

```python
orchestrator = AgentOrchestrator()

class AgentOrchestrator:
    """Agent编排器（不依赖外部库）"""
    def __init__(self):
        self.agents = {}
        self.workflows = {}
    
    def register_agent(self, agent_id, agent_config):
        self.agents[agent_id] = agent_config
    
    def execute_workflow(self, workflow_name, input_data):
        return {'status': 'completed', 'workflow': workflow_name}

# 定义Agent协同模式
collaboration_patterns = {
    'sequential': {
        'description': '顺序执行',
        'agents': ['agent1', 'agent2', 'agent3'],
        'flow': 'agent1 → agent2 → agent3'
    },
    'parallel': {
        'description': '并行执行',
        'agents': ['agent1', 'agent2', 'agent3'],
        'flow': 'agent1 || agent2 || agent3'
    },
    'pipeline': {
        'description': '流水线模式',
        'agents': ['collector', 'processor', 'analyzer', 'publisher'],
        'flow': 'collector → processor → analyzer → publisher'
    },
    'round_robin': {
        'description': '轮询模式',
        'agents': ['agent1', 'agent2', 'agent3'],
        'flow': 'agent1 → agent2 → agent3 → agent1'
    },
    'fan_out': {
        'description': '分发模式',
        'agents': ['dispatcher', 'worker1', 'worker2', 'worker3'],
        'flow': 'dispatcher → (worker1 || worker2 || worker3)'
    }
}

# 配置产品发布协同模式
orchestrator.configure_collaboration(
    pattern='pipeline',
    agents=['listing-optimizer', 'image-processor', 'pricing-agent', 'publisher'],
    data_flow={
        'listing-optimizer': {'output': 'listing_data'},
        'image-processor': {'output': 'image_data'},
        'pricing-agent': {'input': ['listing_data'], 'output': 'pricing_data'},
        'publisher': {'input': ['listing_data', 'image_data', 'pricing_data']}
    }
)

# 配置客服协同模式
orchestrator.configure_collaboration(
    pattern='fan_out',
    agents=['message-dispatcher', 'intent-recognizer', 'kb-searcher', 'answer-generator'],
    data_flow={
        'message-dispatcher': {'output': 'message'},
        'intent-recognizer': {'input': 'message', 'output': 'intent'},
        'kb-searcher': {'input': 'intent', 'output': 'knowledge'},
        'answer-generator': {'input': ['intent', 'knowledge'], 'output': 'response'}
    }
)
```

---

### 阶段三：监控预警（3-4天）

#### 3.1 监控指标定义

**核心监控指标：**

```python
monitoring_metrics = {
    'business_metrics': {
        'sales': {
            'daily_sales': {'threshold': '>1000', 'alert_level': 'warning'},
            'conversion_rate': {'threshold': '<5%', 'alert_level': 'warning'},
            'order_volume': {'threshold': '<50', 'alert_level': 'critical'}
        },
        'inventory': {
            'stock_level': {'threshold': '<10', 'alert_level': 'critical'},
            'out_of_stock_rate': {'threshold': '>5%', 'alert_level': 'warning'},
            'turnover_rate': {'threshold': '<2', 'alert_level': 'info'}
        },
        'pricing': {
            'price_competitiveness': {'threshold': '<0.9', 'alert_level': 'warning'},
            'price_change_frequency': {'threshold': '>10/day', 'alert_level': 'info'}
        },
        'advertising': {
            'acos': {'threshold': '>30%', 'alert_level': 'warning'},
            'ctr': {'threshold': '<1%', 'alert_level': 'warning'},
            'impressions': {'threshold': '<1000', 'alert_level': 'info'}
        }
    },
    'operational_metrics': {
        'order_processing': {
            'processing_time': {'threshold': '>2h', 'alert_level': 'warning'},
            'error_rate': {'threshold': '>5%', 'alert_level': 'critical'},
            'fulfillment_rate': {'threshold': '<95%', 'alert_level': 'warning'}
        },
        'customer_service': {
            'response_time': {'threshold': '>30min', 'alert_level': 'warning'},
            'resolution_rate': {'threshold': '<80%', 'alert_level': 'warning'},
            'satisfaction_score': {'threshold': '<4.0', 'alert_level': 'warning'}
        },
        'system_performance': {
            'api_success_rate': {'threshold': '<99%', 'alert_level': 'warning'},
            'response_time': {'threshold': '>500ms', 'alert_level': 'warning'},
            'error_rate': {'threshold': '>1%', 'alert_level': 'critical'}
        }
    }
}
```

#### 3.2 监控系统配置

**监控服务配置：**

```python
class MonitoringService:
    """监控服务（不依赖外部库）"""
    def __init__(self):
        self.metrics = {}
    
    def track_metric(self, metric_name, value, tags=None):
        self.metrics[metric_name] = {'value': value, 'tags': tags or {}}
    
    def get_metrics(self):
        return self.metrics

monitor = MonitoringService()

# 配置销售监控
monitor.add_metric(
    name='daily_sales',
    type='gauge',
    source='sales_database',
    query='SELECT SUM(amount) FROM sales WHERE date = CURRENT_DATE',
    threshold={
        'warning': {'condition': '<1000', 'action': 'send_alert'},
        'critical': {'condition': '<500', 'action': 'escalate_alert'}
    },
    alert_channels=['email', 'slack', 'sms']
)

# 配置库存监控
monitor.add_metric(
    name='stock_level',
    type='gauge',
    source='inventory_database',
    query='SELECT MIN(quantity) FROM inventory',
    threshold={
        'warning': {'condition': '<20', 'action': 'send_alert'},
        'critical': {'condition': '<10', 'action': 'create_reorder_task'}
    },
    alert_channels=['email', 'slack']
)

# 配置订单处理监控
monitor.add_metric(
    name='processing_time',
    type='histogram',
    source='order_logs',
    query='SELECT processing_time FROM orders WHERE status = "completed"',
    threshold={
        'warning': {'condition': 'p95 > 2h', 'action': 'send_alert'},
        'critical': {'condition': 'p99 > 4h', 'action': 'escalate_alert'}
    },
    alert_channels=['email', 'slack', 'pagerduty']
)

# 配置ACOS监控
monitor.add_metric(
    name='acos',
    type='gauge',
    source='ad_database',
    query='SELECT (ad_spend / ad_revenue) * 100 FROM ads WHERE date = CURRENT_DATE',
    threshold={
        'warning': {'condition': '>30%', 'action': 'optimize_ads'},
        'critical': {'condition': '>50%', 'action': 'pause_ads'}
    },
    alert_channels=['email', 'slack']
)
```

#### 3.3 预警系统配置

**预警规则配置：**

```python
class AlertSystem:
    """预警系统（不依赖外部库）"""
    def __init__(self):
        self.rules = []
    
    def add_rule(self, name, condition, severity, message):
        self.rules.append({
            'name': name,
            'condition': condition,
            'severity': severity,
            'message': message
        })
    
    def check(self, context):
        triggered = []
        for rule in self.rules:
            if rule['condition'](context):
                triggered.append(rule)
        return triggered

alert_system = AlertSystem()

# 定义预警规则
alert_rules = [
    {
        'name': 'low_inventory_alert',
        'condition': lambda ctx: ctx['stock_level'] < ctx['reorder_point'],
        'severity': 'critical',
        'message': '库存不足警告: 产品{product_id}库存仅剩{stock_level}件',
        'channels': ['email', 'slack', 'sms'],
        'actions': ['create_reorder_task', 'notify_supplier']
    },
    {
        'name': 'high_acos_alert',
        'condition': lambda ctx: ctx['acos'] > 50,
        'severity': 'warning',
        'message': 'ACOS过高警告: 当前ACOS为{acos}%',
        'channels': ['email', 'slack'],
        'actions': ['optimize_keywords', 'adjust_bids']
    },
    {
        'name': 'order_processing_delay',
        'condition': lambda ctx: ctx['pending_orders'] > 100,
        'severity': 'warning',
        'message': '订单积压警告: 当前有{pending_orders}个待处理订单',
        'channels': ['email', 'slack'],
        'actions': ['scale_up_workers', 'notify_manager']
    },
    {
        'name': 'negative_review_spike',
        'condition': lambda ctx: ctx['negative_review_rate'] > 10,
        'severity': 'critical',
        'message': '差评激增警告: 差评率达到{negative_review_rate}%',
        'channels': ['email', 'slack', 'sms'],
        'actions': ['analyze_reviews', 'escalate_to_manager']
    }
]

# 注册预警规则
for rule in alert_rules:
    alert_system.register_rule(rule)

# 配置预警渠道
alert_system.configure_channel('email', {
    'recipients': ['ops@example.com', 'manager@example.com'],
    'template': 'email_alert_template.html'
})

alert_system.configure_channel('slack', {
    'webhook_url': 'https://hooks.slack.com/services/...',
    'channel': '#operations-alerts'
})

alert_system.configure_channel('sms', {
    'recipients': ['+1234567890'],
    'provider': 'twilio'
})
```

---

### 阶段四：异常处理（3-4天）

#### 4.1 异常类型识别

**异常分类体系：**

```python
exception_types = {
    'business_exceptions': {
        'inventory_exceptions': {
            'out_of_stock': {
                'severity': 'critical',
                'auto_recovery': False,
                'manual_intervention': True
            },
            'inventory_mismatch': {
                'severity': 'warning',
                'auto_recovery': True,
                'manual_intervention': False
            }
        },
        'order_exceptions': {
            'payment_failed': {
                'severity': 'warning',
                'auto_recovery': True,
                'manual_intervention': False
            },
            'shipping_exception': {
                'severity': 'critical',
                'auto_recovery': False,
                'manual_intervention': True
            }
        },
        'pricing_exceptions': {
            'price_error': {
                'severity': 'critical',
                'auto_recovery': True,
                'manual_intervention': False
            },
            'competitor_price_drop': {
                'severity': 'warning',
                'auto_recovery': True,
                'manual_intervention': False
            }
        }
    },
    'technical_exceptions': {
        'api_exceptions': {
            'api_timeout': {
                'severity': 'warning',
                'auto_recovery': True,
                'manual_intervention': False
            },
            'api_rate_limit': {
                'severity': 'warning',
                'auto_recovery': True,
                'manual_intervention': False
            },
            'api_authentication_error': {
                'severity': 'critical',
                'auto_recovery': False,
                'manual_intervention': True
            }
        },
        'system_exceptions': {
            'database_connection_error': {
                'severity': 'critical',
                'auto_recovery': True,
                'manual_intervention': False
            },
            'memory_error': {
                'severity': 'critical',
                'auto_recovery': True,
                'manual_intervention': False
            }
        }
    }
}
```

#### 4.2 异常处理策略

**异常处理配置：**

```python
class ExceptionHandler:
    """异常处理器（不依赖外部库）"""
    def __init__(self):
        self.strategies = {}
    
    def register_strategy(self, exception_type, strategy):
        self.strategies[exception_type] = strategy
    
    def handle(self, exception, context):
        strategy = self.strategies.get(exception)
        if strategy:
            return {'handled': True, 'action': strategy}
        return {'handled': False}

handler = ExceptionHandler()

# 定义异常处理策略
handler.register_strategy(
    exception_type='out_of_stock',
    strategy={
        'immediate_actions': [
            {'action': 'pause_advertising', 'params': {'product_id': '${product_id}'}},
            {'action': 'notify_team', 'params': {'channel': 'slack'}}
        ],
        'auto_recovery': {
            'enabled': False,
            'reason': '需要人工确认补货计划'
        },
        'manual_intervention': {
            'required': True,
            'assignee': 'inventory_manager',
            'timeout': '2h'
        },
        'escalation': {
            'if_not_resolved': '4h',
            'escalate_to': 'operations_manager'
        }
    }
)

handler.register_strategy(
    exception_type='payment_failed',
    strategy={
        'immediate_actions': [
            {'action': 'retry_payment', 'params': {'max_retries': 3}},
            {'action': 'notify_customer', 'params': {'template': 'payment_failed'}}
        ],
        'auto_recovery': {
            'enabled': True,
            'max_attempts': 3,
            'retry_delay': '5min'
        },
        'manual_intervention': {
            'required': False
        },
        'escalation': {
            'if_not_resolved': '1h',
            'escalate_to': 'customer_service'
        }
    }
)

handler.register_strategy(
    exception_type='api_timeout',
    strategy={
        'immediate_actions': [
            {'action': 'log_error', 'params': {}},
            {'action': 'switch_to_backup', 'params': {}}
        ],
        'auto_recovery': {
            'enabled': True,
            'max_attempts': 5,
            'retry_delay': '1min'
        },
        'manual_intervention': {
            'required': False
        },
        'escalation': {
            'if_not_resolved': '30min',
            'escalate_to': 'devops_team'
        }
    }
)
```

#### 4.3 回滚和恢复机制

**回滚机制配置：**

```python
class RollbackManager:
    """回滚管理器（不依赖外部库）"""
    def __init__(self):
        self.checkpoints = {}
    
    def define_checkpoint(self, name, data):
        self.checkpoints[name] = data
    
    def rollback(self, checkpoint_name):
        return self.checkpoints.get(checkpoint_name)

rollback = RollbackManager()

# 定义回滚点
rollback.define_checkpoint(
    name='before_price_change',
    data={
        'product_id': '${product_id}',
        'old_price': '${old_price}',
        'new_price': '${new_price}',
        'timestamp': '${timestamp}'
    }
)

rollback.define_checkpoint(
    name='before_listing_update',
    data={
        'product_id': '${product_id}',
        'old_listing': '${old_listing}',
        'new_listing': '${new_listing}',
        'timestamp': '${timestamp}'
    }
)

# 配置回滚策略
rollback.configure_strategy(
    exception='price_update_failed',
    action='rollback_to_checkpoint',
    checkpoint='before_price_change'
)

rollback.configure_strategy(
    exception='listing_update_failed',
    action='rollback_to_checkpoint',
    checkpoint='before_listing_update'
)

# 配置恢复机制
rollback.configure_recovery(
    exception='price_update_failed',
    recovery_steps=[
        {'step': 'verify_api_connection'},
        {'step': 'validate_price_data'},
        {'step': 'retry_price_update'}
    ]
)
```

---

## 多Agent协同方案

### Agent角色定义

```python
agent_roles = {
    'coordinator': {
        'description': '协调者Agent',
        'responsibilities': [
            '任务分配',
            '进度监控',
            '异常协调',
            '资源调度'
        ],
        'capabilities': ['task_scheduling', 'resource_management', 'exception_handling']
    },
    'product_selector': {
        'description': '选品Agent',
        'responsibilities': [
            '市场分析',
            '竞品分析',
            '需求预测',
            'ROI评估'
        ],
        'capabilities': ['market_analysis', 'competitor_analysis', 'demand_forecasting']
    },
    'listing_optimizer': {
        'description': 'Listing优化Agent',
        'responsibilities': [
            '关键词研究',
            '标题优化',
            '描述优化',
            'SEO优化'
        ],
        'capabilities': ['keyword_research', 'content_optimization', 'seo_optimization']
    },
    'pricing_agent': {
        'description': '定价Agent',
        'responsibilities': [
            '价格监控',
            '竞品价格分析',
            '动态定价',
            '促销管理'
        ],
        'capabilities': ['price_monitoring', 'competitor_analysis', 'dynamic_pricing']
    },
    'inventory_manager': {
        'description': '库存管理Agent',
        'responsibilities': [
            '库存监控',
            '销量预测',
            '补货计算',
            '供应商管理'
        ],
        'capabilities': ['inventory_monitoring', 'sales_forecasting', 'reorder_calculation']
    },
    'order_processor': {
        'description': '订单处理Agent',
        'responsibilities': [
            '订单接收',
            '支付验证',
            '库存分配',
            '发货协调'
        ],
        'capabilities': ['order_processing', 'payment_verification', 'inventory_allocation']
    },
    'customer_service_agent': {
        'description': '客服Agent',
        'responsibilities': [
            '消息接收',
            '意图识别',
            '答案生成',
            '人工接管'
        ],
        'capabilities': ['nlp', 'knowledge_base', 'sentiment_analysis']
    },
    'ad_manager': {
        'description': '广告管理Agent',
        'responsibilities': [
            '广告创建',
            '关键词优化',
            '出价调整',
            '效果分析'
        ],
        'capabilities': ['ad_creation', 'keyword_optimization', 'bid_management']
    }
}
```

### Agent通信协议

```python
class AgentMessageBus:
    """Agent消息总线（不依赖外部库）"""
    def __init__(self):
        self.subscribers = {}
        self.messages = []
    
    def subscribe(self, agent_id, message_type):
        if message_type not in self.subscribers:
            self.subscribers[message_type] = []
        self.subscribers[message_type].append(agent_id)
    
    def publish(self, message_type, payload):
        self.messages.append({'type': message_type, 'payload': payload})
        return {'delivered_to': self.subscribers.get(message_type, [])}

bus = AgentMessageBus()

# 定义消息类型
message_types = {
    'task_assignment': {
        'fields': ['task_id', 'task_type', 'parameters', 'deadline'],
        'priority': 'high'
    },
    'task_completion': {
        'fields': ['task_id', 'result', 'status', 'duration'],
        'priority': 'medium'
    },
    'data_request': {
        'fields': ['data_type', 'filters', 'format'],
        'priority': 'medium'
    },
    'data_response': {
        'fields': ['data_type', 'data', 'format'],
        'priority': 'medium'
    },
    'exception_notification': {
        'fields': ['exception_type', 'details', 'severity'],
        'priority': 'critical'
    },
    'status_update': {
        'fields': ['agent_id', 'status', 'progress'],
        'priority': 'low'
    }
}

# 配置消息路由
bus.configure_routing(
    from_agent='coordinator',
    to_agent='*',
    message_types=['task_assignment', 'status_update']
)

bus.configure_routing(
    from_agent='*',
    to_agent='coordinator',
    message_types=['task_completion', 'exception_notification']
)

bus.configure_routing(
    from_agent='*',
    to_agent='*',
    message_types=['data_request', 'data_response']
)
```

### 协同场景示例

**场景1：新产品上架**

```python
# 协同流程
def new_product_launch(product_data):
    """新产品上架协同流程"""
    
    # 1. 协调者分配任务
    coordinator.send_message(
        to='product_selector',
        message_type='task_assignment',
        payload={
            'task_id': 'select_product_001',
            'task_type': 'market_analysis',
            'parameters': {'product': product_data},
            'deadline': '2026-02-15 18:00:00'
        }
    )
    
    # 2. 选品Agent完成分析
    product_selector.on_task_complete({
        'task_id': 'select_product_001',
        'result': {'market_score': 85, 'recommended': True}
    })
    
    # 3. 协调者分配后续任务
    coordinator.send_message(
        to='listing_optimizer',
        message_type='task_assignment',
        payload={
            'task_id': 'optimize_listing_001',
            'task_type': 'listing_optimization',
            'parameters': {'product': product_data}
        }
    )
    
    # 4. 并行执行图片处理和定价
    coordinator.send_message(
        to=['image_processor', 'pricing_agent'],
        message_type='task_assignment',
        payload={
            'task_id': 'prepare_publishing_001',
            'task_type': 'preparation',
            'parameters': {'product': product_data}
        }
    )
    
    # 5. 等待所有任务完成
    coordinator.wait_for_completion(['optimize_listing_001', 'prepare_publishing_001'])
    
    # 6. 发布Listing
    coordinator.send_message(
        to='publisher',
        message_type='task_assignment',
        payload={
            'task_id': 'publish_listing_001',
            'task_type': 'publish',
            'parameters': {
                'listing': coordinator.get_result('optimize_listing_001'),
                'images': coordinator.get_result('prepare_publishing_001')['images'],
                'pricing': coordinator.get_result('prepare_publishing_001')['pricing']
            }
        }
    )
    
    # 7. 初始化广告
    coordinator.send_message(
        to='ad_manager',
        message_type='task_assignment',
        payload={
            'task_id': 'init_ads_001',
            'task_type': 'ad_initialization',
            'parameters': {'product': product_data}
        }
    )
```

**场景2：订单自动处理**

```python
def process_order_automatically(order):
    """订单自动处理协同流程"""
    
    # 1. 订单接收Agent接收订单
    order_processor.receive_order(order)
    
    # 2. 库存检查
    inventory_status = inventory_manager.check_stock(order['product_id'], order['quantity'])
    
    if inventory_status['available']:
        # 3. 支付验证
        payment_status = payment_verifier.verify(order['payment_info'])
        
        if payment_status['valid']:
            # 4. 并行执行：生成物流标签、通知客户、更新库存
            parallel_tasks = [
                {'agent': 'label_generator', 'task': 'generate_label'},
                {'agent': 'notification_sender', 'task': 'notify_customer'},
                {'agent': 'inventory_manager', 'task': 'reserve_stock'}
            ]
            
            results = execute_parallel(parallel_tasks, order)
            
            # 5. 发货
            shipper.ship(order, results['label_generator']['label'])
            
            # 6. 启动物流跟踪
            tracker.start_tracking(order['order_id'], results['label_generator']['tracking_number'])
            
            return {'status': 'processed', 'order_id': order['order_id']}
        else:
            # 支付失败处理
            return handle_payment_failure(order)
    else:
        # 库存不足处理
        return handle_insufficient_stock(order)
```

---

## 关键指标KPI

### 自动化效率指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 自动化率 | ≥ 80% | 自动化任务数 / 总任务数 | 每日 |
| 任务执行成功率 | ≥ 95% | 成功任务数 / 总任务数 | 每日 |
| 平均执行时间 | ≤ 30分钟 | 任务总时长 / 任务数 | 每日 |
| 资源利用率 | ≥ 70% | 已使用资源 / 总资源 | 每小时 |

### 业务绩效指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 订单处理时效 | ≤ 2小时 | 平均订单处理时间 | 每日 |
| 客服响应时间 | ≤ 30分钟 | 平均客服响应时间 | 每日 |
| 库存周转率 | ≥ 4次/年 | 年销售成本 / 平均库存 | 每月 |
| 价格竞争力指数 | ≤ 1.1 | 产品价格 / 竞品平均价格 | 每周 |

### 系统稳定性指标

| 指标 | 目标值 | 计算方式 | 监控频率 |
|------|--------|----------|----------|
| 系统可用性 | ≥ 99.9% | 正常运行时间 / 总时间 | 实时 |
| 异常恢复时间 | ≤ 10分钟 | 平均异常恢复时间 | 实时 |
| 数据一致性 | 100% | 一致数据 / 总数据 | 每日 |
| API成功率 | ≥ 99.5% | 成功请求 / 总请求 | 实时 |

---

## 实战示例

### 示例1：自动化产品上架流程

**场景：** 自动完成从选品到上架的全流程

**执行流程：**

```python
class OperationsOrchestrator:
    """运营编排器（不依赖外部库）"""
    def __init__(self):
        self.workflows = {}
    
    def create_workflow(self, name):
        wf = {'name': name, 'steps': []}
        self.workflows[name] = wf
        return wf
    
    def execute(self, workflow_name, context):
        wf = self.workflows.get(workflow_name)
        if wf:
            return {'status': 'completed', 'steps': len(wf['steps'])}
        return {'status': 'not_found'}

# 初始化运营编排器
orchestrator = OperationsOrchestrator()

# 定义产品上架工作流
workflow = orchestrator.create_workflow('product_launch')

# 1. 选品分析
workflow.add_step('select_product', agent='product-selector', params={
    'category': 'wireless earbuds',
    'market': 'US',
    'budget': 5000
})

# 2. Listing优化
workflow.add_step('optimize_listing', agent='listing-optimizer', depends_on=['select_product'])

# 3. 图片处理
workflow.add_step('process_images', agent='image-processor', depends_on=['select_product'])

# 4. 定价
workflow.add_step('set_pricing', agent='pricing-agent', depends_on=['optimize_listing'])

# 5. 库存配置
workflow.add_step('configure_inventory', agent='inventory-manager', depends_on=['select_product'])

# 6. 并行：等待Listing、图片、定价、库存都完成
workflow.add_barrier('ready_to_publish', depends_on=[
    'optimize_listing', 'process_images', 'set_pricing', 'configure_inventory'
])

# 7. 发布
workflow.add_step('publish', agent='publisher', depends_on=['ready_to_publish'])

# 8. 初始化广告
workflow.add_step('init_ads', agent='ad-manager', depends_on=['publish'])

# 执行工作流
result = orchestrator.execute_workflow('product_launch')

print(f"产品上架成功: {result['published']}")
print(f"Listing ID: {result['listing_id']}")
print(f"广告活动ID: {result['ad_campaign_id']}")
```

---

### 示例2：智能客服系统

**场景：** 自动处理客户咨询

**执行流程：**

```python
class CustomerServiceBot:
    """客服机器人（不依赖外部库）"""
    def __init__(self):
        self.knowledge_bases = []
        self.intents = []
    
    def load_knowledge_base(self, kb_file):
        self.knowledge_bases.append(kb_file)
    
    def configure_intents(self, intents):
        self.intents = intents
    
    def process_query(self, query):
        return {'response': 'Processed query', 'confidence': 0.9}

# 初始化客服Bot
bot = CustomerServiceBot()

# 配置知识库
bot.load_knowledge_base('product_kb.json')
bot.load_knowledge_base('shipping_kb.json')
bot.load_knowledge_base('returns_kb.json')

# 配置意图识别
bot.configure_intents([
    {'name': 'order_status', 'patterns': ['where is my order', 'order tracking', 'delivery status']},
    {'name': 'product_info', 'patterns': ['how to use', 'product features', 'specifications']},
    {'name': 'shipping', 'patterns': ['shipping cost', 'delivery time', 'free shipping']},
    {'name': 'returns', 'patterns': ['return policy', 'how to return', 'refund']},
    {'name': 'complaint', 'patterns': ['not working', 'broken', 'poor quality']}
])

# 配置人工接管条件
bot.configure_handoff_conditions([
    {'intent': 'complaint', 'sentiment': 'negative'},
    {'intent': 'returns', 'value': '>100'},
    {'unresolved_queries': '>3'}
])

# 处理客户消息
def handle_customer_message(customer_id, message):
    # 1. 识别意图
    intent = bot.recognize_intent(message)
    
    # 2. 检查是否需要人工接管
    if bot.should_handoff(intent, customer_id, message):
        return bot.handoff_to_human(customer_id, message)
    
    # 3. 搜索知识库
    knowledge = bot.search_knowledge_base(intent, message)
    
    # 4. 生成回答
    response = bot.generate_response(intent, knowledge, message)
    
    # 5. 发送回答
    bot.send_response(customer_id, response)
    
    # 6. 跟踪满意度
    bot.track_satisfaction(customer_id, response)
    
    return response

# 测试
response = handle_customer_message(
    customer_id='customer_123',
    message='Where is my order? I ordered 3 days ago.'
)

print(response)
# 输出: "Hello! I've checked your order #12345. It's currently in transit and expected to be delivered by Feb 15. You can track your package here: [tracking link]. Is there anything else I can help you with?"
```

---

## 边界情况处理

### 1. Agent通信失败

**问题：** Agent之间通信中断

**解决方案：**

```python
def handle_communication_failure(from_agent, to_agent, message):
    """处理通信失败"""
    # 1. 重试机制
    retry_result = retry_message(from_agent, to_agent, message, max_retries=3)
    
    if retry_result['success']:
        return retry_result
    
    # 2. 使用备用Agent
    backup_agent = find_backup_agent(to_agent)
    if backup_agent:
        backup_result = send_message(from_agent, backup_agent, message)
        if backup_result['success']:
            return backup_result
    
    # 3. 缓存消息，等待恢复
    cache_message(message, metadata={
        'from': from_agent,
        'to': to_agent,
        'timestamp': datetime.now()
    })
    
    # 4. 通知协调者
    notify_coordinator({
        'type': 'communication_failure',
        'from': from_agent,
        'to': to_agent,
        'message_id': message['id']
    })
    
    # 5. 启动恢复流程
    start_recovery_process(from_agent, to_agent)
```

### 2. 任务死锁

**问题：** 多个Agent互相等待，导致死锁

**解决方案：**

```python
def handle_deadlock(agents_involved):
    """处理死锁"""
    # 1. 检测死锁
    deadlock_detected = detect_deadlock(agents_involved)
    
    if not deadlock_detected:
        return
    
    # 2. 识别死锁原因
    cause = analyze_deadlock_cause(agents_involved)
    
    # 3. 解决策略
    if cause['type'] == 'circular_wait':
        # 打破循环等待
        break_circular_wait(agents_involved, break_at=cause['break_point'])
    elif cause['type'] == 'resource_exhaustion':
        # 释放资源
        release_resources(agents_involved)
    elif cause['type'] == 'timeout':
        # 超时处理
        handle_timeout(agents_involved)
    
    # 4. 重启受影响的任务
    restart_tasks(agents_involved)
    
    # 5. 记录死锁事件
    log_deadlock_event(agents_involved, cause)
    
    # 6. 优化资源分配策略
    optimize_resource_allocation()
```

### 3. 级联故障

**问题：** 一个Agent故障导致连锁反应

**解决方案：**

```python
def handle_cascading_failure(initial_failure):
    """处理级联故障"""
    # 1. 隔离故障Agent
    isolate_agent(initial_failure['agent_id'])
    
    # 2. 识别影响范围
    affected_agents = identify_affected_agents(initial_failure)
    
    # 3. 启动备用Agent
    for agent_id in affected_agents:
        backup = activate_backup_agent(agent_id)
        if backup:
            transfer_state(agent_id, backup)
    
    # 4. 恢复任务
    recover_tasks(affected_agents)
    
    # 5. 验证系统状态
    system_status = verify_system_health()
    
    if not system_status['healthy']:
        # 进入降级模式
        enter_degraded_mode()
    
    # 6. 通知相关人员
    notify_team({
        'type': 'cascading_failure',
        'initial_failure': initial_failure,
        'affected_agents': affected_agents,
        'actions_taken': 'Backup activated, tasks recovered'
    })
```

---

## 工具和资源

### 工作流引擎

| 工具 | 语言 | 推荐指数 | 备注 |
|------|------|----------|------|
| Apache Airflow | Python | ⭐⭐⭐⭐⭐ | 功能强大，社区活跃 |
| Prefect | Python | ⭐⭐⭐⭐⭐ | 现代化，易用 |
| Temporal | Go/Python | ⭐⭐⭐⭐ | 分布式工作流 |
| n8n | JavaScript | ⭐⭐⭐⭐ | 可视化工作流 |

### 监控工具

| 工具 | 功能 | 价格 | 推荐指数 |
|------|------|------|----------|
| Prometheus | 指标监控 | 免费 | ⭐⭐⭐⭐⭐ |
| Grafana | 可视化 | 免费 | ⭐⭐⭐⭐⭐ |
| ELK Stack | 日志分析 | 免费 | ⭐⭐⭐⭐⭐ |
| Datadog | APM | 付费 | ⭐⭐⭐⭐ |

### 消息队列

| 工具 | 协议 | 价格 | 推荐指数 |
|------|------|------|----------|
| RabbitMQ | AMQP | 免费 | ⭐⭐⭐⭐⭐ |
| Redis Pub/Sub | Redis | 免费 | ⭐⭐⭐⭐ |
| Apache Kafka | Kafka | 免费 | ⭐⭐⭐⭐⭐ |
| Amazon SQS | HTTP | 按使用量付费 | ⭐⭐⭐⭐ |

---

## 成功标准

### 短期目标（1-3个月）

- ✅ 核心流程自动化率≥70%
- ✅ 任务执行成功率≥95%
- ✅ 异常自动恢复率≥80%
- ✅ 人力成本降低≥40%

### 中期目标（3-6个月）

- ✅ 建立完整的自动化运营体系
- ✅ 自动化率≥90%
- ✅ 24小时无人值守运营
- ✅ 多平台统一管理

### 长期目标（6-12个月）

- ✅ 打造智能化运营平台
- ✅ 自动化率≥95%
- ✅ AI决策辅助≥50%
- ✅ 成为行业标杆

---

## 附录

### A. Agent通信协议规范

```json
{
  "message": {
    "id": "msg_001",
    "type": "task_assignment",
    "from": "coordinator",
    "to": "product-selector",
    "timestamp": "2026-02-12T10:00:00Z",
    "priority": "high",
    "payload": {
      "task_id": "task_001",
      "task_type": "market_analysis",
      "parameters": {
        "category": "wireless earbuds",
        "market": "US"
      },
      "deadline": "2026-02-15T18:00:00Z"
    }
  }
}
```

### B. 工作流配置示例

```yaml
workflow:
  name: product_launch
  description: 自动产品上架流程
  trigger:
    type: event
    event: product_selected
  
  steps:
    - id: select_product
      agent: product-selector
      params:
        category: "${input.category}"
        market: "${input.market}"
    
    - id: optimize_listing
      agent: listing-optimizer
      depends_on: [select_product]
    
    - id: process_images
      agent: image-processor
      depends_on: [select_product]
    
    - id: set_pricing
      agent: pricing-agent
      depends_on: [optimize_listing]
    
    - id: configure_inventory
      agent: inventory-manager
      depends_on: [select_product]
    
    - id: publish
      agent: publisher
      depends_on: [optimize_listing, process_images, set_pricing, configure_inventory]
    
    - id: init_ads
      agent: ad-manager
      depends_on: [publish]
```

---

**技能版本：** 1.0.0  
**最后更新：** 2026-02-12  
**维护团队：** 跨境电商技术团队