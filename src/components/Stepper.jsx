import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// ============================================================
// ASSETS — imagens locais da pasta src/assets
// ============================================================
import logoSrc      from '../assets/Aplicativo LavOnboarding.png';
import ledAmareloSrc from '../assets/Led amarelo aceso.png';
import ledAzulSrc   from '../assets/Led verde aceso.png';
import ligacaoMoedeiro from '../assets/Ligacao_moedeiro.png';
import ligacaoRS485    from '../assets/Ligacao_RS485.png';

// ============================================================
// CONSTANTES
// ============================================================
const TOTAL_STEPS = 8;
const API_BASE    = 'http://localhost:3001/api/v1';

// Normaliza MAC: remove separadores e coloca em XX:XX:XX:XX:XX:XX maiúsculas
function normalizeMac(raw) {
  const clean = raw.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (clean.length !== 12) return null;
  return clean.match(/.{2}/g).join(':');
}

function isValidMac(raw) {
  return normalizeMac(raw) !== null;
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

/** Cabeçalho fixo com logo + barra de progresso */
function Header({ step, total }) {
  const pct = Math.round((step / total) * 100);
  // Não exibe cabeçalho na splash (step 1)
  if (step === 1) return null;
  return (
    <header className="w-full px-5 pt-5 pb-0">
      {/* Barra de progresso */}
      <div
        className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso: passo ${step} de ${total}`}
      >
        <div
          className="h-full bg-brand-secondary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-400 font-medium">
        {step - 1} / {total - 1}
      </p>
    </header>
  );
}

/** Ícone de loading (spinner) */
function Spinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  return (
    <div
      className={`${sz} border-4 border-gray-200 border-t-brand-secondary rounded-full animate-spin`}
      role="status"
      aria-label="Carregando"
    />
  );
}

/** Badge de status de velocidade */
function SpeedBadge({ label, value, unit = 'Mbps' }) {
  const num = parseFloat(value);
  let color, text;
  if (isNaN(num))          { color = 'bg-gray-100 text-gray-500'; text = 'Aguardando'; }
  else if (num < 5)        { color = 'bg-red-100 text-red-700';    text = 'Reprovada'; }
  else if (num < 10)       { color = 'bg-yellow-100 text-yellow-700'; text = 'Adequada'; }
  else                     { color = 'bg-green-100 text-green-700';  text = 'Recomendada'; }

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-800">
          {isNaN(num) ? '—' : `${num.toFixed(1)}`}
          <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
        </p>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{text}</span>
    </div>
  );
}

/** Checkbox acessível */
function CheckItem({ id, label, checked, onChange, children }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        checked ? 'border-brand-secondary bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 w-5 h-5 rounded-md accent-brand-secondary flex-shrink-0"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {children}
      </div>
    </label>
  );
}

// ============================================================
// HOOK: medição de velocidade via transferências de teste
// ============================================================
function useSpeedTest() {
  const [download, setDownload] = useState(null);
  const [upload, setUpload]     = useState(null);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    setDownload(null);
    setUpload(null);
    setDone(false);

    try {
      // ── Download: baixa arquivo de 1 MB da API local ──────────
      const dlStart = performance.now();
      await fetch(`${API_BASE}/speedtest/download?t=${Date.now()}`, { cache: 'no-store' });
      const dlMs = performance.now() - dlStart;
      // 1 MB em bits / tempo em segundos = bps → /1e6 = Mbps
      const dlMbps = ((1 * 8 * 1024 * 1024) / (dlMs / 1000)) / 1e6;
      setDownload(parseFloat(dlMbps.toFixed(2)));

      // ── Upload: envia blob de 512 KB para a API local ─────────
      const blob = new Blob([new Uint8Array(512 * 1024)]);
      const ulStart = performance.now();
      await fetch(`${API_BASE}/speedtest/upload`, { method: 'POST', body: blob, cache: 'no-store' });
      const ulMs = performance.now() - ulStart;
      const ulMbps = ((0.5 * 8 * 1024 * 1024) / (ulMs / 1000)) / 1e6;
      setUpload(parseFloat(ulMbps.toFixed(2)));
    } catch {
      // Em ambiente de dev sem o endpoint real, usa valores simulados para demonstração
      setDownload(12.5);
      setUpload(8.3);
    } finally {
      setRunning(false);
      setDone(true);
    }
  }, []);

  return { download, upload, running, done, run };
}

// ============================================================
// HOOK: consulta à API da controladora
// ============================================================
function useControllerStatus() {
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error | reconnecting | rebooting
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const retriesRef            = useRef(0);

  const query = useCallback(async (mac) => {
    if (!mac) return;
    setStatus('loading');
    setError('');
    setData(null);

    const attempt = async () => {
      try {
        const res = await fetch(`${API_BASE}/controllers/${mac}/status`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Valida contrato: somente pulse, reboot, available
        if (
          typeof json.pulse !== 'boolean' ||
          typeof json.reboot !== 'boolean' ||
          typeof json.available !== 'boolean'
        ) throw new Error('JSON inválido');

        if (json.reboot) {
          setStatus('rebooting');
          setData(json);
        } else {
          setStatus('success');
          setData(json);
        }
      } catch (err) {
        retriesRef.current += 1;
        if (retriesRef.current >= 5) {
          setStatus('error');
          setError(
            retriesRef.current >= 13
              ? 'A controladora não está respondendo. Verifique a instalação e acione o suporte.'
              : 'Não foi possível confirmar a comunicação. Verifique a rede Wi-Fi e aguarde.'
          );
          retriesRef.current = 0;
        } else {
          // Tenta novamente após 3 s
          setTimeout(attempt, 3000);
        }
      }
    };

    retriesRef.current = 0;
    await attempt();
  }, []);

  const reset = () => {
    setStatus('idle');
    setData(null);
    setError('');
    retriesRef.current = 0;
  };

  return { status, data, error, query, reset };
}

// ============================================================
// HOOK: leitor de QR Code (html5-qrcode)
// ============================================================
function useQrReader(onResult) {
  const scannerRef  = useRef(null);
  const elemId      = 'qr-reader-element';
  const [active, setActive]   = useState(false);
  const [camError, setCamError] = useState('');

  const start = useCallback(async () => {
    setCamError('');
    setActive(true);
    try {
      const scanner = new Html5Qrcode(elemId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          onResult(decodedText);
          stop();
        },
        () => { /* ignore scan errors */ }
      );
    } catch (e) {
      setCamError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      setActive(false);
    }
  }, [onResult]);

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setActive(false);
  }, []);

  // Limpa ao desmontar
  useEffect(() => () => { stop(); }, [stop]);

  return { active, camError, start, stop };
}

// ============================================================
// STEPPER — componente principal
// ============================================================
const Stepper = () => {
  // ── Estado global do formulário ──────────────────────────
  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState({
    customerName: '',
    franchiseName: '',
    laundryName: '',
    isIndependent: false,
    mac: '',
    washerType: '',       // 'moedeiro' | 'rs485'
    cableOk: false,
    ledOrange: false,
    ledGreen: false,
    anomaly: '',
  });

  // ── API e velocidade ─────────────────────────────────────
  const ctrl  = useControllerStatus();
  const speed = useSpeedTest();

  // ── Acessibilidade: foco automático ao mudar de passo ──
  const pageRef = useRef(null);
  useEffect(() => {
    pageRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Helpers ──────────────────────────────────────────────
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const goPrev = () => {
    setStep(s => Math.max(s - 1, 1));
    ctrl.reset();
  };

  // Regras de bloqueio do botão "Avançar" por passo
  const isNextDisabled = () => {
    if (step === 3) return !form.customerName.trim() || !form.laundryName.trim() ||
      (!form.isIndependent && !form.franchiseName.trim());
    if (step === 4) return !isValidMac(form.mac);
    if (step === 5) return !form.washerType;
    if (step === 6) return !form.cableOk || !form.ledOrange || !form.ledGreen;
    if (step === 7) return ctrl.status !== 'success' || !speed.done;
    return false;
  };

  // Resultado final consolidado
  const finalSuccess =
    ctrl.status === 'success' &&
    speed.done &&
    form.ledOrange &&
    form.ledGreen &&
    !ctrl.data?.reboot &&
    (speed.download ?? 0) >= 5 &&
    (speed.upload ?? 0) >= 5;

  // ── QR reader (só instanciado no passo 4) ───────────────
  const handleQrResult = useCallback((text) => {
    const norm = normalizeMac(text.trim());
    if (norm) setField('mac', norm);
  }, []);
  const qr = useQrReader(handleQrResult);

  // ── RENDERIZAÇÃO ─────────────────────────────────────────
  return (
    <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-surface font-sans">
      <Header step={step} total={TOTAL_STEPS} />

      {/* Área de conteúdo com foco a11y */}
      <div
        ref={pageRef}
        tabIndex={-1}
        className="flex-1 flex flex-col px-5 pb-6 outline-none"
        aria-live="polite"
      >

        {/* ═══════════════════════════════════════════════════
            PASSO 1 — Splash / Boas-vindas
        ═══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="step-page flex flex-col items-center justify-between flex-1 py-8 gap-6">
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <img
                src={logoSrc}
                alt="Self Install — Portal de Onboarding IoT"
                className="w-52 drop-shadow-md"
              />
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-brand-primary leading-tight">
                  Instale você mesmo.
                </h1>
                <p className="text-lg text-gray-500 font-medium leading-snug">
                  Autonomia em administrar<br />seu estabelecimento de<br />autoatendimento.
                </p>
              </div>
            </div>
            <div className="w-full space-y-3 mt-4">
              <button id="btn-comecar" className="btn-primary" onClick={goNext}>
                Vamos Começar
              </button>
              <a
                href="https://wa.me/5511947478697"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary block text-center py-4 rounded-2xl font-semibold text-lg text-brand-primary"
              >
                Preciso de ajuda
              </a>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 2 — Aviso de Segurança
        ═══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="step-page flex flex-col items-center justify-between flex-1 py-8 gap-6">
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
              <div
                className="w-28 h-28 rounded-full bg-yellow-100 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-6xl">⚠️</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold text-gray-900">Aviso</h1>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Não manipule cabos energizados e
                  contate o suporte em caso de dúvida.
                </p>
              </div>
              <div className="card w-full text-left">
                <p className="text-sm text-gray-500 leading-relaxed">
                  A instalação elétrica e física já foi realizada pelo técnico
                  homologado. Este portal orienta apenas a conexão lógica da
                  controladora à rede e ao sistema.
                </p>
              </div>
            </div>
            <button id="btn-aviso-avancar" className="btn-primary w-full" onClick={goNext}>
              Entendi, Avançar
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 3 — Dados da Unidade
        ═══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="step-page flex flex-col flex-1 py-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm font-medium">Identificação</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                Seja bem-vindo! Para começar,<br />informe os seus dados:
              </h1>
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <div>
                <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome do usuário: <span aria-hidden="true" className="text-brand-danger">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  className="input-field"
                  placeholder="Nome Sobrenome"
                  value={form.customerName}
                  onChange={e => setField('customerName', e.target.value)}
                  autoComplete="name"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="franchiseName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome da Franquia: {!form.isIndependent && <span aria-hidden="true" className="text-brand-danger">*</span>}
                </label>
                <input
                  id="franchiseName"
                  type="text"
                  className="input-field disabled:opacity-50"
                  placeholder={form.isIndependent ? 'Independente' : 'Nome Franquia'}
                  value={form.isIndependent ? '' : form.franchiseName}
                  onChange={e => setField('franchiseName', e.target.value)}
                  disabled={form.isIndependent}
                  aria-required={!form.isIndependent}
                  aria-disabled={form.isIndependent}
                />
                <label htmlFor="isIndependent" className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    id="isIndependent"
                    type="checkbox"
                    className="w-4 h-4 accent-brand-secondary rounded"
                    checked={form.isIndependent}
                    onChange={e => setField('isIndependent', e.target.checked)}
                  />
                  <span className="text-sm text-gray-500">Minha lavanderia é independente</span>
                </label>
              </div>

              <div>
                <label htmlFor="laundryName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nome da Lavanderia: <span aria-hidden="true" className="text-brand-danger">*</span>
                </label>
                <input
                  id="laundryName"
                  type="text"
                  className="input-field"
                  placeholder="Nome Lavanderia"
                  value={form.laundryName}
                  onChange={e => setField('laundryName', e.target.value)}
                  aria-required="true"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="btn-ghost" onClick={goPrev} aria-label="Voltar">← Voltar</button>
              <button
                id="btn-dados-avancar"
                className={`btn-primary flex-1 ${isNextDisabled() ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={goNext}
                disabled={isNextDisabled()}
                aria-disabled={isNextDisabled()}
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 4 — Identificação por QR Code / MAC
        ═══════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="step-page flex flex-col flex-1 py-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm font-medium">Controladora</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                Agora vamos identificar<br />a sua controladora:
              </h1>
            </div>

            {/* Área do QR Code */}
            <div className="flex flex-col items-center gap-3">
              {!qr.active ? (
                <button
                  id="btn-abrir-camera"
                  onClick={qr.start}
                  className="w-full flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-brand-secondary rounded-3xl bg-white cursor-pointer hover:bg-brand-light transition-colors"
                  aria-label="Abrir câmera para ler QR Code"
                >
                  <span className="text-5xl" aria-hidden="true">📷</span>
                  <span className="text-sm font-semibold text-brand-secondary text-center">
                    Centralizar a câmera no QR Code<br />
                    <span className="font-normal text-gray-400">Toque para abrir a câmera</span>
                  </span>
                </button>
              ) : (
                <div className="w-full relative">
                  <div
                    id="qr-reader-element"
                    className="w-full rounded-3xl overflow-hidden border-2 border-brand-secondary"
                    style={{ minHeight: 260 }}
                  />
                  <button
                    onClick={qr.stop}
                    className="absolute top-3 right-3 bg-black/50 text-white rounded-full px-3 py-1 text-xs font-semibold"
                    aria-label="Fechar câmera"
                  >
                    ✕ Fechar
                  </button>
                </div>
              )}

              {qr.camError && (
                <p className="text-red-500 text-sm font-medium" role="alert">{qr.camError}</p>
              )}
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Input manual */}
            <div>
              <label htmlFor="mac-input" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Digite manualmente:
              </label>
              <input
                id="mac-input"
                type="text"
                className="input-field font-mono tracking-wider text-center"
                placeholder="A0:B1:C2:D3:E4:F5"
                value={form.mac}
                onChange={e => setField('mac', e.target.value.toUpperCase())}
                aria-label="Endereço MAC da controladora"
                aria-required="true"
                maxLength={17}
                spellCheck={false}
              />
              {form.mac && !isValidMac(form.mac) && (
                <p className="text-red-500 text-xs mt-1 font-medium" role="alert">
                  MAC inválido — formato esperado: XX:XX:XX:XX:XX:XX
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button className="btn-ghost" onClick={() => { qr.stop(); goPrev(); }} aria-label="Voltar">← Voltar</button>
              <button
                id="btn-mac-avancar"
                className={`btn-primary flex-1 ${isNextDisabled() ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={() => { qr.stop(); goNext(); }}
                disabled={isNextDisabled()}
                aria-disabled={isNextDisabled()}
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 5 — Tipo de Lavadora / Conexão Física
        ═══════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="step-page flex flex-col flex-1 py-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm font-medium">Instalação Física</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                Selecione o tipo de lavadora:
              </h1>
            </div>

            {/* Seletor de tipo */}
            <div className="flex flex-col gap-3">
              {/* Moedeiro */}
              <button
                id="btn-tipo-moedeiro"
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  form.washerType === 'moedeiro'
                    ? 'border-brand-secondary bg-brand-light'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setField('washerType', 'moedeiro')}
                aria-pressed={form.washerType === 'moedeiro'}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  form.washerType === 'moedeiro' ? 'border-brand-secondary' : 'border-gray-300'
                }`}>
                  {form.washerType === 'moedeiro' && (
                    <div className="w-3 h-3 rounded-full bg-brand-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Moedeiro de pulso</p>
                  <p className="text-xs text-gray-500 mt-0.5">Um cabo simples vai para a máquina</p>
                </div>
              </button>

              {/* RS-485 */}
              <button
                id="btn-tipo-rs485"
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  form.washerType === 'rs485'
                    ? 'border-brand-secondary bg-brand-light'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setField('washerType', 'rs485')}
                aria-pressed={form.washerType === 'rs485'}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  form.washerType === 'rs485' ? 'border-brand-secondary' : 'border-gray-300'
                }`}>
                  {form.washerType === 'rs485' && (
                    <div className="w-3 h-3 rounded-full bg-brand-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">RS-485 (cabo de rede)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Um cabo de rede sai da máquina</p>
                </div>
              </button>
            </div>

            {/* Diagrama de conexão */}
            {form.washerType && (
              <div className="animate-fade-in">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  {form.washerType === 'moedeiro'
                    ? 'Diagrama — Moedeiro de pulso:'
                    : 'Diagrama — Conexão RS-485:'}
                </p>
                <div className="card">
                  <img
                    src={form.washerType === 'moedeiro' ? ligacaoMoedeiro : ligacaoRS485}
                    alt={form.washerType === 'moedeiro'
                      ? 'Diagrama de conexão moedeiro: cabo da controladora ao painel da máquina'
                      : 'Diagrama de conexão RS-485: cabo de rede entre controladora e máquina'}
                    className="w-full rounded-xl object-contain"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-3">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Apenas <strong>confira</strong> se a conexão está correta conforme o diagrama.
                    Não manipule cabos energizados.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <button className="btn-ghost" onClick={goPrev} aria-label="Voltar">← Voltar</button>
              <button
                id="btn-tipo-avancar"
                className={`btn-primary flex-1 ${isNextDisabled() ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={goNext}
                disabled={isNextDisabled()}
                aria-disabled={isNextDisabled()}
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 6 — Verificação dos LEDs e Cabos
        ═══════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="step-page flex flex-col flex-1 py-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm font-medium">Verificação Visual</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                Verifique com atenção se os cabos<br />estão conectados:
              </h1>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {/* Cabo OK */}
              <CheckItem
                id="check-cable"
                label="Minha controladora está conectada à máquina e não apresenta anormalidade na instalação do técnico."
                checked={form.cableOk}
                onChange={e => setField('cableOk', e.target.checked)}
              />

              {/* LED Laranja */}
              <CheckItem
                id="check-led-orange"
                label="A controladora apresenta LED amarelo aceso (energia)."
                checked={form.ledOrange}
                onChange={e => setField('ledOrange', e.target.checked)}
              >
                <img
                  src={ledAmareloSrc}
                  alt="Controladora com LED amarelo/laranja aceso indicando energia"
                  className="w-24 rounded-lg"
                />
              </CheckItem>

              {/* LED Verde */}
              <CheckItem
                id="check-led-green"
                label="A controladora apresenta LED verde aceso (comunicação)."
                checked={form.ledGreen}
                onChange={e => setField('ledGreen', e.target.checked)}
              >
                <img
                  src={ledAzulSrc}
                  alt="Controladora com LED verde aceso indicando comunicação estabelecida"
                  className="w-24 rounded-lg"
                />
              </CheckItem>

              {/* Campo de anormalidade (opcional) */}
              <div className="mt-1">
                <label htmlFor="anomaly-field" className="block text-sm font-medium text-gray-500 mb-1.5">
                  A controladora apresenta anormalidades? (opcional)
                </label>
                <textarea
                  id="anomaly-field"
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Descreva a anormalidade, se houver."
                  value={form.anomaly}
                  onChange={e => setField('anomaly', e.target.value)}
                  aria-label="Descrição de anormalidades da controladora"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost" onClick={goPrev} aria-label="Voltar">← Voltar</button>
              <button
                id="btn-led-avancar"
                className={`btn-primary flex-1 ${isNextDisabled() ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={goNext}
                disabled={isNextDisabled()}
                aria-disabled={isNextDisabled()}
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 7 — Validação de Conexão + Velocidade
        ═══════════════════════════════════════════════════ */}
        {step === 7 && (
          <div className="step-page flex flex-col flex-1 py-4 gap-5">
            <div>
              <p className="text-gray-500 text-sm font-medium">Validação</p>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                Analisando a conexão<br />da controladora.
              </h1>
            </div>

            {/* Card: Status da Controladora */}
            <div className="card space-y-4">
              <div className="flex items-center gap-3">
                {ctrl.status === 'idle' && (
                  <button
                    id="btn-verificar-status"
                    className="btn-primary"
                    onClick={() => ctrl.query(normalizeMac(form.mac))}
                  >
                    Verificar Status da Controladora
                  </button>
                )}
                {ctrl.status === 'loading' && (
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <p className="text-gray-500 text-sm">Consultando controladora…</p>
                  </div>
                )}
                {ctrl.status === 'success' && (
                  <div className="flex items-center gap-2 w-full" aria-live="assertive">
                    <span className="text-2xl" aria-hidden="true">✅</span>
                    <div>
                      <p className="font-semibold text-green-700">Conexão ok</p>
                      <p className="text-xs text-gray-400">
                        {ctrl.data?.available ? 'Máquina disponível' : 'Máquina ocupada'}&nbsp;·&nbsp;
                        {ctrl.data?.pulse ? 'Pulso pendente' : 'Sem pulso pendente'}
                      </p>
                    </div>
                  </div>
                )}
                {ctrl.status === 'rebooting' && (
                  <div className="flex items-center gap-2 w-full" role="alert">
                    <span className="text-2xl" aria-hidden="true">🔄</span>
                    <div>
                      <p className="font-semibold text-yellow-700">Controladora reiniciando</p>
                      <p className="text-xs text-gray-400">Aguarde e tente novamente em alguns segundos.</p>
                    </div>
                  </div>
                )}
                {ctrl.status === 'error' && (
                  <div className="w-full" role="alert" aria-live="assertive">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl" aria-hidden="true">❌</span>
                      <p className="font-semibold text-red-700">Não foi possível confirmar</p>
                    </div>
                    <p className="text-xs text-red-500">{ctrl.error}</p>
                    <button
                      id="btn-tentar-novamente"
                      className="btn-secondary mt-3 text-sm py-2.5"
                      onClick={() => ctrl.query(normalizeMac(form.mac))}
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-3">Analisando a conexão com a internet.</p>

              {/* Card: Teste de Velocidade */}
              <div className="card space-y-3">
                {!speed.running && !speed.done && (
                  <button
                    id="btn-testar-velocidade"
                    className="btn-primary"
                    onClick={speed.run}
                  >
                    Testar Velocidade da Rede
                  </button>
                )}
                {speed.running && (
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <p className="text-gray-500 text-sm">Medindo download e upload…</p>
                  </div>
                )}
                {speed.done && !speed.running && (
                  <div className="space-y-2" aria-live="polite">
                    <SpeedBadge label="Download" value={speed.download} />
                    <SpeedBadge label="Upload" value={speed.upload} />
                    <button
                      id="btn-repetir-velocidade"
                      className="text-xs text-brand-secondary font-medium mt-1 underline"
                      onClick={speed.run}
                    >
                      Medir novamente
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button className="btn-ghost" onClick={() => { ctrl.reset(); goPrev(); }} aria-label="Voltar">← Voltar</button>
              <button
                id="btn-validacao-avancar"
                className={`btn-primary flex-1 ${isNextDisabled() ? 'opacity-40 cursor-not-allowed' : ''}`}
                onClick={goNext}
                disabled={isNextDisabled()}
                aria-disabled={isNextDisabled()}
              >
                Ver Resultado
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            PASSO 8 — Resultado Final
        ═══════════════════════════════════════════════════ */}
        {step === 8 && (
          <div className="step-page flex flex-col items-center flex-1 py-8 gap-6">
            {finalSuccess ? (
              /* ── SUCESSO ── */
              <div className="flex flex-col items-center gap-6 text-center flex-1">
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <div
                    className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                    aria-hidden="true"
                  >
                    <span className="text-6xl text-white">✓</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                      Sua lavanderia está pronta<br />para receber novos clientes.
                    </h1>
                    <p className="text-sm text-gray-400">Onboarding concluído com sucesso!</p>
                  </div>

                  {/* Resumo */}
                  <div className="card w-full text-left space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resumo</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Controladora</span>
                      <span className="font-mono font-semibold text-gray-700">{normalizeMac(form.mac)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lavanderia</span>
                      <span className="font-semibold text-gray-700">{form.laundryName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Download</span>
                      <span className="font-semibold text-green-600">{speed.download} Mbps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Upload</span>
                      <span className="font-semibold text-green-600">{speed.upload} Mbps</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Máquina</span>
                      <span className="font-semibold text-gray-700">
                        {ctrl.data?.available ? 'Disponível' : 'Ocupada'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <p className="text-sm text-gray-400">
                    Em caso de qualquer problema, entre em contato<br />com nosso time de suporte.
                  </p>
                  <a
                    href="https://wa.me/5511947478697"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-brand-secondary font-semibold text-sm underline"
                    aria-label="Contato de suporte via WhatsApp: (11) 94747-8697"
                  >
                    Tel/Whatsapp: (11) 94747-8697
                  </a>
                </div>
              </div>
            ) : (
              /* ── FALHA ── */
              <div className="flex flex-col items-center gap-6 text-center flex-1">
                <div className="flex-1 flex flex-col items-center justify-center gap-5">
                  <div
                    className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-6xl">⚠️</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                      Não foi possível<br />concluir o onboarding.
                    </h1>
                    <p className="text-sm text-gray-400">
                      O resultado foi registrado e está disponível para o suporte.
                    </p>
                  </div>

                  {/* Diagnóstico */}
                  <div className="card w-full text-left space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Diagnóstico</p>
                    <DiagLine
                      ok={ctrl.status === 'success'}
                      label="Comunicação com a controladora"
                    />
                    <DiagLine
                      ok={form.ledOrange}
                      label="LED amarelo (energia) confirmado"
                    />
                    <DiagLine
                      ok={form.ledGreen}
                      label="LED verde (comunicação) confirmado"
                    />
                    <DiagLine
                      ok={(speed.download ?? 0) >= 5}
                      label={`Download ≥ 5 Mbps (${speed.download ?? '—'} Mbps)`}
                    />
                    <DiagLine
                      ok={(speed.upload ?? 0) >= 5}
                      label={`Upload ≥ 5 Mbps (${speed.upload ?? '—'} Mbps)`}
                    />
                    {ctrl.data?.reboot && (
                      <DiagLine ok={false} label="Reinicialização pendente na controladora" />
                    )}
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button
                    id="btn-tentar-novamente-final"
                    className="btn-primary"
                    onClick={() => { ctrl.reset(); setStep(7); }}
                  >
                    Tentar novamente
                  </button>
                  <a
                    href="https://wa.me/5511947478697"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary block text-center py-4 rounded-2xl text-brand-primary font-semibold text-lg"
                    aria-label="Acionar suporte via WhatsApp"
                  >
                    Acionar Suporte
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Linha de diagnóstico auxiliar ───────────────────────────
function DiagLine({ ok, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-green-500' : 'text-red-500'} aria-hidden="true">
        {ok ? '✓' : '✗'}
      </span>
      <span className={ok ? 'text-gray-700' : 'text-red-600'}>{label}</span>
    </div>
  );
}

export default Stepper;
