# Instruções para Iniciar o Projeto

Para iniciar o ambiente do projeto localmente, siga os passos abaixo em terminais separados na raiz do projeto (`c:\Projeto_facul\Lav Onboarding`).

## 1. Iniciar os Serviços do Docker (Banco de Dados e API Simuladora)

Abra o primeiro terminal e execute o seguinte comando:

```bash
docker-compose up -d
```

> **Nota:** A flag `-d` faz com que os contêineres rodem em segundo plano (detached mode). Se você quiser visualizar os logs da API e do banco de dados em tempo real, pode omitir o `-d` rodando apenas `docker-compose up`.

Isso iniciará:
- O Banco de Dados PostgreSQL (disponível na porta `5432`).
- A API em Node.js (disponível na porta `3001`).


docker stop iot_postgres em que iot_postgres é o nome do container


docker ps para listar o que esta funcionando


## 2. Iniciar o Site (Frontend - React com Vite)

Abra um segundo terminal e execute:

```bash
npm run dev
```

Isso fará com que o Vite inicie o servidor de desenvolvimento. O site ficará acessível no seu navegador, geralmente no endereço: [http://localhost:5173](http://localhost:5173).
