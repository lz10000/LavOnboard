const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3001);
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'admin', password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'iot_simulator',
});
const MAC_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
const normalizeMac = (mac) => String(mac || '').trim().toUpperCase().replaceAll('-', ':');

app.use(cors());
app.use(express.json({ limit: '64kb' }));

app.get('/health', async (_request, response) => {
  try { await pool.query('SELECT 1'); response.json({ status: 'ok' }); }
  catch { response.status(503).json({ status: 'unavailable' }); }
});

const hardwareState = new Map();

app.get('/api/v1/controllers/:mac/status', async (request, response, next) => {
  try {
    const mac = normalizeMac(request.params.mac);
    if (!MAC_PATTERN.test(mac)) return response.status(400).json({ error: 'MAC inválido.' });

    // Recupera os dados simulados via ping
    const pingData = hardwareState.get(mac);
    if (pingData) {
      // Consome os dados: apaga do mapa para exigir o envio de um novo JSON/ping a cada nova consulta
      hardwareState.delete(mac);
      return response.json(pingData);
    }

    // Se nenhum ping foi enviado ou o anterior já foi consumido
    return response.status(404).json({
      error: 'Nenhum sinal recente da controladora. Envie um novo JSON via POST /api/v1/controllers/:mac/ping.'
    });
  } catch (error) { return next(error); }
});

app.post('/api/v1/controllers/:mac/ping', async (request, response) => {
  const mac = normalizeMac(request.params.mac);
  if (!MAC_PATTERN.test(mac)) return response.status(400).json({ error: 'MAC inválido.' });
  
  const data = request.body || {};
  const pingPayload = {
    pulse: data.pulse !== undefined ? Boolean(data.pulse) : false,
    reboot: data.reboot !== undefined ? Boolean(data.reboot) : false,
    available: data.available !== undefined ? Boolean(data.available) : true
  };

  hardwareState.set(mac, pingPayload);

  try {
    await pool.query(
      `INSERT INTO controllers (mac_address, model, pulse_requested, reboot_requested, machine_available, last_seen_at)
       VALUES ($1, 'Controladora IoT', $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (mac_address) DO UPDATE SET
         pulse_requested = EXCLUDED.pulse_requested,
         reboot_requested = EXCLUDED.reboot_requested,
         machine_available = EXCLUDED.machine_available,
         last_seen_at = CURRENT_TIMESTAMP`,
      [mac, pingPayload.pulse, pingPayload.reboot, pingPayload.available]
    );
  } catch (err) {
    // Ignora erro no banco para não impedir simulação em memória
  }
  
  return response.json({ message: 'Ping da controladora recebido com sucesso', mac, data: pingPayload });
});

const handleDownload = (request, response) => {
  const bytes = Math.min(Math.max(Number(request.query.bytes) || 1048576, 65536), 2097152);
  response.set({ 'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes), 'Cache-Control': 'no-store' });
  response.send(Buffer.alloc(bytes, 1));
};

app.get('/api/v1/network-test/download', handleDownload);
app.get('/api/v1/speedtest/download', handleDownload);

const handleUpload = (_request, response) => response.status(204).end();
app.post('/api/v1/network-test/upload', express.raw({ type: 'application/octet-stream', limit: '2mb' }), handleUpload);
app.post('/api/v1/speedtest/upload', express.raw({ type: 'application/octet-stream', limit: '2mb' }), handleUpload);

app.post('/api/v1/onboarding/validations', async (request, response, next) => {
  try {
    const data = request.body || {};
    const mac = normalizeMac(data.macAddress);
    const franchiseName = (data.isIndependent || data.franchiseName === 'Independente')
      ? 'Independente'
      : (data.franchiseName || '').trim();

    if (!MAC_PATTERN.test(mac) || !data.customerName?.trim() || !franchiseName || !data.laundryName?.trim()) {
      return response.status(400).json({ error: 'Dados obrigatórios inválidos.' });
    }

    const pulse = Boolean(data.pulse !== undefined ? data.pulse : false);
    const reboot = Boolean(data.reboot !== undefined ? data.reboot : false);
    const available = Boolean(data.available !== undefined ? data.available : true);

    // Garante que o MAC exista na tabela controllers para respeitar a chave estrangeira
    await pool.query(
      `INSERT INTO controllers (mac_address, model, pulse_requested, reboot_requested, machine_available, last_seen_at)
       VALUES ($1, 'Controladora IoT', $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (mac_address) DO UPDATE SET
         pulse_requested = EXCLUDED.pulse_requested,
         reboot_requested = EXCLUDED.reboot_requested,
         machine_available = EXCLUDED.machine_available,
         last_seen_at = CURRENT_TIMESTAMP`,
      [mac, pulse, reboot, available]
    );

    const speedOk = Number(data.downloadMbps) >= 5 && Number(data.uploadMbps) >= 5;
    const completed = !reboot && data.powerLedConfirmed === true && data.communicationLedConfirmed === true && speedOk;
    const reason = completed
      ? null
      : reboot
        ? 'CONTROLADORA_REINICIANDO'
        : !data.powerLedConfirmed || !data.communicationLedConfirmed
          ? 'LEDS_NAO_CONFIRMADOS'
          : 'VELOCIDADE_INSUFICIENTE';

    const insertResult = await pool.query(
      `INSERT INTO onboarding_attempts (
         controller_mac, customer_name, franchise_name, laundry_name,
         power_led_confirmed, communication_led_confirmed,
         pulse_requested, reboot_requested, machine_available,
         result, failure_reason, download_mbps, upload_mbps, request_attempts
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        mac,
        data.customerName.trim(),
        franchiseName,
        data.laundryName.trim(),
        Boolean(data.powerLedConfirmed),
        Boolean(data.communicationLedConfirmed),
        pulse,
        reboot,
        available,
        completed ? 'SUCCESS' : 'PENDING',
        reason,
        Number(data.downloadMbps) || 0,
        Number(data.uploadMbps) || 0,
        Math.min(Number(data.attempts) || 1, 5)
      ],
    );

    return response.status(201).json({
      result: completed ? 'SUCCESS' : 'PENDING',
      reason,
      attempt: insertResult.rows[0],
      pulse,
      reboot,
      available
    });
  } catch (error) { return next(error); }
});

app.use((_request, response) => response.status(404).json({ error: 'Rota não encontrada.' }));
app.use((error, _request, response, _next) => { console.error(error); response.status(500).json({ error: 'Erro interno do servidor.' }); });
const server = app.listen(port, () => console.log(`API do onboarding disponível na porta ${port}`));
server.timeout = 100000;