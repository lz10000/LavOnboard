// Importação das dependências fundamentais
const express = require('express'); // Framework web para criar a API
const cors = require('cors'); // Middleware para permitir requisições do frontend (React)
const { Pool } = require('pg'); // Cliente de conexão do PostgreSQL

// Inicialização do aplicativo Express
const app = express();
// Define a porta a partir das variáveis de ambiente (Docker) ou usa 3001 como fallback
const port = process.env.PORT || 3001;

// Configuração de Middlewares
app.use(cors()); // Libera o acesso para qualquer domínio (evita erro de CORS no React)
app.use(express.json()); // Permite que a API entenda requisições com formato JSON (req.body)

// Configuração do Pool de conexão do PostgreSQL.
// Lê as variáveis de ambiente passadas no docker-compose.yml
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'iot_simulator',
  port: 5432,
});

// Função Assíncrona para inicializar e criar tabelas no banco de dados
const initDB = async () => {
  const client = await pool.connect(); // Obtém uma conexão física com o banco
  try {
    // Executa a Query SQL para criar a tabela de controladoras caso ainda não exista
    await client.query(`
      CREATE TABLE IF NOT EXISTS controladoras (
        mac_address VARCHAR(17) PRIMARY KEY,
        status_conexao VARCHAR(20) DEFAULT 'offline',
        led_1_alimentacao VARCHAR(15) DEFAULT 'off',
        led_2_wifi VARCHAR(15) DEFAULT 'off',
        ultima_sincronizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "controladoras" verificada/criada com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  } finally {
    client.release(); // Libera a conexão de volta para o Pool
  }
};

// Como o container da API sobe muito rápido, o banco (db) pode não estar 100% pronto.
// Essa função tenta conectar e, se falhar, aguarda 5 segundos e tenta novamente.
const connectDBWithRetry = () => {
  initDB().catch(() => {
    console.log('Tentando conectar ao banco novamente em 5 segundos...');
    setTimeout(connectDBWithRetry, 5000);
  });
};
connectDBWithRetry(); // Executa a conexão inicial

// ==========================================
// ENDPOINTS DA API
// ==========================================

// Rota POST: Simula o boot físico e a conexão da controladora IoT (usado pelo simulador/Postman)
app.post('/api/simulator/boot', async (req, res) => {
  // Desestrutura os dados enviados no corpo da requisição
  const { mac_address, status_conexao, led_1_alimentacao, led_2_wifi } = req.body;

  // Validação básica: O MAC Address é obrigatório
  if (!mac_address) {
    return res.status(400).json({ error: 'MAC Address é obrigatório.' });
  }

  try {
    // Insere a nova placa no banco. Se o MAC Address já existir (ON CONFLICT), ele apenas atualiza os status.
    const result = await pool.query(
      `INSERT INTO controladoras (mac_address, status_conexao, led_1_alimentacao, led_2_wifi, ultima_sincronizacao)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (mac_address) 
       DO UPDATE SET 
         status_conexao = EXCLUDED.status_conexao,
         led_1_alimentacao = EXCLUDED.led_1_alimentacao,
         led_2_wifi = EXCLUDED.led_2_wifi,
         ultima_sincronizacao = CURRENT_TIMESTAMP
       RETURNING *`, // Retorna o registro completo após inserir/atualizar
      [mac_address, status_conexao || 'online', led_1_alimentacao || 'orange', led_2_wifi || 'green']
    );

    // Responde sucesso e envia os dados da placa criada
    res.status(200).json({
      message: 'Controladora simulada com sucesso',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err); // Loga o erro no terminal
    res.status(500).json({ error: 'Erro interno no servidor' }); // Responde erro 500
  }
});

// Rota GET: O Front-end React vai chamar este endpoint para verificar se a placa está online
app.get('/api/onboarding/status/:mac', async (req, res) => {
  // Captura o MAC passado pela URL via params (ex: /status/00:1B:44...)
  const { mac } = req.params;

  try {
    // Busca no banco um registro correspondente ao MAC
    const result = await pool.query('SELECT * FROM controladoras WHERE mac_address = $1', [mac]);

    // Se a query retornar zero linhas, a placa nunca conectou (não existe no banco)
    if (result.rows.length === 0) {
      return res.status(200).json({ status_conexao: 'not_found' });
    }

    // Se encontrou, retorna todos os dados atuais da placa para o React (JSON)
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Coloca o servidor Express no ar, "ouvindo" requisições na porta definida
app.listen(port, () => {
  console.log(`Simulator API rodando na porta ${port}`);
});
