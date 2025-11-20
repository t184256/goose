import { RouteProvider } from '@/shared/providers/RouteProvider'
import { ThemeProvider } from '@/shared/providers/ThemeProvider'

export const AppProviders = () => {
  return (
    <ThemeProvider>
      <RouteProvider />
    </ThemeProvider>
  )
}
