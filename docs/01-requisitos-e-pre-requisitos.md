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
- A recomendação operacional de conexão é 10 Mbps. O portal deve indicar **reprovada** abaixo de 5 Mbps, **adequada** entre 5 e menos de 10 Mbps, e **recomendada** a partir de 10 Mbps.
- O fluxo esperado aborda identificação do equipamento, conexão física orientada, rede Wi-Fi e validação lógica.

## 3. Perfis envolvidos

| Perfil | Responsabilidade | Permissões no MVP |
| --- | --- | --- |
| Cliente/franqueado | Executa o passo a passo da sua instalação. | Informa nome, franquia e lavanderia; inicia a validação e consulta o dispositivo pelo MAC. |
| Técnico homologado | Instala previamente hardware e cabos. | Fora do portal no MVP, salvo se o grupo decidir criar tela de preparação. |
| Suporte | Atua quando o roteiro não resolve. | Consulta de tentativas e orientações de diagnóstico — opcional no MVP. |
| Simulador IoT | Representa a controladora enviando telemetria. | Informa estado de conexão e LEDs à API. |

## 4. Fluxo funcional proposto

1. O usuário abre o portal e recebe aviso de segurança: não manipular cabos energizados e contatar suporte em caso de dúvida.
2. Preenche nome, franquia e nome da lavanderia.
3. Informa o MAC manualmente ou o lê pelo QR Code correspondente.
4. O portal explica a ligação do cabo Micro-Fit de seis vias à interface de moedeiro, inclusive o pulso de ativação e o sinal de máquina ocupada, com conteúdo visual aprovado e aviso de segurança.
5. O portal consulta via HTTP o status da controladora e exibe os estados esperados: ligada (LED laranja) e comunicação estabelecida (LED verde).
6. O usuário inicia o teste de conexão. O portal verifica a conexão com internet através de um download e upload e calcula sua velocidade através do tempo de execução. 
7. O portal mostra o resultado, a próxima ação e grava o log associado ao MAC e à unidade informada.
8. O portal verá através de uma simulação correspondente a API do portal da empresa.
8. Em falha, o resultado fica disponível no banco interno para análise pelo suporte.

## 5. Requisitos funcionais (rascunho para validação)

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | Exibir um roteiro sequencial de instalação. | Usuário vê etapa atual, instrução, progresso e botões Voltar/Avançar. |
| RF-02 | Coletar os dados da unidade. | Antes da validação, o usuário informa nome, franquia e nome da lavanderia. |
| RF-03 | Identificar a controladora por MAC. | Sistema aceita MAC válido digitado ou extraído do QR Code e informa quando não há dispositivo disponível. |
| RF-04 | Orientar a conexão com a máquina. | Portal explica em linguagem simples a conexão Micro-Fit de seis vias e os sinais de pulso de ativação/ocupação, sem instruções elétricas não autorizadas. O usuário deve somente conferir se a ligação está correta|
| RF-05 | Consultar o estado atual via HTTP. | A interface apresenta carregamento e recebe da API JSON `online` ou `offline`, mais os estados dos LEDs. |
| RF-06 | Exibir indicadores físicos. | O resultado informa LED laranja (energia) e LED verde (comunicação) de forma textual e acessível, não apenas por cor. |
| RF-07 | Executar teste de conexão. | O sistema registra a velocidade em Mbps e classifica como reprovada abaixo de 5 Mbps, adequada entre 5 e menos de 10 Mbps, e recomendada a partir de 10 Mbps. |
| RF-08 | Registrar telemetria e log da validação. | O banco recebe MAC, dados da unidade, resultado, LEDs, métricas, data/hora e motivo de falha, sem senha de Wi-Fi. |
| RF-09 | Exibir orientação após o teste. | Sucesso encerra o onboarding; falha orienta o usuário e permanece disponível ao suporte no banco interno. |

## 6. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | A interface deve funcionar em desktop e celular nas larguras definidas pelo grupo. |
| RNF-02 | O fluxo deve ser utilizável por teclado, ter foco visível, contraste adequado, rótulos em campos e mensagens anunciáveis por leitor de tela. Usar WCAG 2.2 AA como referência. |
| RNF-03 | A API deve responder em JSON e usar códigos HTTP coerentes; erros não podem expor stack trace ou segredos. |
| RNF-04 | Configurações e segredos ficam em variáveis de ambiente, nunca versionados. Para o protótipo, usar apenas valores locais não sensíveis. |
| RNF-05 | A execução local deve subir com um único comando Docker Compose e possuir instruções de parada, logs e reinicialização. |
| RNF-06 | Banco e API devem manter dados entre reinicializações por volume nomeado. |
| RNF-07 | O sistema deve ter testes mínimos para regras da API e fluxo principal de interface. |

## 7. Regras de negócio iniciais

- O MAC é o identificador único da controladora. Um QR Code só facilita sua captura e não cria outro identificador.
- O estado da controladora é determinado pela resposta HTTP mais recente obtida dela ou recebida pelo simulador.
- Uma validação só é bem-sucedida quando a controladora está `ONLINE`, o LED de energia está `ON` (laranja), o LED de comunicação está `ON` (verde) e a velocidade de conexão é maior ou igual a 5 Mbps.
- A classificação de velocidade é: `REPROVADA` abaixo de 5 Mbps; `ADEQUADA` de 5 Mbps até menos de 10 Mbps; `RECOMENDADA` a partir de 10 Mbps.
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
| `controllers` | `id`, `mac_address`, `model`, `connection_status`, `power_led`, `communication_led`, `last_seen_at`, `created_at`, `updated_at` |
| `telemetry_events` | `id`, `controller_id`, `connection_status`, `power_led`, `communication_led`, `received_at` |
| `onboarding_attempts` | `id`, `controller_id`, `customer_name`, `franchise_name`, `laundry_name`, `result`, `failure_reason`, `latency_ms`, `download_mbps`, `upload_mbps`, `created_at` |

Para o MVP, `controllers` e `onboarding_attempts` já demonstram o necessário. `telemetry_events` é recomendado se o grupo quiser mostrar histórico.

### Contrato inicial de API

| Método e rota | Finalidade | Resposta principal |
| --- | --- | --- |
| `POST /api/v1/simulator/controllers/:mac/telemetry` | Simular resposta/telemetria HTTP no formato JSON da integração Azure. | Controladora atualizada (`200`). |
| `GET /api/v1/controllers/:mac/status` | Consultar estado calculado para onboarding. | Estado, LEDs, atualização e próxima ação (`200`). |
| `POST /api/v1/onboarding/validations` | Executar/registrar a validação com dados da unidade e métricas de conexão. | Resultado e log criado (`201`). |
| `GET /health` | Verificar se a API e banco estão disponíveis. | `{"status":"ok"}` (`200`). |

O contrato final deve ser publicado em OpenAPI/Swagger ou, pelo menos, em um arquivo Markdown com exemplos de request e response.

### Comportamentos da controladora a simular

| Comportamento | Requisito para o simulador e portal |
| --- | --- |
| Sincronização | A controladora envia periodicamente sua identificação, versão e disponibilidade à nuvem e recebe uma resposta JSON. O simulador deve devolver somente os dados necessários ao onboarding. |
| Indicador de comunicação | Uma sincronização bem-sucedida representa a comunicação estabelecida; falhas repetidas levam a reconexão, indisponibilidade e reinicialização conforme os limites documentados. |
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
- [ ] Definir como a velocidade de conexão em Mbps será medida no ambiente simulado e usar o limite de aprovação de 5 Mbps.
- [ ] Definir um arquivo de massa simulada com controladoras online, offline, velocidade reprovada, adequada e recomendada.
- [ ] Criar casos de teste e massa de dados simulada reproduzível.
- [ ] Registrar instruções de execução, logs, parada e remoção de dados locais.

### Evolução do Compose atual

O arquivo atual já sobe PostgreSQL e uma API, mas é material de aprendizagem. Antes de adotá-lo como base final, substituir senha fixa por variáveis de ambiente, incluir `healthcheck`, remover `container_name` (evita conflitos entre ambientes), preferir `npm ci` na imagem e separar a inicialização do esquema em migrations. Em produção, não publicar a porta do banco e não montar o código como volume.

## 10. Decisões necessárias antes da implementação

1. Você pode fornecer o arquivo Swagger/OpenAPI ou exemplos anonimizados de request e response JSON da API Azure? Isso define o contrato exato do simulador.
Esse é o resultado 
{
    "pulse": false,
    "reboot": false,
    "available": true
}
2. Os 5/10 Mbps referem-se a download, upload, ambos ou a uma métrica única devolvida pela API? Para o MVP, assumimos uma métrica única em Mbps.
Sim ambos
3. Quais modelos/tipos de controladora e quais instruções/imagens são autorizados para cada um?
Irei anexar as imagens a uma pasta, crie somente a pasta que irei adicionar posteriormente 
4. O que ocorre após uma falha: quantas tentativas, qual mensagem e qual canal de suporte?
Tente 5 vezes, informe um erro correspondente.
5. Como o portal sem login impede ou aceita a consulta arbitrária de um MAC conhecido?
somente pelo MAC sem login, segue o principio de um preenchimento de formulario.
6. Quais dados podem ser guardados para o relatório acadêmico e por quanto tempo?
Todos os dados de projeto. Que descrevam o produto final.
7. O projeto precisa simular várias controladoras ao mesmo tempo? Qual cenário deve aparecer na demonstração?
Somente uma controladora
8. Em quais navegadores e tamanhos de tela o protótipo será avaliado?
Chrome, para celulares.

## 11. Próximos artefatos após as respostas

1. Backlog priorizado (MVP x desejável) com histórias de usuário e critérios de aceite.
2. Diagrama de sequência do fluxo de telemetria e validação.
3. Modelo relacional e migrations.
4. Especificação OpenAPI da API.
5. Arquivos Docker, Compose, variáveis de ambiente e roteiro de execução.
6. Plano de testes funcional, integração, acessibilidade e falhas de rede.
