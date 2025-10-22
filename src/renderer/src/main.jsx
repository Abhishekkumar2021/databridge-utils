import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from 'next-themes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system">
      <App />
    </ThemeProvider>
  </StrictMode>
)
