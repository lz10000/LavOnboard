// Configuração de variáveis de ambiente em tempo de execução (Runtime)
// Em produção (Docker/Nginx), este arquivo é regerado dinamicamente na inicialização do contêiner.
window.__ENV__ = {
  API_BASE_URL: 'https://lavonboarding-simulator-api.onrender.com/api/v1'
};
