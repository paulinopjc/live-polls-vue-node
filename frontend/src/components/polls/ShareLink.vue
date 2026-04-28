<template>
  <div class="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded p-2">
    <input
      :value="url"
      readonly
      class="flex-1 bg-transparent text-sm text-gray-700 px-2 focus:outline-none"
    />
    <button
      @click="copy"
      class="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
    >
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ url: string }>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText((event!.target as HTMLElement).closest('div')!.querySelector('input')!.value)
  } catch {
    // ignore
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>