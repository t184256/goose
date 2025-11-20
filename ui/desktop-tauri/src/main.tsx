import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { AppProviders } from './features/app/AppProviders'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>,
)
