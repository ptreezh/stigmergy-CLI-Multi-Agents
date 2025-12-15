// .qoder/specs/multilingual-hook-system/language-patterns/chinese.js

module.exports = [
  {
    name: 'qingyong_tool_bangwo',
    regex: /请用(\w+)\s*帮我(.+)$/i
  },
  {
    name: 'diaoyong_tool_lai',
    regex: /调用(\w+)\s*来(.+)$/i
  },
  {
    name: 'yong_tool_bangwo',
    regex: /用(\w+)\s*帮我(.+)$/i
  },
  {
    name: 'tool_douhao',
    regex: /(\w+)，(.+)$/i
  },
  {
    name: 'rang_tool',
    regex: /让(\w+)\s*(.+)$/i
  }
];