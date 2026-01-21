#!/usr/bin/env python3
"""
生态系统地图可视化模块
使用matplotlib和networkx生成生态系统网络图、关系矩阵和统计分析图表
"""

import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import Normalize
import numpy as np
import networkx as nx
import pandas as pd

# 配置中文字体支持
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EcosystemVisualizer:
    """生态系统可视化器"""

    def __init__(self, output_dir: str = "visualizations"):
        """初始化可视化器

        Args:
            output_dir: 输出目录
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"生态系统可视化器初始化完成，输出目录: {self.output_dir}")

    def plot_ecosystem_network(
        self,
        data: Dict[str, Any],
        filename: str = "ecosystem_network.png",
        figsize: Tuple[int, int] = (16, 12),
        layout: str = "spring"
    ) -> str:
        """
        绘制生态系统网络图

        Args:
            data: 生态系统数据
            filename: 输出文件名
            figsize: 图形大小
            layout: 布局算法 (spring, circular, random, kamada_kawai, spectral)

        Returns:
            输出文件路径
        """
        logger.info(f"绘制生态系统网络图: {filename}")

        try:
            # 创建图形
            fig, ax = plt.subplots(figsize=figsize)

            # 提取实体和关系
            entities = data.get("entities", [])
            relationships = data.get("relationships", [])

            if not entities:
                logger.warning("没有实体数据，无法绘制网络图")
                return ""

            # 创建NetworkX图
            G = nx.Graph()

            # 添加节点
            for entity in entities:
                G.add_node(
                    entity["id"],
                    label=entity["name"],
                    type=entity.get("type", "unknown"),
                    importance=entity.get("importance", "medium"),
                    scale=entity.get("scale", "medium")
                )

            # 添加边
            for rel in relationships:
                G.add_edge(
                    rel["source"],
                    rel["target"],
                    type=rel.get("type", "unknown"),
                    strength=rel.get("strength", 0.5),
                    description=rel.get("description", "")
                )

            # 选择布局
            if layout == "spring":
                pos = nx.spring_layout(G, k=1, iterations=50)
            elif layout == "circular":
                pos = nx.circular_layout(G)
            elif layout == "random":
                pos = nx.random_layout(G)
            elif layout == "kamada_kawai":
                pos = nx.kamada_kawai_layout(G)
            elif layout == "spectral":
                pos = nx.spectral_layout(G)
            else:
                pos = nx.spring_layout(G)

            # 定义颜色映射
            type_colors = {
                "manufacturer": "#FF6B6B",
                "supplier": "#4ECDC4",
                "competitor": "#FFA07A",
                "customer": "#98D8C8",
                "partner": "#F7DC6F",
                "unknown": "#BDC3C7"
            }

            # 定义大小映射
            size_map = {
                "高": 800,
                "中": 500,
                "低": 300,
                "large": 700,
                "medium": 500,
                "small": 300
            }

            # 绘制节点
            for node in G.nodes():
                node_data = G.nodes[node]
                node_type = node_data.get("type", "unknown")
                node_importance = node_data.get("importance", "medium")

                color = type_colors.get(node_type, type_colors["unknown"])
                size = size_map.get(node_importance, size_map["medium"])

                nx.draw_networkx_nodes(
                    G,
                    pos,
                    nodelist=[node],
                    node_color=color,
                    node_size=size,
                    alpha=0.7,
                    ax=ax
                )

            # 绘制边
            edge_widths = []
            for u, v, d in G.edges(data=True):
                edge_widths.append(d.get("strength", 0.5) * 3)

            nx.draw_networkx_edges(
                G,
                pos,
                width=edge_widths,
                alpha=0.4,
                edge_color='gray',
                ax=ax
            )

            # 绘制节点标签
            labels = nx.get_node_attributes(G, 'label')
            nx.draw_networkx_labels(
                G,
                pos,
                labels,
                font_size=8,
                font_family='sans-serif',
                ax=ax
            )

            # 添加图例
            legend_patches = []
            for type_name, color in type_colors.items():
                if type_name != "unknown":
                    patch = mpatches.Patch(color=color, label=type_name)
                    legend_patches.append(patch)

            ax.legend(
                handles=legend_patches,
                loc='upper right',
                bbox_to_anchor=(1.15, 1),
                fontsize=10
            )

            # 添加标题
            industry_name = data.get("industry_name", "生态系统")
            ax.set_title(
                f"{industry_name} - 生态系统网络图",
                fontsize=16,
                fontweight='bold',
                pad=20
            )

            # 添加统计信息
            num_entities = len(entities)
            num_relationships = len(relationships)
            stats_text = f"实体数: {num_entities} | 关系数: {num_relationships}"
            ax.text(
                0.02,
                0.98,
                stats_text,
                transform=ax.transAxes,
                fontsize=10,
                verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
            )

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"网络图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制网络图失败: {e}")
            return ""

    def plot_entity_type_distribution(
        self,
        data: Dict[str, Any],
        filename: str = "entity_type_distribution.png"
    ) -> str:
        """
        绘制实体类型分布图

        Args:
            data: 生态系统数据
            filename: 输出文件名

        Returns:
            输出文件路径
        """
        logger.info(f"绘制实体类型分布图: {filename}")

        try:
            # 提取实体类型
            entities = data.get("entities", [])
            type_counts = {}

            for entity in entities:
                entity_type = entity.get("type", "unknown")
                type_counts[entity_type] = type_counts.get(entity_type, 0) + 1

            if not type_counts:
                logger.warning("没有实体类型数据")
                return ""

            # 创建图形
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

            # 颜色
            colors = plt.cm.Set3(range(len(type_counts)))

            # 1. 饼图
            labels = list(type_counts.keys())
            sizes = list(type_counts.values())

            wedges, texts, autotexts = ax1.pie(
                sizes,
                labels=labels,
                autopct='%1.1f%%',
                colors=colors,
                startangle=90,
                textprops={'fontsize': 10}
            )

            ax1.set_title(
                "实体类型分布 (饼图)",
                fontsize=12,
                fontweight='bold'
            )

            # 2. 柱状图
            ax2.bar(labels, sizes, color=colors, alpha=0.7)
            ax2.set_title(
                "实体类型分布 (柱状图)",
                fontsize=12,
                fontweight='bold'
            )
            ax2.set_xlabel("实体类型", fontsize=10)
            ax2.set_ylabel("数量", fontsize=10)
            ax2.tick_params(axis='x', rotation=45)

            # 添加数值标签
            for i, (label, size) in enumerate(zip(labels, sizes)):
                ax2.text(
                    i,
                    size,
                    str(size),
                    ha='center',
                    va='bottom',
                    fontsize=9
                )

            # 添加网格
            ax2.grid(axis='y', alpha=0.3)

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"实体类型分布图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制实体类型分布图失败: {e}")
            return ""

    def plot_relationship_matrix(
        self,
        data: Dict[str, Any],
        filename: str = "relationship_matrix.png"
    ) -> str:
        """
        绘制关系矩阵热图

        Args:
            data: 生态系统数据
            filename: 输出文件名

        Returns:
            输出文件路径
        """
        logger.info(f"绘制关系矩阵热图: {filename}")

        try:
            # 提取实体和关系
            entities = data.get("entities", [])
            relationships = data.get("relationships", [])

            if not entities or not relationships:
                logger.warning("没有足够的实体或关系数据")
                return ""

            # 创建实体名称到ID的映射
            entity_id_to_name = {e["id"]: e["name"] for e in entities}
            entity_ids = list(entity_id_to_name.keys())
            entity_names = [entity_id_to_name[eid] for eid in entity_ids]

            # 创建关系矩阵
            n = len(entity_ids)
            matrix = np.zeros((n, n))

            # 填充矩阵
            for rel in relationships:
                source = rel.get("source")
                target = rel.get("target")
                strength = rel.get("strength", 0)

                if source in entity_ids and target in entity_ids:
                    i = entity_ids.index(source)
                    j = entity_ids.index(target)
                    matrix[i, j] = max(matrix[i, j], strength)
                    matrix[j, i] = matrix[i, j]  # 对称矩阵

            # 创建图形
            fig, ax = plt.subplots(figsize=(12, 10))

            # 绘制热图
            im = ax.imshow(
                matrix,
                cmap='YlOrRd',
                aspect='auto',
                interpolation='nearest',
                vmin=0,
                vmax=1
            )

            # 设置坐标轴
            ax.set_xticks(np.arange(len(entity_names)))
            ax.set_yticks(np.arange(len(entity_names)))
            ax.set_xticklabels(entity_names, fontsize=8, rotation=90, ha='right')
            ax.set_yticklabels(entity_names, fontsize=8)

            # 添加颜色条
            cbar = plt.colorbar(im, ax=ax)
            cbar.set_label('关系强度', fontsize=10)

            # 在每个格子中添加数值
            for i in range(n):
                for j in range(n):
                    text = ax.text(
                        j, i,
                        f'{matrix[i, j]:.2f}',
                        ha="center",
                        va="center",
                        color="black" if matrix[i, j] < 0.5 else "white",
                        fontsize=6
                    )

            # 添加标题
            ax.set_title(
                "生态系统关系矩阵",
                fontsize=14,
                fontweight='bold',
                pad=20
            )

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"关系矩阵热图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制关系矩阵热图失败: {e}")
            return ""

    def plot_importance_scale_distribution(
        self,
        data: Dict[str, Any],
        filename: str = "importance_scale_distribution.png"
    ) -> str:
        """
        绘制重要性和规模分布图

        Args:
            data: 生态系统数据
            filename: 输出文件名

        Returns:
            输出文件路径
        """
        logger.info(f"绘制重要性和规模分布图: {filename}")

        try:
            # 提取实体
            entities = data.get("entities", [])

            if not entities:
                logger.warning("没有实体数据")
                return ""

            # 统计重要性和规模
            importance_counts = {}
            scale_counts = {}

            for entity in entities:
                importance = entity.get("importance", "中")
                scale = entity.get("scale", "中型")

                importance_counts[importance] = importance_counts.get(importance, 0) + 1
                scale_counts[scale] = scale_counts.get(scale, 0) + 1

            # 创建图形
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

            # 1. 重要性分布
            importance_labels = list(importance_counts.keys())
            importance_sizes = list(importance_counts.values())

            colors1 = plt.cm.Reds(np.linspace(0.5, 1, len(importance_labels)))

            ax1.bar(importance_labels, importance_sizes, color=colors1, alpha=0.7)
            ax1.set_title(
                "实体重要性分布",
                fontsize=12,
                fontweight='bold'
            )
            ax1.set_xlabel("重要性", fontsize=10)
            ax1.set_ylabel("数量", fontsize=10)

            # 添加数值标签
            for i, (label, size) in enumerate(zip(importance_labels, importance_sizes)):
                ax1.text(
                    i,
                    size,
                    str(size),
                    ha='center',
                    va='bottom',
                    fontsize=10
                )

            ax1.grid(axis='y', alpha=0.3)

            # 2. 规模分布
            scale_labels = list(scale_counts.keys())
            scale_sizes = list(scale_counts.values())

            colors2 = plt.cm.Blues(np.linspace(0.5, 1, len(scale_labels)))

            ax2.bar(scale_labels, scale_sizes, color=colors2, alpha=0.7)
            ax2.set_title(
                "实体规模分布",
                fontsize=12,
                fontweight='bold'
            )
            ax2.set_xlabel("规模", fontsize=10)
            ax2.set_ylabel("数量", fontsize=10)

            # 添加数值标签
            for i, (label, size) in enumerate(zip(scale_labels, scale_sizes)):
                ax2.text(
                    i,
                    size,
                    str(size),
                    ha='center',
                    va='bottom',
                    fontsize=10
                )

            ax2.grid(axis='y', alpha=0.3)

            # 调整布局
            plt.tight_layout()

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"重要性和规模分布图已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制重要性和规模分布图失败: {e}")
            return ""

    def plot_network_statistics(
        self,
        data: Dict[str, Any],
        filename: str = "network_statistics.png"
    ) -> str:
        """
        绘制网络统计图表

        Args:
            data: 生态系统数据
            filename: 输出文件名

        Returns:
            输出文件路径
        """
        logger.info(f"绘制网络统计图表: {filename}")

        try:
            # 提取实体和关系
            entities = data.get("entities", [])
            relationships = data.get("relationships", [])

            if not entities or not relationships:
                logger.warning("没有足够的实体或关系数据")
                return ""

            # 创建NetworkX图
            G = nx.Graph()

            for entity in entities:
                G.add_node(entity["id"])

            for rel in relationships:
                G.add_edge(rel["source"], rel["target"])

            # 计算网络统计指标
            num_nodes = len(G.nodes())
            num_edges = len(G.edges())

            if num_nodes == 0:
                logger.warning("图中没有节点")
                return ""

            degree_centrality = nx.degree_centrality(G)
            betweenness_centrality = nx.betweenness_centrality(G)
            closeness_centrality = nx.closeness_centrality(G)

            # 获取度数分布
            degrees = [G.degree(n) for n in G.nodes()]

            # 创建图形
            fig, axes = plt.subplots(2, 2, figsize=(16, 12))

            # 1. 度数分布
            ax = axes[0, 0]
            ax.hist(degrees, bins=10, color='skyblue', edgecolor='black', alpha=0.7)
            ax.set_title("节点度数分布", fontsize=11, fontweight='bold')
            ax.set_xlabel("度数", fontsize=9)
            ax.set_ylabel("节点数量", fontsize=9)
            ax.grid(axis='y', alpha=0.3)

            # 2. 度中心性分布
            ax = axes[0, 1]
            dc_values = list(degree_centrality.values())
            ax.hist(dc_values, bins=10, color='lightcoral', edgecolor='black', alpha=0.7)
            ax.set_title("度中心性分布", fontsize=11, fontweight='bold')
            ax.set_xlabel("度中心性", fontsize=9)
            ax.set_ylabel("节点数量", fontsize=9)
            ax.grid(axis='y', alpha=0.3)

            # 3. 中介中心性分布
            ax = axes[1, 0]
            bc_values = list(betweenness_centrality.values())
            ax.hist(bc_values, bins=10, color='lightgreen', edgecolor='black', alpha=0.7)
            ax.set_title("中介中心性分布", fontsize=11, fontweight='bold')
            ax.set_xlabel("中介中心性", fontsize=9)
            ax.set_ylabel("节点数量", fontsize=9)
            ax.grid(axis='y', alpha=0.3)

            # 4. 接近中心性分布
            ax = axes[1, 1]
            cc_values = list(closeness_centrality.values())
            ax.hist(cc_values, bins=10, color='gold', edgecolor='black', alpha=0.7)
            ax.set_title("接近中心性分布", fontsize=11, fontweight='bold')
            ax.set_xlabel("接近中心性", fontsize=9)
            ax.set_ylabel("节点数量", fontsize=9)
            ax.grid(axis='y', alpha=0.3)

            # 添加总标题
            fig.suptitle(
                "生态系统网络统计分析",
                fontsize=14,
                fontweight='bold',
                y=0.995
            )

            # 添加统计信息文本
            stats_text = (
                f"网络统计信息:\n"
                f"节点数: {num_nodes}\n"
                f"边数: {num_edges}\n"
                f"平均度数: {np.mean(degrees):.2f}\n"
                f"最大度数: {max(degrees)}\n"
                f"最小度数: {min(degrees)}\n"
                f"网络密度: {nx.density(G):.4f}"
            )
            fig.text(
                0.02,
                0.02,
                stats_text,
                fontsize=9,
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5)
            )

            # 调整布局
            plt.tight_layout(rect=[0, 0.08, 1, 0.99])

            # 保存图片
            output_path = self.output_dir / filename
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()

            logger.info(f"网络统计图表已保存: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"绘制网络统计图表失败: {e}")
            return ""

    def generate_all_visualizations(
        self,
        data: Dict[str, Any],
        prefix: str = ""
    ) -> List[str]:
        """
        生成所有可视化图表

        Args:
            data: 生态系统数据
            prefix: 文件名前缀

        Returns:
            生成的文件路径列表
        """
        logger.info(f"生成所有可视化图表，前缀: {prefix}")

        generated_files = []

        # 1. 生态系统网络图
        network_file = self.plot_ecosystem_network(
            data,
            filename=f"{prefix}ecosystem_network.png"
        )
        if network_file:
            generated_files.append(network_file)

        # 2. 实体类型分布图
        type_dist_file = self.plot_entity_type_distribution(
            data,
            filename=f"{prefix}entity_type_distribution.png"
        )
        if type_dist_file:
            generated_files.append(type_dist_file)

        # 3. 关系矩阵热图
        matrix_file = self.plot_relationship_matrix(
            data,
            filename=f"{prefix}relationship_matrix.png"
        )
        if matrix_file:
            generated_files.append(matrix_file)

        # 4. 重要性和规模分布图
        imp_scale_file = self.plot_importance_scale_distribution(
            data,
            filename=f"{prefix}importance_scale_distribution.png"
        )
        if imp_scale_file:
            generated_files.append(imp_scale_file)

        # 5. 网络统计图表
        stats_file = self.plot_network_statistics(
            data,
            filename=f"{prefix}network_statistics.png"
        )
        if stats_file:
            generated_files.append(stats_file)

        logger.info(f"共生成 {len(generated_files)} 个可视化文件")
        return generated_files


def main():
    """主函数 - 演示可视化功能"""
    # 创建示例数据
    example_data = {
        "industry_name": "新能源汽车",
        "entities": [
            {
                "id": "entity_1",
                "name": "比亚迪",
                "type": "manufacturer",
                "importance": "高",
                "scale": "大型"
            },
            {
                "id": "entity_2",
                "name": "宁德时代",
                "type": "supplier",
                "importance": "高",
                "scale": "大型"
            },
            {
                "id": "entity_3",
                "name": "特斯拉",
                "type": "competitor",
                "importance": "高",
                "scale": "大型"
            },
            {
                "id": "entity_4",
                "name": "蔚来汽车",
                "type": "manufacturer",
                "importance": "中",
                "scale": "中型"
            },
            {
                "id": "entity_5",
                "name": "小鹏汽车",
                "type": "manufacturer",
                "importance": "中",
                "scale": "中型"
            }
        ],
        "relationships": [
            {
                "source": "entity_1",
                "target": "entity_2",
                "type": "supply",
                "strength": 0.9,
                "description": "宁德时代为比亚迪供应电池"
            },
            {
                "source": "entity_1",
                "target": "entity_3",
                "type": "competition",
                "strength": 0.8,
                "description": "比亚迪与特斯拉在市场竞争"
            },
            {
                "source": "entity_4",
                "target": "entity_5",
                "type": "competition",
                "strength": 0.7,
                "description": "蔚来与小鹏在市场竞争"
            }
        ]
    }

    # 创建可视化器
    visualizer = EcosystemVisualizer(output_dir="example_visualizations")

    # 生成所有可视化
    print("生成所有可视化图表...")
    files = visualizer.generate_all_visualizations(
        example_data,
        prefix="example_"
    )

    print(f"\n生成的文件:")
    for file in files:
        print(f"  - {file}")


if __name__ == "__main__":
    main()
