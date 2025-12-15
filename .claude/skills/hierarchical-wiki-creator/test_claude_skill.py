#!/usr/bin/env python3
"""
测试Claude Skills的shell脚本
"""

import subprocess
import json
import os
import sys
from datetime import datetime

def test_claude_skill_with_shell():
    """通过shell调用Claude测试技能"""
    
    print("🚀 通过shell调用Claude测试技能")
    print("=" * 60)
    
    # 构建Claude调用命令
    skill_path = os.path.join(os.path.dirname(__file__), "SKILL.md")
    
    # 构建完整的提示词
    prompt = f"""请按照以下技能定义创建一个关于"深度学习"的Wiki百科：

技能文件路径：{skill_path}

请严格按照技能定义中的5个阶段执行：
1. 任务理解与规划
2. 信息收集与处理（包括论文搜索和下载）
3. 深度分析与思考（三个专业角度分析）
4. 协同内容生成（7个章节）
5. 最终交付（HTML页面和质量报告）

要求：
- 真实搜索相关论文并下载
- 真实解析PDF内容
- 真实进行深度分析
- 生成高质量的HTML页面
- 提供详细的质量报告

请直接执行完整的技能工作流程，不要只是描述流程。"""

    # 构建Claude调用命令
    try:
        # 尝试不同的Claude调用方式
        claude_commands = [
            ["claude", prompt],
            ["claude-cli", prompt],
            ["claude", "--skill", prompt],
            ["claude", "--file", skill_path, "--topic", "深度学习"]
        ]
        
        claude_found = False
        result = None
        
        for cmd in claude_commands:
            try:
                print(f"🔍 尝试命令: {' '.join(cmd)}")
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5分钟超时
                )
                
                if result.returncode == 0:
                    print("✅ Claude调用成功!")
                    print(f"📄 输出长度: {len(result.stdout)} 字符")
                    
                    if len(result.stdout) > 100:
                        # 尝试解析输出
                        try:
                            lines = result.stdout.split('\n')
                            for line in lines[:10]:  # 显示前10行
                                if line.strip():
                                    print(f"   {line}")
                            print(f"   ... (总共 {len(lines)} 行)")
                        except:
                            print("   输出格式不是纯文本")
                    
                    claude_found = True
                    break
                else:
                    print(f"❌ 命令失败: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print("⏰ 命令超时")
            except FileNotFoundError:
                print(f"❌ 命令未找到: {cmd[0]}")
            except Exception as e:
                print(f"❌ 执行错误: {e}")
        
        if not claude_found:
            print("\n🔍 尝试其他Claude调用方式...")
            
            # 尝试通过环境变量或配置文件
            alternative_methods = [
                "echo '测试内容' | claude",
                "claude --help",
                "which claude",
                "echo $CLAUDE_API_KEY"
            ]
            
            for method in alternative_methods:
                try:
                    print(f"🔍 尝试: {method}")
                    result = subprocess.run(
                        method,
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    print(f"   结果: {result.stdout[:100] if result.stdout else result.stderr[:100]}")
                except:
                    pass
    
    except Exception as e:
        print(f"❌ 测试过程中出现错误: {e}")
    
    print("\n" + "=" * 60)
    print("📊 Claude Skills测试总结:")
    
    # 检查技能文件
    if os.path.exists(skill_path):
        print(f"✅ 技能文件存在: {skill_path}")
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"📄 技能文件大小: {len(content)} 字符")
            print(f"📋 包含阶段: {content.count('阶段')} 个")
            print(f"📋 包含步骤: {content.count('请')} 个")
    else:
        print(f"❌ 技能文件不存在: {skill_path}")
    
    # 检查输出目录
    output_dir = "outputs"
    if os.path.exists(output_dir):
        files = os.listdir(output_dir)
        html_files = [f for f in files if f.endswith('.html')]
        print(f"📁 HTML文件数量: {len(html_files)}")
        if html_files:
            latest_html = max(html_files, key=lambda x: os.path.getmtime(os.path.join(output_dir, x)))
            print(f"📄 最新HTML文件: {latest_html}")
    
    print("\n💡 建议:")
    print("1. 确保Claude CLI已正确安装")
    print("2. 检查Claude API密钥配置")
    print("3. 验证网络连接和权限")
    print("4. 考虑使用更详细的测试主题")

def create_test_prompt():
    """创建测试提示词"""
    
    skill_path = os.path.join(os.path.dirname(__file__), "SKILL.md")
    
    if not os.path.exists(skill_path):
        print("❌ 技能文件不存在，无法创建测试提示词")
        return None
    
    with open(skill_path, 'r', encoding='utf-8') as f:
        skill_content = f.read()
    
    test_prompt = f"""请按照以下技能定义创建一个关于"量子计算"的Wiki百科：

{skill_content}

请严格按照技能定义中的5个阶段执行：
1. 任务理解与规划
2. 信息收集与处理（包括论文搜索和下载）
3. 深度分析与思考（三个专业角度分析）
4. 协同内容生成（7个章节）
5. 最终交付（HTML页面和质量报告）

要求：
- 真实搜索相关论文并下载
- 真实解析PDF内容
- 真实进行深度分析
- 生成高质量的HTML页面
- 提供详细的质量报告

请直接执行完整的技能工作流程，生成最终的HTML文件。"""
    
    return test_prompt

def main():
    """主函数"""
    
    print("🎯 Claude Skills测试工具")
    print("=" * 40)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--create-prompt":
            prompt = create_test_prompt()
            if prompt:
                print("\n📝 生成的测试提示词:")
                print("=" * 40)
                print(prompt)
                print("=" * 40)
                print("请复制此提示词到Claude中执行")
        else:
            topic = sys.argv[1]
            print(f"🎯 测试主题: {topic}")
            test_claude_skill_with_shell()
    else:
        print("用法:")
        print("  python test_claude_skill.py              # 默认测试")
        print("  python test_claude_skill.py --create-prompt  # 生成测试提示词")
        print("  python test_claude_skill.py <topic>        # 指定主题测试")
        
        # 显示技能文件信息
        skill_path = os.path.join(os.path.dirname(__file__), "SKILL.md")
        if os.path.exists(skill_path):
            print(f"\n📋 技能文件位置: {skill_path}")
            with open(skill_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                print(f"📄 技能文件大小: {len(lines)} 行")
                print(f"📋 包含阶段: {len([l for l in lines if '阶段' in l])} 个")
                print(f"📋 包含步骤: {len([l for l in lines if '请' in l])} 个")
        else:
            print(f"\n❌ 技能文件不存在: {skill_path}")
            print("请确保SKILL.md文件存在")

if __name__ == "__main__":
    main()