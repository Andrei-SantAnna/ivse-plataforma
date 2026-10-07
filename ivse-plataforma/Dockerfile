# Usa uma imagem leve do Node.js (LTS)
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia apenas os arquivos de dependência primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código fonte
COPY . .

# Expõe a porta que a API vai utilizar
EXPOSE 3000

# Comando padrão para iniciar a API (caso não seja sobrescrito pelo compose)
CMD ["node", "src/server.js"]