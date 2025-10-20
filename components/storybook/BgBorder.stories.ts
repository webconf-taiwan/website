import BgBorder from '../share/BgBorder.vue'

export default {
  title: 'Components/BgBorder',
  component: BgBorder,
  argTypes: {
    borderColor: {
      control: 'color',
    },
    dvdDotSpeed: {
      control: { type: 'range', min: 1, max: 10, step: 0.1 },
    },
    dvdDotColors: {
      control: { type: 'array' },
    },
  },
}

export const Playground = {
  args: {
    borderColor: '#E6E6E6',
    dvdDotSpeed: 4,
    dvdDotColors: ['#2F2ADB', '#919191', '#E6E6E6'],
    default: '網格 + DVD Dot 效果背景',
  },
  render: (args: any) => ({
    components: { BgBorder },
    setup() {
      return { args }
    },
    template: `<BgBorder v-bind="args">
        <h2 class="h-screen grid place-content-center text-white text-2xl">{{ args.default }}</h2>
    </BgBorder>
    `,
  }),
}
