import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './i18n'
import './styles/global.css'
import './styles/components.css'
import './styles/dashboard.css'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload?')) {
      updateSW(true)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
