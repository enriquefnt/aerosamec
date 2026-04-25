# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Construye la app para producción (esto crea .next)
#RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para ejecutar en producción
CMD ["npm", "start"]


