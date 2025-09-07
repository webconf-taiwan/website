import CursorDot from '../share/CursorDot.vue'

export default {
  title: 'Components/CursorDot',
  component: CursorDot,
  argTypes: {
    speed: {
      control: { type: 'range', min: 0.01, max: 0.3, step: 0.01 },
    },
  },
}

export const Playground = {
  args: {
    speed: 0.045,
  },
  render: (args: any) => ({
    components: { CursorDot },
    setup() {
      return { args }
    },
    template: `
      <div class="relative h-screen w-full bg-blue-600 cursor-none">
        <CursorDot :speed="args.speed" />
        <div class="flex h-full items-center justify-center text-white text-2xl">
          Move your mouse!
        </div>
      </div>
    `,
  }),
}
