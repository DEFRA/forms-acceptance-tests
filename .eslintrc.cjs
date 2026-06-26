module.exports = {
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  globals: {
    before: true,
    after: true
  },
  ignorePatterns: ['playwright-report', 'test-results'],
  extends: [
    'standard',
    'prettier',
    'eslint:recommended',
    'plugin:wdio/recommended'
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ]
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  plugins: ['prettier', 'wdio'],

  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error'
  }
}
