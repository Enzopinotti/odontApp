# 🦷 odontApp

Sistema de gestión para una clínica odontológica. Permite la administración de pacientes, turnos y profesionales, con frontend en React y backend en Node.js utilizando Sequelize y MySQL. Contenerizado completamente con Docker.

---

## 👥 Integrantes

- Enzo Pinotti
- Patricio Borda
- Lucio Borda
- Matias Rau Bekerman
- Natasha Cadabon

---

## 🚀 Tecnologías utilizadas

### Frontend

- React
- SCSS

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
│   │   ├── config/            # Configuración (db.js, dotenv)
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Rutas Express
│   │   ├── migrations/        # Migraciones Sequelize
│   │   ├── seeders/           # Datos iniciales (opcional)
│   │   └── index.js           # Punto de entrada del servidor Express
│   ├── Dockerfile             # Imagen Docker para backend
│   ├── .env                   # Variables de entorno
│   └── package.json           # Configuración de dependencias
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   └── App.jsx            # Root de la app React
│   ├── public/                # Archivos públicos
│   ├── Dockerfile             # Imagen Docker para frontend
│   ├── index.html             # HTML base
│   └── vite.config.js         # Configuración de Vite
│
├── docker-compose.yml         # Orquestación de servicios (MySQL + frontend + backend)
├── README.md                  # Documentación del proyecto
└── .gitignore                 # Ignorados por Git
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
