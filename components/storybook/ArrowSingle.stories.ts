export default {
  title: 'Components/ArrowSingle',
  argTypes: {
    animation: {
      control: { type: 'select' },
      options: ['animate-arrow-run', 'animate-arrow-run-storybook'],
    },
  },
}

export const Playground = {
  args: {
    animation: 'arrow-run-storybook',
  },
  render: (args: any) => ({
    setup() {
      return { args }
    },
    template: `<div class="relative h-screen w-full bg-black pt-10">
        <div class="w-full arrow-single h-[1px] bg-white" :class="'before:' + args.animation"></div>
      </div>
    `,
  }),
}
