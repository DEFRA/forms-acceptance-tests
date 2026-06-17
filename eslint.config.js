import neostandard from 'neostandard'
import importX from 'eslint-plugin-import-x'
import wdioPlugin from 'eslint-plugin-wdio'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'playwright-report/**',
      'test-results/**',
      'docker/**',
      'allure-results/**',
      'allure-report/**',
      '.prettierrc.js'
    ]
  },
  ...neostandard({ noStyle: true }),
  wdioPlugin.configs['flat/recommended'],
  {
    plugins: { 'import-x': importX },
    rules: {
      'import-x/export': 'error',
      'import-x/first': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-named-default': 'error',
      'import-x/no-webpack-loader-syntax': 'error'
    }
  },
  {
    plugins: { prettier: prettierPlugin },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.mocha,
        before: 'readonly',
        after: 'readonly'
      }
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'error'
    }
  },
  prettierConfig
]
