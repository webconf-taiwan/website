<script setup lang="ts">
const route = useRoute()
const userStore = useUserStore()

const name = route.params.id

watchEffect(() => {
  userStore.setNewName(route.params.id as string)
})

definePageMeta({
  layout: 'home',
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="mb-3 animate-[wiggle_1s_ease-in-out_infinite] text-yellow-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M6.07 9.8c-.2.2-.2.51 0 .71a3.003 3.003 0 0 1 .28 3.92c-.15.2-.12.47.05.65c.22.22.57.19.76-.05a4.02 4.02 0 0 0-.04-4.85l7.62-7.62c.49-.49 1.28-.49 1.77 0s.49 1.28 0 1.77l-5.13 5.13c-.2.2-.2.51 0 .71s.51.2.71 0l6.54-6.54c.49-.49 1.28-.49 1.77 0s.49 1.28 0 1.77l-6.54 6.54c-.2.2-.2.51 0 .71s.51.2.71 0l5.48-5.48c.49-.49 1.28-.49 1.77 0s.49 1.28 0 1.77l-6.19 6.19c-.2.2-.2.51 0 .71c.2.2.51.2.71 0l4.07-4.07a1.25 1.25 0 0 1 1.77 0c.49.49.49 1.28 0 1.77l-7.07 7.07c-3.22 3.22-8.45 3.22-11.67 0s-3.22-8.45 0-11.67l4.6-4.6a1.25 1.25 0 0 1 1.77 0c.49.49.49 1.28 0 1.77L6.07 9.8zm.93-8c0-.41-.34-.75-.75-.75c-.04 0-.07 0-.11.01c-2.63.38-4.7 2.46-5.08 5.08c0 .03-.01.07-.01.11c0 .41.34.75.75.75c.38 0 .69-.28.74-.64a4.497 4.497 0 0 1 3.81-3.81c.37-.06.65-.37.65-.75zm10 20.4c0 .41.34.75.75.75c.04 0 .07 0 .11-.01c2.63-.38 4.7-2.46 5.08-5.08c0-.03.01-.07.01-.11c0-.41-.34-.75-.75-.75c-.38 0-.69.28-.74.64a4.497 4.497 0 0 1-3.81 3.81c-.37.06-.65.37-.65.75z"
      /></svg>
    </div>

    <h3 class="text-2xl">
      Hi,
    </h3>

    <div class="mb-3">
      {{ name }}
    </div>

    <template v-if="userStore.otherNames.length">
      <div class="mb-4">
        <p class="mb-2">
          You have been called:
        </p>
        <ul class="flex max-w-xs flex-wrap place-content-center gap-x-2 gap-y-3">
          <li
            v-for="otherName in userStore.otherNames"
            :key="otherName"
          >
            <NuxtLink
              class="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
              :to="`/hi/${otherName}`"
              replace
            >
              {{ otherName }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>

    <Counter class="mb-4" />

    <NuxtLink
      class="my-btn"
      to="/"
    >
      Back
    </NuxtLink>
  </div>
</template>

<style scope></style>
