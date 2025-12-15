// .qoder/specs/multilingual-hook-system/language-patterns/japanese.js

module.exports = [
  {
    name: 'tool_wo_tsukatte',
    regex: /(\w+)を使って(.+)$/i
  },
  {
    name: 'tool_wo_yobidashite',
    regex: /(\w+)を呼び出して(.+)$/i
  },
  {
    name: 'tool_de_onegaishimasu',
    regex: /(\w+)で(.+)お願いします$/i
  }
];