import ScrollToTopButton from '../share/ScrollToTopButton.vue'

export default {
  title: 'Components/ScrollToTopButton',
  component: ScrollToTopButton,
}

export const Playground = {
  args: {},
  render: (args: any) => ({
    components: { ScrollToTopButton },
    setup() {
      return { args }
    },
    template: `<div class="bg-black p-8 relative">
      <div class="h-screen">預設畫面</div>
      <ScrollToTopButton class="bottom-10 right-10 cursor-pointer" />
    </div>
    `,
  }),
}
