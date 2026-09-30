# Instruções para Iniciar o Projeto — Lav Onboarding

> Portal de Onboarding IoT (Self Install) — React + Vite + Node.js + PostgreSQL

---

## Requisitos e Pré-requisitos

### 1. Pré-requisitos de Software

Dependendo de como você deseja executar a aplicação, os requisitos variam:

#### A. Para Execução Completa via Docker (Recomendado / Produção / Demonstração)
Se você apenas deseja rodar toda a aplicação (Frontend, Backend, Banco e Adminer) sem precisar compilar o código manualmente:
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado e em execução (com suporte a Docker Compose v2).
- **Git** para clonar o repositório.
*(Neste modo, não é necessário ter Node.js instalado na máquina hospedeira, pois o build é realizado dentro do container).*

#### B. Para Desenvolvimento Local (Hot-Reload do Frontend ou Backend)
Se você for alterar código do React ou depurar a API fora dos contêineres:
- **[Node.js](https://nodejs.org/)** v18.x ou v20.x+ (LTS recomendado).
- **npm** v9+ (instalado com o Node).
- Dependências instaladas localmente (`npm install` na raiz e dentro de `/simulator`).

#### C. Para Publicação na Nuvem (Microsoft Azure)
- Conta ativa no **Microsoft Azure**.
- **[Azure CLI](https://learn.microsoft.com/pt-br/cli/azure/install-azure-cli)** instalado (opcional, para deploys via terminal).
- Recurso de **Azure Container Apps**, **Web App for Containers** ou **Azure API Management** configurado.

---

### 2. Requisitos de Rede e Portas do Sistema

Certifique-se de que as seguintes portas locais estejam liberadas (não ocupadas por outros serviços):

| Porta  | Serviço               | Utilização                                      |
|--------|-----------------------|-------------------------------------------------|
| `8081` | **Frontend (Docker)** | Acesso ao site em produção via Nginx            |
| `5173` | **Frontend (Vite)**   | Acesso ao site em modo de desenvolvimento local |
| `3001` | **API Simuladora**    | Endpoints REST e documentação Swagger           |
| `8080` | **Adminer**           | Interface gráfica web para o PostgreSQL         |
| `5432` | **PostgreSQL**        | Conexão direta com o banco de dados             |

---

### 3. Requisitos de Hardware e Navegador

- **Hardware Mínimo:** 4 GB de memória RAM (8 GB recomendado para rodar Docker Desktop e IDE conjuntamente) e 5 GB de espaço livre em disco.
- **Navegador Web:** Google Chrome, Microsoft Edge ou Mozilla Firefox atualizados.
- **Permissão de Câmera:** Necessária no navegador caso vá utilizar a leitura de QR Code do MAC da controladora via webcam/smartphone.

---

## Estrutura dos Serviços

| Serviço             | Container              | Porta  | Descrição                        |
|---------------------|------------------------|--------|----------------------------------|
| **PostgreSQL**      | `iot_postgres`         | `5432` | Banco de dados principal         |
| **API Node.js**     | `iot_simulator_api`    | `3001` | API simuladora (mock)            |
| **Adminer**         | *(adminer)*            | `8080` | Interface web para o banco       |
| **Frontend Docker** | `iot_webapp`           | `8081` | Site em produção (Nginx)         |
| **Frontend React**  | *(local, via Vite)*    | `5173` | Site de onboarding (dev)         |

---

## 1. Iniciar os Serviços do Docker (Banco de Dados e API)

Abra um terminal na raiz do projeto e execute:

```bash
docker-compose up -d
```

> **Nota:** A flag `-d` roda os contêineres em segundo plano *(detached mode)*. Para visualizar os logs em tempo real, omita o `-d`:
> ```bash
> docker-compose up
> ```

Após subir, os seguintes serviços estarão disponíveis:

- **Frontend Docker (Nginx)** → [http://localhost:8081](http://localhost:8081)
- **API Node.js** → [http://localhost:3001](http://localhost:3001)
- **Documentação Swagger (UI)** → [http://localhost:3001/api-docs](http://localhost:3001/api-docs) (ou `/docs`)
- **Especificação OpenAPI / Azure** → [http://localhost:3001/swagger.json](http://localhost:3001/swagger.json)
- **Adminer** (gerenciador do banco) → [http://localhost:8080](http://localhost:8080)
- **PostgreSQL** → `localhost:5432`

---

## 2. Iniciar o Frontend (React + Vite)

Em outro terminal, na raiz do projeto, execute:

```bash
npm run dev
```

O site ficará acessível em: [http://localhost:5173](http://localhost:5173)

---

## Comandos Docker Úteis

```bash
# Listar todos os contêineres em execução
docker ps

# Parar um contêiner específico (ex: banco de dados)
docker stop iot_postgres

# Parar a API simuladora
docker stop iot_simulator_api

# Parar e remover contêineres (mantém os dados do banco)
docker-compose down

# Reset completo do ambiente (remove contêineres E apaga os volumes do banco)
docker-compose down -v

# Reiniciar tudo do zero aplicando novas migrações/scripts de init.sql
docker-compose down -v && docker-compose up -d

# Reconstruir imagens após alterar Dockerfile ou dependências da API
docker-compose up -d --build

# Ver logs de um serviço específico
docker-compose logs -f simulator-api
docker-compose logs -f db
```

---

## Credenciais do Banco de Dados

| Campo      | Valor           |
|------------|-----------------|
| **Host**   | `localhost`     |
| **Porta**  | `5432`          |
| **Usuário**| `admin`         |
| **Senha**  | `password123`   |
| **Banco**  | `iot_simulator` |

> Para acessar via Adminer, abra [http://localhost:8080](http://localhost:8080) e use as credenciais acima com o sistema **PostgreSQL**.

---

## Estrutura do Projeto

```
Lav Onboarding/
├── src/
│   ├── components/
│   │   └── Stepper.jsx       # Componente principal do fluxo de onboarding
│   ├── App.jsx               # Componente raiz
│   ├── index.css             # Estilos globais (Tailwind)
│   └── App.css               # Estilos do App
├── simulator/                # Código da API Node.js (Mock IoT)
│   ├── db/
│   │   └── init.sql          # Script de inicialização do banco
│   ├── Dockerfile            # Imagem Docker da API
│   ├── package.json          # Dependências da API (express, pg, swagger-ui-express)
│   ├── server.js             # Servidor Express com endpoints e Swagger
│   └── swagger.json          # Especificação OpenAPI 3.0 para documentação e Azure
├── docs/                     # Documentação adicional
├── .dockerignore             # Arquivos ignorados no build Docker do frontend
├── docker-compose.yml        # Orquestração de todos os serviços
├── Dockerfile                # Build multi-stage do frontend com Nginx Alpine
├── nginx.conf                # Configuração do Nginx (suporte a SPA)
├── package.json              # Dependências do frontend
└── vite.config.js            # Configuração do Vite
```

---

## Documentação da API com Swagger (OpenAPI) & Azure

A API do simulador possui documentação interativa em conformidade com o padrão **OpenAPI 3.0**, permitindo testes locais e importação automática para o Azure.

### Endpoints Disponíveis:
- **Interface Interativa (Swagger UI):** [http://localhost:3001/api-docs](http://localhost:3001/api-docs) ou `/docs`
- **Arquivo de Configuração OpenAPI (JSON):** [http://localhost:3001/swagger.json](http://localhost:3001/swagger.json)

### Como o Azure lê automaticamente:
1. **Azure API Management (APIM):**
   - Ao criar uma nova API no portal do Azure, selecione a opção **OpenAPI**.
   - No campo **OpenAPI specification**, insira a URL pública da sua API no Azure apontando para o endpoint do Swagger:
     `https://<sua-api-no-azure>.azurewebsites.net/swagger.json`
   - O Azure fará a leitura automática de todas as rotas, tipos de dados e payloads, gerando a documentação e o Developer Portal instantaneamente.
2. **Azure Container Apps / App Service:**
   - O arquivo `simulator/swagger.json` é embutido na imagem do container.
   - Assim que o container sobe no Azure, a rota `/swagger.json` e a interface `/api-docs` ficam ativas sem necessidade de qualquer configuração manual adicional.

---

## Scripts Disponíveis (`npm`)

| Comando          | Descrição                                  |
|------------------|--------------------------------------------|
| `npm run dev`    | Inicia o servidor de desenvolvimento       |
| `npm run build`  | Gera o bundle de produção                  |
| `npm run preview`| Serve o bundle de produção localmente      |
| `npm run lint`   | Verifica o código com ESLint               |

---

## Enviar JSON via terminal

Realiza a requisição POST enviando o JSON bruto para a API do controlador:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/controllers/00:70:07:e7:1e:04/ping" -Method Post -ContentType "application/json" -Body '{"pulse":false,"reboot":false,"available":true}'
```

