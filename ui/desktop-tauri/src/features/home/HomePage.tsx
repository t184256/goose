import { ChatInput } from '../chat/ChatInput'
import { ChatMessages } from '../chat/ChatMessages'
import { ChatSessionProvider } from '../chat/ChatSessionProvider'

export const HomePage = () => {
  return (
    <ChatSessionProvider>
      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto p-4 mt-8 min-h-0'>
          <ChatMessages />
        </div>
        <div className='shrink-0 flex justify-center p-4 border-t'>
          <ChatInput />
        </div>
      </div>
    </ChatSessionProvider>
  )
}
