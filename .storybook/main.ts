export default {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx|vue)'],
  addons: [],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {}
  },
  docs: {
    autodocs: 'tag',
  },
  // Storybook 自帶的文件執行環境（addon-docs、MDX、React renderer）壓縮後就超過 1000 kB，
  // 只放寬 Storybook 建置的門檻，不影響網站本身
  viteFinal: (config) => {
    config.build = { ...config.build, chunkSizeWarningLimit: 1500 }
    return config
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: false,
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
}