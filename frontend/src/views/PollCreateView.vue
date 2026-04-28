<template>
  <div class="max-w-xl">
    <h1 class="text-2xl font-semibold mb-6">New Poll</h1>

    <!-- Success: poll submitted for approval -->
    <div v-if="submitted" class="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
      <h2 class="text-lg font-medium text-green-800">Poll submitted!</h2>
      <p class="text-sm text-green-700">
        Your poll has been submitted for approval. An admin will review it shortly.
        Once approved, it will appear on the public polls page.
      </p>
      <div class="flex gap-3 pt-2">
        <button
          @click="resetForm"
          class="px-5 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Create Another
        </button>
        <router-link
          to="/polls"
          class="px-5 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          View Polls
        </router-link>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="onSubmit" class="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div v-if="error" class="bg-red-50 border border-red-200 rounded px-3 py-2 text-sm text-red-700">
        {{ error }}
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Question *</label>
        <input
          v-model="question"
          type="text"
          required
          maxlength="500"
          placeholder="What should we decide?"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <p v-if="fieldErrors.question" class="text-xs text-red-600 mt-1">{{ fieldErrors.question }}</p>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-medium text-gray-600">Options *</label>
          <button
            type="button"
            @click="addOption"
            :disabled="options.length >= 6"
            class="text-xs text-indigo-600 hover:underline disabled:opacity-50"
          >
            + Add option
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="(_opt, i) in options" :key="i" class="flex items-center gap-2">
            <input
              v-model="options[i]"
              type="text"
              maxlength="200"
              :placeholder="`Option ${i + 1}`"
              class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <button
              v-if="options.length > 2"
              type="button"
              @click="removeOption(i)"
              class="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
        <p v-if="fieldErrors.options" class="text-xs text-red-600 mt-1">{{ fieldErrors.options }}</p>
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ saving ? 'Creating…' : 'Create Poll' }}
        </button>
        <button
          type="button"
          @click="router.push('/')"
          class="px-5 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { pollApi } from '@/api/pollApi'

const router = useRouter()

const question = ref('')
const options = ref<string[]>(['', ''])
const saving = ref(false)
const submitted = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

function addOption() {
  if (options.value.length < 6) options.value.push('')
}

function removeOption(i: number) {
  options.value.splice(i, 1)
}

function resetForm() {
  question.value = ''
  options.value = ['', '']
  submitted.value = false
  error.value = null
  fieldErrors.value = {}
}

async function onSubmit() {
  saving.value = true
  error.value = null
  fieldErrors.value = {}
  try {
    const trimmed = options.value.map((o) => o.trim()).filter(Boolean)
    await pollApi.create({ question: question.value.trim(), options: trimmed })
    submitted.value = true
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string; details?: Record<string, string> } } }
    fieldErrors.value = err.response?.data?.details ?? {}
    error.value = err.response?.data?.error ?? 'Failed to create poll.'
  } finally {
    saving.value = false
  }
}
</script>