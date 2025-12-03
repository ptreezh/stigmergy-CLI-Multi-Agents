/**
 * Encoding Handler Plugin
 * 编码处理插件
 */

const os = require('os');
const fs = require('fs');

class EncodingHandler {
    constructor() {
        this.platform = os.platform();
        this.defaultEncoding = this.platform === 'win32' ? 'gbk' : 'utf8';
    }
    
    async safeWrite(filePath, content) {
        // Windows系统GBK编码处理
        if (this.platform === 'win32') {
            try {
                await fs.promises.writeFile(filePath, content, 'utf8');
                return true;
            } catch (error) {
                console.log('⚠️ UTF-8写入失败，尝试GBK编码');
                const iconv = require('iconv-lite');
                const gbkContent = iconv.encode(content, 'gbk');
                await fs.promises.writeFile(filePath, gbkContent);
                return true;
            }
        } else {
            await fs.promises.writeFile(filePath, content, 'utf8');
            return true;
        }
    }
    
    async safeRead(filePath) {
        if (this.platform === 'win32') {
            try {
                return await fs.promises.readFile(filePath, 'utf8');
            } catch (error) {
                const iconv = require('iconv-lite');
                const buffer = await fs.promises.readFile(filePath);
                return iconv.decode(buffer, 'gbk');
            }
        } else {
            return await fs.promises.readFile(filePath, 'utf8');
        }
    }
}

module.exports = EncodingHandler;
