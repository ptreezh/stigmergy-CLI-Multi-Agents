/**
 * DecisionBoundary — DECI Layer 1: Hard-rule boundary checker.
 *
 * Loads boundaries.json at construction, caches validated rules.
 * Schema validation at init throws clear error on invalid config (DECI-03c).
 * check() is deterministic: same (action, category) -> same result.
 *
 * Layer 1 decisions:
 *   BLOCK     — destructive ops (matched by rule with action: "BLOCK")
 *   AUTONOMOUS — read-only ops (matched by rule with action: "AUTONOMOUS")
 *   PASS      — non-destructive ops (matched by LAYER2 rule, or no rule match)
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_BOUNDARIES_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'boundaries',
  'boundaries.json'
);

class DecisionBoundary {
  /**
   * @param {Object} opts
   * @param {string} opts.boundariesPath — path to boundaries.json
   * @param {string} opts.projectRoot — project root for relative paths (default: cwd)
   */
  constructor(opts = {}) {
    this.projectRoot = opts.projectRoot || process.cwd();
    const boundariesPath = opts.boundariesPath || DEFAULT_BOUNDARIES_PATH;

    // Resolve path: absolute or relative to projectRoot
    this._boundariesPath = path.isAbsolute(boundariesPath)
      ? boundariesPath
      : path.join(this.projectRoot, boundariesPath);

    // Load + validate schema at construction (DECI-03c)
    this._rules = this._loadAndValidate();

    // Cache compiled regex rules
    this._compiledRules = this._rules
      .filter(r => r.is_regex)
      .map(r => ({ id: r.id, re: new RegExp(r.pattern, 'i'), action: r.action, reason: r.reason, category: r.operation_category }));
  }

  /**
   * Layer 1 boundary check.
   * @param {DecisionContext} context
   * @returns {{ decision: 'PASS'|'BLOCK'|'AUTONOMOUS', reason: string, matchedRule: Object|null }}
   */
  check(context) {
    const action = context.action || '';
    const category = context.operationCategory || 'unknown';

    // 1. Exact category match: destructive always BLOCK, always_safe always AUTONOMOUS
    if (category === 'destructive') {
      return { decision: 'BLOCK', reason: 'Destructive operation category', matchedRule: null };
    }
    if (category === 'always_safe') {
      return { decision: 'AUTONOMOUS', reason: 'Always-safe operation category', matchedRule: null };
    }

    // 2. Regex rule match (checked before string contains)
    for (const rule of this._compiledRules) {
      if (rule.re.test(action)) {
        if (rule.action === 'BLOCK') {
          return { decision: 'BLOCK', reason: rule.reason, matchedRule: rule.id };
        }
        if (rule.action === 'AUTONOMOUS') {
          return { decision: 'AUTONOMOUS', reason: rule.reason, matchedRule: rule.id };
        }
        // LAYER2 rule matched by regex -> PASS
        return { decision: 'PASS', reason: rule.reason, matchedRule: rule.id };
      }
    }

    // 3. String contains match for non-regex BLOCK/AUTONOMOUS rules
    for (const rule of this._rules) {
      if (rule.is_regex) continue; // skip already-checked regex rules
      if (action.includes(rule.pattern)) {
        if (rule.action === 'BLOCK') {
          return { decision: 'BLOCK', reason: rule.reason, matchedRule: rule.id };
        }
        if (rule.action === 'AUTONOMOUS') {
          return { decision: 'AUTONOMOUS', reason: rule.reason, matchedRule: rule.id };
        }
        // LAYER2 or no-match -> PASS (route to Layer 2)
        return { decision: 'PASS', reason: rule.reason, matchedRule: rule.id };
      }
    }

    // 4. No match — default to PASS (route to Layer 2 for scoring)
    return { decision: 'PASS', reason: 'No boundary rule matched — routing to Layer 2', matchedRule: null };
  }

  /** Get validated rules (for SoulDecisionEngine to access threshold). */
  get defaultThreshold() {
    return this._defaultThreshold;
  }

  // --- private ---

  _loadAndValidate() {
    if (!fs.existsSync(this._boundariesPath)) {
      throw new Error(
        `[DecisionBoundary] boundaries.json not found at: ${this._boundariesPath}\n` +
        'Please create .stigmergy/soul-state/boundaries/boundaries.json'
      );
    }

    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(this._boundariesPath, 'utf8'));
    } catch (e) {
      throw new Error(
        `[DecisionBoundary] boundaries.json parse error: ${e.message}\n` +
        `File: ${this._boundariesPath}`
      );
    }

    // Schema validation (DECI-03c)
    const schemaErrors = [];
    if (typeof raw.version !== 'string') schemaErrors.push('missing or invalid "version" (string required)');
    if (typeof raw.default_threshold !== 'number') schemaErrors.push('missing or invalid "default_threshold" (number required)');
    if (!Array.isArray(raw.rules)) schemaErrors.push('missing or invalid "rules" (array required)');
    if (!raw.operation_categories || typeof raw.operation_categories !== 'object') {
      schemaErrors.push('missing or invalid "operation_categories" (object required)');
    }

    if (schemaErrors.length > 0) {
      throw new Error(
        `[DecisionBoundary] boundaries.json schema validation failed:\n` +
        schemaErrors.map(e => `  - ${e}`).join('\n') + '\n' +
        `File: ${this._boundariesPath}`
      );
    }

    // Validate each rule
    for (let i = 0; i < raw.rules.length; i++) {
      const rule = raw.rules[i];
      if (!rule.id) schemaErrors.push(`rule[${i}]: missing "id"`);
      if (!rule.pattern) schemaErrors.push(`rule[${i}]: missing "pattern"`);
      if (!rule.action) schemaErrors.push(`rule[${i}]: missing "action"`);
      if (!['BLOCK', 'LAYER2', 'AUTONOMOUS'].includes(rule.action)) {
        schemaErrors.push(`rule[${i}]: invalid action "${rule.action}" (must be BLOCK|LAYER2|AUTONOMOUS)`);
      }
    }

    if (schemaErrors.length > 0) {
      throw new Error(
        `[DecisionBoundary] boundaries.json schema validation failed:\n` +
        schemaErrors.map(e => `  - ${e}`).join('\n') + '\n' +
        `File: ${this._boundariesPath}`
      );
    }

    this._defaultThreshold = raw.default_threshold;
    return raw.rules;
  }
}

module.exports = DecisionBoundary;
