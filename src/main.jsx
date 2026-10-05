import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
