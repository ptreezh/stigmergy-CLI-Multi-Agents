module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'space-before-blocks': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'padded-blocks': ['error', 'never'],
    'no-mixed-spaces-and-tabs': 'error',
    'no-useless-escape': 'off',
    'max-len': ['error', { 'code': 120, 'ignoreUrls': true }]
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/setup.js'],
      rules: {
        'no-unused-vars': 'off',
        'max-len': 'off'
      }
    }
  ]
};