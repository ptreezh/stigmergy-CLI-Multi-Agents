#!/usr/bin/env node
// 桌面型智能体下载链接核查 + 版本基线维护脚本
// 用法：
//   node scripts/check-desktop-versions.js          # 核查全部桌面工具（链接可达性 + 本机安装 + 版本基线）
//   node scripts/check-desktop-versions.js --set <id> <version>   # 手动更新某工具 lastKnownVersion
//   node scripts/check-desktop-versions.js --json    # 输出 JSON（供 CI/自动化消费）
// 退出码：0 = 全部链接可达；1 = 存在链接失效或用法错误
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { DESKTOP_TOOLS, isDesktopInstalled } = require('../src/core/desktop-tools.js');

const BASELINE_PATH = path.join(__dirname, '..', 'docs', 'desktop-tools', 'versions.json');
const REQUEST_TIMEOUT_MS = 10000;
const EXAMINE_URLS = { win32: ['microsoftStore', 'official'], darwin: ['official'] };

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    return { schemaVersion: 1, updatedAt: null, tools: {} };
  }
  const raw = fs.readFileSync(BASELINE_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveBaseline(baseline) {
  baseline.updatedAt = new Date().toISOString().slice(0, 10);
  const dir = path.dirname(BASELINE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
}

async function checkUrl(url) {
  try {
    const res = await axios.head(url, { timeout: REQUEST_TIMEOUT_MS, maxRedirects: 5 });
    return { ok: res.status >= 200 && res.status < 400, status: res.status };
  } catch (error) {
    if (error.response && [405, 403, 429].includes(error.response.status)) {
      // HEAD 被拒（部分站点/CDN），降级 GET
      try {
        const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS, maxRedirects: 5 });
        return { ok: res.status >= 200 && res.status < 400, status: res.status, via: 'GET' };
      } catch (getError) {
        const status = getError.response ? getError.response.status : null;
        return { ok: false, status, error: getError.message };
      }
    }
    const status = error.response ? error.response.status : null;
    return { ok: false, status, error: error.code || error.message };
  }
}

/**
 * 核查单个工具：返回该工具所有待检 URL 的可达性结果
 * @param {string} toolName - 工具标识
 * @returns {Promise<{id: string, name: string, local: boolean, urls: Array<{key: string, url: string, ok: boolean, status: number|null, via?: string, error?: string}>}>}
 */
async function checkTool(toolName) {
  const tool = DESKTOP_TOOLS[toolName];
  const urls = [];
  const seen = new Set();
  const pushUrl = (key, url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push({ key, url, ok: false, status: null });
  };
  if (tool.downloadUrls) {
    for (const key of EXAMINE_URLS.win32) {
      pushUrl(key, tool.downloadUrls[key]);
    }
    if (process.platform === 'darwin') {
      for (const key of EXAMINE_URLS.darwin) {
        pushUrl(key, tool.downloadUrls[key]);
      }
    }
  }
  if (tool.installUrl) {
    pushUrl('installUrl', tool.installUrl);
  }
  if (tool.versionCheck && tool.versionCheck.url) {
    pushUrl('versionCheck', tool.versionCheck.url);
  }
  await Promise.all(
    urls.map(async (entry) => {
      const result = await checkUrl(entry.url);
      entry.ok = result.ok;
      entry.status = result.status;
      if (result.via) entry.via = result.via;
      if (result.error) entry.error = result.error;
    }),
  );
  return {
    id: toolName,
    name: tool.name,
    local: isDesktopInstalled(toolName),
    urls,
  };
}

async function runCheck() {
  const baseline = loadBaseline();
  const results = [];
  for (const toolName of Object.keys(DESKTOP_TOOLS)) {
    results.push(await checkTool(toolName));
  }
  return { baseline, results };
}

async function setVersion(id, version) {
  if (!DESKTOP_TOOLS[id]) {
    console.error(`[check-desktop-versions] 未知工具: ${id}`);
    process.exit(1);
  }
  const baseline = loadBaseline();
  if (!baseline.tools[id]) baseline.tools[id] = {};
  baseline.tools[id].lastKnownVersion = version;
  baseline.tools[id].setAt = new Date().toISOString();
  saveBaseline(baseline);
  console.log(`[check-desktop-versions] ${id} lastKnownVersion -> ${version}`);
}

function renderTable(results, baseline) {
  const lines = [];
  lines.push('桌面型智能体下载链接核查');
  lines.push('='.repeat(88));
  lines.push(
    ['工具'.padEnd(12), '本机'.padEnd(6), '链接数'.padEnd(6), '基线版本'.padEnd(16), '核查结果'].join(' '),
  );
  for (const r of results) {
    const toolBaseline = baseline.tools[r.id] || {};
    const failCount = r.urls.filter((u) => !u.ok).length;
    const version = toolBaseline.lastKnownVersion || '(未记录)';
    const verdict = failCount === 0 ? 'OK' : `LINK_FAIL x${failCount}`;
    lines.push(
      [r.id.padEnd(12), (r.local ? '✓ 已装' : '✗ 未装').padEnd(6), String(r.urls.length).padEnd(6), String(version).padEnd(16), verdict].join(' '),
    );
  }
  lines.push('='.repeat(88));
  lines.push(`基线文件: ${BASELINE_PATH}`);
  lines.push(`基线更新: ${baseline.updatedAt || '(未设置)'}`);
  return lines.join('\n');
}

function renderJson(results, baseline) {
  const payload = {
    checkedAt: new Date().toISOString(),
    baselineUpdatedAt: baseline.updatedAt || null,
    tools: {},
  };
  for (const r of results) {
    payload.tools[r.id] = {
      name: r.name,
      local: r.local,
      linkOk: r.urls.every((u) => u.ok),
      urls: r.urls.map((u) => ({ key: u.key, url: u.url, ok: u.ok, status: u.status })),
      lastKnownVersion: (baseline.tools[r.id] || {}).lastKnownVersion || null,
    };
  }
  return JSON.stringify(payload, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--set') {
    const id = args[1];
    const version = args[2];
    if (!id || !version) {
      console.error('用法: node scripts/check-desktop-versions.js --set <id> <version>');
      process.exit(1);
    }
    await setVersion(id, version);
    return;
  }
  const { baseline, results } = await runCheck();
  const output = args.includes('--json') ? renderJson(results, baseline) : renderTable(results, baseline);
  console.log(output);
  const anyFail = results.some((r) => r.urls.some((u) => !u.ok));
  process.exit(anyFail ? 1 : 0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`[check-desktop-versions] 执行失败: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { checkTool, runCheck, renderTable, renderJson, checkUrl };