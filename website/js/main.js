// 智能体协作系统网站JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动导航
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 终端模拟动画
    function animateTerminal() {
        const terminals = document.querySelectorAll('.terminal-content');
        terminals.forEach(term => {
            const lines = term.querySelectorAll('.terminal-line');
            let delay = 0;
            
            lines.forEach((line, index) => {
                setTimeout(() => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateX(0)';
                }, delay);
                
                delay += 300; // 逐行显示
            });
        });
    }
    
    // 页面加载时触发动画
    setTimeout(animateTerminal, 500);

    // 特性卡片悬停效果
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 代码复制功能
    function addCopyButtons() {
        const terminalBoxes = document.querySelectorAll('.terminal-box');
        
        terminalBoxes.forEach(box => {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn btn-sm btn-outline-light position-absolute top-0 end-0 m-2';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.style.zIndex = '10';
            
            box.style.position = 'relative';
            box.appendChild(copyBtn);
            
            copyBtn.addEventListener('click', function() {
                const content = box.textContent;
                navigator.clipboard.writeText(content).then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    copyBtn.classList.remove('btn-outline-light');
                    copyBtn.classList.add('btn-success');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.classList.remove('btn-success');
                        copyBtn.classList.add('btn-outline-light');
                    }, 2000);
                });
            });
        });
    }
    
    // 页面加载后添加复制按钮
    setTimeout(addCopyButtons, 1000);

    // 回到顶部按钮
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'btn btn-primary position-fixed';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.style.bottom = '20px';
    backToTopBtn.style.right = '20px';
    backToTopBtn.style.display = 'none';
    backToTopBtn.style.zIndex = '1000';
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 项目特性轮播动画
    function animateFeatures() {
        const features = document.querySelectorAll('.feature-card');
        let delay = 0;
        
        features.forEach(feature => {
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateY(0)';
            }, delay);
            
            delay += 100;
        });
    }
    
    // 页面加载后触发动画
    setTimeout(animateFeatures, 1000);

    // 添加滚动监听器，当元素进入视窗时动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 为重要元素添加交叉观察器
    document.querySelectorAll('.feature-card, .card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // 页面加载完成效果
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// 工具栏函数
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// 搜索功能（如果需要）
function searchFeatures(query) {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 语言切换功能
function switchLanguage(lang) {
    localStorage.setItem('preferred-lang', lang);
    window.location.href = `/${lang}/index.html`;
}

// 贡献者统计
function updateContributorCount() {
    // 这里可以从API获取实际贡献者数量
    const count = Math.floor(Math.random() * 50) + 10; // 模拟数据
    const elements = document.querySelectorAll('.contributor-count');
    elements.forEach(el => {
        el.textContent = count;
    });
}

// 初始化统计
document.addEventListener('DOMContentLoaded', function() {
    updateContributorCount();
});