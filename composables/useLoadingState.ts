export function useLoadingState() {
  const hasShownAnimation = useState('hasShownAnimation', () => false)

  const setAnimationShown = () => {
    hasShownAnimation.value = true
  }

  return {
    hasShownAnimation,
    setAnimationShown,
  }
}
