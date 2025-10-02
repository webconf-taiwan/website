export function useGlobalState() {
  // 是否已經開賣
  const isSaleOpen = useState<boolean>('isSaleOpen', () => false)
  // 是否已經完成初次加載動畫
  const isFirstLoad = useState<boolean>('isFirstLoad', () => true)

  return {
    isSaleOpen: readonly(isSaleOpen),
    isFirstLoad: readonly(isFirstLoad),
    setFirstLoad: (value: boolean) => (isFirstLoad.value = value),
  }
}
