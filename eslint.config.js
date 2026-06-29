import neostandard from 'neostandard'
import importX from 'eslint-plugin-import-x'
import wdioPlugin from 'eslint-plugin-wdio'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
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
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: tsParser
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  },
  prettierConfig
]
