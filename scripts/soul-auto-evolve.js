#!/usr/bin/env node
/**
 * Soul Auto Evolve Script - 真正的自主进化
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const https = require("https");

const home = process.env.HOME || process.env.USERPROFILE || "";
const CLI_NAME = process.argv[2] || "claude";
const DIRECTION = process.argv[3] || "auto-detect";

class SoulAutoEvolve {
  constructor(cliName, direction) {
    this.cliName = cliName;
    this.direction = direction;
    this.skillsPath = path.join(home, ".stigmergy", "skills", cliName);
    this.knowledgePath = path.join(this.skillsPath, "knowledge");
    this.evolutionPath = path.join(this.skillsPath, "evolution");
    this.results = {
      knowledgeAdded: [],
      skillsCreated: [],
      insights: [],
      errors: [],
    };
  }

  async run() {
    console.log(`\n⚡ [SoulAutoEvolve] Starting for ${this.cliName}`);
    console.log(`   Direction: ${this.direction}\n`);

    try {
      const learnedDirection = await this._determineDirection();
      console.log(`   📍 Direction: ${learnedDirection}`);

      console.log(`\n🌐 Searching...`);
      const searchResults = await this._searchKnowledge(learnedDirection);
      console.log(`   Found: ${searchResults.length} sources`);

      if (searchResults.length > 0) {
        console.log(`\n📝 Analyzing with ${this.cliName}'s LLM...`);
        const analyzed = await this._analyzeWithLLM(searchResults);
        console.log(`   Analyzed: ${analyzed.length} items`);

        console.log(`\n💾 Saving knowledge...`);
        await this._saveKnowledge(analyzed);

        console.log(`\n🎯 Creating skills...`);
        await this._createSkills(analyzed);
      } else {
        console.log(`\n⚠️ No search results`);
      }

      console.log(`\n🔮 Self-reflection...`);
      await this._selfReflect();

      this._recordEvolution();

      console.log(`\n✅ Evolution complete!`);
      console.log(`   Knowledge: ${this.results.knowledgeAdded.length}`);
      console.log(`   Skills: ${this.results.skillsCreated.length}`);

      return this.results;
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  async _determineDirection() {
    if (this.direction !== "auto-detect") return this.direction;
    const prompt = "给出1个值得学习的技能方向，只返回英文单词";
    try {
      const result = await this._callCLI(prompt);
      return result.trim().split("\n")[0] || "general";
    } catch (e) {
      return "general";
    }
  }

  async _searchKnowledge(direction) {
    const queries = [`${direction} tutorial`, `${direction} best practices`];

    for (const query of queries) {
      try {
        console.log(`   Trying: ${query}`);
        const results = await this._searchBing(query);
        if (results.length > 0) return results;
      } catch (e) {
        console.log(`      Failed: ${e.message}`);
      }
    }
    return this._getFallbackSources(direction);
  }

  _searchBing(query) {
    return new Promise((resolve, reject) => {
      const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

      const req = https.get(
        url,
        {
          timeout: 10000,
          headers: { "User-Agent": "Mozilla/5.0" },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const results = [];
              const regex = /<a href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
              let match;
              const seen = new Set();

              while ((match = regex.exec(data)) && results.length < 10) {
                const url = match[1];
                const title = match[2].replace(/<[^>]+>/g, "").trim();

                if (
                  url &&
                  title &&
                  !url.includes("bing.com") &&
                  !seen.has(url) &&
                  title.length > 5
                ) {
                  seen.add(url);
                  results.push({ url, title, snippet: "" });
                }
              }
              resolve(results);
            } catch (e) {
              reject(e);
            }
          });
        },
      );

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("timeout"));
      });
    });
  }

  _getFallbackSources(direction) {
    const resources = {
      javascript: [
        { url: "https://developer.mozilla.org", title: "MDN Web Docs" },
        { url: "https://react.dev", title: "React Docs" },
      ],
      python: [{ url: "https://docs.python.org", title: "Python Docs" }],
      ai: [{ url: "https://pytorch.org", title: "PyTorch" }],
      security: [{ url: "https://owasp.org", title: "OWASP" }],
    };
    return resources[direction] || resources.javascript;
  }

  async _analyzeWithLLM(searchResults) {
    const analyzed = [];

    for (const result of searchResults.slice(0, 3)) {
      try {
        const prompt = `分析返回JSON: {"topic": "主题", "key_points": ["要点"]}\n\n${result.title}`;
        const analysis = await this._callCLI(prompt);

        try {
          const parsed = JSON.parse(analysis.match(/\{[\s\S]*\}/)?.[0] || "{}");
          analyzed.push({ ...result, analysis: parsed });
        } catch (e) {
          analyzed.push({
            ...result,
            analysis: { topic: "general", key_points: [] },
          });
        }
      } catch (e) {
        analyzed.push(result);
      }
    }

    return analyzed;
  }

  _callCLI(prompt) {
    return new Promise((resolve, reject) => {
      const proc = spawn("stigmergy", ["call", prompt], { timeout: 30000 });
      let output = "";
      proc.stdout.on("data", (data) => {
        output += data;
      });
      proc.stderr.on("data", (data) => {
        output += data;
      });
      proc.on("close", (code) => {
        if (code === 0) resolve(output);
        else reject(new Error(`CLI exited ${code}`));
      });
      proc.on("error", reject);
    });
  }

  async _saveKnowledge(analyzed) {
    fs.mkdirSync(this.knowledgePath, { recursive: true });

    for (const item of analyzed) {
      const filepath = path.join(this.knowledgePath, `${Date.now()}.json`);
      fs.writeFileSync(
        filepath,
        JSON.stringify(
          {
            source: item.url,
            title: item.title,
            analysis: item.analysis,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      this.results.knowledgeAdded.push(item);
    }
  }

  async _createSkills(analyzed) {
    const topics = {};
    for (const item of analyzed) {
      const topic = item.analysis?.topic || "general";
      if (!topics[topic]) topics[topic] = [];
      topics[topic].push(item);
    }

    for (const [topic, items] of Object.entries(topics)) {
      const skillDir = path.join(
        home,
        ".stigmergy",
        "skills",
        `evolved-${topic}`,
      );
      fs.mkdirSync(skillDir, { recursive: true });

      const content = `---
name: evolved-${topic}
description: Auto-evolved skill for ${topic}
---

# ${topic} Skill

## Sources
${items.map((i) => `- [${i.title}](${i.url})`).join("\n")}
`;

      fs.writeFileSync(path.join(skillDir, "SKILL.md"), content);
      this.results.skillsCreated.push(`evolved-${topic}`);
      console.log(`   Created: evolved-${topic}`);
    }
  }

  async _selfReflect() {
    const prompt = `反思: ${this.results.knowledgeAdded.length}条知识, ${this.results.skillsCreated.length}个技能. 返回JSON: {"success": "成功", "improve": "改进", "score": 85}`;
    try {
      const r = await this._callCLI(prompt);
      const parsed = JSON.parse(r.match(/\{[\s\S]*\}/)?.[0] || "{}");
      this.results.insights.push(parsed);
    } catch (e) {
      this.results.insights.push({
        success: "done",
        improve: "none",
        score: 80,
      });
    }
  }

  _recordEvolution() {
    fs.mkdirSync(this.evolutionPath, { recursive: true });
    const logFile = path.join(this.evolutionPath, "evolution-log.json");
    let logs = [];
    if (fs.existsSync(logFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
      } catch (e) {}
    }
    logs.push({
      timestamp: new Date().toISOString(),
      direction: this.direction,
      ...this.results,
    });
    fs.writeFileSync(logFile, JSON.stringify(logs.slice(-100), null, 2));
  }
}

if (require.main === module) {
  new SoulAutoEvolve(CLI_NAME, DIRECTION)
    .run()
    .then((r) => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = SoulAutoEvolve;
