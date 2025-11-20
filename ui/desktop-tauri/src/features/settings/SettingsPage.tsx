import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTheme } from '@/shared/providers/ThemeProvider'

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <div className='p-6'>
      <h1 className='text-text-default font-sans text-xl mb-6'>Settings</h1>

      <div className='space-y-6'>
        <div>
          <h2 className='text-text-default font-semibold mb-3'>Theme</h2>
          <div className='flex gap-3'>
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <Button key={option.value} onClick={() => setTheme(option.value)} variant={`${isSelected ? 'default' : 'outline'}`} size='sm'>
                  <Icon className='h-4 w-4' />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
