# Instruções para Iniciar o Projeto — Lav Onboarding

> Portal de Onboarding IoT (Self Install) — React + Vite + Node.js + PostgreSQL

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Dependências do frontend instaladas (rode `npm install` na primeira vez)

---

## Estrutura dos Serviços

| Serviço             | Container              | Porta  | Descrição                        |
|---------------------|------------------------|--------|----------------------------------|
| **PostgreSQL**      | `iot_postgres`         | `5432` | Banco de dados principal         |
| **API Node.js**     | `iot_simulator_api`    | `3001` | API simuladora (mock)            |
| **Adminer**         | *(adminer)*            | `8080` | Interface web para o banco       |
| **Frontend React**  | *(local, via Vite)*    | `5173` | Site de onboarding               |

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

- **PostgreSQL** → `localhost:5432`
- **API Node.js** → `http://localhost:3001`
- **Adminer** (gerenciador do banco) → `http://localhost:8080`

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

# Parar e remover todos os contêineres do projeto
docker-compose down

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
├── simulator/                # Código da API Node.js (roda via Docker)
│   └── db/init.sql           # Script de inicialização do banco
├── docs/                     # Documentação adicional
├── docker-compose.yml        # Configuração dos serviços Docker
├── package.json              # Dependências do frontend
└── vite.config.js            # Configuração do Vite
```

---

## Scripts Disponíveis (`npm`)

| Comando          | Descrição                                  |
|------------------|--------------------------------------------|
| `npm run dev`    | Inicia o servidor de desenvolvimento       |
| `npm run build`  | Gera o bundle de produção                  |
| `npm run preview`| Serve o bundle de produção localmente      |
| `npm run lint`   | Verifica o código com ESLint               |
