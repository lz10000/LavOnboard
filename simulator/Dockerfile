# Utiliza a imagem oficial do Node.js versão 18 na sua variante Alpine (sistema mais leve e rápido)
FROM node:18-alpine

# Define o diretório de trabalho padrão dentro do contêiner Linux
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json (se existir) primeiro
# Isso tira proveito do cache do Docker, evitando instalar as bibliotecas de novo caso o código mude
COPY package*.json ./

# Instala todas as dependências declaradas no package.json
RUN npm install

# Copia todo o restante do código (como o server.js) da pasta /simulator para dentro do contêiner
COPY . .

# Informa ao Docker que a aplicação vai utilizar a porta 3001
EXPOSE 3001

# Comando padrão que é executado quando o contêiner for iniciado.
# Neste caso, roda o script "dev" que aciona o nodemon para recarregar o servidor a cada alteração
CMD ["npm", "run", "dev"]
