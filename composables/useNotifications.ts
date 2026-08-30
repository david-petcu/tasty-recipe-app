export type NotificationType = 'success' | 'error' | 'info'

export interface AppNotification {
  id: number
  message: string
  type: NotificationType
}

export function useNotifications() {
  const notifications = useState<AppNotification[]>('app-notifications', () => [])

  function dismiss(id: number) {
    notifications.value = notifications.value.filter(item => item.id !== id)
  }

  function notify(message: string, type: NotificationType = 'info') {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    notifications.value.push({ id, message, type })
    if (import.meta.client) window.setTimeout(() => dismiss(id), 4500)
  }

  return { notifications, notify, dismiss }
}
