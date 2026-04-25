# 🚀 Linux Deployment Guide for Fullstack ERP

This guide explains how to deploy and run the entire ERP application (Frontend, Backend, Database, and Nginx) on a Linux machine using **Docker**.

## 📋 Prerequisites

Ensure your Linux machine (Ubuntu/Debian) has the following installed. 

### ⚡ Quick Docker & Compose Install (Ubuntu)
Run these commands to set up everything you need in one go:

```bash
# 1. Update your package index
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
sudo apt install -y docker.io

# 3. Install Docker Compose (V2)
sudo apt install -y docker-compose-v2

# 4. Start and Enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# 5. (Optional) Allow your user to run docker without 'sudo'
sudo usermod -aG docker $USER
# Note: Log out and back in for this to take effect!
```

- **Git**: `sudo apt install git` (for Ubuntu/Debian)

---

## 🏗️ Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd fullstack-erp-app
```

---

## 🔐 Step 2: Set Up Environment Variables

The application relies on `.env` files to connect to the database. You need to create a development environment file for the containers.

```bash
# Create the backend environment file
nano backend/.env.development
```

Paste the following configuration:
```ini
NODE_ENV=development
PORT=5000

# Database Settings (Matches Docker Compose)
DB_DIALECT=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=hrdb
DB_USER=postgres
DB_PASSWORD=postgres

# Security
JWT_SECRET=your_super_secret_key_here
```

---

## 🚢 Step 3: Launch the Application

Run the following command in the root directory (where `docker-compose.yaml` is located):

```bash
# Build and start all services in the background
docker-compose up --build -d
```

### What this does:
1.  **db**: Starts a PostgreSQL 17 database.
2.  **backend**: Starts the Node.js server (it will wait for the DB to be ready).
3.  **frontend**: Starts the React development server.
4.  **nginx**: Starts a reverse proxy that routes traffic to the correct service.

---

## 🌐 Step 4: Access the Application

Once the containers are running, you can access the ERP via your browser:

- **Main URL**: `http://<your-server-ip>`
- **Direct Frontend**: `http://<your-server-ip>:5173`
- **Direct Backend API**: `http://<your-server-ip>:5000/api`

---

## 🛠️ Common Commands

### Check logs (Troubleshooting)
```bash
# View real-time logs for all services
docker-compose logs -f

# View logs for just the backend
docker-compose logs -f backend
```

### Stop the application
```bash
docker-compose down
```

### Update the application
If you pull new code from Git:
```bash
git pull origin dev
docker-compose up --build -d
```

---

## ⚡ Production Optimization (Optional)

Currently, the `frontend` runs in "dev" mode. For a high-performance production setup:

1.  **Build the Frontend**: Run `npm run build` inside the `frontend` folder.
2.  **Update Nginx**: Modify `nginx/nginx.conf` to serve the `dist/` folder directly.
3.  **Standalone Containers**: Remove the `volumes` mapping in `docker-compose.yaml` so the containers use the code baked into the images.

---

## 💾 Database Backups

To backup your database on Linux:
```bash
docker exec -t hr_postgres pg_dumpall -c -U postgres > backup_$(date +%F).sql
```
