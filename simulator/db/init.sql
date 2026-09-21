-- Cria a tabela que representa a única controladora do MVP.
CREATE TABLE IF NOT EXISTS controllers (
  -- Guarda o MAC como identificador único da controladora.
  mac_address VARCHAR(17) PRIMARY KEY,
  -- Guarda um nome amigável para exibição e documentação.
  model VARCHAR(80) NOT NULL DEFAULT 'Controladora IoT',
  -- Guarda se a resposta atual solicita pulso operacional.
  pulse_requested BOOLEAN NOT NULL DEFAULT FALSE,
  -- Guarda se a resposta atual solicita reinicialização.
  reboot_requested BOOLEAN NOT NULL DEFAULT FALSE,
  -- Guarda se a máquina está disponível para uso.
  machine_available BOOLEAN NOT NULL DEFAULT TRUE,
  -- Registra a última vez em que o estado foi atualizado.
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Registra a criação do cadastro.
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Registra a última alteração do cadastro.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cria a tabela de registros das tentativas feitas pelo cliente.
CREATE TABLE IF NOT EXISTS onboarding_attempts (
  -- Cria um identificador numérico para cada tentativa.
  id BIGSERIAL PRIMARY KEY,
  -- Associa a tentativa ao MAC da controladora cadastrada.
  controller_mac VARCHAR(17) NOT NULL REFERENCES controllers(mac_address),
  -- Armazena o nome informado pelo cliente.
  customer_name VARCHAR(120) NOT NULL,
  -- Armazena a franquia informada.
  franchise_name VARCHAR(120) NOT NULL,
  -- Armazena o nome da lavanderia.
  laundry_name VARCHAR(120) NOT NULL,
  -- Registra a confirmação do LED laranja feita pelo cliente.
  power_led_confirmed BOOLEAN NOT NULL,
  -- Registra a confirmação do LED verde feita pelo cliente.
  communication_led_confirmed BOOLEAN NOT NULL,
  -- Copia o valor de pulso recebido da integração.
  pulse_requested BOOLEAN NOT NULL,
  -- Copia o valor de reinicialização recebido da integração.
  reboot_requested BOOLEAN NOT NULL,
  -- Copia a disponibilidade recebida da integração.
  machine_available BOOLEAN NOT NULL,
  -- Registra se o onboarding foi concluído ou ficou pendente.
  result VARCHAR(20) NOT NULL,
  -- Explica a causa da pendência, quando existir.
  failure_reason VARCHAR(80),
  -- Armazena a velocidade de download medida no celular.
  download_mbps NUMERIC(10,2) NOT NULL,
  -- Armazena a velocidade de upload medida no celular.
  upload_mbps NUMERIC(10,2) NOT NULL,
  -- Registra quantas consultas foram usadas na validação.
  request_attempts SMALLINT NOT NULL,
  -- Registra o instante UTC em que a tentativa foi criada.
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insere a controladora usada na demonstração se ela ainda não existir.
INSERT INTO controllers (mac_address, model, pulse_requested, reboot_requested, machine_available)
-- Define um MAC de exemplo e o estado inicial saudável da simulação.
VALUES ('00:1B:44:11:3A:B7', 'Controladora IoT simulada', FALSE, FALSE, TRUE)
-- Evita duplicação se o banco já tiver sido inicializado.
ON CONFLICT (mac_address) DO NOTHING;
