export function useGlobalState() {
  // 是否已經開賣
  const isSaleOpen = useState<boolean>('isSaleOpen', () => false)

  return {
    isSaleOpen: readonly(isSaleOpen),
  }
}
