import { getCurrentWindow } from '@tauri-apps/api/window'
import { Maximize, Minimize, Monitor, Moon, Sun, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { useTheme } from '@/shared/providers/ThemeProvider'

const win = getCurrentWindow()

export const AppTitleBar = () => {
  const { theme, setTheme } = useTheme()
  const onHeaderDblClick = () => win.toggleMaximize()

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className='h-4 w-4' />
      case 'dark':
        return <Moon className='h-4 w-4' />
      case 'system':
        return <Monitor className='h-4 w-4' />
    }
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50'>
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <needed for doubleclick> */}
      <header data-tauri-drag-region onDoubleClick={onHeaderDblClick} className='flex h-10 items-center justify-end px-2 select-none'>
        <div className='flex items-center gap-1' /* no drag here */>
          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' data-tauri-drag-region='no-drag' className='h-8 w-8'>
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem onClick={() => setTheme('light')} className='flex items-center gap-2'>
                  <Sun className='h-4 w-4' />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className='flex items-center gap-2'>
                  <Moon className='h-4 w-4' />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className='flex items-center gap-2'>
                  <Monitor className='h-4 w-4' />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button variant='ghost' data-tauri-drag-region='no-drag' onClick={() => win.minimize()} className='h-8 w-8'>
            <Minimize />
          </Button>
          <Button variant='ghost' data-tauri-drag-region='no-drag' onClick={() => win.toggleMaximize()} className='h-8 w-8'>
            <Maximize />
          </Button>
          <Button variant='ghost' data-tauri-drag-region='no-drag' onClick={() => win.close()} className='h-8 w-8'>
            <X />
          </Button>
        </div>
      </header>
    </div>
  )
}
