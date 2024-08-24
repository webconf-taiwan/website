import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  /* onfigures for antfu's config */
  {
    vue: {
      overrides: {
        'vue/no-unused-vars': 'warn',
        'vue/max-attributes-per-line': 'error',
        'vue/html-self-closing': ['error', {
          html: {
            void: 'never',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        }],
      },
    },
    javascript: {
      overrides: {
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
        'unused-imports/no-unused-imports': 'warn',
        'no-unused-vars': 'warn',
      },
    },
    ignores: [
      'node_modules/',
      'dist/',
      '.output/',
      '.nuxt/',
      '.storybook/',
      'storybook-static',
      '.github/',
      '.gitlab/',
      'coverage',
      '*.log',
      'nuxt.d.ts',
      '.DS_Store',
      '.vscode/',
      '*.md',
      'netlify.toml',
      'README.md',
      'package.json',
      'package-lock.json',
      'babel.config.js',
      '*.toml',
      'graphql',
      'types.ts',
      'generated',
      'components.d.ts',
      'icons.d.ts',
      'auto.d.ts',
      'src-tauri',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },
  /* From the second arguments they are ESLint Flat Configs */
  {
    rules: {
      'no-unused-vars': 'warn',
      'node/prefer-global/process': 'off',
    },
  },
  {
    plugins: {
      tw: tailwindcss,
    },
    rules: {
      /* Add custom rules */
      'tw/classnames-order': 'error',
      'tw/enforces-negative-arbitrary-values': 'error',
      'tw/enforces-shorthand': 'error',
      'tw/migration-from-tailwind-2': 'error',
      'tw/no-arbitrary-value': 'off',
      'tw/no-custom-classname': [
        'error',
        {
          whitelist: [
            'my\\-(.*)', // You can rewrite this regex
          ],
        },
      ],
      'tw/no-contradicting-classname': 'error',
    },
  },
)
