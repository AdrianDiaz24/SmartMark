# Dockerfile multi-stage para el frontend de SmartMark
# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Argumentos de build
ARG REACT_APP_API_BASE_URL=/api

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de la aplicación con variable de entorno
RUN REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL npm run build

# Stage 2: Serve con Nginx (Servidor Web y Proxy)
FROM nginx:alpine

# Copiar configuración personalizada del proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados del stage anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Exponer puerto HTTP
EXPOSE 80

# Comando para servir la aplicación con Nginx
CMD ["nginx", "-g", "daemon off;"]