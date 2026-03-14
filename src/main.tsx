import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!

// If the root already has children it was server-rendered — hydrate instead of render
if (root.hasChildNodes() && root.innerHTML.trim() !== '<!--app-html-->') {
  hydrateRoot(
    root,
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  )
}
