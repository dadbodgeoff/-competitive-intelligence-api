import React from 'react'
import ReactDOM from 'react-dom/client'
import { initSentry } from './lib/sentry'
import App from './App.tsx'
import './index.css'

// Initialize error tracking before React renders
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)