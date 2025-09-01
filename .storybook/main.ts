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