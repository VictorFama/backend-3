# --- etapa 1: instala las dependencias ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- etapa 2: la imagen que se publica ---
FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 8080
CMD ["npm", "start"]