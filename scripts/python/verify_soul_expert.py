# -*- coding: utf-8 -*-
"""Full verification for soul-expert CodeBuddy plugin asset pack.

Checks: plugin.json required fields + invariants, displayDescription.zh
CJK char count (official 40-50), defaultInitPrompt==quickPrompts[0],
avatar dims/size, structure tree presence, 4 soul skills frontmatter
cleanliness (no tags/requires/builtin) and relative link ../two-agent-loop.
Exits 1 on any failure.
"""
import json
import os
import re
import sys

ROOT = r"D:\stigmergy-CLI-Multi-Agents\docs\strategy\soul-expert"
OK = True


def check(name, cond, detail=""):
    global OK
    mark = "PASS" if cond else "FAIL"
    if not cond:
        OK = False
    print(f"[{mark}] {name} {detail}")


def cjk_count(s):
    return len(re.findall(r"[\u4e00-\u9fff]", s))


# 1. plugin.json
pj_path = os.path.join(ROOT, ".codebuddy-plugin", "plugin.json")
with open(pj_path, encoding="utf-8") as f:
    pj = json.load(f)

req_fields = ["name", "expertType", "version", "description", "author",
              "agents", "agentName", "displayName", "profession",
              "displayDescription", "avatar", "categoryId",
              "defaultInitPrompt", "plugin", "tags", "quickPrompts"]
for f in req_fields:
    check(f"plugin.json field: {f}", f in pj)
check("name lowercase-hyphen", bool(re.fullmatch(r"[a-z0-9-]+", pj.get("name", ""))))
check("name == plugin", pj.get("name") == pj.get("plugin"))
check("expertType == agent", pj.get("expertType") == "agent")
check("agentName matches agents[0]",
      pj.get("agentName", "") ==
      os.path.splitext(os.path.basename(pj.get("agents", [""])[0]))[0])
check("displayName en+zh", "en" in pj.get("displayName", {}) and "zh" in pj.get("displayName", {}))
check("profession en+zh", "en" in pj.get("profession", {}) and "zh" in pj.get("profession", {}))
check("displayDescription en+zh",
      "en" in pj.get("displayDescription", {}) and "zh" in pj.get("displayDescription", {}))

zh_desc = pj.get("displayDescription", {}).get("zh", "")
n = cjk_count(zh_desc)
check("displayDescription.zh CJK 40-50", 40 <= n <= 50, f"(counted {n})")

check("defaultInitPrompt == quickPrompts[0]",
      pj.get("defaultInitPrompt", {}).get("zh") == pj["quickPrompts"][0].get("zh") and
      pj.get("defaultInitPrompt", {}).get("en") == pj["quickPrompts"][0].get("en"))
check("quickPrompts x3 en+zh",
      len(pj.get("quickPrompts", [])) == 3 and
      all("en" in q and "zh" in q for q in pj.get("quickPrompts", [])))
check("tags en+zh x3",
      len(pj.get("tags", [])) == 3 and
      all("en" in t and "zh" in t for t in pj.get("tags", [])))
check("author name+email",
      isinstance(pj.get("author", {}).get("name"), str) and
      isinstance(pj.get("author", {}).get("email"), str) and
      "@" in pj["author"].get("email", ""))
check("categoryId set", isinstance(pj.get("categoryId"), str) and pj["categoryId"])

# 2. structure tree + referenced paths exist
refs = [
    os.path.join(ROOT, "agents", "soul-evolution-expert.md"),
    os.path.join(ROOT, "avatars", "expert.png"),
    os.path.join(ROOT, "README.md"),
]
for r in refs:
    check(f"exists: {os.path.relpath(r, ROOT)}", os.path.isfile(r))

skills = pj.get("skills", [])
check("skills declared", isinstance(skills, list) and len(skills) == 5, f"({len(skills)})")
for s in skills:
    rel = s.removeprefix("./")
    sp = os.path.join(ROOT, rel, "SKILL.md")
    check(f"skill exists: {rel}/SKILL.md", os.path.isfile(sp))

# 3. avatar dims/size
from PIL import Image
av = os.path.join(ROOT, "avatars", "expert.png")
im = Image.open(av)
kb = os.path.getsize(av) / 1024
check("avatar 512x512", im.size == (512, 512), f"({im.size})")
check("avatar <=500KB", kb <= 500, f"({kb:.1f}KB)")

# 4. skill frontmatter cleanliness
for name in ["soul-evolution", "soul-reflection", "soul-compete", "soul-co-evolve"]:
    p = os.path.join(ROOT, "skills", name, "SKILL.md")
    txt = open(p, encoding="utf-8").read()
    fm = txt.split("---")[1]
    for bad in ["tags:", "requires:", "builtin:"]:
        check(f"{name}: no '{bad}'", bad not in fm)
    for good in ["description_zh:", "description_en:", "display_name:",
                 "category:", "author:", "version:"]:
        check(f"{name}: has '{good}'", good in fm)
    # relative links point to sibling two-agent-loop (bare ./ must not appear)
    bad_bare = re.search(r"(?<!\.)\./two-agent-loop/SKILL\.md", txt)
    check(f"{name}: link ../two-agent-loop",
          "../two-agent-loop/SKILL.md" in txt and bad_bare is None, f"(bare ./ match: {bool(bad_bare)})")

print()
print("ALL PASS" if OK else "FAILURES PRESENT")
sys.exit(0 if OK else 1)