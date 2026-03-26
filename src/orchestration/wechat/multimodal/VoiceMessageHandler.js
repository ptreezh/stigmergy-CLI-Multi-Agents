/**
 * VoiceMessageHandler - 语音消息处理器
 * 处理微信语音消息，支持SILK解码和语音转文字
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class VoiceMessageHandler {
  constructor(options = {}) {
    this.textHandler = options.textHandler;
    this.downloadDir = options.downloadDir || path.join(require('os').tmpdir(), 'wechat-voices');

    // 创建下载目录
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }

    // SILK解码器（需要单独安装）
    this.silkDecoder = options.silkDecoder || null;

    // STT服务
    this.sttService = options.sttService || null;

    this.options = options;
  }

  /**
   * 处理语音消息
   */
  async handle(message) {
    try {
      console.log('Processing voice message:', message.voice);

      // 1. 下载语音文件
      const voiceData = await this.downloadVoice(message.voice);

      // 2. 解码SILK格式
      const pcmData = await this.decodeSILK(voiceData);

      // 3. 转换为文本
      const text = await this.speechToText(pcmData);

      if (!text || text.trim().length === 0) {
        return this.sendVoiceFallbackMessage(message);
      }

      console.log('Voice transcribed to text:', text);

      // 4. 转发给文本处理器
      const textMessage = {
        ...message,
        content: text,
        originalFormat: 'voice',
        voiceData: voiceData
      };

      if (this.textHandler) {
        return this.textHandler.handle(textMessage);
      }

      return {
        success: true,
        type: 'voice',
        content: text,
        originalFormat: 'voice'
      };

    } catch (error) {
      console.error('Voice message handling error:', error);
      return this.sendVoiceFallbackMessage(message, error);
    }
  }

  /**
   * 下载语音文件
   */
  async downloadVoice(voiceUrl) {
    return new Promise((resolve, reject) => {
      const url = new URL(voiceUrl);
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
          if (voiceUrl.includes('cdn')) {
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
      // 注意：这里需要正确的密钥，实际密钥需要从协议分析获取
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
   * 解码SILK格式
   */
  async decodeSILK(silkData) {
    if (!this.silkDecoder) {
      throw new Error('SILK decoder not configured');
    }

    try {
      // 使用SILK解码器
      const pcmData = await this.silkDecoder.decode(silkData);
      return pcmData;
    } catch (error) {
      console.error('SILK decoding error:', error);
      throw new Error('Failed to decode SILK audio');
    }
  }

  /**
   * 语音转文字
   */
  async speechToText(pcmData) {
    if (!this.sttService) {
      // Fallback: 使用简单的语音识别提示
      throw new Error('STT service not configured');
    }

    try {
      // 调用STT服务
      const text = await this.sttService.transcribe(pcmData);
      return text;
    } catch (error) {
      console.error('Speech to text error:', error);
      throw error;
    }
  }

  /**
   * 发送语音识别失败的回退消息
   */
  sendVoiceFallbackMessage(message, error = null) {
    const errorMessage = error ? error.message : '语音识别失败';

    return {
      success: false,
      type: 'error',
      content: `抱歉，无法识别语音内容。${errorMessage}\n\n请尝试以下方式：\n1. 重新发送语音消息\n2. 使用文字输入\n3. 确保语音清晰`,
      error: errorMessage,
      originalFormat: 'voice'
    };
  }

  /**
   * 设置SILK解码器
   */
  setSILKDecoder(decoder) {
    this.silkDecoder = decoder;
  }

  /**
   * 设置STT服务
   */
  setSTTService(sttService) {
    this.sttService = sttService;
  }

  /**
   * 检查是否配置了语音处理
   */
  isVoiceEnabled() {
    return this.silkDecoder !== null && this.sttService !== null;
  }
}

module.exports = VoiceMessageHandler;
