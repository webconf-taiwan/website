export default {
  title: 'Directives/ArrowDirective',
  argTypes: {
    speed1: {
      control: { type: 'text' },
    },
    speed2: {
      control: { type: 'text' },
    },
    color: {
      control: { type: 'color' },
    },
    direction: {
      control: { type: 'select' },
      options: [1, -1],
    },
    count: {
      control: { type: 'select' },
      options: [1, 2],
    },
    delay: {
      control: { type: 'text' },
    },
  },
}

export const Playground = {
  args: {
    speed1: '3s',
    speed2: '2s',
    color: 'white',
    direction: 1,
    count: 1,
    delay: '1s',
  },
  render: (args: any) => ({
    setup() {
      return { args }
    },
    template: `<div class="relative w-full bg-black pt-10 overflow-x-clip flex flex-col gap-10 p-10">
        <h1 class="text-center text-white font-bold bg-red-500 py-4">Tips：如果箭頭被蓋在下面多半是 overflow 導致出現新的堆疊上下文(用 overflow-clip 比較不會影響)</h1>
        <div>
          <p class="mb-6 text-white text-center text-xl">單一箭頭動畫(正向)</p>
          <div v-arrow="{ speed1: '10s', color: 'white' }" class="w-full h-[1px] bg-white" :class="'before:' + args.animation"></div>
        </div>

        <div>
          <p class="mb-6 text-white text-center text-xl">單一箭頭動畫(反向)</p>
          <div v-arrow="{ speed1: '10s', color: 'white', direction: -1 }" class="w-full h-[1px] bg-white" :class="'before:' + args.animation"></div>
        </div>

        <div>
          <p class="mb-6 text-white text-center text-xl">雙箭頭動畫</p>
          <div v-arrow="{ speed1: '10s', color: 'white', count: 2, delay: 0, speed2: '5s' }" class="w-full h-[1px] bg-white" :class="'before:' + args.animation"></div>
        </div>

        <div>
          <p class="mb-6 text-white text-center text-xl">箭頭動畫(可自定義調整)</p>
          <div v-arrow="{ speed1: args.speed1, color: args.color, direction: args.direction, count: args.count, delay: args.delay, speed2: args.speed2 }" class="w-full h-[1px] bg-white" :class="'before:' + args.animation"></div>
        </div>
      </div>
    `,
  }),
}
