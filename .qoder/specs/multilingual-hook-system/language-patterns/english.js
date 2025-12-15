// .qoder/specs/multilingual-hook-system/language-patterns/english.js

module.exports = [
  {
    name: 'use_tool_for_task',
    regex: /(?:use|call|ask)\s+(\w+)\s+(?:to|for)\s+(.+)$/i
  },
  {
    name: 'please_use_tool',
    regex: /(?:please\s+)?(?:use|call|ask)\s+(\w+)\s+(.+)$/i
  },
  {
    name: 'tool_please_help',
    regex: /(\w+)[,\s]+(?:please\s+)?(?:help\s+me\s+)?(.+)$/i
  }
];