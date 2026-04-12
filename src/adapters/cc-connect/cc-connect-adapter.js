#!/usr/bin/env node

/**
 * Stigmergy cc-connect 适配器
 * 
 * 将 Stigmergy 注册为 cc-connect 可调用的 AI 代理
 * 通过 shell 命令方式调用 stigmergy CLI
 * 
 * 架构: IM → cc-connect → Stigmergy (via shell) → 多 CLI 协作 → 结果返回
 */

const { spawn } = require('child_process');
const path = require('path');

class CCConnectAdapter {
  constructor(options = {}) {
    this.workDir = options.workDir || process.cwd();
    this.stigmergyCmd = options.stigmergyCmd || 'stigmergy';
    this.mode = options.mode || 'interactive'; // interactive | call
  }

  /**
   * 执行 Stigmergy 命令
   * @param {string} prompt - 用户消息
   * @param {Object} context - 上下文信息
   * @returns {Promise<string>} Stigmergy 输出
   */
  async execute(prompt, context = {}) {
    return new Promise((resolve, reject) => {
      const args = this.mode === 'interactive'
        ? ['call', prompt]
        : ['call', prompt];

      const child = spawn(this.stigmergyCmd, args, {
        cwd: this.workDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          CC_CONNECT_MODE: 'true',
          STIGMERGY_IM_SOURCE: context.platform || 'unknown'
        }
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Stigmergy exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // 发送 prompt 到 stdin
      child.stdin.write(prompt + '\n');
      child.stdin.end();
    });
  }

  /**
   * 流式执行 (支持实时输出)
   * @param {string} prompt - 用户消息
   * @param {Function} onChunk - 每次输出块的回调
   * @returns {Promise<void>}
   */
  async executeStream(prompt, onChunk) {
    return new Promise((resolve, reject) => {
      const args = ['call', prompt];

      const child = spawn(this.stigmergyCmd, args, {
        cwd: this.workDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          CC_CONNECT_MODE: 'true',
          CC_CONNECT_STREAM: 'true'
        }
      });

      child.stdout.on('data', (data) => {
        onChunk(data.toString());
      });

      child.stderr.on('data', (data) => {
        onChunk('[stderr] ' + data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Stigmergy exited with code ${code}`));
        }
      });

      child.on('error', reject);

      child.stdin.write(prompt + '\n');
      child.stdin.end();
    });
  }
}

module.exports = { CCConnectAdapter };
