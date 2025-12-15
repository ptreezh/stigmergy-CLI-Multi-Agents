// .qoder/specs/multilingual-hook-system/language-patterns/french.js

module.exports = [
  {
    name: 'utilise_tool_pour',
    regex: /utilise\s+(\w+)\s+pour\s+(.+)$/i
  },
  {
    name: 'emploie_tool_pour',
    regex: /emploie\s+(\w+)\s+pour\s+(.+)$/i
  },
  {
    name: 'appelle_tool_pour',
    regex: /appelle\s+(\w+)\s+pour\s+(.+)$/i
  }
];