import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ensureInitialLanguage } from './i18n'
import './index.css'

async function bootstrap() {
  try {
    await ensureInitialLanguage()
  } catch {
    // English fallback is always bundled; app can still render.
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap()
