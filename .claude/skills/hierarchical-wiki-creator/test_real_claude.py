#!/usr/bin/env python3
"""
真实Claude技能测试 - 使用Claude CLI直接调用
"""

import subprocess
import os
import sys
import time

def test_real_claude_skill():
    """使用真实的Claude CLI测试技能"""
    
    print("🚀 真​实Claude技能测试")
    print("=" * 50)
    
    skill_path = os.path.join(os.path.dirname(__file__), "SKILL.md")
    
    # 构建分步执行的提示词
    step1_prompt = f"""请按照技能定义执行阶段1：任务理解与规划。

技能文件：{skill_path}

主题：深度学习

请：
1. 识别主题和目标受众
2. 评估内容深度要求
3. 确定质量标准
4. 规划论文搜索策略

请简明回答你的规划结果。"""

    step2_prompt = f"""请按照技能定义执行阶段2：信息收集与处理。

技能文件：{skill_path}

主题：深度学习

请：
1. 搜索相关学术论文
2. 下载arXiv论文
3. 解析PDF内容
4. 提取关键信息

请列出你找到的3篇论文标题。"""

    step3_prompt = f"""请按照技能定义执行阶段3：深度分析与思考。

技能文件：{skill_path}

主题：深度学习

请从三个专业角度分析：
1. 学术研究员角度
2. 技术专家角度  
3. 行业实践者角度

每个角度提供2-3个关键点。"""

    step4_prompt = f"""请按照技能定义执行阶段4：协同内容生成。

技能文件：{skill_path}

主题：深度学习

请生成以下7个章节的标题和简要内容：
1. 概述
2. 核心原理
3. 技术实现
4. 应用领域
5. 发展历程
6. 优势与局限
7. 发展趋势

每个章节100字以内。"""

    step5_prompt = f"""请按照技能定义执行阶段5：最终交付。

技能文件：{skill_path}

主题：深度学习

请：
1. 创建HTML页面
2. 生成质量报告
3. 提供改进建议

请确认完成状态。"""

    prompts = [
        ("阶段1：任务理解与规划", step1_prompt),
        ("阶段2：信息收集与处理", step2_prompt),
        ("阶段3：深度分析与思考", step3_prompt),
        ("阶段4：协同内容生成", step4_prompt),
        ("阶段5：最终交付", step5_prompt)
    ]
    
    results = {}
    
    for i, (phase_name, prompt) in enumerate(prompts, 1):
        print(f"\n🎯 执行{phase_name}")
        
        try:
            print(f"   📝 发送提示到Claude...")
            
            # 使用claude CLI
            result = subprocess.run(
                ["claude", prompt],
                capture_output=True,
                text=True,
                timeout=60  # 1分钟超时
            )
            
            if result.returncode == 0:
                print(f"   ✅ Claude响应成功")
                output = result.stdout.strip()
                print(f"   📄 响应长度: {len(output)} 字符")
                
                # 保存结果
                results[phase_name] = {
                    'output': output,
                    'length': len(output),
                    'success': True
                }
                
                # 显示前几行输出
                lines = output.split('\n')
                for line in lines[:5]:
                    if line.strip():
                        print(f"   📝 {line}")
                if len(lines) > 5:
                    print(f"   ... (总共 {len(lines)} 行)")
                
            else:
                print(f"   ❌ Claude响应失败")
                print(f"   错误: {result.stderr}")
                results[phase_name] = {
                    'output': result.stderr.strip(),
                    'success': False
                }
                
        except subprocess.TimeoutExpired:
            print(f"   ⏰ Claude响应超时")
            results[phase_name] = {
                'output': "响应超时",
                'success': False
            }
        except Exception as e:
            print(f"   ❌ 执行错误: {e}")
            results[phase_name] = {
                'output': str(e),
                'success': False
            }
        
        # 短暂等待，避免过快执行
        time.sleep(2)
    
    # 生成总结报告
    print("\n" + "=" * 50)
    print("📊 Claude技能测试报告")
    print("=" * 50)
    
    success_count = sum(1 for r in results.values() if r['success'])
    total_count = len(results)
    
    print(f"✅ 成功阶段: {success_count}/{total_count}")
    total_length = sum(r['length'] for r in results.values() if 'length' in r and isinstance(r['length'], (int)))
                print(f"📊 总输出长度: {total_length} 字符")
    
    print("\n📋 各阶段状态:")
    for phase_name, result in results.items():
        status = "✅ 成功" if result['success'] else "❌ 失败"
        print(f"   {phase_name}: {status}")
    
    if success_count == total_count:
        print("\n🎉 所有阶段执行成功！")
        print("💡 Claude技能可以正常使用")
    else:
        print(f"\n⚠️ {total_count - success_count} 个阶段失败")
        print("💡 需要检查Claude配置或网络连接")
    
    return results

def main():
    """主函数"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            test_real_claude_skill()
        else:
            topic = sys.argv[1]
            print(f"🎯 测试主题: {topic}")
            print("💡 使用 --test 参数进行完整测试")
            test_real_claude_skill()
    else:
        print("🎯 真实Claude技能测试")
        print("=" * 40)
        print("用法:")
        print("  python test_real_claude.py              # 默认测试")
        print("  python test_real_claude.py --test      # 强制测试")
        print("  python test_real_claude.py <topic>    # 指定主题测试")

if __name__ == "__main__":
    main()