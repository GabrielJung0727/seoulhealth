import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// After a deploy, tabs still on the old build can't fetch removed route chunks.
// Reload once to pick up the new build; the flag stops a loop if a chunk is truly missing.
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('sih_chunk_reload')) return
  sessionStorage.setItem('sih_chunk_reload', '1')
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
