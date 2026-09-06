giimport React, { useState, useEffect, useRef } from 'react';

const Stepper = () => {
  // ==========================================
  // ESTADOS DO COMPONENTE (React Hooks)
  // ==========================================
  // Controla o passo atual (inicia no passo 1)
  const [currentStep, setCurrentStep] = useState(1);
  // Armazena o endereço MAC digitado pelo usuário
  const [macAddress, setMacAddress] = useState('');
  // Armazena a seleção do tipo de conexão física (moedeira, digital, etc.)
  const [connectionType, setConnectionType] = useState('');
  // Controla o status da requisição à API: idle (parado), loading (carregando), success (sucesso), error (erro)
  const [status, setStatus] = useState('idle'); 
  // Armazena a mensagem de erro que veio da API ou validação
  const [errorMessage, setErrorMessage] = useState('');

  // ==========================================
  // REFERÊNCIAS DE ACESSIBILIDADE (A11Y)
  // ==========================================
  // Cria uma referência para o container do conteúdo. Usado para focar automaticamente no novo conteúdo quando o passo mudar, ajudando leitores de tela.
  const stepRef = useRef(null);
  
  // Variáveis para calcular a barra de progresso
  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Efeito Colateral: Toda vez que o 'currentStep' mudar, o foco do teclado vai para o container do passo
  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.focus();
    }
  }, [currentStep]);

  // Função para avançar para o próximo passo (limitado ao total de passos)
  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  // Função para voltar ao passo anterior. Ao voltar, reseta o status de erro ou loading da API
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    setStatus('idle');
    setErrorMessage('');
  };

  // ==========================================
  // INTEGRAÇÃO COM A API DO SIMULADOR (Docker)
  // ==========================================
  const verifyConnectionStatus = async () => {
    // Muda o status para carregando para desabilitar o botão e mostrar feedback visual
    setStatus('loading');
    setErrorMessage('');

    try {
      // Faz uma requisição GET assíncrona (fetch) para a API Node.js local
      const response = await fetch(`http://localhost:3001/api/onboarding/status/${macAddress}`);
      
      // Se a resposta HTTP for 404/500, força um erro para cair no bloco catch
      if (!response.ok) {
        throw new Error('Falha ao conectar no servidor local.');
      }
      
      // Converte a resposta recebida em JSON
      const data = await response.json();

      // Regra de Negócio: O sucesso só ocorre se a placa estiver 'online' e com o led de wifi 'verde'
      if (data.status_conexao === 'online' && data.led_2_wifi === 'green') {
        setStatus('success');
      } 
      // Se a resposta for um registro vazio simulado (not_found)
      else if (data.status_conexao === 'not_found') {
        setStatus('error');
        setErrorMessage('Dispositivo não encontrado. Verifique se o MAC Address está correto e se o equipamento foi ligado.');
      } 
      // Se encontrou a placa, mas ela está offline ou com led diferente de verde
      else {
        setStatus('error');
        setErrorMessage('A controladora foi encontrada, mas ainda não está online ou com o LED Verde estável. Aguarde mais uns segundos ou reinicie a controladora.');
      }
    } catch (error) {
      console.error(error); // Imprime o erro técnico no console do navegador
      setStatus('error'); // Mostra a interface de erro genérica pro usuário
      setErrorMessage('Erro de comunicação. O simulador local (Docker) está rodando?');
    }
  };

  // ==========================================
  // ESTILIZAÇÃO CSS (INLINE)
  // ==========================================
  // Centraliza todo o estilo visual dentro do arquivo JS, dispensando arquivos CSS extras.
  const styles = {
    container: { fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '600px', margin: '2rem auto', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#ffffff', color: '#333' },
    header: { textAlign: 'center', marginBottom: '2rem' },
    progressBarContainer: { width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#007bff', width: `${progressPercentage}%`, transition: 'width 0.3s ease' },
    stepContent: { minHeight: '200px', outline: 'none' }, // outline: none evita a borda azul chata de foco do acessibilidade
    title: { fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' },
    text: { fontSize: '1rem', lineHeight: '1.5', marginBottom: '1rem', color: '#555' },
    input: { width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '1rem' },
    select: { width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '1rem' },
    buttonRow: { display: 'flex', justifyContent: 'space-between', marginTop: '2rem' },
    button: { padding: '10px 20px', fontSize: '1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', transition: 'background-color 0.2s' },
    buttonSecondary: { backgroundColor: '#f1f1f1', color: '#333' },
    buttonDisabled: { backgroundColor: '#ccc', cursor: 'not-allowed' },
    alertInfo: { padding: '15px', backgroundColor: '#e7f3fe', borderLeft: '4px solid #2196F3', marginBottom: '1rem' },
    alertError: { padding: '15px', backgroundColor: '#ffebee', borderLeft: '4px solid #f44336', marginBottom: '1rem', color: '#d32f2f' },
    alertSuccess: { padding: '15px', backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50', marginBottom: '1rem', color: '#2e7d32' }
  };

  // Função auxiliar que decide (true/false) se o botão 'Avançar' deve ser bloqueado dependendo da tela
  const isNextDisabled = () => {
    // Tela 1: O botão só habilita se a pessoa digitou um MAC com pelo menos 12 caracteres
    if (currentStep === 1 && macAddress.trim().length < 12) return true;
    // Tela 2: O botão só habilita se ela selecionou alguma opção do combo box
    if (currentStep === 2 && !connectionType) return true;
    // Tela 4 (Simulação): O botão só habilita para ir pro final se a API validou que é sucessodd
    if (currentStep === 4 && status !== 'success') return true;
    return false; // Se não caiu em nenhuma restrição, libera o botão.
  };

  // ==========================================
  // RENDERIZAÇÃO VISUAL (HTML/JSX) Mudei 

  // ==========================================
  return (
    <div style={styles.container}>
      {/* Cabeçalho da interface */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Self Install - Onboarding</h2>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Passo {currentStep} de {totalSteps}</p>
      </div>

      {/* Barra de Progresso com os atributos corretos do WCAG para leitores de tela saberem o andamento */}
      <div 
        style={styles.progressBarContainer} 
        role="progressbar" 
        aria-valuenow={progressPercentage} 
        aria-valuemin="0" 
        aria-valuemax="100"
        aria-label={`Progresso: ${progressPercentage}%`}
      >
        <div style={styles.progressBar}></div>
      </div>

      {/* Container dinâmico com tabindex e ref para receber foco. O aria-live="polite" avisa leitores de tela gentilmente caso mude sem perder o foco. */}
      <div 
        ref={stepRef} 
        tabIndex={-1} 
        style={styles.stepContent}
        aria-live="polite"
      >
        {/* Renderização Condicional: O que for renderizado depende do número da tela atual */}
        
        {currentStep === 1 && (
          <div>
            <h3 style={styles.title}>Identificação do Equipamento</h3>
            <p style={styles.text}>Por favor, insira o endereço MAC da sua controladora IoT...</p>
            {/* Input controlado por estado (value associado ao estado macAddress) */}
            <input 
              type="text" style={styles.input} placeholder="Ex: 00:1B:44:11:3A:B7" 
              value={macAddress} onChange={(e) => setMacAddress(e.target.value)}
              aria-label="MAC Address do equipamento"
            />
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={styles.title}>Instalação Física</h3>
            <p style={styles.text}>Selecione o tipo de conexão que será realizada na sua máquina:</p>
            {/* Select controlado, o options disabled impede envio com valor nulo nativamente */}
            <select style={styles.select} value={connectionType} onChange={(e) => setConnectionType(e.target.value)} aria-label="Tipo de conexão física">
              <option value="" disabled>Selecione uma opção...</option>
              <option value="moedeira">Moedeira de pulso padronizado</option>
              <option value="digital">Pulso Digital</option>
              <option value="protocolo">Protocolos de Comunicação (RS-485 / MDB)</option>
            </select>
            
            {/* Só exibe o alerta amarelo de instrução física DEPOIS que ele selecionar o cabo */}
            {connectionType && (
              <div style={styles.alertInfo}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Instruções:</p>
                <p style={{ margin: '5px 0 0 0' }}>Conecte os cabos correspondentes à interface <strong>{connectionType}</strong>. Ligue a tomada. O <strong>LED 1 deve acender laranja estável</strong>.</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={styles.title}>Conexão à Rede Wi-Fi</h3>
            <p style={styles.text}>Sua controladora criará uma rede Wi-Fi temporária. Siga os passos...</p>
            <div style={styles.alertInfo}>
              <p style={{ margin: 0 }}>Aguarde até que o <strong>LED 2 (Wi-Fi) fique verde estável</strong>.</p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 style={styles.title}>Validação de Conexão</h3>
            <p style={styles.text}>Vamos verificar se o seu equipamento já está comunicando com a nuvem.</p>

            {/* Botão para disparar o FETCH na API */}
            <button 
              onClick={verifyConnectionStatus} 
              style={{...styles.button, width: '100%', marginBottom: '1rem'}}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Verificando...' : 'Verificar Status da Conexão'}
            </button>

            {/* aria-live assertive obriga os leitores de tela a lerem a mensagem de erro/sucesso imediatamente após o fetch */}
            <div aria-live="assertive">
              {status === 'error' && (
                <div style={styles.alertError}>
                  <strong>Ops! Tivemos um problema:</strong>
                  <p style={{ margin: '5px 0 0 0' }}>{errorMessage}</p>
                </div>
              )}

              {status === 'success' && (
                <div style={styles.alertSuccess}>
                  <strong>Sucesso! 🎉</strong>
                  <p style={{ margin: '5px 0 0 0' }}>Sua controladora está online e o LED 2 está verde estável.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h3 style={styles.title}>Finalização e Atualizações</h3>
            <p style={styles.text}>Tudo pronto! A instalação física e a conexão da controladora IoT foram concluídas.</p>
            <div style={styles.alertInfo}>
              <p style={{ margin: 0 }}>Não se esqueça de ativar as atualizações automáticas...</p>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          BOTÕES DE NAVEGAÇÃO DE PÁGINA (Footer)
          ========================================== */}
      <div style={styles.buttonRow}>
        {/* O botão voltar só fica visível (ocupando espaço na tela) a partir do passo 2 */}
        <button 
          style={{ ...styles.button, ...styles.buttonSecondary, visibility: currentStep > 1 ? 'visible' : 'hidden' }} 
          onClick={handlePrev}
        >
          Voltar
        </button>
        
        {/* Botão avançar desaparece na última tela */}
        {currentStep < totalSteps && (
          <button 
            style={{ ...styles.button, ...(isNextDisabled() ? styles.buttonDisabled : {}) }} 
            onClick={handleNext}
            disabled={isNextDisabled()} // Trava no HTML a possibilidade de dar Next
          >
            Avançar
          </button>
        )}
        
        {/* Botão de conclusão verde só aparece no último passo */}
        {currentStep === totalSteps && (
          <button 
            style={{ ...styles.button, backgroundColor: '#28a745' }} 
            onClick={() => alert('Onboarding finalizado!')}
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
};

// Exporta o componente para ele ser importado lá no App.jsx
export default Stepper;
