const fs = require('fs');
const path = require('path');

class SocialScienceSkillsManager {
    constructor() {
        // 定义社会科学技能
        this.skills = {
            'processing-citations': {
                id: 'processing-citations',
                name: '中文引用处理',
                category: 'social-science',
                description: '处理中文社会科学文献引用，包括GB/T 7714标准格式化、引用规范性检查、期刊格式适配和引用完整性验证',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    document: {
                        required: true,
                        description: '需要处理的文档内容',
                        type: 'string'
                    },
                    journal: {
                        required: false,
                        description: '目标期刊名称（可选）',
                        type: 'string'
                    },
                    format: {
                        required: false,
                        description: '引用格式标准，默认为GB/T 7714',
                        type: 'string',
                        default: 'GB/T 7714'
                    }
                },
                examples: [
                    '帮我格式化这份文档的引用，使用GB/T 7714标准',
                    '检查参考文献的格式是否符合要求'
                ]
            },
            'performing-open-coding': {
                id: 'performing-open-coding',
                name: '开放编码',
                category: 'social-science',
                description: '执行扎根理论的开放编码过程，包括中文质性数据的概念识别、初始编码、持续比较和备忘录撰写',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    data: {
                        required: true,
                        description: '质性数据（访谈文本、观察记录等）',
                        type: 'string'
                    },
                    memo: {
                        required: false,
                        description: '是否生成编码备忘录',
                        type: 'boolean',
                        default: true
                    }
                },
                examples: [
                    '对这段访谈文本进行开放编码',
                    '帮我识别文本中的概念并进行初始编码'
                ]
            },
            'performing-axial-coding': {
                id: 'performing-axial-coding',
                name: '轴心编码',
                category: 'social-science',
                description: '执行扎根理论的轴心编码过程，建立概念之间的关系，形成范畴',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    codes: {
                        required: true,
                        description: '开放编码结果',
                        type: 'array'
                    },
                    context: {
                        required: false,
                        description: '编码上下文信息',
                        type: 'string'
                    }
                },
                examples: [
                    '对这些开放编码结果进行轴心编码',
                    '分析概念之间的关系并形成范畴'
                ]
            },
            'performing-selective-coding': {
                id: 'performing-selective-coding',
                name: '选择式编码',
                category: 'social-science',
                description: '执行扎根理论的选择式编码过程，确定核心范畴并构建理论',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    axial_codes: {
                        required: true,
                        description: '轴心编码结果',
                        type: 'array'
                    },
                    theory: {
                        required: false,
                        description: '初始理论框架',
                        type: 'string'
                    }
                },
                examples: [
                    '对这些轴心编码结果进行选择式编码',
                    '确定核心范畴并构建理论'
                ]
            },
            'theory-saturation': {
                id: 'theory-saturation',
                name: '理论饱和度检验',
                category: 'social-science',
                description: '检验理论发展的饱和度，评估是否需要收集更多数据',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    theory: {
                        required: true,
                        description: '当前理论框架',
                        type: 'string'
                    },
                    data: {
                        required: true,
                        description: '用于检验的数据',
                        type: 'string'
                    }
                },
                examples: [
                    '检验这个理论框架的饱和度',
                    '评估当前理论是否需要更多数据'
                ]
            },
            'memo-writing': {
                id: 'memo-writing',
                name: '备忘录撰写',
                category: 'social-science',
                description: '撰写质性研究备忘录，记录编码过程和理论思考',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    content: {
                        required: true,
                        description: '备忘录内容',
                        type: 'string'
                    },
                    topic: {
                        required: false,
                        description: '备忘录主题',
                        type: 'string'
                    }
                },
                examples: [
                    '为这个编码过程撰写备忘录',
                    '记录我的理论思考过程'
                ]
            },
            'centrality-analysis': {
                id: 'centrality-analysis',
                name: '中心性分析',
                category: 'social-science',
                description: '社会网络分析中的中心性分析，包括度中心性、接近中心性、中介中心性等指标计算',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    networkData: {
                        required: true,
                        description: '网络数据',
                        type: 'string'
                    },
                    centralityType: {
                        required: false,
                        description: '中心性类型（度、接近、中介等）',
                        type: 'string',
                        default: 'all'
                    }
                },
                examples: [
                    '对这个网络进行中心性分析',
                    '计算节点的中介中心性指标'
                ]
            },
            'network-computation': {
                id: 'network-computation',
                name: '网络计算',
                category: 'social-science',
                description: '社会网络的各种计算任务，如密度、聚类系数、连通分量等',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    networkData: {
                        required: true,
                        description: '网络数据',
                        type: 'string'
                    },
                    computationType: {
                        required: true,
                        description: '计算类型（密度、聚类、连通分量等）',
                        type: 'string'
                    }
                },
                examples: [
                    '计算这个网络的密度',
                    '分析网络的聚类系数'
                ]
            },
            'network-data-processing': {
                id: 'network-data-processing',
                name: '网络数据处理',
                category: 'social-science',
                description: '社会网络数据的收集、清洗、格式化和预处理',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    rawData: {
                        required: true,
                        description: '原始网络数据',
                        type: 'string'
                    },
                    format: {
                        required: false,
                        description: '输出格式',
                        type: 'string',
                        default: 'edgelist'
                    }
                },
                examples: [
                    '帮我处理这个网络数据文件',
                    '将网络数据转换为Gephi可用格式'
                ]
            },
            'paper-structure': {
                id: 'paper-structure',
                name: '论文结构',
                category: 'social-science',
                description: '构建和评估社会科学论文的结构，包括章节安排、逻辑连贯性、论证完整性等',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    paperContent: {
                        required: false,
                        description: '论文内容（可选，如果没有则分析结构要素）',
                        type: 'string'
                    },
                    structureType: {
                        required: false,
                        description: '论文类型（实证研究、综述、理论文章等）',
                        type: 'string',
                        default: 'empirical'
                    }
                },
                examples: [
                    '帮我构建一篇实证研究论文的结构',
                    '评估这篇论文的结构合理性'
                ]
            },
            'conflict-resolution': {
                id: 'conflict-resolution',
                name: '冲突解决',
                category: 'social-science',
                description: '社会科学中的冲突识别、分析和解决策略制定',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    conflictDescription: {
                        required: true,
                        description: '冲突的具体描述',
                        type: 'string'
                    },
                    parties: {
                        required: false,
                        description: '涉及各方的情况',
                        type: 'array'
                    }
                },
                examples: [
                    '分析这个组织内部的冲突情况',
                    '提出解决团队分歧的策略'
                ]
            },
            'dissent-resolution': {
                id: 'dissent-resolution',
                name: '异议解决',
                category: 'social-science',
                description: '处理和协调不同观点、意见分歧，促进共识达成',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    dissentDescription: {
                        required: true,
                        description: '异议的具体描述',
                        type: 'string'
                    },
                    viewpoints: {
                        required: false,
                        description: '不同观点详情',
                        type: 'array'
                    }
                },
                examples: [
                    '帮助处理这些不同的学术观点',
                    '协调团队中关于研究方法的分歧'
                ]
            },
            'mathematical-statistics': {
                id: 'mathematical-statistics',
                name: '数理统计',
                category: 'social-science',
                description: '社会科学中的统计分析，包括描述统计、推断统计、假设检验等',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    data: {
                        required: true,
                        description: '统计数据',
                        type: 'string'
                    },
                    analysisType: {
                        required: true,
                        description: '分析类型（描述统计、推断统计、相关分析、回归分析等）',
                        type: 'string'
                    }
                },
                examples: [
                    '对这组数据进行描述统计分析',
                    '执行相关性分析'
                ]
            },
            'research-design': {
                id: 'research-design',
                name: '研究设计',
                category: 'social-science',
                description: '社会科学研究的设计，包括研究问题确定、方法选择、变量定义、抽样策略等',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    researchTopic: {
                        required: true,
                        description: '研究主题',
                        type: 'string'
                    },
                    researchMethod: {
                        required: false,
                        description: '研究方法（定量、定性、混合方法）',
                        type: 'string',
                        default: 'mixed'
                    }
                },
                examples: [
                    '帮我设计关于社交媒体影响的研究方案',
                    '确定这个研究课题的抽样策略'
                ]
            },
            'validity-assessment': {
                id: 'validity-assessment',
                name: '效度评估',
                category: 'social-science',
                description: '评估研究的效度，包括内部效度、外部效度、结构效度、内容效度等',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    researchDesign: {
                        required: true,
                        description: '研究设计方案',
                        type: 'string'
                    },
                    validityType: {
                        required: false,
                        description: '效度类型（内部、外部、结构、内容）',
                        type: 'string',
                        default: 'all'
                    }
                },
                examples: [
                    '评估这项研究的内部效度',
                    '检查问卷调查的效度问题'
                ]
            },
            'validity-reliability': {
                id: 'validity-reliability',
                name: '效度信度',
                category: 'social-science',
                description: '评估研究的效度和信度，包括测量工具的信度分析和研究设计的效度检验',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    instrument: {
                        required: true,
                        description: '测量工具或研究设计',
                        type: 'string'
                    },
                    analysisType: {
                        required: false,
                        description: '分析类型（信度、效度或综合分析）',
                        type: 'string',
                        default: 'comprehensive'
                    }
                },
                examples: [
                    '分析这个问卷的信度',
                    '检验测量工具的效度和信度'
                ]
            },
            'paper-download': {
                id: 'paper-download',
                name: '论文下载',
                category: 'research-automation',
                description: '自动搜索和下载学术论文PDF，支持arXiv、PubMed、IEEE Xplore、ACL Anthology等学术数据库',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    query: {
                        required: true,
                        description: '搜索查询词或论文标题',
                        type: 'string'
                    },
                    sources: {
                        required: false,
                        description: '指定搜索来源（all, arxiv, pubmed, ieee, acl, cnki, etc.）',
                        type: 'string',
                        default: 'all'
                    },
                    maxResults: {
                        required: false,
                        description: '最大结果数量',
                        type: 'number',
                        default: 5
                    }
                },
                examples: [
                    '下载关于大语言模型在自然语言处理中应用的论文',
                    '获取关于transformer架构的最新研究',
                    '搜索并下载计算机视觉领域的论文'
                ]
            },
            'cnki-search': {
                id: 'cnki-search',
                name: '中国知网检索',
                category: 'research-automation',
                description: '使用持久化浏览器技术在中国知网(CNKI)中进行学术检索，支持关键词提示和PDF下载',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    query: {
                        required: true,
                        description: '在CNKI上搜索的关键词或题目',
                        type: 'string'
                    },
                    maxResults: {
                        required: false,
                        description: '最大结果数量',
                        type: 'number',
                        default: 10
                    },
                    downloadPdfs: {
                        required: false,
                        description: '是否尝试下载PDF（需要适当权限）',
                        type: 'boolean',
                        default: false
                    }
                },
                examples: [
                    '在中国知网上搜索关于数字化转型的论文',
                    '检索2023年发表的关于数字经济的文章',
                    '在中国知网搜索并下载指定论文的PDF'
                ]
            },
            'paper-doi': {
                id: 'paper-doi',
                name: '论文DOI',
                category: 'research-automation',
                description: '搜索学术论文的DOI、URL和引用信息，支持多种学术数据库的检索',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    query: {
                        required: true,
                        description: '搜索查询词或论文标题',
                        type: 'string'
                    },
                    sources: {
                        required: false,
                        description: '指定搜索来源（all, crossref, doi, semantic-scholar, etc.）',
                        type: 'string',
                        default: 'all'
                    }
                },
                examples: [
                    '获取关于BERT模型的论文DOI和引用信息',
                    '查找这篇论文的DOI和下载链接',
                    '搜索特定研究主题的DOI和URL'
                ]
            },
            'persistent-browser': {
                id: 'persistent-browser',
                name: '持久化浏览器',
                category: 'automation',
                description: '使用Playwright进行持久化浏览器操作，支持自动检测登录状态、手动登录流程、会话保存和复用，禁止使用无头浏览器模式',
                tools: ['claude', 'gemini', 'qwen', 'iflow'],
                parameters: {
                    website: {
                        required: true,
                        description: '目标网站URL',
                        type: 'string'
                    },
                    task: {
                        required: true,
                        description: '需要执行的具体任务',
                        type: 'string'
                    },
                    loginRequired: {
                        required: false,
                        description: '是否需要登录（默认自动检测）',
                        type: 'boolean',
                        default: false
                    }
                },
                examples: [
                    '帮我访问GitHub并获取我的仓库列表',
                    '访问淘宝搜索iPhone 15并获取前5个商品信息',
                    '登录LinkedIn并获取我的个人资料信息'
                ]
            }
        };
    }

    getSkill(skillId) {
        return this.skills[skillId];
    }

    getAllSkills(category = null) {
        if (category) {
            return Object.values(this.skills).filter(skill => skill.category === category);
        }
        return Object.values(this.skills);
    }

    // 实现具体的技能执行逻辑
    async executeCitationProcessing(parameters, tool) {
        const document = parameters.document;
        const journal = parameters.journal || '';
        const format = parameters.format || 'GB/T 7714';

        // 构建处理指令
        let instruction = `请按照${format}标准处理以下文档中的引用：\n\n${document}`;
        
        if (journal) {
            instruction += `\n\n特别注意适配${journal}期刊的特殊格式要求`;
        }

        // 添加处理步骤说明
        instruction += `\n\n处理步骤要求：\n`;
        instruction += `1. 识别文档中的所有引用\n`;
        instruction += `2. 按照${format}标准格式化\n`;
        instruction += `3. 检查格式一致性和规范性\n`;
        instruction += `4. 提供处理结果和改进建议`;

        return {
            success: true,
            output: `处理引用指令已生成：\n${instruction}`,
            skillId: 'processing-citations',
            mode: 'execution-instruction'
        };
    }

    async executeOpenCoding(parameters, tool) {
        const data = parameters.data;
        const memo = parameters.memo !== undefined ? parameters.memo : true;

        let instruction = `请对以下质性数据进行开放编码：\n\n${data}`;
        instruction += `\n\n编码要求：\n`;
        instruction += `1. 逐行分析数据，识别有意义的现象\n`;
        instruction += `2. 提取出行动导向的概念\n`;
        instruction += `3. 为每个概念提供定义和示例\n`;
        instruction += `4. 进行持续比较分析\n`;
        
        if (memo) {
            instruction += `5. 撰写编码备忘录，记录思考过程\n`;
        }

        return {
            success: true,
            output: `开放编码指令已生成：\n${instruction}`,
            skillId: 'performing-open-coding',
            mode: 'execution-instruction'
        };
    }

    async executeAxialCoding(parameters, tool) {
        const codes = parameters.codes || [];
        const context = parameters.context || '';

        let instruction = `请对以下开放编码结果进行轴心编码：\n\n`;
        instruction += `编码结果：${JSON.stringify(codes)}\n`;
        
        if (context) {
            instruction += `上下文信息：${context}\n`;
        }

        instruction += `\n\n轴心编码要求：\n`;
        instruction += `1. 识别概念之间的关系\n`;
        instruction += `2. 形成高阶范畴\n`;
        instruction += `3. 建立范畴与概念之间的逻辑联系\n`;
        instruction += `4. 探索“因果条件-现象-情境-互动行动策略-后果”模式`;

        return {
            success: true,
            output: `轴心编码指令已生成：\n${instruction}`,
            skillId: 'performing-axial-coding',
            mode: 'execution-instruction'
        };
    }

    async executeSelectiveCoding(parameters, tool) {
        const axialCodes = parameters.axial_codes || parameters.axialCodes || [];
        const theory = parameters.theory || '';

        let instruction = `请对以下轴心编码结果进行选择式编码：\n\n`;
        instruction += `轴心编码结果：${JSON.stringify(axialCodes)}\n`;
        
        if (theory) {
            instruction += `当前理论框架：${theory}\n`;
        }

        instruction += `\n\n选择式编码要求：\n`;
        instruction += `1. 确定核心范畴\n`;
        instruction += `2. 围绕核心范畴整合其他范畴\n`;
        instruction += `3. 构建初步理论模型\n`;
        instruction += `4. 验证理论的解释力`;

        return {
            success: true,
            output: `选择式编码指令已生成：\n${instruction}`,
            skillId: 'performing-selective-coding',
            mode: 'execution-instruction'
        };
    }

    async executeTheorySaturation(parameters, tool) {
        const theory = parameters.theory;
        const data = parameters.data;

        const instruction = `请检验以下理论框架的饱和度：\n\n`;
        instruction += `理论框架：${theory}\n\n`;
        instruction += `检验数据：${data}\n\n`;
        instruction += `饱和度检验要求：\n`;
        instruction += `1. 分析新数据是否产生新概念\n`;
        instruction += `2. 评估理论的解释充分性\n`;
        instruction += `3. 判断是否需要进一步数据收集\n`;
        instruction += `4. 提出后续研究建议`;

        return {
            success: true,
            output: `理论饱和度检验指令已生成：\n${instruction}`,
            skillId: 'theory-saturation',
            mode: 'execution-instruction'
        };
    }

    async executeMemoWriting(parameters, tool) {
        const content = parameters.content;
        const topic = parameters.topic || '研究备忘录';

        const instruction = `请撰写以下主题的研究备忘录：\n\n`;
        instruction += `主题：${topic}\n\n`;
        instruction += `内容：${content}\n\n`;
        instruction += `备忘录要求：\n`;
        instruction += `1. 记录研究过程中的思考\n`;
        instruction += `2. 分析概念和理论的发展\n`;
        instruction += `3. 反思研究方法和策略\n`;
        instruction += `4. 提出后续研究方向`;

        return {
            success: true,
            output: `备忘录撰写指令已生成：\n${instruction}`,
            skillId: 'memo-writing',
            mode: 'execution-instruction'
        };
    }

    // 主执行方法
    async executeSkill(skillId, parameters, tool) {
        switch (skillId) {
            case 'processing-citations':
                return await this.executeCitationProcessing(parameters, tool);
            case 'performing-open-coding':
                return await this.executeOpenCoding(parameters, tool);
            case 'performing-axial-coding':
                return await this.executeAxialCoding(parameters, tool);
            case 'performing-selective-coding':
                return await this.executeSelectiveCoding(parameters, tool);
            case 'theory-saturation':
                return await this.executeTheorySaturation(parameters, tool);
            case 'memo-writing':
                return await this.executeMemoWriting(parameters, tool);
            case 'centrality-analysis':
                return await this.executeCentralityAnalysis(parameters, tool);
            case 'network-computation':
                return await this.executeNetworkComputation(parameters, tool);
            case 'network-data-processing':
                return await this.executeNetworkDataProcessing(parameters, tool);
            case 'paper-structure':
                return await this.executePaperStructure(parameters, tool);
            case 'conflict-resolution':
                return await this.executeConflictResolution(parameters, tool);
            case 'dissent-resolution':
                return await this.executeDissentResolution(parameters, tool);
            case 'mathematical-statistics':
                return await this.executeMathematicalStatistics(parameters, tool);
            case 'research-design':
                return await this.executeResearchDesign(parameters, tool);
            case 'validity-assessment':
                return await this.executeValidityAssessment(parameters, tool);
            case 'validity-reliability':
                return await this.executeValidityReliability(parameters, tool);
            case 'paper-download':
                return await this.executePaperDownload(parameters, tool);
            case 'paper-doi':
                return await this.executePaperDoi(parameters, tool);
            case 'cnki-search':
                return await this.executeCnkiSearch(parameters, tool);
            case 'persistent-browser':
                return await this.executePersistentBrowser(parameters, tool);
            default:
                throw new Error(`未知的社会科学技能: ${skillId}`);
        }
    }

    async executeCentralityAnalysis(parameters, tool) {
        const networkData = parameters.networkData || parameters.data || 'network data';
        const type = parameters.centralityType || 'all';

        const instruction = `请对以下社会网络数据进行中心性分析：\n\n${networkData}\n\n分析要求：\n`;
        instruction += `- 计算度中心性、接近中心性、中介中心性等指标\n`;
        instruction += `- 识别网络中的关键节点\n`;
        instruction += `- 分析${type}类型的中心性\n`;
        instruction += `- 提供中心性排名和解释`;

        return {
            success: true,
            output: `中心性分析指令已生成：\n${instruction}`,
            skillId: 'centrality-analysis',
            mode: 'execution-instruction'
        };
    }

    async executeNetworkComputation(parameters, tool) {
        const networkData = parameters.networkData || parameters.data || 'network data';
        const type = parameters.computationType || 'density';

        const instruction = `请对以下社会网络数据进行计算：\n\n${networkData}\n\n计算要求：\n`;
        instruction += `- 执行类型：${type}\n`;
        instruction += `- 网络密度计算\n`;
        instruction += `- 聚类系数分析\n`;
        instruction += `- 连通分量识别\n`;
        instruction += `- 提供详细计算结果`;

        return {
            success: true,
            output: `网络计算指令已生成：\n${instruction}`,
            skillId: 'network-computation',
            mode: 'execution-instruction'
        };
    }

    async executeNetworkDataProcessing(parameters, tool) {
        const rawData = parameters.rawData || 'raw network data';
        const format = parameters.format || 'edgelist';

        const instruction = `请处理以下原始网络数据：\n\n${rawData}\n\n处理要求：\n`;
        instruction += `- 数据清洗和格式化\n`;
        instruction += `- 转换为${format}格式\n`;
        instruction += `- 检查数据完整性和一致性\n`;
        instruction += `- 提供处理后的网络数据`;

        return {
            success: true,
            output: `网络数据处理指令已生成：\n${instruction}`,
            skillId: 'network-data-processing',
            mode: 'execution-instruction'
        };
    }

    async executePaperStructure(parameters, tool) {
        const content = parameters.paperContent || '';
        const structureType = parameters.structureType || 'empirical';

        let instruction = `请构建或评估社会科学论文的结构：\n\n`;

        if (content) {
            instruction += `论文内容：${content}\n\n`;
            instruction += `结构评估要求：\n`;
            instruction += `- 评估章节安排的合理性\n`;
            instruction += `- 检查逻辑连贯性\n`;
            instruction += `- 分析论证完整性\n`;
            instruction += `- 提供改进建议`;
        } else {
            instruction += `论文类型：${structureType}\n\n`;
            instruction += `结构构建要求：\n`;
            instruction += `- 提供适合${structureType}研究的典型结构\n`;
            instruction += `- 建议章节安排\n`;
            instruction += `- 说明各部分写作要点`;
        }

        return {
            success: true,
            output: `论文结构指令已生成：\n${instruction}`,
            skillId: 'paper-structure',
            mode: 'execution-instruction'
        };
    }

    async executeConflictResolution(parameters, tool) {
        const description = parameters.conflictDescription || 'conflict description';
        const parties = parameters.parties || [];

        const instruction = `请分析以下冲突情况并提供解决方案：\n\n冲突描述：${description}\n\n涉及各方：${parties.join(', ')}\n\n解决要求：\n`;
        instruction += `- 识别冲突的根本原因\n`;
        instruction += `- 分析各方利益和立场\n`;
        instruction += `- 提出建设性解决方案\n`;
        instruction += `- 制定实施策略`;

        return {
            success: true,
            output: `冲突解决指令已生成：\n${instruction}`,
            skillId: 'conflict-resolution',
            mode: 'execution-instruction'
        };
    }

    async executeDissentResolution(parameters, tool) {
        const description = parameters.dissentDescription || 'dissent description';
        const viewpoints = parameters.viewpoints || [];

        const instruction = `请处理以下意见分歧：\n\n分歧描述：${description}\n\n不同观点：${viewpoints.join(', ')}\n\n处理要求：\n`;
        instruction += `- 分析各观点的合理性\n`;
        instruction += `- 寻找共同点和互补性\n`;
        instruction += `- 提出协调方案\n`;
        instruction += `- 促进共识达成`;

        return {
            success: true,
            output: `异议解决指令已生成：\n${instruction}`,
            skillId: 'dissent-resolution',
            mode: 'execution-instruction'
        };
    }

    async executeMathematicalStatistics(parameters, tool) {
        const data = parameters.data || 'statistical data';
        const type = parameters.analysisType || 'descriptive';

        const instruction = `请对以下数据进行数理统计分析：\n\n${data}\n\n分析类型：${type}\n\n分析要求：\n`;
        instruction += `- 执行${type}统计分析\n`;
        instruction += `- 提供统计描述\n`;
        instruction += `- 检验假设（如适用）\n`;
        instruction += `- 解释结果的统计学意义`;

        return {
            success: true,
            output: `数理统计指令已生成：\n${instruction}`,
            skillId: 'mathematical-statistics',
            mode: 'execution-instruction'
        };
    }

    async executeResearchDesign(parameters, tool) {
        const topic = parameters.researchTopic || 'research topic';
        const method = parameters.researchMethod || 'mixed';

        const instruction = `请设计以下研究的研究方案：\n\n研究主题：${topic}\n\n推荐方法：${method}\n\n设计要求：\n`;
        instruction += `- 确定研究问题和假设\n`;
        instruction += `- 选择合适的研究方法\n`;
        instruction += `- 定义变量和指标\n`;
        instruction += `- 制定抽样策略\n`;
        instruction += `- 设计数据收集和分析计划`;

        return {
            success: true,
            output: `研究设计指令已生成：\n${instruction}`,
            skillId: 'research-design',
            mode: 'execution-instruction'
        };
    }

    async executeValidityAssessment(parameters, tool) {
        const design = parameters.researchDesign || 'research design';
        const type = parameters.validityType || 'all';

        const instruction = `请评估以下研究设计的效度：\n\n研究设计：${design}\n\n效度类型：${type}\n\n评估要求：\n`;
        instruction += `- 评估内部效度\n`;
        instruction += `- 评估外部效度\n`;
        instruction += `- 评估结构效度\n`;
        instruction += `- 评估内容效度\n`;
        instruction += `- 识别潜在的效度威胁\n`;
        instruction += `- 提供改进建议`;

        return {
            success: true,
            output: `效度评估指令已生成：\n${instruction}`,
            skillId: 'validity-assessment',
            mode: 'execution-instruction'
        };
    }

    async executeValidityReliability(parameters, tool) {
        const instrument = parameters.instrument || 'measurement instrument';
        const type = parameters.analysisType || 'comprehensive';

        const instruction = `请对以下测量工具进行效度和信度分析：\n\n测量工具：${instrument}\n\n分析类型：${type}\n\n分析要求：\n`;
        instruction += `- 评估信度（内部一致性、重测信度、评分者信度等）\n`;
        instruction += `- 评估效度（内容效度、结构效度、准则效度等）\n`;
        instruction += `- 提供具体的统计指标（如Cronbach's α、ICC等）\n`;
        instruction += `- 识别需要改进的方面\n`;
        instruction += `- 建议改进措施`;

        return {
            success: true,
            output: `效度信度分析指令已生成：\n${instruction}`,
            skillId: 'validity-reliability',
            mode: 'execution-instruction'
        };
    }

    async executePaperDownload(parameters, tool) {
        const query = parameters.query || parameters.text || 'research paper';
        const sources = parameters.sources || 'all';
        const maxResults = parameters.maxResults || 5;

        try {
            // Import and initialize real academic search engine
            const { AcademicSearchEngine } = require('./academic-search-engine.cjs');
            const searchEngine = new AcademicSearchEngine();

            // Perform real search across academic databases
            const searchResults = await searchEngine.searchPapers(query, {
                maxResults: maxResults,
                sources: sources
            });

            return {
                success: true,
                skillId: 'paper-download',
                mode: 'real-search-executed',
                details: searchResults,
                message: `Found ${searchResults.totalResults} papers matching "${query}"`
            };
        } catch (error) {
            return {
                success: false,
                skillId: 'paper-download',
                error: error.message,
                mode: 'real-search-error'
            };
        }
    }

    async executePaperDoi(parameters, tool) {
        const query = parameters.query || parameters.text || 'research paper';

        try {
            // Import and initialize real academic search engine
            const { AcademicSearchEngine } = require('./academic-search-engine.cjs');
            const searchEngine = new AcademicSearchEngine();

            // First, try to interpret the query as a DOI
            const doiRegex = /(10\.\d{4,}\/[^\s]+)/;
            const doiMatch = query.match(doiRegex);

            if (doiMatch) {
                // If it's a DOI, retrieve specific information
                const doi = doiMatch[1];

                // Try MCP-based DOI lookup first if available
                let doiResult;
                if (searchEngine.useMCP && searchEngine.mcpConnector) {
                    doiResult = await searchEngine.mcpConnector.searchByDOI(doi, { maxResults: 1 });
                } else {
                    // Fallback to standard DOI lookup
                    doiResult = await searchEngine.retrieveDOI(doi);
                }

                return {
                    success: doiResult.success,
                    skillId: 'paper-doi',
                    mode: doiResult.success ? 'doi-retrieved' : 'doi-error',
                    details: doiResult,
                    message: doiResult.success
                        ? `DOI retrieved: ${doi} using ${doiResult.server || 'standard API'}`
                        : `DOI lookup failed: ${doiResult.error || 'No server available'}`
                };
            } else {
                // If it's a search query, search for papers and extract DOI info
                const searchResults = await searchEngine.searchPapers(query, { maxResults: 10 });

                // Extract DOIs from results
                const papersWithDoi = searchResults.papers.filter(paper => paper.doi);

                return {
                    success: true,
                    skillId: 'paper-doi',
                    mode: 'doi-search-completed',
                    details: {
                        query: query,
                        papersWithDoi: papersWithDoi,
                        totalWithDoi: papersWithDoi.length,
                        totalResults: searchResults.totalResults,
                        mcpServers: searchResults.mcpServersAvailable
                    },
                    message: `Found ${papersWithDoi.length} papers with DOI out of ${searchResults.totalResults} results using ${searchResults.mcpServersAvailable.length > 0 ? 'MCP servers' : 'standard APIs'}`
                };
            }
        } catch (error) {
            return {
                success: false,
                skillId: 'paper-doi',
                error: error.message,
                mode: 'doi-search-error'
            };
        }
    }

    async executePersistentBrowser(parameters, tool) {
        const website = parameters.website || parameters.site || 'https://example.com';
        const task = parameters.task || 'perform basic navigation';
        const loginRequired = parameters.loginRequired || false;

        const instruction = `请使用Playwright执行以下浏览器自动化任务：\n\n`;
        instruction += `目标网站: ${website}\n`;
        instruction += `执行任务: ${task}\n\n`;

        instruction += `任务要求：\n`;
        instruction += `- 使用持久化浏览器上下文\n`;
        instruction += `- 禁用无头模式（必须显示浏览器界面）\n`;
        instruction += `- 自动检测登录状态\n`;
        instruction += `- 如需要登录，等待手动登录后保存会话\n`;
        instruction += `- 执行指定任务\n`;
        instruction += `- 保存会话状态\n\n`;

        instruction += `具体步骤：\n`;
        instruction += `1. 启动持久化浏览器上下文\n`;
        instruction += `2. 访问网站: ${website}\n`;
        instruction += `3. 检测登录状态\n`;
        if (loginRequired) {
            instruction += `4. 等待手动登录（如需要）\n`;
        } else {
            instruction += `4. 自动检测是否需要登录\n`;
        }
        instruction += `5. 执行任务: ${task}\n`;
        instruction += `6. 保存会话并关闭浏览器\n`;

        return {
            success: true,
            output: `持久化浏览器任务指令已生成：\n${instruction}`,
            skillId: 'persistent-browser',
            mode: 'execution-instruction'
        };
    }

    async executeCnkiSearch(parameters, tool) {
        const query = parameters.query || parameters.text || '学术论文';
        const maxResults = parameters.maxResults || 10;
        const downloadPdfs = parameters.downloadPdfs || false;

        try {
            // Import and initialize academic search engine
            const { AcademicSearchEngine } = require('./academic-search-engine.cjs');
            const searchEngine = new AcademicSearchEngine();

            // Execute real CNKI search with Playwright
            const executionResult = await searchEngine.executeCNKIWithPlaywright(query, {
                maxResults: maxResults,
                downloadPdfs: downloadPdfs
            });

            return {
                success: true,
                skillId: 'cnki-search',
                mode: 'real-playwright-execution',
                details: executionResult,
                message: `Real Playwright code generated for CNKI search: "${query}"`
            };
        } catch (error) {
            return {
                success: false,
                skillId: 'cnki-search',
                error: error.message,
                mode: 'search-failed'
            };
        }
    }
}

module.exports = { SocialScienceSkillsManager };