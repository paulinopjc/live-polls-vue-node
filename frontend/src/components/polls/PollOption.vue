<template>
  <button
    type="button"
    @click="emit('vote', option.id)"
    :disabled="hasVoted"
    class="w-full text-left bg-white border border-gray-200 rounded-lg p-3 relative overflow-hidden hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-white"
    :class="{ 'ring-2 ring-indigo-500': isMyVote }"
  >
    <div
      class="absolute inset-0 bg-indigo-100 transition-all"
      :style="{ width: barWidth, opacity: hasVoted ? 1 : 0 }"
    ></div>
    <div class="relative flex items-center justify-between">
      <span class="font-medium text-gray-900">{{ option.label }}</span>
      <span v-if="hasVoted" class="text-sm text-gray-600 ml-3">
        {{ count }} ({{ percent }}%)
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PollOption } from '@/types/poll'

const props = defineProps<{
  option: PollOption
  count: number
  totalVotes: number
  hasVoted: boolean
  isMyVote: boolean
}>()

const emit = defineEmits<{ (e: 'vote', optionId: number): void }>()

const percent = computed(() => {
  if (props.totalVotes === 0) return 0
  return Math.round((props.count / props.totalVotes) * 100)
})

const barWidth = computed(() => `${percent.value}%`)
</script>