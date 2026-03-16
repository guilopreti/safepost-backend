# ---- Estágio 1: Build ----
# Instala TUDO (incluindo devDependencies) para compilar o TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ---- Estágio 2: Produção ----
# Imagem final limpa: só dependências de produção + código compilado
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["node", "dist/server.js"]
