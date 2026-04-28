const lastVoteAt = new Map<string, number>()
const MIN_INTERVAL_MS = 250

export const voteRateLimiter = {
  allow(sessionId: string): boolean {
    const now = Date.now()
    const last = lastVoteAt.get(sessionId)
    if (last && now - last < MIN_INTERVAL_MS) {
      return false
    }
    lastVoteAt.set(sessionId, now)
    return true
  },
}