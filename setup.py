"""
AI CLI Router - 安装配置文件
跨AI CLI工具协作系统
"""
from setuptools import setup, find_packages
from pathlib import Path

# 读取README文件
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding='utf-8') if readme_file.exists() else ""

# 读取requirements文件
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    requirements = requirements_file.read_text(encoding='utf-8').strip().split('\n')
    requirements = [req.strip() for req in requirements if req.strip() and not req.startswith('#')]

setup(
    name="ai-cli-router",
    version="1.0.0",
    author="AI CLI Router Team",
    author_email="contact@ai-cli-router.dev",
    description="跨AI CLI工具协作系统",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ai-cli-router",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Utilities",
    ],
    python_requires=">=3.8",
    install_requires=requirements or [
        "asyncio",
        "aiofiles",
        "pyyaml",
        "click",
        "rich",
        "pathlib",
        "typing-extensions",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-asyncio>=0.18",
            "pytest-cov>=2.0",
            "black>=21.0",
            "isort>=5.0",
            "flake8>=3.9",
            "mypy>=0.910",
            "pre-commit>=2.15",
        ],
        "docs": [
            "mkdocs>=1.4",
            "mkdocs-material>=8.0",
            "mkdocstrings-python>=0.7",
        ],
    },
    entry_points={
        "console_scripts": [
            "ai-cli-router=src.main:main",
            # 添加自动安装命令
            "ai-cli-router-deploy=src.main:main",
            "ai-cli-router-install=src.main:main",
            "ai-cli-router-init=src.main:main",
            "ai-cli-router-status=src.main:main",
            "ai-cli-router-scan=src.main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": [
            "*.md",
            "*.yml",
            "*.yaml",
            "*.json",
            "*.txt",
            "*.bat",
            "templates/*",
            "docs/*",
        ],
    },
    keywords=[
        "ai",
        "cli",
        "collaboration",
        "automation",
        "development",
        "productivity",
        "cross-platform",
        "stigmergy",
        "ai-tools",
    ],
    project_urls={
        "Bug Reports": "https://github.com/ai-cli-router/issues",
        "Source": "https://github.com/ai-cli-router",
        "Documentation": "https://ai-cli-router.readthedocs.io/",
        "Changelog": "https://github.com/ai-cli-router/blob/main/CHANGELOG.md",
    },
)