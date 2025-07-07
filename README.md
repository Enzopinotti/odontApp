# 🦷 odontApp

Sistema de gestión para una clínica odontológica. Permite la administración de pacientes, turnos y profesionales, con frontend en React y backend en Node.js utilizando Sequelize y MySQL. Contenerizado completamente con Docker.

---

## 👥 Integrantes

- Enzo Pinotti  
- Patricio Borda  
- Lucio Borda  
- Matías Rau Bekerman  
- Natasha Cadabon  

---

## 🚀 Tecnologías utilizadas

### Frontend

- React
- SCSS
- Create React App (CRA)

### Backend

- Node.js
- Express
- Sequelize ORM
- MySQL

### DevOps

- Docker
- Docker Compose

---

## 📁 Estructura del repositorio

``
odontApp/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración general (db.js, dotenv)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middlewares/    # Middlewares personalizados (auth, errores, etc.)
│   │   ├── migrations/     # Migraciones Sequelize
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas Express
│   │   ├── seeders/        # Datos iniciales (opcional)
│   │   ├── services/       # Funciones del dominio reutilizables
│   │   └── utils/          # Utilidades generales
│   ├── .env                # Variables de entorno
│   ├── .dockerignore       # Archivos ignorados en la imagen
│   ├── .sequelizerc        # Configuración de Sequelize CLI
│   ├── Dockerfile.prod     # Dockerfile para entorno de producción
│   ├── index.js            # Punto de entrada del servidor Express
│   ├── nodemon.json        # Configuración de reinicio automático en desarrollo
│   ├── package.json        # Configuración y dependencias
│   └── package-lock.json   # Lockfile de dependencias
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas principales
│   │   ├── routes/         # Ruteo de la aplicación
│   │   ├── styles/         # Estilos globales en SCSS
│   │   ├── App.js          # Componente raíz de la app
│   │   └── index.js        # Punto de entrada de ReactDOM
│   ├── public/             # Archivos públicos
│   ├── Dockerfile.prod     # Dockerfile para producción
│   └── package.json        # Configuración del frontend (CRA)
│
├── docker-compose.yml      # Orquestación de servicios (MySQL + frontend + backend)
├── README.md               # Documentación del proyecto
└── .gitignore              # Archivos ignorados por Git
``

---

## 🐳 Cómo levantar el proyecto con Docker

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/odontApp.git
cd odontApp
```

2.Crear el archivo `.env` en `/backend/.env` con el siguiente contenido:

``
PORT=4000
DB_NAME=odontapp_db
DB_USER=root
DB_PASSWORD=odont123
DB_HOST=mysql
``

3.Levantar el entorno:

```bash
docker-compose up --build
```

El flag --build es necesario solo la primera vez o si cambias dependencias.

4.Acceder al sistema:

- Frontend: <http://localhost:3000>
- Backend (API): <http://localhost:4000>

---

## 📌 Notas adicionales

- El backend se conecta a MySQL usando el hostname `mysql`, ya que es el nombre del servicio definido en `docker-compose.yml`.
- Las migraciones pueden ejecutarse con `npx sequelize-cli db:migrate` dentro del contenedor backend si se desea.
- La base de datos se almacena en un volumen persistente.

---

## 📬 Contacto

Para más información, comunicarse con cualquiera de los integrantes o levantar un issue en el repositorio.
