# Fullstack ERP - Deployment Guide

This guide explains how to deploy the ERP application using **Docker Compose**. This is the recommended method for production as it packages the database, backend, frontend, and a reverse proxy (Nginx) into a single, manageable system.

---

## 🛠️ Prerequisites
1. **Docker** installed on the server.
2. **Docker Compose** installed.
3. Git (to clone the repository).

---

## 🚀 Quick Start (Deployment Steps)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd fullstack-erp-app
```

### 2. Configure Environment Variables
You need to create/verify the `.env` files for both the backend and database.

**Backend (.env)**:
Copy the existing development env to a production one:
```bash
cp backend/.env.development backend/.env.production
```
*Ensure `DB_HOST` is set to `db` (the name of the docker service).*

### 3. Initialize the Database
Ensure you have your initial database backup or schema ready in the `./pg_restore` folder if you want to restore data. The `docker-compose.yaml` is configured to run `./init-scripts/init-db.sh` on the first startup.

### 4. Build and Launch
Run the following command to build the images and start the containers in the background:

```bash
docker-compose up --build -d
```

---

## 📂 Understanding the Architecture

### Services in Docker Compose:
- **db (Postgres 17)**: The primary database. Data is persisted in the `./pgdata-new` volume.
- **backend (Node.js)**: The Express API. Runs on port `5000`.
- **frontend (Vite/React)**: The user interface. Runs on port `5173`.
- **nginx**: Acts as the entry point for the application on port `80`. It routes traffic to the frontend and backend.

### Port Mappings:
| Service | Public Port | Description |
|---------|-------------|-------------|
| Nginx   | 80          | Main URL (e.g., http://your-server-ip) |
| Backend | 5000        | API Access (Direct) |
| Frontend| 5173        | UI Access (Direct) |
| DB      | 5432        | Database Access (Direct) |

---

## 🔧 Maintenance & Troubleshooting

### Viewing Logs
To see what's happening inside the containers:
```bash
docker-compose logs -f
```

### Stopping the Application
```bash
docker-compose down
```

### Database Backups
To create a backup from the running container:
```bash
docker exec -t hr_postgres pg_dump -U postgres hrdb > backup_$(date +%F).sql
```

### Updating the Application
When you make code changes:
1. Pull the new code: `git pull`
2. Rebuild: `docker-compose up --build -d`

---

> [!IMPORTANT]
> **Production Security**: For a real production server, remember to change the `POSTGRES_PASSWORD` in `docker-compose.yaml` from `postgres` to a strong, unique password.

> [!TIP]
> **HTTPS**: If you want to enable SSL (HTTPS), you will need to update the `nginx/nginx.conf` file to include your SSL certificates and listen on port 443.
