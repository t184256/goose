import { Outlet } from 'react-router-dom'
import { AppTitleBar } from './AppTitleBar'

export const AppLayout = () => {
  return (
    <div className='flex flex-col h-screen bg-background-muted rounded-xl overflow-hidden'>
      <AppTitleBar />
      <main className='flex-1 flex flex-col overflow-hidden'>
        <Outlet />
      </main>
    </div>
  )
}
