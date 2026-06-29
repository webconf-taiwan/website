import { defineStore } from 'pinia'

export const useAllStore = defineStore('all', () => {
  const nowPath = ref('')
  const windowWidth = ref(0)

  const pageLoading = ref(false)
  const fetchLoading = ref(false)

  const globalData = ref({})

  const count = ref(0)
  const increment = () => {
    count.value += 1
  }
  const decrement = () => {
    count.value -= 1
  }
  const doubleCount = computed(() => count.value * 2)

  return {
    nowPath,
    windowWidth,
    pageLoading,
    fetchLoading,
    globalData,
    count,
    increment,
    decrement,
    doubleCount
  }
})
