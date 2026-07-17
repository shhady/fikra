import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

/**
 * Plain-JavaScript ESLint config (flat). No TypeScript anywhere in this project.
 *
 * Three environments live in this repo and they do NOT share globals:
 *   - main process / scripts : CommonJS + Node globals
 *   - preload                : CommonJS + Node + a sliver of browser
 *   - renderer               : browser globals only, no Node (contextIsolation)
 */
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'release/**', 'assets/**'],
  },

  js.configs.recommended,

  // Main process, services, models, utils, build scripts.
  {
    files: ['src/main/**/*.js', 'src/services/**/*.js', 'src/models/**/*.js', 'src/utils/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        fetch: 'readonly',
        crypto: 'readonly',
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-console': 'off',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // ESM build scripts (scripts/*.mjs). Same Node globals as the CommonJS ones,
  // but module syntax — which is why they need their own block: the CommonJS
  // block above only matches *.js.
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Preload bridge.
  {
    files: ['src/preload/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  // Renderer: browser only. Node globals are intentionally absent — if a rule
  // fires here for `require`, that is a real bug (contextIsolation is on).
  {
    files: ['src/renderer/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        fikranova: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  prettier,
];
