import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRouteWatcher() {
  const route = useRoute()
  const router = useRouter()
  const currentRoute = ref(route.path)
  const previousRoute = ref('')
  const nextRoute = ref('')

  watchEffect(() => {
    currentRoute.value = route.path
  })

  router.beforeEach((to, from) => {
    previousRoute.value = from.path
    nextRoute.value = to.path
  })

  return { currentRoute, previousRoute, nextRoute }
}
