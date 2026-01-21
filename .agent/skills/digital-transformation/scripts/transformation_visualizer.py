#!/usr/bin/env python3
"""
数字化转型路径可视化模块
使用matplotlib生成转型路径图、时间线图和流程图
"""

import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# 配置中文字体支持
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TransformationPathVisualizer:
    """转型路径可视化器"""

    def __init__(self, output_dir: str = "transformations_visualizations"):
        """初始化可视化器

        Args:
            output_dir: 输出目录
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"转型路径可视化器初始化完成，输出目录: {self.output_dir}")

    def plot_transformation_pathway(
        self,
        data: Dict[str, Any],
        filename: str = "transformation_pathway.png",
        figsize: Tuple[int, int] = (14, 10)
    ) -> str:
        """
        绘制转型路径图

        Args:
            data: 转型路径数据
            filename: 输出文件名
            figsize: 图形大小

        Returns:
            输出文件路径
        """
        logger.info(f"绘制转型路径图: {filename}")

        try:
            # 创建图形
            fig, ax = plt.subplots(figsize=figsize)

            # 提取路径模型
            pathway_model = data.get("pathway_planning_framework", {})
            technology_path = pathway_model.get("technology_implementation_pathway", {})
            commercial_path = pathway_model.get("commercial_implementation_pathway", {})
            organizational_path = pathway_model.get("organizational_implementation_pathway", {})

            # 定义颜色
            tech_color = "#3498db"  # 蓝色
            commercial_color = "#e74c3c"  # 红色
            org_color = "#2ecc71"  # 绿色

            # 定义阶段
            phases = ["数字化基础", "在线化平台", "智能化应用"]

            # 1. 技术实现路径
            tech_y = 0.8
            tech_x_positions = [0.2, 0.5, 0.8]
            tech_steps = [
                technology_path.get("digitalization_foundation", "数据采集、存储、管理"),
                technology_path.get("online_platform", "客户触达、交互、服务系统"),
                technology_path.get("intelligent_application", "AI算法、自动化、智能决策")
            ]

            for i, (x_pos, step) in enumerate(zip(tech_x_positions, tech_steps)):
                # 绘制步骤框
                box = FancyBboxPatch(
                    (x_pos - 0.15, tech_y - 0.1),
                    0.3, 0.2,
                    boxstyle="round,pad=0.02",
                    facecolor=tech_color,
                    edgecolor="black",
                    linewidth=2,
                    alpha=0.7
                )
                ax.add_patch(box)

                # 添加文本
                ax.text(
                    x_pos, tech_y + 0.12,
                    phases[i],
                    ha='center',
                    fontsize=11,
                    fontweight='bold',
                    color=tech_color
                )

                # 添加步骤描述
                ax.text(
                    x_pos, tech_y,
                    step[:20] + "..." if len(step) > 20 else step,
                    ha='center',
                    va='center',
                    fontsize=9,
                    color='white',
                    fontweight='bold'
                )

                # 绘制箭头（连接步骤）
                if i < len(tech_x_positions) - 1:
                    arrow = FancyArrowPatch(
                        (x_pos + 0.15, tech_y),
                        (tech_x_positions[i+1] - 0.15, tech_y),
                        arrowstyle='->',
                        mutation_scale=20,
                        linewidth=3,
                        color=tech_color,
                        alpha=0.8
                    )
                    ax.add_patch(arrow)

            # 2. 商业实现路径
            commercial_y = 0.5
            commercial_x_positions = [0.2, 0.5, 0.8]
            commercial_steps = [
                commercial_path.get("market_verification", "MVP开发、用户测试"),
                commercial_path.get("business_model", "收入模式、定价策略"),
                commercial_path.get("scale_expansion", "市场推广、渠道建设")
            ]

            for i, (x_pos, step) in enumerate(zip(commercial_x_positions, commercial_steps)):
                # 绘制步骤框
                box = FancyBboxPatch(
                    (x_pos - 0.15, commercial_y - 0.1),
                    0.3, 0.2,
                    boxstyle="round,pad=0.02",
                    facecolor=commercial_color,
                    edgecolor="black",
                    linewidth=2,
                    alpha=0.7
                )
                ax.add_patch(box)

                # 添加文本
                ax.text(
                    x_pos, commercial_y + 0.12,
                    phases[i],
                    ha='center',
                    fontsize=11,
                    fontweight='bold',
                    color=commercial_color
                )

                # 添加步骤描述
                ax.text(
                    x_pos, commercial_y,
                    step[:20] + "..." if len(step) > 20 else step,
                    ha='center',
                    va='center',
                    fontsize=9,
                    color='white',
                    fontweight='bold'
                )

                # 绘制箭头
                if i < len(commercial_x_positions) - 1:
                    arrow = FancyArrowPatch(
                        (x_pos + 0.15, commercial_y),
                        (commercial_x_positions[i+1] - 0.15, commercial_y),
                        arrowstyle='->',
                        mutation_scale=20,
                        linewidth=3,
                        color=commercial_color,
                        alpha=0.8
                    )
                    ax.add_patch(arrow)

            # 3. 组织实现路径
            org_y = 0.2
            org_x_positions = [0.2, 0.5, 0.8]
            org_steps = [
                organizational_path.get("capacity_building", "数字化技能、数据思维"),
                organizational_path.get("process_reconstruction", "业务流程、决策流程"),
                organizational_path.get("governance_mechanism", "数据治理、算法治理")
            ]

            for i, (x_pos, step) in enumerate(zip(org_x_positions, org_steps)):
                # 绘制步骤框
                box = FancyBboxPatch(
                    (x_pos - 0.15, org_y - 0.1),
                    0.3, 0.2,
                    boxstyle="round,pad=0.02",
                    facecolor=org_color,
                    edgecolor="black",
                    linewidth=2,
                    alpha=0.7
                )
                ax.add_patch(box)

                # 添加文本
                ax.text(
                    x_pos, org_y + 0.12,
                    phases[i],
                    ha='center',
                    fontsize=11,
                    fontweight='bold',
                    color=org_color
                )

                # 添加步骤描述
                ax.text(
                    x_pos, org_y,
                    step[:20] + "..." if len(step) > 20 else step,
                    ha='center',
                    va='center',
                    fontsize=9,
                    color='white',
                    fontweight='bold'
                )

                # 绘制箭头
                if i < len(org_x_positions) - 1:
                    arrow = FancyArrowPatch(
                        (x_pos + 0.15, org_y),
                        (org_x_positions[i+1] - 0.15, org_y),
                        arrowstyle='->',
                        mutation_scale=20,
                        linewidth=3,
                        color=org_color,
                        alpha=0.8
                    )
                    ax.add_patch(arrow)

            # 添加路径标签
            ax.text(0.05, tech_y, "技术路径", fontsize=12, fontweight='bold', color=tech_color, va='center')
            ax.text(0.05, commercial_y, "商业路径", fontsize=12, fontweight='bold', color=commercial_color, va='center')
            ax.text(0.05, org_y, "组织路径", fontsize=12, fontweight='bold', color=org_color, va='center')

            # 设置图形范围
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect('equal')

            # 隐藏坐标轴
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)

            # 添加标题
            title = data.get("business_name", "企业") + " - 数字化转型路径"
            ax.set_title(
                title,
                fontsize=16,
                fontweight='bold',
                pad=20
            )

            # 添加图例
            legend_patches = [
                mpatches.Patch(color=tech_color, label='技术实现路径'),
                mpatches.Patch(color=commercial_color, label='商业实现路径'),
                mpatches.Patch(color=org_color, label='组织实现路径')
            ]
            ax.legend(
                handles=legend_patches,
                loc='upper center',
                bbox_to_anchor=(0.5, 1.15),
                ncol=3,
                fontsize=10
            )

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"转型路径图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制转型路径图失败: {e}")
            return ""

    def plot_innovation_phase_timeline(
        self,
        data: Dict[str, Any],
        filename: str = "innovation_phase_timeline.png",
        figsize: Tuple[int, int] = (16, 8)
    ) -> str:
        """
        绘制创新阶段时间线

        Args:
            data: 创新路径数据
            filename: 输出文件名
            figsize: 图形大小

        Returns:
            输出文件路径
        """
        logger.info(f"绘制创新阶段时间线: {filename}")

        try:
            # 创建图形
            fig, ax = plt.subplots(figsize=figsize)

            # 提取阶段信息
            pathway_model = data.get("innovation_pathway_model", {})
            phases = [
                ("探索阶段", pathway_model.get("exploration_phase", {})),
                ("试点阶段", pathway_model.get("pilot_phase", {})),
                ("扩展阶段", pathway_model.get("scaling_phase", {})),
                ("优化阶段", pathway_model.get("optimization_phase", {}))
            ]

            # 定义颜色
            colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

            # 绘制时间线
            x_positions = np.linspace(0.15, 0.85, len(phases))
            y_position = 0.5

            # 绘制水平线
            ax.plot(
                [x_positions[0], x_positions[-1]],
                [y_position, y_position],
                color='gray',
                linewidth=3,
                alpha=0.5,
                zorder=1
            )

            # 绘制每个阶段
            for i, (phase_name, phase_info) in enumerate(phases):
                x_pos = x_positions[i]
                color = colors[i]

                # 绘制阶段节点
                circle = plt.Circle(
                    (x_pos, y_position),
                    0.08,
                    facecolor=color,
                    edgecolor='black',
                    linewidth=3,
                    zorder=2
                )
                ax.add_patch(circle)

                # 添加阶段名称
                ax.text(
                    x_pos,
                    y_position + 0.15,
                    phase_name,
                    ha='center',
                    fontsize=14,
                    fontweight='bold',
                    color=color
                )

                # 提取阶段信息
                goal = phase_info.get("goal", "")
                activities = phase_info.get("activities", [])
                key_metrics = phase_info.get("key_metrics", [])

                # 添加目标
                ax.text(
                    x_pos,
                    y_position - 0.15,
                    f"目标: {goal[:15]}..." if len(goal) > 15 else f"目标: {goal}",
                    ha='center',
                    fontsize=9,
                    bbox=dict(boxstyle='round,pad=0.3', facecolor=color, alpha=0.3)
                )

                # 添加活动列表（底部）
                if activities:
                    activities_text = "\n".join([f"• {act}" for act in activities[:3]])
                    ax.text(
                        x_pos,
                        y_position - 0.35,
                        "活动:\n" + activities_text,
                        ha='center',
                        fontsize=8,
                        va='top',
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8)
                    )

                # 添加关键指标（顶部）
                if key_metrics:
                    metrics_text = "\n".join([f"✓ {metric}" for metric in key_metrics[:3]])
                    ax.text(
                        x_pos,
                        y_position + 0.35,
                        "关键指标:\n" + metrics_text,
                        ha='center',
                        fontsize=8,
                        va='bottom',
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8)
                    )

            # 添加时间线标签
            ax.text(
                (x_positions[0] + x_positions[-1]) / 2,
                y_position + 0.55,
                "创新实施阶段时间线",
                ha='center',
                fontsize=16,
                fontweight='bold'
            )

            # 设置图形范围
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect('equal')

            # 隐藏坐标轴
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"创新阶段时间线已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制创新阶段时间线失败: {e}")
            return ""

    def plot_business_model_reconstruction(
        self,
        data: Dict[str, Any],
        filename: str = "business_model_reconstruction.png",
        figsize: Tuple[int, int] = (14, 10)
    ) -> str:
        """
        绘制商业模式重构图

        Args:
            data: 商业模式重构数据
            filename: 输出文件名
            figsize: 图形大小

        Returns:
            输出文件路径
        """
        logger.info(f"绘制商业模式重构图: {filename}")

        try:
            # 创建图形
            fig, ax = plt.subplots(figsize=figsize)

            # 提取重构框架
            framework = data.get("business_model_reconstruction_framework", {})

            # 定义5个重构维度
            dimensions = [
                ("价值主张重构", framework.get("value_proposition_reconstruction", {})),
                ("价值创造重构", framework.get("value_creation_reconstruction", {})),
                ("价值传递重构", framework.get("value_delivery_reconstruction", {})),
                ("价值获取重构", framework.get("value_capture_reconstruction", {})),
                ("竞争优势重构", framework.get("competitive_advantage_reconstruction", {}))
            ]

            # 定义颜色
            colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

            # 绘制中心圆
            center_circle = plt.Circle(
                (0.5, 0.5),
                0.08,
                facecolor='#2C3E50',
                edgecolor='black',
                linewidth=3,
                zorder=10
            )
            ax.add_patch(center_circle)
            ax.text(
                0.5, 0.5,
                "商业\n模式",
                ha='center',
                va='center',
                fontsize=10,
                fontweight='bold',
                color='white',
                zorder=11
            )

            # 计算5个维度的位置（围绕中心分布）
            angles = np.linspace(0, 2*np.pi, len(dimensions), endpoint=False)
            radius = 0.35

            # 绘制每个维度
            for i, (dim_name, dim_info) in enumerate(dimensions):
                angle = angles[i]
                x = 0.5 + radius * np.cos(angle)
                y = 0.5 + radius * np.sin(angle)
                color = colors[i]

                # 绘制维度节点
                circle = plt.Circle(
                    (x, y),
                    0.1,
                    facecolor=color,
                    edgecolor='black',
                    linewidth=2,
                    zorder=5
                )
                ax.add_patch(circle)

                # 添加维度名称
                ax.text(
                    x,
                    y + 0.12,
                    dim_name,
                    ha='center',
                    fontsize=11,
                    fontweight='bold',
                    color=color
                )

                # 绘制连接线
                line = plt.Line2D(
                    [0.5, x],
                    [0.5, y],
                    color=color,
                    linewidth=2,
                    alpha=0.6,
                    zorder=1
                )
                ax.add_line(line)

                # 添加详细内容框
                content_box = FancyBboxPatch(
                    (x - 0.12, y - 0.25),
                    0.24, 0.15,
                    boxstyle="round,pad=0.01",
                    facecolor=color,
                    edgecolor='black',
                    linewidth=1,
                    alpha=0.3,
                    zorder=3
                )
                ax.add_patch(content_box)

                # 添加内容文本
                content_keys = list(dim_info.keys())[:2]  # 只显示前2个
                content_text = "\n".join([
                    f"• {key}" for key in content_keys
                ])
                ax.text(
                    x,
                    y - 0.17,
                    content_text,
                    ha='center',
                    fontsize=7,
                    va='center',
                    color='black',
                    zorder=4
                )

            # 设置图形范围
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect('equal')

            # 隐藏坐标轴
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)

            # 添加标题
            title = data.get("business_name", "企业") + " - 商业模式重构"
            ax.set_title(
                title,
                fontsize=16,
                fontweight='bold',
                pad=20
            )

            # 添加说明文本
            description = (
                "商业模式重构从5个维度进行：\n"
                "价值主张、价值创造、价值传递、价值获取、竞争优势"
            )
            ax.text(
                0.5, 0.05,
                description,
                ha='center',
                fontsize=9,
                bbox=dict(boxstyle='round,pad=0.5', facecolor='wheat', alpha=0.5)
            )

            # 调整布局
            plt.tight_layout(rect=[0, 0.08, 1, 1])

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"商业模式重构图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制商业模式重构图失败: {e}")
            return ""

    def plot_digitization_online_intelligence_steps(
        self,
        data: Dict[str, Any],
        filename: str = "doi_steps.png",
        figsize: Tuple[int, int] = (16, 8)
    ) -> str:
        """
        绘制数字化-在线化-智能化三步曲图

        Args:
            data: 转型数据
            filename: 输出文件名
            figsize: 图形大小

        Returns:
            输出文件路径
        """
        logger.info(f"绘制数字化-在线化-智能化三步曲图: {filename}")

        try:
            # 创建图形
            fig, ax = plt.subplots(figsize=figsize)

            # 定义三步曲
            steps = [
                {
                    "name": "数字化",
                    "description": "数据沉淀",
                    "detail": "物理属性转化为数字属性",
                    "color": "#FF6B6B"
                },
                {
                    "name": "在线化",
                    "description": "直接触达",
                    "detail": "行为数据获取，市场感知提升",
                    "color": "#4ECDC4"
                },
                {
                    "name": "智能化",
                    "description": "智能决策",
                    "detail": "预测性服务，个性化匹配",
                    "color": "#45B7D1"
                }
            ]

            # 定义位置
            x_positions = [0.2, 0.5, 0.8]
            y_position = 0.5

            # 绘制连接箭头
            for i in range(len(steps) - 1):
                arrow = FancyArrowPatch(
                    (x_positions[i] + 0.12, y_position),
                    (x_positions[i+1] - 0.12, y_position),
                    arrowstyle='->',
                    mutation_scale=30,
                    linewidth=4,
                    color='gray',
                    alpha=0.6,
                    zorder=1
                )
                ax.add_patch(arrow)

            # 绘制每个步骤
            for i, step in enumerate(steps):
                x_pos = x_positions[i]
                color = step["color"]

                # 绘制大圆
                big_circle = plt.Circle(
                    (x_pos, y_position),
                    0.15,
                    facecolor=color,
                    edgecolor='black',
                    linewidth=3,
                    alpha=0.8,
                    zorder=2
                )
                ax.add_patch(big_circle)

                # 添加步骤名称
                ax.text(
                    x_pos,
                    y_position + 0.22,
                    step["name"],
                    ha='center',
                    fontsize=16,
                    fontweight='bold',
                    color=color
                )

                # 添加描述
                ax.text(
                    x_pos,
                    y_position + 0.05,
                    step["description"],
                    ha='center',
                    fontsize=12,
                    fontweight='bold',
                    color='white',
                    zorder=3
                )

                # 绘制详细描述框
                desc_box = FancyBboxPatch(
                    (x_pos - 0.15, y_position - 0.3),
                    0.3, 0.15,
                    boxstyle="round,pad=0.02",
                    facecolor=color,
                    edgecolor='black',
                    linewidth=2,
                    alpha=0.3,
                    zorder=3
                )
                ax.add_patch(desc_box)

                # 添加详细描述
                ax.text(
                    x_pos,
                    y_position - 0.22,
                    step["detail"],
                    ha='center',
                    fontsize=9,
                    color='black',
                    zorder=4
                )

            # 添加标题
            ax.text(
                0.5, 0.85,
                "数字化转型三步曲",
                ha='center',
                fontsize=18,
                fontweight='bold'
            )

            # 添加说明
            description = (
                "数字化 → 在线化 → 智能化\n"
                "数据从沉淀到应用，从静态到动态，从成本中心到价值中心"
            )
            ax.text(
                0.5, 0.15,
                description,
                ha='center',
                fontsize=11,
                bbox=dict(boxstyle='round,pad=0.5', facecolor='wheat', alpha=0.5)
            )

            # 设置图形范围
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect('equal')

            # 隐藏坐标轴
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_visible(False)

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"数字化-在线化-智能化三步曲图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制数字化-在线化-智能化三步曲图失败: {e}")
            return ""

    def generate_all_transformations_visualizations(
        self,
        data: Dict[str, Any],
        prefix: str = ""
    ) -> List[str]:
        """
        生成所有转型可视化图表

        Args:
            data: 转型数据
            prefix: 文件名前缀

        Returns:
            生成的文件路径列表
        """
        logger.info(f"生成所有转型可视化图表，前缀: {prefix}")

        generated_files = []

        # 1. 转型路径图
        pathway_file = self.plot_transformation_pathway(
            data,
            filename=f"{prefix}transformation_pathway.png"
        )
        if pathway_file:
            generated_files.append(pathway_file)

        # 2. 创新阶段时间线
        timeline_file = self.plot_innovation_phase_timeline(
            data,
            filename=f"{prefix}innovation_phase_timeline.png"
        )
        if timeline_file:
            generated_files.append(timeline_file)

        # 3. 商业模式重构图
        business_model_file = self.plot_business_model_reconstruction(
            data,
            filename=f"{prefix}business_model_reconstruction.png"
        )
        if business_model_file:
            generated_files.append(business_model_file)

        # 4. 数字化-在线化-智能化三步曲图
        doi_file = self.plot_digitization_online_intelligence_steps(
            data,
            filename=f"{prefix}doi_steps.png"
        )
        if doi_file:
            generated_files.append(doi_file)

        logger.info(f"共生成 {len(generated_files)} 个转型可视化文件")
        return generated_files


def main():
    """主函数 - 演示转型可视化功能"""
    # 创建示例数据
    example_data = {
        "business_name": "智能制造公司",
        "pathway_planning_framework": {
            "technology_implementation_pathway": {
                "digitalization_foundation": "数据采集、存储、管理系统建设",
                "online_platform": "客户触达、交互、服务系统构建",
                "intelligent_application": "AI算法、自动化流程、智能决策系统开发"
            },
            "commercial_implementation_pathway": {
                "market_verification": "MVP开发、用户测试、需求验证",
                "business_model": "收入模式设计、定价策略制定",
                "scale_expansion": "市场推广、渠道建设、客户增长"
            },
            "organizational_implementation_pathway": {
                "capacity_building": "数字化技能、数据思维、创新文化",
                "process_reconstruction": "业务流程、决策流程、协作流程优化",
                "governance_mechanism": "数据治理、算法治理、创新治理"
            }
        },
        "innovation_pathway_model": {
            "exploration_phase": {
                "goal": "验证创新利基的可行性",
                "activities": ["市场调研", "技术验证", "原型开发"],
                "key_metrics": ["需求验证度", "技术可行性", "资源需求评估"]
            },
            "pilot_phase": {
                "goal": "小规模验证创新方案",
                "activities": ["小范围试点", "用户反馈收集", "方案优化"],
                "key_metrics": ["用户满意度", "运营效率", "成本效益"]
            },
            "scaling_phase": {
                "goal": "规模化实施创新方案",
                "activities": ["范围扩大", "流程优化", "团队建设"],
                "key_metrics": ["市场覆盖率", "收入增长", "竞争优势"]
            },
            "optimization_phase": {
                "goal": "持续优化创新方案",
                "activities": ["数据分析", "持续改进", "生态建设"],
                "key_metrics": ["持续创新率", "生态协同度", "长期价值"]
            }
        },
        "business_model_reconstruction_framework": {
            "value_proposition_reconstruction": {
                "digitalization_value": "从物理价值到数字价值的转化",
                "personalization_value": "从标准化到个性化的价值重构"
            },
            "value_creation_reconstruction": {
                "process_intelligence": "传统流程向智能流程的转换",
                "resource_allocation_optimization": "从静态配置到动态配置"
            },
            "value_delivery_reconstruction": {
                "channel_digitization": "从传统渠道到数字化渠道",
                "touchpoint_intelligence": "从单点触达到全链路触达"
            },
            "value_capture_reconstruction": {
                "income_diversification": "从单一收入到多元收入",
                "pricing_dynamism": "从固定定价到动态定价"
            },
            "competitive_advantage_reconstruction": {
                "data_assetization": "构建数据驱动的竞争优势",
                "algorithm_barriering": "通过算法构建技术壁垒"
            }
        }
    }

    # 创建可视化器
    visualizer = TransformationPathVisualizer(
        output_dir="example_transformations_visualizations"
    )

    # 生成所有可视化
    print("生成所有转型可视化图表...")
    files = visualizer.generate_all_transformations_visualizations(
        example_data,
        prefix="example_"
    )

    print(f"\n生成的文件:")
    for file in files:
        print(f"  - {file}")


if __name__ == "__main__":
    main()
