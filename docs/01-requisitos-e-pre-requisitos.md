# Self Install — Requisitos e Pré-requisitos

## 1. Propósito e limites

O **Self Install** é um portal web de orientação para o proprietário/franqueado concluir a etapa de instalação e conexão de uma controladora IoT de lavanderia já instalada fisicamente por técnico homologado. Ao final, o portal consulta uma nuvem **simulada localmente** e informa se o dispositivo se comunicou com sucesso.

O produto é um protótipo acadêmico. Ele **não** controla máquinas, não muda configurações reais de equipamentos, não acessa serviços ou credenciais da empresa parceira e não substitui suporte técnico ou instalação elétrica.

A controladora se conecta à máquina por um cabo Micro-Fit de seis vias, usando a interface de moedeiro tradicional: envia um pulso de ativação e recebe sinal contínuo quando a máquina está ocupada. O portal apenas orienta e valida o resultado dessa ligação; não deve acionar diretamente a máquina.

O funcionamento interno da controladora e a API operacional da empresa permanecem fora do escopo do portal. Este projeto simula somente o comportamento necessário para demonstrar o onboarding.

### Problema atendido

Clientes não técnicos erram ao energizar a controladora, conectá-la à rede e validar a comunicação, o que aumenta chamados de suporte. O portal deve reduzir essa incerteza com instruções claras, acessíveis e uma confirmação objetiva de conectividade.

## 2. Evidências já confirmadas

Estas informações foram extraídas do Plano de Ação do projeto:

- Interface responsiva em React e JavaScript, com foco em acessibilidade.
- API local simulada, banco SQL e ambiente executável em Docker.
- A controladora e a parte elétrica são preexistentes; o escopo começa após a instalação técnica.
- A controladora é identificada pelo MAC; o QR Code, quando usado, apenas representa esse mesmo MAC.
- O QR Code contém somente o MAC. Uma controladora pode atender lavadora e secadora.
- A controladora trabalha com dois canais de máquina: lavadora e secadora. Eles definem onde o pulso de ativação será aplicado, mas não fazem parte do MAC apresentado ao cliente.
- A comunicação entre portal/API e controladora é feita pelo protocolo HTTP.
- Há dois indicadores físicos: LED laranja (controladora ligada) e LED verde (comunicação estabelecida).
- A integração de produção troca JSON com uma API hospedada no Azure e documentada por Swagger/OpenAPI. O protótipo acadêmico deve simular esse contrato, sem utilizar credenciais reais.
- A resposta JSON da integração é fixa e contém somente três informações: solicitação de pulso, solicitação de reinicialização e disponibilidade da máquina. O portal não pode acrescentar campos a essa resposta.
- A recomendação operacional de conexão é 10 Mbps. O portal deve indicar **reprovada** abaixo de 5 Mbps, **adequada** entre 5 e menos de 10 Mbps, e **recomendada** a partir de 10 Mbps.
- O fluxo esperado aborda identificação do equipamento, conexão física orientada, rede Wi-Fi e validação lógica.

## 3. Perfis envolvidos

| Perfil | Responsabilidade | Permissões no MVP |
| --- | --- | --- |
| Cliente/franqueado | Executa o passo a passo da sua instalação. | Informa nome, franquia e lavanderia; inicia a validação e consulta o dispositivo pelo MAC. |
| Técnico homologado | Instala previamente hardware e cabos. | Fora do portal no MVP, salvo se o grupo decidir criar tela de preparação. |
| Suporte | Atua quando o roteiro não resolve. | Consulta de tentativas e orientações de diagnóstico — opcional no MVP. |
| Simulador IoT | Representa a resposta da integração da controladora. | Retorna o contrato JSON fixo à API. |

## 4. Fluxo funcional proposto

1. O usuário abre o portal e recebe aviso de segurança: não manipular cabos energizados e contatar suporte em caso de dúvida.
2. Preenche nome, franquia e nome da lavanderia.
3. Informa o MAC manualmente ou o lê pelo QR Code correspondente.
4. O portal explica a ligação do cabo Micro-Fit de seis vias à interface de moedeiro, inclusive o pulso de ativação e o sinal de máquina ocupada, com conteúdo visual aprovado e aviso de segurança.
5. O portal consulta via HTTP a simulação equivalente à API da empresa e recebe o JSON estabelecido para a controladora.
6. O usuário inicia o teste de conexão no celular, conectado à mesma rede da controladora. O portal mede download e upload pelo tempo de execução de transferências de teste.
7. O portal interpreta o JSON e o teste de velocidade, mostra o resultado e grava o log associado ao MAC e à unidade informada.
8. Em falha, o resultado fica disponível no banco interno para análise pelo suporte.

## 5. Requisitos funcionais (rascunho para validação)

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | Exibir um roteiro sequencial de instalação. | Usuário vê etapa atual, instrução, progresso e botões Voltar/Avançar. |
| RF-02 | Coletar os dados da unidade. | Antes da validação, o usuário informa nome, franquia e nome da lavanderia. |
| RF-03 | Identificar a controladora por MAC. | Sistema aceita MAC válido digitado ou extraído do QR Code e informa quando não há dispositivo disponível. |
| RF-04 | Orientar a conexão com a máquina. | Portal explica em linguagem simples a conexão Micro-Fit de seis vias e os sinais de pulso de ativação/ocupação, sem instruções elétricas não autorizadas. O usuário deve somente conferir se a ligação está correta|
| RF-05 | Consultar o estado atual via HTTP. | A interface apresenta carregamento e recebe exatamente a resposta JSON estabelecida pela API, sem adicionar campos. Falha HTTP, timeout ou JSON inválido indicam que não foi possível confirmar comunicação. |
| RF-06 | Coletar a conferência dos indicadores físicos. | O usuário informa no formulário se o LED laranja (energia) e o LED verde (comunicação) estão acesos. O portal explica os dois indicadores em texto acessível. |
| RF-07 | Executar teste de conexão no dispositivo do cliente. | Com o celular conectado à mesma rede da controladora, o sistema mede download e upload em Mbps e classifica ambos como reprovados abaixo de 5 Mbps, adequados entre 5 e menos de 10 Mbps e recomendados a partir de 10 Mbps. |
| RF-08 | Registrar resultado e log da validação. | O banco recebe MAC, dados da unidade, valores da resposta JSON, métricas de download/upload, resultado, motivo de falha e data/hora, sem senha de Wi-Fi. |
| RF-09 | Exibir orientação após o teste. | Sucesso encerra o onboarding; falha orienta o usuário e permanece disponível ao suporte no banco interno. |

## 6. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | A interface deve funcionar no Google Chrome para celular, com validação no viewport do iPhone 14 (390 × 844 px). |
| RNF-02 | O fluxo deve ser utilizável por teclado, ter foco visível, contraste adequado, rótulos em campos e mensagens anunciáveis por leitor de tela. Usar WCAG 2.2 AA como referência. |
| RNF-03 | A API deve responder em JSON e usar códigos HTTP coerentes; erros não podem expor stack trace ou segredos. |
| RNF-04 | Configurações e segredos ficam em variáveis de ambiente, nunca versionados. Para o protótipo, usar apenas valores locais não sensíveis. |
| RNF-05 | A execução local deve subir com um único comando Docker Compose e possuir instruções de parada, logs e reinicialização. |
| RNF-06 | Banco e API devem manter dados entre reinicializações por volume nomeado. |
| RNF-07 | O sistema deve ter testes mínimos para regras da API e fluxo principal de interface. |

## 7. Regras de negócio iniciais

- O MAC é o identificador único da controladora. Um QR Code só facilita sua captura e não cria outro identificador.
- O resultado de conectividade é confirmado quando a consulta HTTP retorna com sucesso uma resposta JSON válida. Falha HTTP, timeout ou JSON inválido significam que a comunicação não pôde ser confirmada.
- Uma validação é concluída com êxito quando a comunicação é confirmada, o usuário confirma os LEDs laranja e verde acesos, a resposta não indica reinicialização pendente e download e upload são maiores ou iguais a 5 Mbps.
- A classificação de velocidade é aplicada separadamente a download e upload: `REPROVADA` abaixo de 5 Mbps; `ADEQUADA` de 5 Mbps até menos de 10 Mbps; `RECOMENDADA` a partir de 10 Mbps.
- Quando a resposta indicar pulso pendente, o portal registra a informação e informa que existe uma ação operacional associada à máquina, sem enviar nem executar comandos.
- Quando a resposta indicar reinicialização pendente, o portal informa que a controladora está reiniciando, registra o evento e aguarda nova consulta antes de concluir o onboarding.
- A disponibilidade recebida define a mensagem da máquina: disponível para uso ou ocupada. Ela não altera o resultado do teste de velocidade.
- Quando não houver comunicação válida, o portal deve informar que a controladora está offline ou reconectando e orientar o cliente a aguardar ou acionar o suporte.
- A controladora verifica a comunicação com os canais de lavadora e secadora a cada 5 segundos. Os estados de sincronização são atualizados a cada 500 milissegundos.
- Depois de 7 falhas de conectividade, a controladora inicia uma nova tentativa de conexão. Depois de 13 falhas acumuladas, ela apaga os indicadores e reinicia. O simulador deve reproduzir os estados `RECONECTANDO`, `OFFLINE` e `REINICIANDO` para esses cenários.
- A conexão Wi-Fi é tentada uma vez por segundo. Após aproximadamente 31 tentativas consecutivas sem sucesso, a controladora reinicia.
- O dispositivo sincroniza o relógio pela internet, troca para uma fonte alternativa após 30 falhas e reinicia após aproximadamente 61 falhas. O backend deve registrar datas em UTC e o simulador local não pode depender de internet para operar.
- O portal e seu banco não devem receber, exibir ou persistir SSID/senha.
- O MAC precisa ser normalizado antes de persistir ou consultar (maiúsculas e formato único).
- Dados de Wi-Fi, senha, credenciais de produção e detalhes elétricos confidenciais não devem ser armazenados. Nome, franquia e lavanderia devem ser usados somente para rastreabilidade acadêmica/operacional do MVP.

## 8. Arquitetura de backend recomendada para estudo

Começar com um **monólito modular** é mais didático e adequado ao escopo: uma única API Node.js/Express, com módulos separados por responsabilidade. Microserviços acrescentariam complexidade sem benefício demonstrável neste MVP.

```text
React (navegador)
        | HTTP/JSON
API Express
  ├─ rotas/controladores  (HTTP e validação de entrada)
  ├─ serviços             (regras: status, teste de conexão e log)
  ├─ repositórios         (acesso ao PostgreSQL)
  └─ middleware           (erros, CORS, logs)
        |
PostgreSQL  <── Simulador IoT (endpoint interno de telemetria)
```

No ambiente real, a API Express pode atuar como uma camada de integração segura entre o navegador e a API Azure. No ambiente acadêmico, o simulador substitui a API Azure e retorna JSON no mesmo formato acordado. O navegador não deve conter chave ou URL confidencial da integração real.

Estrutura sugerida:

```text
backend/src/
  app.js                 # composição do Express
  server.js              # inicialização e encerramento
  routes/
  controllers/
  services/
  repositories/
  middlewares/
  schemas/               # validação de payloads
  config/
  db/migrations/
  tests/
```

Não deixar SQL, regra de sucesso e detalhes de HTTP no mesmo arquivo. O controlador recebe a requisição; o serviço decide a regra; o repositório executa SQL. Essa divisão torna os testes e a evolução do projeto mais claros.

### Dados mínimos

| Entidade | Campos principais |
| --- | --- |
| `controllers` | `id`, `mac_address`, `model`, `last_seen_at`, `created_at`, `updated_at` |
| `telemetry_events` | `id`, `controller_id`, `pulse_requested`, `reboot_requested`, `machine_available`, `received_at` |
| `onboarding_attempts` | `id`, `controller_id`, `customer_name`, `franchise_name`, `laundry_name`, `power_led_confirmed`, `communication_led_confirmed`, `pulse_requested`, `reboot_requested`, `machine_available`, `result`, `failure_reason`, `download_mbps`, `upload_mbps`, `created_at` |

Para o MVP, `controllers` e `onboarding_attempts` já demonstram o necessário. `telemetry_events` é recomendado se o grupo quiser mostrar histórico.

### Contrato inicial de API

| Método e rota | Finalidade | Resposta principal |
| --- | --- | --- |
| `GET /api/v1/controllers/:mac/status` | Consultar a simulação da integração. | Retorna exatamente o JSON estabelecido pela API (`200`). |
| `POST /api/v1/onboarding/validations` | Executar/registrar a validação com dados da unidade e métricas de conexão. | Resultado e log criado (`201`). |
| `GET /health` | Verificar se a API e banco estão disponíveis. | `{"status":"ok"}` (`200`). |

O contrato final deve ser publicado em OpenAPI/Swagger ou, pelo menos, em um arquivo Markdown com exemplos de request e response.

O contrato de resposta da consulta é imutável: `pulse`, `reboot` e `available`. Esses campos são booleanos e nenhum outro campo deve ser incluído na resposta da integração simulada.

### Comportamentos da controladora a simular

| Comportamento | Requisito para o simulador e portal |
| --- | --- |
| Sincronização | A controladora envia periodicamente sua identificação, versão e disponibilidade à nuvem e recebe uma resposta JSON. O simulador devolve exatamente os três valores estabelecidos no contrato. |
| Indicador de comunicação | Uma resposta HTTP bem-sucedida e JSON válido representam comunicação confirmada. Falha de resposta representa comunicação não confirmada. |
| Canais de máquina | Uma controladora pode atender lavadora e secadora. O onboarding consulta a controladora pelo MAC sem exigir que o cliente informe o canal. |
| Segurança operacional | O onboarding não envia comandos, pulsos, reinicializações ou configurações de Wi-Fi. Ele somente orienta, consulta status, testa conexão e grava logs. |
| Recuperação de rede | Enquanto a controladora tenta recuperar rede ou comunicação, o portal deve informar “reconectando” e evitar declarar sucesso até nova resposta válida. |

## 9. Contêineres e pré-requisitos técnicos

### Serviços do ambiente de desenvolvimento

| Serviço | Papel | Porta externa | Persistência |
| --- | --- | --- | --- |
| `frontend` (opcional no Compose em desenvolvimento) | React/Vite | 5173 | Código montado como volume, sem dados persistentes |
| `api` | API de onboarding e telemetria simulada | 3001 | Código montado somente em desenvolvimento |
| `db` | PostgreSQL | 5432 somente se for necessário acessar pelo host | Volume nomeado para os dados |

O simulador pode ser uma rota da própria API no MVP. Se ele virar um processo independente, deve receber o nome `device-simulator` e não acessar o banco diretamente: ele envia telemetria pela API, como um dispositivo real faria.

### Antes de escrever código

- [ ] Definir versão do Node LTS a ser usada por todos e registrá-la em `.nvmrc` ou `package.json`.
- [ ] Instalar Docker Desktop e confirmar `docker compose version`.
- [ ] Definir versões do PostgreSQL, Node, React e gerenciador de pacotes.
- [ ] Criar `.env.example` com nomes de variáveis sem valores reais; adicionar `.env` ao `.gitignore`.
- [ ] Decidir se o frontend fará parte do Compose no desenvolvimento ou será executado pelo Vite no host.
- [ ] Criar migration SQL versionada; não criar tabelas em código na inicialização da API.
- [ ] Criar healthcheck do banco e fazer a API aguardar o banco saudável.
- [ ] Definir nomes de estados, códigos de erro e respostas padronizadas.
- [ ] Obter a especificação Swagger/OpenAPI ou um exemplo anonimizado de request/response JSON da API Azure; reproduzir somente o contrato necessário no simulador.
- [ ] Implementar transferências de teste para medir download e upload no navegador do cliente, conectado à mesma rede da controladora.
- [ ] Definir uma massa simulada de uma única controladora, com cenários de resposta válida, falha de resposta, máquina disponível, máquina ocupada e reinicialização pendente; combinar cada cenário com velocidades reprovada, adequada e recomendada.
- [ ] Criar casos de teste e massa de dados simulada reproduzível.
- [ ] Registrar instruções de execução, logs, parada e remoção de dados locais.

### Evolução do Compose atual

O arquivo atual já sobe PostgreSQL e uma API, mas é material de aprendizagem. Antes de adotá-lo como base final, substituir senha fixa por variáveis de ambiente, incluir `healthcheck`, remover `container_name` (evita conflitos entre ambientes), preferir `npm ci` na imagem e separar a inicialização do esquema em migrations. Em produção, não publicar a porta do banco e não montar o código como volume.

## 10. Decisões consolidadas

1. A consulta à simulação retorna somente três valores: solicitação de pulso, solicitação de reinicialização e disponibilidade da máquina.
2. Download e upload são medidos separadamente no celular conectado à mesma rede da controladora.
3. As imagens serão adicionadas posteriormente em `public/images/onboarding`.
4. Em falha, o portal realiza até cinco tentativas e apresenta uma mensagem correspondente ao motivo.
5. O acesso não exige login; o cliente informa dados básicos da unidade e consulta pelo MAC.
6. O projeto guarda os dados necessários para descrever e demonstrar o produto final, respeitando a proibição de armazenar senha, SSID, segredos e comandos operacionais.
7. O MVP simula somente uma controladora.
8. A avaliação é feita no Google Chrome para celular, usando a proporção do iPhone 14.

## 11. Próximos artefatos após as respostas

1. Backlog priorizado (MVP x desejável) com histórias de usuário e critérios de aceite.
2. Diagrama de sequência do fluxo de telemetria e validação.
3. Modelo relacional e migrations.
4. Especificação OpenAPI da API.
5. Arquivos Docker, Compose, variáveis de ambiente e roteiro de execução.
6. Plano de testes funcional, integração, acessibilidade e falhas de rede.

## 12. Bibliotecas e dependências do frontend

Esta seção registra as bibliotecas efetivamente utilizadas na implementação do portal React/Vite, incluindo as adicionadas após a definição inicial dos requisitos.

### 12.1 Dependências de produção (`dependencies`)

| Biblioteca | Versão | Finalidade |
| --- | --- | --- |
| `react` | ^19.2.8 | Biblioteca principal de interface; modelo de componentes, estado e ciclo de vida. |
| `react-dom` | ^19.2.8 | Renderização do React no DOM do navegador. |
| `html5-qrcode` | ^2.3.8 | Leitura de QR Code via câmera do dispositivo (API `getUserMedia`). Utilizado no passo de identificação da controladora pelo MAC. Funciona em `localhost` sem HTTPS; em produção requer HTTPS. |

### 12.2 Dependências de desenvolvimento (`devDependencies`)

| Biblioteca | Versão | Finalidade |
| --- | --- | --- |
| `vite` | ^8.2.2 | Bundler e servidor de desenvolvimento. Comando de execução: `npm run dev`. |
| `@vitejs/plugin-react` | ^6.1.0 | Plugin Vite que habilita JSX e Fast Refresh para React. |
| `tailwindcss` | ^3.4.19 | Framework CSS utilitário. Utilizado para toda a estilização do portal no modelo mobile-first (viewport 390 × 844 px do iPhone 14). |
| `postcss` | ^8.5.26 | Processador CSS necessário para o pipeline do Tailwind CSS. |
| `autoprefixer` | ^10.5.4 | Plugin PostCSS que adiciona prefixos de vendor automaticamente para compatibilidade cross-browser. |
| `eslint` | ^10.9.0 | Linter de JavaScript/JSX para análise estática de código. |
| `eslint-plugin-react-hooks` | ^7.1.1 | Regras ESLint para uso correto dos React Hooks. |
| `eslint-plugin-react-refresh` | ^0.5.4 | Regras ESLint para compatibilidade com o Fast Refresh do Vite. |
| `@eslint/js` | ^10.0.1 | Configurações base do ESLint para JavaScript. |
| `globals` | ^17.11.0 | Definições de variáveis globais para configuração do ESLint. |
| `@types/react` | ^19.2.18 | Tipos TypeScript para React (auxilia IDEs com autocompletar). |
| `@types/react-dom` | ^19.2.4 | Tipos TypeScript para React DOM. |

### 12.3 Recurso externo de fonte tipográfica

| Recurso | Origem | Finalidade |
| --- | --- | --- |
| Inter (400, 500, 600, 700, 800) | Google Fonts CDN | Tipografia principal do portal. Carregada via `@import` no `index.css`. Não requer instalação de pacote npm. |

### 12.4 Observações de uso

- O arquivo `tailwind.config.js` foi configurado com cores da marca (`brand.primary`, `brand.secondary`, `brand.green`, `brand.orange`, `brand.danger`), fonte `Inter`, e animações customizadas (`slide-up`, `fade-in`, `pulse-led`).
- A leitura de QR Code (`html5-qrcode`) depende de permissão de câmera concedida pelo usuário no navegador. Em caso de negação, o portal exibe mensagem de erro e mantém a opção de entrada manual do MAC.
- O teste de velocidade (RF-07) é implementado via `fetch` cronometrado contra dois endpoints da API local (`GET /api/v1/speedtest/download` e `POST /api/v1/speedtest/upload`). Em ambiente sem a API, os valores retornam simulados para fins de demonstração.
- Nenhuma biblioteca de gerenciamento de estado global (Redux, Zustand, etc.) foi adicionada; o estado é gerenciado localmente com `useState` e `useRef` do React, adequado ao escopo do MVP.
