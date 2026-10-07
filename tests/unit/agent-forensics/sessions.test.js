const {
  decodeProjectDirName,
  fileUriToPath,
  currentTaskFromJsonl,
} = require("../../../src/agent-forensics/sessions");

describe("decodeProjectDirName", () => {
  test("decodes drive-relative encoded dirs", () => {
    expect(decodeProjectDirName("D-stigmergy-CLI-Multi-Agents")).toBe(
      "D:\\stigmergy\\CLI\\Multi\\Agents"
    );
  });

  test("returns null on invalid input", () => {
    expect(decodeProjectDirName("plain")).toBeNull();
    expect(decodeProjectDirName("-stigmergy")).toBeNull();
  });
});

describe("fileUriToPath", () => {
  test("converts file URI to windows path", () => {
    expect(fileUriToPath("file:///D:/foo/bar")).toBe("D:\\foo\\bar");
  });

  test("handles encoded characters", () => {
    expect(fileUriToPath("file:///C:/Users/Zhang/AppData/Roaming")).toBe(
      "C:\\Users\\Zhang\\AppData\\Roaming"
    );
  });

  test("returns null on invalid uri", () => {
    expect(fileUriToPath("not-a-uri")).toBeNull();
  });
});

describe("currentTaskFromJsonl", () => {
  test("extracts last user message", () => {
    const records = [
      { type: "user", message: { content: "Hello world" } },
      { type: "assistant", message: { content: "Hi there" } },
    ];
    const result = currentTaskFromJsonlFromRecords(records);
    expect(result.text).toBe("Hello world");
  });

  test("skips system-injected skill messages", () => {
    const records = [
      { type: "user", message: { content: "Base directory for this skill: /foo" } },
      { type: "user", message: { content: "<command-name>skill</command-name>" } },
      { type: "user", message: { content: "[Request interrupted]" } },
      { type: "user", message: { content: "Real task text" } },
    ];
    const result = currentTaskFromJsonlFromRecords(records);
    expect(result.text).toBe("Real task text");
  });

  test("returns null when no valid user message", () => {
    const records = [
      { type: "assistant", message: { content: "Only assistant" } },
    ];
    const result = currentTaskFromJsonlFromRecords(records);
    expect(result).toBeNull();
  });
});

function currentTaskFromJsonlFromRecords(records) {
  const recs = records.filter((r) => {
    const t = r.type || (r.message && r.message.type);
    return t === "user" || t === "human";
  });
  for (let i = recs.length - 1; i >= 0; i--) {
    const r = records[i];
    const msg = r.message || r;
    let raw = msg.content;
    if (Array.isArray(raw)) {
      raw = raw.map((c) => (typeof c === "string" ? c : c?.text || "")).join("\n");
    }
    if (!raw) continue;
    const text = String(raw).replace(/\s+/g, " ").trim();
    if (text.startsWith("<") || text.startsWith("[Request interrupted")) continue;
    if (/^Base directory for this skill:/i.test(text)) continue;
    if (/^<command-name>/i.test(text)) continue;
    if (text.length < 3) continue;
    return { text: text.slice(0, 220), truncated: text.length > 220 };
  }
  return null;
}
