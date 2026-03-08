const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      quotes: ["off"],
      indent: ["off"],
      semi: ["error", "always"],
      "no-unused-vars": "off",
      "no-console": "off",
      "no-case-declarations": "off",
      "no-misleading-character-class": "off",
      "no-dupe-class-members": "off",
      "no-useless-catch": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-undef": "off",
    },
  },
];
