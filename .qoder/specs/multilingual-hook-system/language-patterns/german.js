// .qoder/specs/multilingual-hook-system/language-patterns/german.js

module.exports = [
  {
    name: 'benutze_tool_um',
    regex: /benutze\s+(\w+)\s+um\s+(.+)$/i
  },
  {
    name: 'verwende_tool_fur',
    regex: /verwende\s+(\w+)\s+für\s+(.+)$/i
  },
  {
    name: 'rufe_tool_fur_an',
    regex: /rufe\s+(\w+)\s+für\s+(.+)\s+an$/i
  }
];