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

app.get('/api/v1/controllers/:mac/status', async (request, response, next) => {
  try {
    const mac = normalizeMac(request.params.mac);
    if (!MAC_PATTERN.test(mac)) return response.status(400).json({ error: 'MAC inválido.' });
    const result = await pool.query(
      'SELECT pulse_requested, reboot_requested, machine_available FROM controllers WHERE mac_address = $1', [mac],
    );
    if (!result.rowCount) return response.status(404).json({ error: 'Controladora não encontrada.' });
    const controller = result.rows[0];
    return response.json({ pulse: controller.pulse_requested, reboot: controller.reboot_requested, available: controller.machine_available });
  } catch (error) { return next(error); }
});

app.get('/api/v1/network-test/download', (request, response) => {
  const bytes = Math.min(Math.max(Number(request.query.bytes) || 1048576, 65536), 2097152);
  response.set({ 'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes), 'Cache-Control': 'no-store' });
  response.send(Buffer.alloc(bytes, 1));
});

app.post('/api/v1/network-test/upload', express.raw({ type: 'application/octet-stream', limit: '2mb' }), (_request, response) => response.status(204).end());

app.post('/api/v1/onboarding/validations', async (request, response, next) => {
  try {
    const data = request.body || {};
    const mac = normalizeMac(data.macAddress);
    if (!MAC_PATTERN.test(mac) || !data.customerName?.trim() || !data.franchiseName?.trim() || !data.laundryName?.trim()) {
      return response.status(400).json({ error: 'Dados obrigatórios inválidos.' });
    }
    const result = await pool.query('SELECT pulse_requested, reboot_requested, machine_available FROM controllers WHERE mac_address = $1', [mac]);
    if (!result.rowCount) return response.status(404).json({ error: 'Controladora não encontrada.' });
    const controller = result.rows[0];
    const speedOk = Number(data.downloadMbps) >= 5 && Number(data.uploadMbps) >= 5;
    const completed = !controller.reboot_requested && data.powerLedConfirmed === true && data.communicationLedConfirmed === true && speedOk;
    const reason = completed ? null : controller.reboot_requested ? 'CONTROLADORA_REINICIANDO' : !data.powerLedConfirmed || !data.communicationLedConfirmed ? 'LEDS_NAO_CONFIRMADOS' : 'VELOCIDADE_INSUFICIENTE';
    await pool.query(
      `INSERT INTO onboarding_attempts (controller_mac, customer_name, franchise_name, laundry_name, power_led_confirmed, communication_led_confirmed, pulse_requested, reboot_requested, machine_available, result, failure_reason, download_mbps, upload_mbps, request_attempts)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [mac, data.customerName.trim(), data.franchiseName.trim(), data.laundryName.trim(), data.powerLedConfirmed, data.communicationLedConfirmed, controller.pulse_requested, controller.reboot_requested, controller.machine_available, completed ? 'SUCCESS' : 'PENDING', reason, Number(data.downloadMbps) || 0, Number(data.uploadMbps) || 0, Math.min(Number(data.attempts) || 1, 5)],
    );
    return response.status(201).json({ result: completed ? 'SUCCESS' : 'PENDING', reason, pulse: controller.pulse_requested, reboot: controller.reboot_requested, available: controller.machine_available });
  } catch (error) { return next(error); }
});

app.use((_request, response) => response.status(404).json({ error: 'Rota não encontrada.' }));
app.use((error, _request, response, _next) => { console.error(error); response.status(500).json({ error: 'Erro interno do servidor.' }); });
app.listen(port, () => console.log(`API do onboarding disponível na porta ${port}`));
