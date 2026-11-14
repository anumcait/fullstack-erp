import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Clear any legacy cached logo from old companies
if (localStorage.getItem('cached_logo_url') === '/logo.png') {
  localStorage.removeItem('cached_logo_url');
}
if (localStorage.getItem('cached_favicon_url') === '/logo.png') {
  localStorage.removeItem('cached_favicon_url');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
