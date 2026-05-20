# Dockerfile para el backend de SmartMark
FROM node:20

# Establecer directorio de trabajo
WORKDIR /app

# Instalar herramientas de compilación necesarias para sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias - forzar compilación de sqlite3
RUN npm install --production --build-from-source

# Copiar código fuente
COPY src ./src

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]
