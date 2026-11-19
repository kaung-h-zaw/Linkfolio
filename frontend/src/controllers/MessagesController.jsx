import { useCallback, useEffect, useRef, useState } from 'react'
import { MessagesContext } from '../lib/messagesContext'
import { api } from '../services/api'

export default function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)
  const refresh = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    try {
      const result = await api('/messages', { signal: controller.signal })
      if (!controller.signal.aborted) {
        setMessages(result.messages)
        setLoaded(true)
        setError('')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message)
        throw error
      }
    }
  }, [])
  useEffect(() => {
    const update = () => { if (!document.hidden) refresh().catch(() => {}) }
    update()
    const timer = setInterval(update, 15000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      request.current?.abort()
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [refresh])
  return <MessagesContext.Provider value={{ messages, loaded, error, refresh, unread: messages.filter((message) => !message.deleted_at && message.status === 'unread').length }}>{children}</MessagesContext.Provider>
}
