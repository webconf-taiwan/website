import antfu from '@antfu/eslint-config'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default antfu(
  /* Configures for antfu's config */
  {
    vue: {
      overrides: {
        'vue/no-unused-vars': 'warn',
        'vue/max-attributes-per-line': 'error',
        'vue/html-self-closing': ['error', {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        }],
        'vue/no-empty-component-block': 'error',
      },
    },
    typescript: true,
    ignores: [
      'scripts/**',
      'node_modules/',
      'dist/',
      '.output/',
      '.nuxt/',
      '.storybook/',
      '.github/',
      'README.md',
      'package.json',
      'package-lock.json',
      '**/*.css',
      '**/*.scss',
      '**/*.sass',
      '**/*.less',
      '**/*.stylus',
    ],
  },
  /* From the second arguments they are ESLint Flat Configs */
  {
    rules: {
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
      'node/prefer-global/process': 'off',
    },
  },
  {
    files: ['**/*.config.{js,ts,mjs,cjs}', '**/nuxt.config.{js,ts}'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.vue', '**/pages/**/*.{js,ts,vue}', '**/composables/**/*.{js,ts}', '**/plugins/**/*.{js,ts}'],
    rules: {
      'no-undef': 'off',
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
            'main-body',
            'pic',
            'txt',
            'info',
            'main-footer',
            'gradient-dots-card',
            'floating-tag',
            'hero-section',
            'cta-section',
            'float-blocks',
            'banner-float-block',
            'blue-overlay',
            'mobile-menu',
            'content-container',
            'dot',
            'horizontal-line',
            'banner-section',
            'sponsors-title-section',
            'sponsors-content',
            'sponsors-img-filter',
            'speaker-detail-header',
            'flex-center',
            'tag-filter-title',
            'tag-filter-menu',
            'custom-ul-style',
            'organizer-description-paragraph',
            'venue-bg',
            'venue-content',
            'venue-map',
          ], // 允許自定義的 CSS 類名
        },
      ],
      'tw/no-contradicting-classname': 'error',
    },
  },
)
