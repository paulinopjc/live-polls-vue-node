<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Admin: All Polls</h1>

    <div v-if="loading" class="text-center py-12 text-gray-500">Loading polls...</div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
      Failed to load polls.
    </div>

    <div v-else-if="polls.length === 0" class="text-center py-12 text-gray-500">
      No polls yet.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="poll in polls"
        :key="poll.poll.id"
        class="bg-white border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- Editable question -->
            <div v-if="editingId === poll.poll.id" class="flex items-center gap-2 mb-2">
              <input
                v-model="editQuestion"
                type="text"
                class="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
              />
              <button
                @click="saveEdit(poll.poll.id)"
                class="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                @click="editingId = null"
                class="text-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
            <p v-else class="font-semibold text-gray-900">{{ poll.poll.question }}</p>

            <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span
                :class="{
                  'text-amber-700 bg-amber-50 px-2 py-0.5 rounded': poll.poll.status === 'pending',
                  'text-green-700 bg-green-50 px-2 py-0.5 rounded': poll.poll.status === 'approved',
                  'text-red-700 bg-red-50 px-2 py-0.5 rounded': poll.poll.status === 'denied',
                }"
              >
                {{ poll.poll.status }}
              </span>
              <span>{{ poll.poll.options.length }} options</span>
              <span>{{ poll.total_votes }} votes</span>
              <span>{{ formatDate(poll.poll.created_at) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              v-if="poll.poll.status !== 'approved'"
              @click="approve(poll.poll.id)"
              class="text-xs text-green-700 hover:underline"
            >
              Approve
            </button>
            <button
              v-if="poll.poll.status !== 'denied'"
              @click="deny(poll.poll.id)"
              class="text-xs text-amber-700 hover:underline"
            >
              Deny
            </button>
            <button
              @click="startEdit(poll)"
              class="text-xs text-indigo-600 hover:underline"
            >
              Edit
            </button>
            <button
              @click="remove(poll.poll.id)"
              class="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
            <router-link
              :to="`/polls/${poll.poll.id}`"
              class="text-xs text-gray-500 hover:underline"
            >
              View
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pollApi } from '@/api/pollApi'
import type { PollWithTotals } from '@/types/poll'

const polls = ref<PollWithTotals[]>([])
const loading = ref(true)
const error = ref(false)
const editingId = ref<string | null>(null)
const editQuestion = ref('')

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function load() {
  loading.value = true
  error.value = false
  try {
    polls.value = await pollApi.listAll()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function approve(id: string) {
  await pollApi.approve(id)
  await load()
}

async function deny(id: string) {
  await pollApi.deny(id)
  await load()
}

function startEdit(poll: PollWithTotals) {
  editingId.value = poll.poll.id
  editQuestion.value = poll.poll.question
}

async function saveEdit(id: string) {
  await pollApi.editQuestion(id, editQuestion.value)
  editingId.value = null
  await load()
}

async function remove(id: string) {
  if (!confirm('Delete this poll and all its votes? This cannot be undone.')) return
  await pollApi.deletePoll(id)
  await load()
}

onMounted(load)
</script>
