import { Folder, Plus, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { useChat } from './ChatSessionProvider'

export const ChatInput = () => {
  const { sendMessage } = useChat()
  const [text, setText] = useState<string>('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await sendMessage(trimmed)
    setText('')
  }

  return (
    <form onSubmit={onSubmit} className='w-full max-w-xl border rounded-xl shadow-sm flex flex-col gap-1'>
      <div className='flex gap-2'>
        <div className='flex-1'>
          <Textarea
            className='resize-none min-h-0 mt-1 border-0 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent'
            rows={1}
            placeholder='Ask anything...'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const form = e.currentTarget.form
                if (form) {
                  form.requestSubmit()
                }
              }
            }}
          />
        </div>
        <div className='self-end pr-2'>
          <Button size='sm' type='submit'>
            <Send />
            Send
          </Button>
        </div>
      </div>
      <div className='flex'>
        <Button variant='ghost'>
          <Folder />
        </Button>
        <Button variant='ghost'>
          <Plus />
        </Button>
      </div>
    </form>
  )
}
