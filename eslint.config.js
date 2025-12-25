import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
  { ignores: ['dist', 'coverage'] },
  {
    files: ['src/js/**/*.js', 'src/js/**/*.ts', 'src/js/**/*.mjs', 'src/js/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        kintone: 'readonly',
        cybozu: 'readonly',
        gapi: 'readonly',
        google: 'readonly',
        process: 'readonly',
        DEV_GAS_URL: 'readonly',
        PROD_GAS_URL: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      jsdoc: jsdocPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsdocPlugin.configs.recommended.rules,

      // 基本的なルール
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-undef': 'warn',

      // 文字列引用符規約: JavaScript では single quote を強制
      quotes: ['error', 'single', { allowTemplateLiterals: true }],

      // JSDocコメント規約
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      'jsdoc/require-description': [
        'error',
        {
          exemptedBy: ['description'],
        },
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['date', 'note', 'updated'],
        },
      ],
      // 命名規則
      camelcase: ['error', { properties: 'always' }],

      // null/undefined チェック
      'no-eq-null': 'error',
      eqeqeq: ['error', 'always'],

      // try-catch規約
      'no-empty': ['error', { allowEmptyCatch: false }],
      'prefer-promise-reject-errors': 'error',
      // React/JSX規約
      'react/prop-types': 'warn',
      // コードの可読性
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      indent: ['error', 2],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // importに関するルール（必要に応じて追加）
      // 'import/no-unresolved': 'off',
    },
    settings: {
      react: {
        version: 'detect', // Reactバージョンを自動検出
      },
    },
  },
];
