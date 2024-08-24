<script setup lang="ts">
const router = useRouter()
const name = ref<string>('')

function go() {
  if (!name.value)
    return
  router.push(`/hi/${encodeURIComponent(name.value)}`)
}
</script>

<template>
  <div class="my-6">
    <input
      v-model="name"
      type="text"
      class="w-64 rounded border border-gray-300 bg-transparent px-4 py-2 text-center text-gray-600 outline-none focus:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:focus:border-gray-600"
      placeholder="What's your name?"
      autocomplete="off"
      @keydown.enter="go"
    >
  </div>
  <div>
    <button
      type="button"
      class="my-btn"
      :disabled="!name"
      @click="go"
    >
      Go
    </button>
  </div>
</template>

<style scope></style>
