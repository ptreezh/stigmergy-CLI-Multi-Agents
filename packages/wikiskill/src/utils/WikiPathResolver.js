const fs = require('fs-extra');
const path = require('path');

/**
 * Wiki路径解析器
 */
class WikiPathResolver {
  /**
   * 查找Wiki路径
   * @param {string} startPath - 起始路径
   */
  static async findWikiPath(startPath = process.cwd()) {
    let currentPath = path.resolve(startPath);
    
    // 向上查找.wiki目录
    while (currentPath !== path.dirname(currentPath)) {
      const wikiPath = path.join(currentPath, '.wiki');
      
      if (await fs.pathExists(wikiPath)) {
        return wikiPath;
      }
      
      currentPath = path.dirname(currentPath);
    }
    
    return null;
  }

  /**
   * 查找所有Wiki路径
   * @param {string} searchPath - 搜索路径
   */
  static async findAllWikiPaths(searchPath = process.cwd()) {
    const wikiPaths = [];
    
    const searchDirectory = async (dir) => {
      try {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = await fs.stat(itemPath);
          
          if (stat.isDirectory()) {
            if (item === '.wiki') {
              wikiPaths.push(itemPath);
            } else if (!item.startsWith('.')) {
              await searchDirectory(itemPath);
            }
          }
        }
      } catch (error) {
        // 忽略权限错误等
      }
    };
    
    await searchDirectory(searchPath);
    return wikiPaths;
  }

  /**
   * 获取主题路径
   * @param {string} topicName - 主题名称
   * @param {string} wikiPath - Wiki路径
   */
  static getTopicPath(topicName, wikiPath = null) {
    if (!wikiPath) {
      wikiPath = this.findWikiPath();
    }
    
    if (!wikiPath) {
      throw new Error('Wiki未找到');
    }
    
    return path.join(wikiPath, 'topics', `${topicName}.html`);
  }

  /**
   * 获取配置路径
   * @param {string} configName - 配置名称
   * @param {string} wikiPath - Wiki路径
   */
  static getConfigPath(configName, wikiPath = null) {
    if (!wikiPath) {
      wikiPath = this.findWikiPath();
    }
    
    if (!wikiPath) {
      throw new Error('Wiki未找到');
    }
    
    return path.join(wikiPath, 'config', configName);
  }

  /**
   * 获取资源路径
   * @param {string} assetName - 资源名称
   * @param {string} wikiPath - Wiki路径
   */
  static getAssetPath(assetName, wikiPath = null) {
    if (!wikiPath) {
      wikiPath = this.findWikiPath();
    }
    
    if (!wikiPath) {
      throw new Error('Wiki未找到');
    }
    
    return path.join(wikiPath, 'assets', assetName);
  }

  /**
   * 验证Wiki结构
   * @param {string} wikiPath - Wiki路径
   */
  static async validateWikiStructure(wikiPath) {
    const requiredDirectories = [
      'topics',
      'config',
      'assets'
    ];
    
    const requiredFiles = [
      'config/wiki-config.json',
      'config/shared-config.json',
      'topics/README.html'
    ];
    
    const validation = {
      valid: true,
      missingDirectories: [],
      missingFiles: [],
      warnings: []
    };
    
    // 检查目录
    for (const dir of requiredDirectories) {
      const dirPath = path.join(wikiPath, dir);
      if (!await fs.pathExists(dirPath)) {
        validation.missingDirectories.push(dir);
        validation.valid = false;
      }
    }
    
    // 检查文件
    for (const file of requiredFiles) {
      const filePath = path.join(wikiPath, file);
      if (!await fs.pathExists(filePath)) {
        validation.missingFiles.push(file);
        validation.valid = false;
      }
    }
    
    // 检查TiddlyWiki核心文件
    const tiddlywikiPath = path.join(wikiPath, 'assets/tiddlywiki/tiddlywiki.js');
    if (!await fs.pathExists(tiddlywikiPath)) {
      validation.warnings.push('TiddlyWiki核心文件缺失，某些功能可能不可用');
    }
    
    return validation;
  }

  /**
   * 获取相对路径
   * @param {string} fromPath - 起始路径
   * @param {string} toPath - 目标路径
   */
  static getRelativePath(fromPath, toPath) {
    return path.relative(fromPath, toPath);
  }

  /**
   * 规范化路径
   * @param {string} filePath - 文件路径
   */
  static normalizePath(filePath) {
    return path.normalize(filePath).replace(/\\/g, '/');
  }
}

module.exports = WikiPathResolver;