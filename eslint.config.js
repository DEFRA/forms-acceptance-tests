import neostandard from 'neostandard'
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
