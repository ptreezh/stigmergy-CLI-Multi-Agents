#!/usr/bin/env node

/**
 * Skills Detector - TDD Implementation
 * Phase 1: Green - Minimal implementation to pass tests
 */

class SkillsDetector {
    constructor() {
        this.skillPatterns = {
            translation: {
                keywords: {
                    english: ['translate', 'convert', 'localization'],
                    chinese: ['翻译', '转换', '本地化']
                },
                confidence: 8
            },
            'code-analysis': {
                keywords: {
                    english: ['analyze', 'analysis', 'review', 'audit', 'security', 'performance', 'quality'],
                    chinese: ['分析', '审查', '审计', '安全', '性能', '质量']
                },
                confidence: 7
            },
            'code-generation': {
                keywords: {
                    english: ['generate', 'create', 'build', 'write', 'implement', 'develop'],
                    chinese: ['生成', '创建', '构建', '编写', '实现', '开发']
                },
                confidence: 7
            },
            documentation: {
                keywords: {
                    english: ['document', 'docs', 'documentation', 'readme', 'manual', 'guide'],
                    chinese: ['文档', '说明', '手册', '指南']
                },
                confidence: 6
            },
            'processing-citations': {
                keywords: {
                    english: ['citation', 'reference', 'format', 'bibliography', 'gb/t', 'standard', 'cite'],
                    chinese: ['引用', '参考文献', '格式', '标准', 'gb/t', 'gbt', '格式化', '规范', '文献']
                },
                confidence: 8
            },
            'performing-open-coding': {
                keywords: {
                    english: ['open coding', 'coding', 'concept', 'identify', 'grounded theory', 'qualitative', 'thematic'],
                    chinese: ['开放编码', '编码', '概念', '识别', '扎根理论', '质性', '主题']
                },
                confidence: 8
            },
            'performing-axial-coding': {
                keywords: {
                    english: ['axial coding', 'axial', 'relationship', 'category', 'connection', 'link'],
                    chinese: ['轴心编码', '轴心', '关系', '范畴', '连接', '关联']
                },
                confidence: 8
            },
            'performing-selective-coding': {
                keywords: {
                    english: ['selective coding', 'selective', 'core category', 'theory', 'integration', 'main'],
                    chinese: ['选择式编码', '选择', '核心范畴', '理论', '整合', '主要']
                },
                confidence: 8
            },
            'theory-saturation': {
                keywords: {
                    english: ['theory saturation', 'theoretical saturation', 'saturation', 'saturate', 'theoretical', 'data collection', 'complete', 'enough'],
                    chinese: ['饱和', '理论饱和', '数据收集', '完成', '充分', '足够']
                },
                confidence: 8
            },
            'memo-writing': {
                keywords: {
                    english: ['memo', 'write', 'note', 'reflection', 'documentation', 'record'],
                    chinese: ['备忘录', '撰写', '记录', '反思', '文档', '笔记']
                },
                confidence: 7
            },
            'centrality-analysis': {
                keywords: {
                    english: ['centrality', 'centrality analysis', 'degree centrality', 'closeness', 'betweenness', 'network centrality'],
                    chinese: ['中心性', '中心性分析', '度中心性', '接近中心性', '中介中心性', '网络中心性']
                },
                confidence: 8
            },
            'persistent-browser': {
                keywords: {
                    english: ['persistent browser', 'playwright', 'browser automation', 'login', 'session', 'headless', 'chromium', 'automated browsing', 'web automation', 'authenticated access', 'manual login'],
                    chinese: ['持久化浏览器', 'playwright', '浏览器自动化', '登录', '会话', '浏览器自动化', '无头浏览器', '自动浏览', '网页自动化', '认证访问', '手动登录']
                },
                confidence: 9  // 增加置信度
            },
            'network-computation': {
                keywords: {
                    english: ['network computation', 'network calculation', 'density', 'clustering', 'components', 'network analysis'],
                    chinese: ['网络计算', '网络分析', '密度', '聚类', '连通分量', '网络分析计算']
                },
                confidence: 8
            },
            'network-data-processing': {
                keywords: {
                    english: ['network data processing', 'network preprocessing', 'network data', 'social network'],
                    chinese: ['网络数据处理', '网络数据预处理', '社会网络', '网络数据清洗']
                },
                confidence: 7
            },
            'paper-structure': {
                keywords: {
                    english: ['paper structure', 'research structure', 'thesis structure', 'outline', 'organization'],
                    chinese: ['论文结构', '研究结构', '论文大纲', '组织结构', '章节安排']
                },
                confidence: 7
            },
            'conflict-resolution': {
                keywords: {
                    english: ['conflict resolution', 'conflict management', 'dispute resolution', 'mediation', 'negotiation'],
                    chinese: ['冲突解决', '冲突管理', '纠纷解决', '调解', '协商']
                },
                confidence: 8
            },
            'dissent-resolution': {
                keywords: {
                    english: ['dissent resolution', 'difference resolution', 'disagreement', 'consensus building', 'opinion resolution'],
                    chinese: ['异议解决', '分歧解决', '意见分歧', '共识构建', '处理异议']
                },
                confidence: 8
            },
            'mathematical-statistics': {
                keywords: {
                    english: ['mathematical statistics', 'statistical analysis', 'statistics', 'hypothesis testing', 'correlation', 'regression'],
                    chinese: ['数理统计', '统计分析', '统计', '假设检验', '相关性', '回归分析']
                },
                confidence: 8
            },
            'research-design': {
                keywords: {
                    english: ['research design', 'study design', 'research methodology', 'experimental design', 'survey design'],
                    chinese: ['研究设计', '研究方法', '实验设计', '问卷设计', '调查设计']
                },
                confidence: 8
            },
            'validity-assessment': {
                keywords: {
                    english: ['validity assessment', 'validity test', 'internal validity', 'external validity', 'construct validity'],
                    chinese: ['效度评估', '效度检验', '内部效度', '外部效度', '结构效度']
                },
                confidence: 8
            },
            'validity-reliability': {
                keywords: {
                    english: ['validity reliability', 'reliability', 'cronbach', 'consistency', 'internal consistency', 'reproducibility'],
                    chinese: ['效度信度', '信度', '重测信度', '内部一致性', '可重复性', '信度效度']
                },
                confidence: 8
            },
            'cnki-search': {
                keywords: {
                    english: ['cnki', 'chinese academic', 'chinese journals', 'china national knowledge infrastructure', 'chinese research', '知网', '中国知网', '学术期刊'],
                    chinese: ['知网', '中国知网', '学术期刊', '中国学术', '中文学术', '中文文献', 'CNKI']
                },
                confidence: 9
            },
            'persistent-browser': {
                keywords: {
                    english: ['persistent browser', 'playwright', 'browser automation', 'login', 'session', 'headless', 'chromium', 'automated browsing', 'web automation'],
                    chinese: ['持久化浏览器', 'playwright', '浏览器自动化', '登录', '会话', '浏览器自动化', '无头浏览器', '自动浏览', '网页自动化']
                },
                confidence: 9  // 提高置信度
            },
            'paper-download': {
                keywords: {
                    english: ['paper download', 'download paper', 'download pdf', 'research paper', 'academic paper', 'pdf download', 'get paper', 'retrieve paper'],
                    chinese: ['论文下载', '下载论文', '下载PDF', '学术论文', '研究论文', '获取论文', '检索论文', '下载PDF']
                },
                confidence: 9
            },
            'paper-doi': {
                keywords: {
                    english: ['paper doi', 'doi lookup', 'doi search', 'get doi', 'paper url', 'paper identifier', 'citation info'],
                    chinese: ['论文DOI', 'DOI检索', 'DOI搜索', '获取DOI', '论文URL', '论文标识符', '引用信息']
                },
                confidence: 9
            }
        };
    }

    detectSkill(input) {
        if (!input || typeof input !== 'string' || input.trim() === '') {
            return { skill: null, confidence: 0, parameters: {} };
        }

        const normalizedInput = input.toLowerCase().trim();

        // Sort skill patterns by specificity to prioritize more specific matches
        const sortedSkills = this.getSortedSkillsBySpecificity();

        let bestMatch = null;
        let maxConfidence = 0;

        for (const [skillType, skillData] of sortedSkills) {
            const matchResult = this.checkKeywords(normalizedInput, skillData.keywords);

            if (matchResult.found && matchResult.confidence > maxConfidence) {
                bestMatch = {
                    skill: skillType,
                    confidence: matchResult.confidence,
                    parameters: this.extractParameters(normalizedInput, skillType)
                };
                maxConfidence = matchResult.confidence;
            }
        }

        return bestMatch || { skill: null, confidence: 0, parameters: {} };
    }

    getSortedSkillsBySpecificity() {
        // Define specificity levels - more specific skills come first
        const specificityOrder = [
            // Most specific - very specific terms
            'performing-axial-coding',
            'performing-selective-coding',
            'theory-saturation',
            'centrality-analysis',
            'network-computation',
            'network-data-processing',
            'conflict-resolution',
            'dissent-resolution',
            'validity-assessment',
            'validity-reliability',
            'mathematical-statistics',
            'research-design',
            'persistent-browser',
            'paper-download',
            'paper-doi',
            'cnki-search',
            // Medium specific
            'processing-citations',
            'performing-open-coding',
            'memo-writing',
            'paper-structure',
            // General terms
            'translation',
            'code-analysis',
            'code-generation',
            'documentation'
        ];

        const skillsArray = Object.entries(this.skillPatterns);

        // Sort based on specificity order
        return skillsArray.sort((a, b) => {
            const skillA = a[0];
            const skillB = b[0];

            const indexA = specificityOrder.indexOf(skillA);
            const indexB = specificityOrder.indexOf(skillB);

            // If both are in the specificity order, sort by that order
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // If only one is in the order, prioritize it
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // If neither is in the order, keep original order
            return 0;
        });
    }

    checkKeywords(input, keywords) {
        let maxConfidence = 0;
        let found = false;

        const allKeywords = [
            ...keywords.english,
            ...keywords.chinese
        ];

        // Create an array of keywords with their lengths to sort without modifying the original
        const keywordsWithLength = allKeywords.map(keyword => ({
            keyword: keyword,
            length: keyword.length
        })).sort((a, b) => b.length - a.length);

        for (const { keyword, length } of keywordsWithLength) {
            if (input.includes(keyword)) {
                found = true;
                // Longer keywords get higher priority to match more specific patterns first
                let baseConfidence = Math.max(this.getCurrentBaseConfidence(keywords),
                                             this.skillPatterns[Object.keys(this.skillPatterns).find(skill =>
                                                 this.skillPatterns[skill].keywords === keywords
                                             )].confidence);

                // Exact keyword match gets higher confidence
                if (input === keyword) {
                    baseConfidence = Math.max(baseConfidence, 9.5);
                } else if (input.startsWith(keyword) || input.endsWith(keyword)) {
                    baseConfidence = Math.max(baseConfidence, 8);
                } else {
                    // Give extra weight to longer, more specific matches
                    baseConfidence = Math.max(baseConfidence, (baseConfidence + length * 0.1));

                    // For overlapping keywords, apply context-based scoring
                    const contextualScore = this.getContextualScore(input, keyword, keywords);
                    baseConfidence = Math.max(baseConfidence, contextualScore);
                }

                if (baseConfidence > maxConfidence) {
                    maxConfidence = baseConfidence;
                }
            }
        }

        if (found && maxConfidence === 0) {
            maxConfidence = this.skillPatterns[Object.keys(this.skillPatterns).find(skill =>
                this.skillPatterns[skill].keywords === keywords
            )].confidence;
        }

        return { found, confidence: maxConfidence };
    }

    getCurrentBaseConfidence(keywords) {
        // Find the corresponding skill pattern to get its base confidence
        for (const [skillType, skillInfo] of Object.entries(this.skillPatterns)) {
            if (skillInfo.keywords === keywords) {
                return skillInfo.confidence;
            }
        }
        return 0;
    }

    getContextualScore(input, keyword, keywords) {
        // Boost confidence for specific skill combinations
        const combinations = {
            // Documentation patterns
            'documentation': {
                'create': 8,
                'generate': 6,
                'write': 8,
                'build': 7
            },
            // Code generation patterns
            'generate': {
                'function': 8,
                'class': 8,
                'component': 8,
                'api': 7
            }
        };

        const skillType = this.getSkillTypeForKeywords(keywords);
        if (combinations[skillType]) {
            for (const [contextKeyword, score] of Object.entries(combinations[skillType])) {
                if (input.includes(contextKeyword)) {
                    return score;
                }
            }
        }

        return 6; // Default score
    }

    getSkillTypeForKeywords(keywords) {
        for (const [skillType, skillData] of Object.entries(this.skillPatterns)) {
            if (skillData.keywords === keywords) {
                return skillType;
            }
        }
        return null;
    }

    extractParameters(input, skillType) {
        const parameters = {
            text: input
        };

        switch (skillType) {
            case 'translation':
                parameters.targetLanguage = this.extractTargetLanguage(input);
                break;

            case 'code-generation':
                parameters.language = this.extractLanguage(input);
                parameters.type = this.extractCodeType(input);
                parameters.features = this.extractFeatures(input);
                break;

            case 'code-analysis':
                parameters.analysisType = this.extractAnalysisType(input);
                break;

            case 'processing-citations':
                parameters.document = this.extractCitationDocument(input);
                parameters.journal = this.extractTargetJournal(input);
                parameters.format = this.extractCitationFormat(input);
                break;

            case 'performing-open-coding':
                parameters.data = this.extractQualitativeData(input);
                parameters.memo = this.extractMemoRequirement(input);
                break;

            case 'performing-axial-coding':
                parameters.codes = this.extractCodes(input);
                parameters.context = this.extractContext(input);
                break;

            case 'performing-selective-coding':
                parameters.axial_codes = this.extractCodes(input);
                parameters.theory = this.extractTheory(input);
                break;

            case 'theory-saturation':
                parameters.theory = this.extractTheory(input);
                parameters.data = this.extractQualitativeData(input);
                break;

            case 'memo-writing':
                parameters.content = this.extractMemoContent(input);
                parameters.topic = this.extractTopic(input);
                break;
        }

        return parameters;
    }

    extractCitationDocument(input) {
        // 提取引用文档内容
        if (input.includes(':')) {
            const parts = input.split(':');
            if (parts.length > 1) {
                return parts.slice(1).join(':').trim();
            }
        }
        return input;
    }

    extractTargetJournal(input) {
        const journalKeywords = ['journal', '期刊', '杂志'];
        for (const keyword of journalKeywords) {
            const match = input.match(new RegExp(`${keyword}\\s*[:：]\\s*([^,，]+)`));
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }

    extractCitationFormat(input) {
        if (input.includes('gb/t') || input.includes('GBT') || input.includes('GB/T')) {
            return 'GB/T 7714';
        }
        return 'GB/T 7714'; // 默认格式
    }

    extractQualitativeData(input) {
        // 提取质性数据内容
        return input;
    }

    extractMemoRequirement(input) {
        return input.includes('memo') || input.includes('备忘录') || input.includes('记录');
    }

    extractCodes(input) {
        // 提取编码结果
        return [input];
    }

    extractContext(input) {
        // 提取上下文信息
        return input;
    }

    extractTheory(input) {
        // 提取理论框架
        return input;
    }

    extractTopic(input) {
        // 提取主题
        const topicKeywords = ['topic', '主题', '关于', '关于', '有关'];
        for (const keyword of topicKeywords) {
            const match = input.match(new RegExp(`${keyword}\\s*[:：]\\s*([^,，]+)`));
            if (match) {
                return match[1].trim();
            }
        }
        return '研究备忘录';
    }

    extractMemoContent(input) {
        // 提取备忘录内容
        return input;
    }

    extractTargetLanguage(input) {
        const languages = ['english', 'spanish', 'french', 'german', 'japanese', 'chinese', 'korean'];

        for (const lang of languages) {
            if (input.includes('to ' + lang) || input.includes(lang)) {
                return lang;
            }
        }
        return null;
    }

    extractLanguage(input) {
        const languages = {
            'node.js': ['node', 'node.js'],
            'javascript': ['javascript', 'js'],
            'python': ['python', 'py'],
            'java': ['java'],
            'c#': ['c#', 'csharp', '.net'],
            'go': ['go'],
            'rust': ['rust'],
            'typescript': ['typescript', 'ts'],
            'php': ['php'],
            'ruby': ['ruby'],
            'swift': ['swift']
        };

        // Prioritize more specific matches
        if (input.includes('node.js')) return 'node.js';
        if (input.includes('javascript')) return 'javascript';

        for (const [lang, keywords] of Object.entries(languages)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return lang;
            }
        }
        return null;
    }

    extractCodeType(input) {
        const types = {
            'rest api': ['api', 'rest', 'endpoint'],
            'function': ['function', 'method'],
            'class': ['class'],
            'component': ['component', 'widget'],
            'module': ['module']
        };

        for (const [type, keywords] of Object.entries(types)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return type;
            }
        }
        return null;
    }

    extractFeatures(input) {
        const features = [];
        const featureKeywords = {
            'authentication': ['auth', 'authentication', 'login', 'signin'],
            'security': ['security', 'secure'],
            'validation': ['validation', 'validate'],
            'error handling': ['error', 'exception', 'try', 'catch']
        };

        for (const [feature, keywords] of Object.entries(featureKeywords)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                features.push(feature);
            }
        }

        return features;
    }

    extractAnalysisType(input) {
        const types = {
            'security': ['security', 'vulnerability', 'attack', 'threat'],
            'performance': ['performance', 'optimization', 'bottleneck', 'speed'],
            'quality': ['quality', 'clean', 'refactor', 'maintainable'],
            'architecture': ['architecture', 'design', 'structure']
        };

        for (const [type, keywords] of Object.entries(types)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return type;
            }
        }
        return null;
    }
}

module.exports = SkillsDetector;