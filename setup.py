#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Smart CLI Router 安装脚本
"""

from setuptools import setup, find_packages
import os

# 读取README文件
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# 读取requirements文件
def read_requirements():
    requirements = []
    if os.path.exists("requirements.txt"):
        with open("requirements.txt", "r", encoding="utf-8") as fh:
            requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]
    return requirements

setup(
    name="smart-cli-router",
    version="1.0.0",
    author="Smart CLI Router Team",
    author_email="contact@smart-cli-router.com",
    description="智能CLI路由器 - 让多个AI CLI工具统一响应您的自然语言指令",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/your-username/smart-cli-router",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Shells",
        "Topic :: Utilities",
    ],
    python_requires=">=3.7",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "black>=21.0",
            "flake8>=3.8",
            "mypy>=0.800",
        ],
    },
    entry_points={
        "console_scripts": [
            "smart-router=src.universal_cli_setup:main",
            "smart-create=src.smart_router_creator:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.md", "*.txt", "*.json"],
    },
    keywords="ai cli router smart natural-language automation cross-platform",
    project_urls={
        "Bug Reports": "https://github.com/your-username/smart-cli-router/issues",
        "Source": "https://github.com/your-username/smart-cli-router",
        "Documentation": "https://smart-cli-router.readthedocs.io/",
    },
)