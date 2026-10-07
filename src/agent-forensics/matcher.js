const path = require("path");
const { normalize } = require("./signatures");

function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[\s._\-()[\]{}'"`,/\\]+/)
    .filter(Boolean);
}

function nameMatches(sig, observed) {
  const nObs = normalize(observed);
  if (!nObs) return false;
  for (const alias of sig.aliases) {
    const nAlias = normalize(alias);
    if (!nAlias) continue;
    if (nObs === nAlias) return true;
    if (nAlias.length >= 4 && nObs.includes(nAlias)) return true;
    if (nObs.length >= 4 && nAlias.includes(nObs)) return true;
  }
  return false;
}

function exactMatch(sig, observed) {
  const nObs = normalize(observed);
  return sig.aliases.some((a) => normalize(a) === nObs);
}

function basenameMatch(sig, observed) {
  return exactMatch(sig, path.basename(String(observed || "")));
}

function inList(sig, list, field, { fuzzy = true } = {}) {
  for (const item of list || []) {
    if (fuzzy ? nameMatches(sig, item) : exactMatch(sig, item)) return item;
  }
  return null;
}

function processMatch(sig, procName) {
  const base = path.basename(String(procName || ""), path.extname(String(procName || "")));
  const nBase = normalize(base);
  for (const p of sig.processes || []) {
    const nP = normalize(p);
    if (nP === nBase) return true;
  }
  return false;
}

function npmMatch(sig, pkgName) {
  const n = normalize(pkgName);
  return (sig.npm || []).some((p) => normalize(p) === n);
}

function dirMatch(sig, dirName, kind) {
  const n = normalize(dirName);
  if (!n) return false;
  const list = kind === "roaming" ? sig.roamingDirs : kind === "local" ? sig.localDirs : kind === "home" ? sig.homeDirs : [];
  return list.some((d) => {
    const nd = normalize(d);
    return nd === n || (nd.length >= 5 && n.includes(nd));
  });
}

function buildMatcher(signatures) {
  const exactIndex = new Map();
  const fuzzyIndex = [];

  for (const sig of signatures) {
    for (const alias of sig.aliases) {
      const n = normalize(alias);
      if (n.length < 3) continue;
      if (!exactIndex.has(n)) exactIndex.set(n, []);
      exactIndex.get(n).push(sig);
    }
    fuzzyIndex.push(sig);
  }

  const sortByAliasLen = (a, b) => b.length - a.length;

  return {
    byExactName(observed) {
      const n = normalize(observed);
      const hit = exactIndex.get(n);
      return hit ? hit[0] : null;
    },
    byName(observed) {
      const direct = exactIndex.get(normalize(observed));
      if (direct) return direct[0];
      const candidates = [];
      for (const sig of fuzzyIndex) {
        if (nameMatches(sig, observed)) candidates.push(sig);
      }
      candidates.sort((a, b) => (b.aliases[0] || "").length - (a.aliases[0] || "").length);
      return candidates[0] || null;
    },
    byProcess(procName) {
      const base = normalize(path.basename(String(procName || ""), path.extname(String(procName || ""))));
      for (const sig of signatures) {
        if (processMatch(sig, base)) return sig;
      }
      return null;
    },
    byNpmPackage(pkgName) {
      for (const sig of signatures) {
        if (npmMatch(sig, pkgName)) return sig;
      }
      return null;
    },
    byDirName(dirName, kind) {
      const n = normalize(dirName);
      if (!n) return null;
      for (const sig of signatures) {
        if (dirMatch(sig, dirName, kind)) return sig;
      }
      return null;
    },
  };
}

module.exports = {
  tokens,
  normalize,
  nameMatches,
  exactMatch,
  basenameMatch,
  inList,
  processMatch,
  npmMatch,
  dirMatch,
  buildMatcher,
};