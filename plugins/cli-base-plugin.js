/**
 * Stigmergy CLI Base Plugin
 * 基础插件模板
 */

class StigmergyBasePlugin {
    constructor() {
        this.name = 'base-plugin';
        this.version = '1.0.0';
        this.enabled = true;
    }
    
    async initialize() {
        console.log('🚀 Stigmergy Base Plugin initialized');
    }
    
    async collaborate(context) {
        console.log('🤝 Collaborating with context:', context);
    }
    
    async cleanup() {
        console.log('🧹 Cleanup completed');
    }
}

module.exports = StigmergyBasePlugin;
