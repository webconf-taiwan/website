import { onMounted, onUnmounted, ref } from 'vue'

export function useDateCountdown() {
  const deadlineDate = '2024-10-17 12:00:00'
  const remainingTime = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' })
  const isTimeUp = ref(false)
  let intervalId: NodeJS.Timeout

  function updateCountdown() {
    const now = new Date().getTime()
    const target = new Date(deadlineDate).getTime()
    const diff = target - now

    // 取得各時間整數
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      remainingTime.value = {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      }
      isTimeUp.value = false
    }
    else {
      remainingTime.value = { days: '00', hours: '00', minutes: '00', seconds: '00' }
      isTimeUp.value = true
    }
  }

  onMounted(() => {
    updateCountdown()
    intervalId = setInterval(updateCountdown, 1000)
  })

  onUnmounted(() => {
    clearInterval(intervalId)
  })

  return { remainingTime, isTimeUp }
}
