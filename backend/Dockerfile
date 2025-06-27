FROM node:20-alpine
WORKDIR /usr/src/app

# dependencias
COPY package*.json ./
RUN npm install --production

# ---------- SOLUCIÓN ----------
# Copia TODO el backend (src, index.js, etc.)
COPY . .

EXPOSE 4000
CMD ["node", "index.js"]   # o  npm run start
