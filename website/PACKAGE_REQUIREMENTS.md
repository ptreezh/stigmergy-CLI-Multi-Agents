# Stigmergy CLI多智能体协作系统 - 网站包需求

## 网站所需包

为了使网站正常运行，需要以下JavaScript库包：

### 1. Bootstrap 5.x
- **用途**: 响应式UI组件和布局框架
- **版本**: 5.3.0
- **CDN**: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
- **CDN JS**: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js

### 2. Font Awesome 6.x
- **用途**: 图标库
- **版本**: 6.0.0
- **CDN**: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css

### 3. Google Fonts (Inter字体)
- **用途**: 网站字体
- **字体**: Inter:wght@300;400;500;600;700;800
- **CDN**: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap

### 4. jQuery (如果需要)
- **用途**: DOM操作和事件处理
- **版本**: 3.6.x+
- **CDN**: https://code.jquery.com/jquery-3.6.0.min.js

## 包集成

这些包通过CDN链接直接在HTML中引用，无需本地安装：
- CSS样式通过 `<link rel="stylesheet">` 引入
- JavaScript脚本通过 `<script src="">` 引入

## 本地部署

如果需要本地部署，可以通过npm安装：
```bash
npm install bootstrap@5.3.0
npm install @fortawesome/fontawesome-free@6.0.0
```

## 注意事项

- 所有包都已正确配置在HTML文件中
- 网站在不同浏览器中兼容性良好
- 所有外部资源都有适当的回退机制