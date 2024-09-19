const activeDrawer = ref<symbol | null>(null)

export function useDrawerState() {
  const instance = getCurrentInstance()
  const drawerSymbol = Symbol('drawer')

  const openDrawer = () => {
    activeDrawer.value = drawerSymbol
  }

  const closeDrawer = () => {
    if (activeDrawer.value === drawerSymbol) {
      activeDrawer.value = null
    }
  }

  const isDrawerActive = () => activeDrawer.value === drawerSymbol

  const cleanup = () => {
    if (activeDrawer.value === drawerSymbol) {
      activeDrawer.value = null
    }
  }

  if (instance) {
    onUnmounted(cleanup)
  }

  return {
    openDrawer,
    closeDrawer,
    isDrawerActive,
  }
}
