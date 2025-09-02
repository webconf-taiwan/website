import Tag from '../share/Tag.vue'

export default {
  title: 'Components/Tag',
  component: Tag,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['md', 'lg'],
    },
  },
}

export const Playground = {
  args: {
    size: 'md',
    default: 'CoC 行為準則',
  },
  render: args => ({
    components: { Tag },
    setup() {
      return { args }
    },
    template: `<div class="bg-black w-screen h-screen p-8">    
      <Tag :size="args.size">{{ args.default }}</Tag>
    </div>
    `,
  }),
}
