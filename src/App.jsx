// Importação da biblioteca nativa do React
import React from 'react'

// Importação do nosso componente (criado na pasta components)
import Stepper from './components/Stepper'

// Importa o arquivo global de CSS que já veio na configuração padrão do projeto Vite
import './App.css'

// O Componente App é a base (raiz) do seu Front-End
function App() {
  return (
    // Cria uma div genérica flexível que centraliza totalmente o conteúdo (vertical e horizontalmente) na tela
    // Definimos minHeight 100vh para ocupar 100% da altura da tela e aplicamos uma cor cinza claro agradável ao fundo
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      
      {/* Aqui estamos "Injetando" todo o formulário visual do Onboarding para o navegador */}
      <Stepper />

    </div>
  )
}

// Exporta a função para o Vite pegá-la no main.jsx e injetar na tag <div id="root"> do index.html
export default App
