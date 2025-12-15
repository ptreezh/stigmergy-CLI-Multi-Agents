// .qoder/specs/multilingual-hook-system/language-patterns/russian.js

module.exports = [
  {
    name: 'ispolzuy_tool_chtoby',
    regex: /используй\s+(\w+)\s+чтобы\s+(.+)$/i
  },
  {
    name: 'primeni_tool_dlya',
    regex: /примени\s+(\w+)\s+для\s+(.+)$/i
  },
  {
    name: 'vysovyi_tool_dlya',
    regex: /вызови\s+(\w+)\s+для\s+(.+)$/i
  }
];