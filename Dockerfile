# Estágio 1: Build da aplicação Vite / React
FROM node:20-alpine AS build

WORKDIR /app

# Copia as definições de dependências
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o código fonte do projeto
COPY . .

# Compila a aplicação gerando os arquivos estáticos na pasta dist
RUN npm run build

# Estágio 2: Servidor Web Nginx para produção
FROM nginx:alpine

# Copia a configuração personalizada do Nginx para suportar SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o resultado do build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80 do contêiner
EXPOSE 80

# Inicia gerando o env-config.js em tempo de execução com o valor de API_BASE_URL fornecido ao contêiner
CMD ["/bin/sh", "-c", "echo \"window.__ENV__ = { API_BASE_URL: '${API_BASE_URL:-https://lavonboarding-simulator-api.onrender.com/api/v1}' };\" > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]

