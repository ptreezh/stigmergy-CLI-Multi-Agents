// .qoder/specs/multilingual-hook-system/language-patterns/korean.js

module.exports = [
  {
    name: 'tool_ro_jjakseonghae_jwo',
    regex: /(\w+)로\s*(.+)\s*작성해\s*줘/i
  },
  {
    name: 'tool_hwallang',
    regex: /(\w+)\s*호출해서\s*(.+)/i
  },
  {
    name: 'tool_euro_doen',
    regex: /(\w+)으로\s*(.+)/i
  }
];