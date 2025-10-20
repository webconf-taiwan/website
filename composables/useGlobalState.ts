export function useGlobalState() {
  // 是否已經開賣
  const isSaleOpen = useState<boolean>('isSaleOpen', () => false)
  // 是否已經完成初次加載動畫
  const isFirstLoad = useState<boolean>('isFirstLoad', () => false)
  // 未完成公開的功能
  const isPublishFeature = useState<boolean>('isPublishFeature', () => false)

  return {
    isSaleOpen: readonly(isSaleOpen),
    isFirstLoad: readonly(isFirstLoad),
    isPublishFeature: readonly(isPublishFeature),
    setFirstLoad: (value: boolean) => (isFirstLoad.value = value),
  }
}
