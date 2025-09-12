import CursorDot from '../share/CursorDot.vue'

// Demo 組件
const CursorDemo = {
  components: { CursorDot },
  props: {
    scale: { type: Number, default: 0.4 },
    duration: { type: Number, default: 0.5 },
    backgroundColor: { type: String, default: 'white' },
    text: { type: String, default: null },
  },
  template: `
    <div class="h-screen w-full bg-red-400 cursor-none p-8">
      <CursorDot />
      <div class="grid grid-cols-4 gap-4">
        <!-- 無文字效果 -->
        <div
          v-cursor="{ scale: 0.4, duration: 0.5, backgroundColor: 'rgba(0, 46, 255, 0.9)' }"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg text-center"
        >
          Hover me (No Text)
        </div>
        
        <!-- 有文字效果 -->
        <div
          v-cursor="{ scale: 5, duration: 0.5, backgroundColor: 'rgba(0, 46, 255, 0.9)', text: 'FOLLOW' }"
          class="bg-green-500 text-white px-6 py-3 rounded-lg text-center"
        >
          Hover me (With Text)
        </div>

        <!-- 箭頭特化效果 -->
        <div
          v-cursor="{ scale: 5, duration: 0.5, backgroundColor: 'rgba(0, 46, 255, 0.9)', text: 'arrow-right' }"
          class="bg-purple-500 text-white px-6 py-3 rounded-lg text-center"
        >
          Hover me (With arrow)
        </div>

         <!-- 自由調整參數區域 -->
        <div
          v-cursor="{ scale: scale, duration: duration, backgroundColor: backgroundColor, text: text }"
          class="bg-yellow-500 text-white px-6 py-3 rounded-lg text-center"
        >
          Hover me (可根據參數改動)
        </div>
      </div>
    </div>
  `,
}

export default {
  title: 'Directives/CursorDirective',
  component: CursorDemo,
  argTypes: {
    scale: {
      control: { type: 'range', min: 1, max: 10, step: 0.5 },
    },
    duration: {
      control: { type: 'range', min: 0.1, max: 1, step: 0.1 },
    },
    backgroundColor: {
      control: { type: 'color' },
    },
    text: {
      control: { type: 'text' },
    },
  },
}

export const Playground = {
  args: {
    scale: 5,
    duration: 0.3,
    backgroundColor: '#ccc',
    text: 'Hover',
  },
}
