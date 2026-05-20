# Dockerfile multi-stage para el frontend de SmartMark
# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Argumentos de build
ARG REACT_APP_API_BASE_URL=http://localhost:3000/api

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de la aplicación con variable de entorno
RUN REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL npm run build

# Stage 2: Serve
FROM node:20

WORKDIR /app

# Instalar servidor HTTP ligero
RUN npm install -g serve

# Copiar archivos compilados del stage anterior
COPY --from=builder /app/build ./build

# Exponer puerto
EXPOSE 3001

# Comando para servir la aplicación
CMD ["serve", "-s", "build", "-l", "3001"]
