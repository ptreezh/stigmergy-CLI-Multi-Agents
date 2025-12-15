// TiddlyWiki核心文件占位符
// 实际部署时需要从官方源复制完整的TiddlyWiki文件
// 下载地址: https://tiddlywiki.com/

/*!
TiddlyWiki 5.3.0 - The reusable non-linear personal web notebook
Copyright (c) 2004-2023, Jeremy Ruston and contributors
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// 这是一个占位符文件
// 实际使用时，请从 https://tiddlywiki.com/ 下载完整的 TiddlyWiki 单文件版本

console.log('TiddlyWiki核心文件需要从官方源获取');
console.log('请访问 https://tiddlywiki.com/ 下载完整版本');

// 简化的TiddlyWiki初始化代码
if (typeof window !== 'undefined') {
  window.$tw = window.$tw || {};
  
  // 基础工具函数
  $tw.utils = {
    // 创建Tiddler
    createTiddler: function(title, text, tags) {
      return {
        title: title,
        text: text || '',
        tags: tags || [],
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
    },
    
    // 渲染Tiddler
    renderTiddler: function(tiddler) {
      const div = document.createElement('div');
      div.className = 'tiddler';
      div.innerHTML = `
        <h2>${tiddler.title}</h2>
        <div class="content">${tiddler.text}</div>
        <div class="tags">${tiddler.tags.join(', ')}</div>
      `;
      return div;
    }
  };
  
  // TiddlyWiki核心类
  $tw.TiddlyWiki = function() {
    this.tiddlers = [];
    
    this.addTiddler = function(tiddler) {
      this.tiddlers.push(tiddler);
    };
    
    this.getTiddler = function(title) {
      return this.tiddlers.find(t => t.title === title);
    };
    
    this.removeTiddler = function(title) {
      this.tiddlers = this.tiddlers.filter(t => t.title !== title);
    };
    
    this.forEachTiddler = function(callback) {
      this.tiddlers.forEach(callback);
    };
  };
}

// Node.js环境支持
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TiddlyWiki: $tw.TiddlyWiki,
    utils: $tw.utils
  };
}