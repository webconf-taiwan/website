export const useCounterStore = defineStore('counter', () => {
  const count = ref<number>(0)

  function increment() {
    count.value += 1
  }

  function decrement() {
    count.value -= 1
  }

  return {
    count,
    increment,
    decrement,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
