# frontend/Dockerfile
FROM node:20-alpine


WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --production
COPY ./ ./

# Build del frontend (sale a /build)
RUN npm run build

# Usaremos un Nginx básico para servir el build estático
FROM nginx:1.25-alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
