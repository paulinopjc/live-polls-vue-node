import { onUnmounted } from 'vue'
import { getSocket } from '@/api/socket'

export function useSocket<T = unknown>(event: string, handler: (data: T) => void) {
  const socket = getSocket()
  socket.on(event, handler as (...args: unknown[]) => void)

  onUnmounted(() => {
    socket.off(event, handler as (...args: unknown[]) => void)
  })
}