/**
 * ImageMessageHandler - 图片消息处理器
 * 处理微信图片消息，支持图片内容识别和OCR
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ImageMessageHandler {
  constructor(options = {}) {
    this.textHandler = options.textHandler;
    this.downloadDir = options.downloadDir || path.join(require('os').tmpdir(), 'wechat-images');

    // 创建下载目录
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }

    // 图片分析服务
    this.imageAnalyzer = options.imageAnalyzer || null;

    // OCR服务
    this.ocrService = options.ocrService || null;

    this.options = options;
  }

  /**
   * 处理图片消息
   */
  async handle(message) {
    try {
      console.log('Processing image message:', message.image);

      // 1. 下载图片
      const imageData = await this.downloadImage(message.image);

      // 2. 分析图片内容
      const analysis = await this.analyzeImage(imageData);

      console.log('Image analysis result:', analysis);

      // 3. 构建增强消息
      const enhancedMessage = {
        ...message,
        content: analysis.text || '',
        imageDescription: analysis.description,
        visualContext: analysis.context,
        ocrText: analysis.ocrText,
        originalFormat: 'image',
        imageData: imageData
      };

      // 4. 转发给文本处理器
      if (this.textHandler) {
        return this.textHandler.handle(enhancedMessage);
      }

      return {
        success: true,
        type: 'image',
        content: analysis.description || '已收到图片',
        data: analysis
      };

    } catch (error) {
      console.error('Image message handling error:', error);
      return this.sendImageFallbackMessage(message, error);
    }
  }

  /**
   * 下载图片
   */
  async downloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const url = new URL(imageUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET'
      };

      https.get(options, (res) => {
        let data = [];

        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(data);

          // 检查是否需要AES-128-ECB解密
          if (imageUrl.includes('cdn')) {
            try {
              const decrypted = this.decryptAES128ECB(buffer);
              resolve(decrypted);
            } catch (error) {
              // 如果解密失败，返回原始数据
              console.warn('AES decryption failed, using raw data');
              resolve(buffer);
            }
          } else {
            resolve(buffer);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * AES-128-ECB解密
   */
  decryptAES128ECB(buffer) {
    try {
      // 微信CDN文件使用AES-128-ECB加密
      const key = this.options.aesKey || Buffer.from('0123456789abcdef', 'utf8');
      const decipher = crypto.createDecipheriv('aes-128-ecb', key, '');

      let decrypted = decipher.update(buffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;
    } catch (error) {
      console.error('AES decryption error:', error);
      throw error;
    }
  }

  /**
   * 分析图片内容
   */
  async analyzeImage(imageData) {
    const analysis = {
      text: '',
      description: '',
      context: {},
      ocrText: ''
    };

    // 1. OCR文字提取
    if (this.ocrService) {
      try {
        analysis.ocrText = await this.extractText(imageData);
        analysis.text = analysis.ocrText;
      } catch (error) {
        console.error('OCR extraction error:', error);
      }
    }

    // 2. 图片内容识别
    if (this.imageAnalyzer) {
      try {
        const recognition = await this.recognizeContent(imageData);
        analysis.description = recognition.description;
        analysis.context = recognition.context;
      } catch (error) {
        console.error('Image recognition error:', error);
      }
    }

    // 如果没有可用的分析服务，返回基本描述
    if (!analysis.description && !analysis.ocrText) {
      analysis.description = '已收到图片，但未配置图片分析服务';
    }

    return analysis;
  }

  /**
   * OCR文字提取
   */
  async extractText(imageData) {
    if (!this.ocrService) {
      throw new Error('OCR service not configured');
    }

    try {
      const text = await this.ocrService.extract(imageData);
      return text;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw error;
    }
  }

  /**
   * 图片内容识别
   */
  async recognizeContent(imageData) {
    if (!this.imageAnalyzer) {
      throw new Error('Image analyzer not configured');
    }

    try {
      const result = await this.imageAnalyzer.analyze(imageData);
      return result;
    } catch (error) {
      console.error('Image recognition error:', error);
      throw error;
    }
  }

  /**
   * 发送图片处理失败的回退消息
   */
  sendImageFallbackMessage(message, error = null) {
    const errorMessage = error ? error.message : '图片处理失败';

    return {
      success: false,
      type: 'error',
      content: `抱歉，无法处理图片内容。${errorMessage}\n\n请尝试以下方式：\n1. 重新发送图片\n2. 使用文字描述\n3. 确保图片清晰`,
      error: errorMessage,
      originalFormat: 'image'
    };
  }

  /**
   * 设置图片分析服务
   */
  setImageAnalyzer(analyzer) {
    this.imageAnalyzer = analyzer;
  }

  /**
   * 设置OCR服务
   */
  setOCRService(ocrService) {
    this.ocrService = ocrService;
  }

  /**
   * 检查是否配置了图片处理
   */
  isImageEnabled() {
    return this.imageAnalyzer !== null || this.ocrService !== null;
  }
}

module.exports = ImageMessageHandler;
