import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/features/app/AppLayout'
import { HomePage } from '@/features/home/HomePage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path='*' element={'Page not found'} />
    </>,
  ),
)

export const RouteProvider = () => {
  return <RouterProvider router={router} />
}
