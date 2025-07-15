# 🦷 odontApp

Sistema integral de gestión para clínicas odontológicas.  
Frontend en **React 19 + SCSS** · Backend en **Node 20 + Express 5 + Sequelize 6** · Base de datos **MySQL 8** · Orquestado con **Docker Compose**.

---

## 👥 Equipo

| Integrante |
|------------|
| **Enzo Pinotti** |
| **Patricio Borda** |
| **Lucio Borda** |
| **Matías Rau Bekerman** |
| **Natasha Cadabon** |

---

## 🚀 Stack principal

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19 · React-Router 7 · SCSS (CRA) |
| **Backend** | Node 20 · Express 5 · Sequelize 6 |
| **DB** | MySQL 8.3 |
| **DevOps** | Docker · Docker Compose · Nodemon · Sequelize-CLI |

---

## 📁 Estructura general (monorepo)

```text
odontApp/
├── backend/
│   ├── src/
│   │   ├── modules/            # → 1 módulo = 1 carpeta (Usuarios, Clinica, …)
│   │   │   └── Usuarios/
│   │   │       ├── controllers/
│   │   │       ├── models/
│   │   │       ├── repositories/
│   │   │       ├── services/
│   │   │       └── validators/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   ├── middlewares/
│   │   ├── routes/             # index.js concatena rutas de todos los módulos
│   │   └── utils/
│   ├── config/
│   │   └── config.json         # ← usado por Sequelize-CLI dentro del contenedor
│   ├── .sequelizerc            # paths de modelos / migraciones / seeders
│   ├── .env                    # vars usadas solo por Node (host=mysql, etc.)
│   ├── Dockerfile.prod
│   ├── index.js                # entry-point Express
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── Dockerfile.prod
│   └── package.json
│
├── docker-compose.yml
└── README.md   ← este archivo
```

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
- Adminer: <http://localhost:8080>

---

## Migraciones con Sequelize-CLI

### dentro del contenedor

docker compose exec backend npx sequelize-cli db:migrate           # aplica pendientes
docker compose exec backend npx sequelize-cli db:migrate:undo      # revierte la última
docker compose exec backend npx sequelize-cli db:migrate:undo:all  # revierte todas
docker compose exec backend npx sequelize-cli db:migrate:status    # estado

## 📌 Notas adicionales

- El backend se conecta a MySQL usando el hostname `mysql`, ya que es el nombre del servicio definido en `docker-compose.yml`.
- Las migraciones pueden ejecutarse con `npx sequelize-cli db:migrate` dentro del contenedor backend si se desea.
- La base de datos se almacena en un volumen persistente.

---

## 📬 Contacto

Para bugs o sugerencias, abrí un issue o escribí a cualquiera de los integrantes.
¡Gracias por contribuir a odontApp!
