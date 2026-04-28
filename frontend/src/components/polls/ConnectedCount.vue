<template>
  <div class="inline-flex items-center gap-1.5 text-xs text-gray-500">
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    <span>{{ count }} {{ count === 1 ? 'person' : 'people' }} connected</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>()
</script>