import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainApp from './MainApp.tsx'

console.log('🚀 main.tsx is executing!');
console.log('About to createRoot with element:', document.getElementById('root'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
