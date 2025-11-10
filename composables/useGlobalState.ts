export function useGlobalState() {
  // 是否已經開賣
  const isSaleOpen = useState<boolean>('isSaleOpen', () => false)
  // 是否已經完成初次加載動畫
  const isFirstLoad = useState<boolean>('isFirstLoad', () => true)
  // 是否已經打開選單
  const isMenuOpen = useState<boolean>('isMenuOpen', () => false)
  // 是否已經打開講者詳細資訊彈窗
  const isModalOpen = useState<boolean>('isModalOpen', () => false)

  return {
    isSaleOpen: readonly(isSaleOpen),
    isFirstLoad: readonly(isFirstLoad),
    isMenuOpen: readonly(isMenuOpen),
    isModalOpen: readonly(isModalOpen),
    setFirstLoad: (value: boolean) => (isFirstLoad.value = value),
    setToggleMenu: (value: boolean) => (isMenuOpen.value = value),
    setToggleModal: (value: boolean) => (isModalOpen.value = value),
  }
}
