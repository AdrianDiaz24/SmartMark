# Dockerfile para el backend de SmartMark
FROM node:20

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY src ./src

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]
