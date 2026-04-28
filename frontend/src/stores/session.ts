import { defineStore } from 'pinia'
import { ref } from 'vue'

const SESSION_KEY = 'live-polls-session-id'

function generateSessionId(): string {
  // Modern browsers expose crypto.randomUUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const useSessionStore = defineStore('session', () => {
  const sessionId = ref<string>('')

  function load() {
    let stored = localStorage.getItem(SESSION_KEY)
    if (!stored) {
      stored = generateSessionId()
      localStorage.setItem(SESSION_KEY, stored)
    }
    sessionId.value = stored
  }

  return { sessionId, load }
})