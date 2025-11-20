import { useEffect, useRef } from 'react'
import { Markdown } from '@/shared/components/ui/markdown'
import { useChat } from './ChatSessionProvider'

export const ChatMessages = () => {
  const { messages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex flex-col gap-3'>
      {messages.map((m) => (
        <div key={m.id} className={m.role === 'user' ? 'self-end max-w-[80%]' : 'self-start max-w-[80%]'}>
          {m.role === 'user' ? (
            <>
              <div className='text-sm rounded-2xl px-3 py-2 shadow bg-background-card'>{m.content.trim()}</div>
              <div className='mt-1 text-xs font-mono text-gray-400'>{new Date(m.createdAt).toLocaleTimeString()}</div>
            </>
          ) : (
            <>
              <div className='text-sm'>
                <Markdown content={m.content} />
              </div>
              <div className='mt-1 text-xs font-mono text-gray-400'>{new Date(m.createdAt).toLocaleTimeString()}</div>
            </>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
