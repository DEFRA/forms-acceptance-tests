import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import js from '@eslint/js'
import wdioPlugin from 'eslint-plugin-wdio'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  {
    ignores: [
      'playwright-report/**',
      'test-results/**',
      'docker/**',
      'allure-results/**',
      'allure-report/**'
    ]
  },
  ...compat.extends('eslint:recommended', 'standard', 'prettier'),
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
  }
]
