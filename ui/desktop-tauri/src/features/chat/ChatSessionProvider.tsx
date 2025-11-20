// chat/ChatContext.tsx

import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { homeDir } from '@tauri-apps/api/path'
import type React from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number // epoch ms
}

export interface ChatAPI {
  messages: ChatMessage[]
  sendMessage: (content: string) => Promise<void>
}

const ChatSessionContext = createContext<ChatAPI | null>(null)

export const ChatSessionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const currentAssistantMessageId = useRef<string | null>(null)

  // Create a session when the provider mounts
  useEffect(() => {
    const createSession = async () => {
      try {
        // Get the user's home directory as the working directory
        const homePath = await homeDir()
        const session = await invoke('create_session', {
          workingDir: homePath,
          name: 'Chat Session',
          sessionType: 'user',
        })
        setSessionId((session as any).id)
      } catch (error) {
        console.error('Error creating session:', error)
      }
    }
    createSession()
  }, [])

  // Set up event listener for agent events
  useEffect(() => {
    const unlistenPromise = listen('agent-event', (event: any) => {
      const data = event.payload

      if (data.type === 'message') {
        const message = data.message

        // Extract text content from the message
        let textContent = ''
        if (message.content && Array.isArray(message.content)) {
          for (const contentItem of message.content) {
            if (contentItem.type === 'text' || contentItem.Text) {
              textContent += contentItem.text || contentItem.Text?.text || ''
            }
          }
        }

        if (message.role === 'assistant' && textContent) {
          // Update or create assistant message
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg?.role === 'assistant' && lastMsg.id === currentAssistantMessageId.current) {
              // Append to existing message
              return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + textContent }]
            } else {
              // Create new assistant message
              const newMsg: ChatMessage = {
                id: message.id || crypto.randomUUID(),
                role: 'assistant',
                content: textContent,
                createdAt: Date.now(),
              }
              currentAssistantMessageId.current = newMsg.id
              return [...prev, newMsg]
            }
          })
        }
      }
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      // Don't send if session isn't created yet
      if (!sessionId) {
        console.error('Session not ready yet')
        return
      }

      const now = Date.now()
      const messageId = crypto.randomUUID()
      const userMsg: ChatMessage = { id: messageId, role: 'user', content, createdAt: now }

      // Add user message immediately
      setMessages((prev) => [...prev, userMsg])

      // Reset current assistant message tracking
      currentAssistantMessageId.current = null

      try {
        // Create a minimal Message object for goose
        // This matches the Message struct from goose
        const gooseMessage = {
          id: messageId,
          role: 'user',
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
          created: Math.floor(now / 1000), // Convert milliseconds to seconds (Unix timestamp)
          metadata: {
            userVisible: true, // Message is visible to user
            agentVisible: true, // Message is visible to user
          }, // Empty metadata object
        }

        // Create a minimal SessionConfig using the persistent session ID
        const sessionConfig = {
          id: sessionId,
          max_turns: 1000,
        }

        // Call the Tauri command
        await invoke('agent_reply', {
          userMessage: gooseMessage,
          sessionConfig: sessionConfig,
        })
      } catch (error) {
        console.error('Error calling agent_reply:', error)
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${error}`,
            createdAt: Date.now(),
          },
        ])
      }
    },
    [sessionId],
  )

  const value = useMemo<ChatAPI>(() => ({ messages, sendMessage }), [messages, sendMessage])

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>
}

export const useChat = (): ChatAPI => {
  const ctx = useContext(ChatSessionContext)
  if (!ctx) throw new Error('useChat must be used within <ChatProvider>')
  return ctx
}
