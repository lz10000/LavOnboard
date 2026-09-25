import React from 'react'
import Stepper from './components/Stepper'
import './index.css'

// Componente raiz do Self Install — Portal de Onboarding IoT
function App() {
  return (
    <main className="min-h-screen bg-surface flex justify-center items-start">
      <Stepper />
    </main>
  )
}

export default App

