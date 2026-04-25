# 🚀 Linux Deployment Guide for Fullstack ERP

This guide explains how to deploy and run the entire ERP application (Frontend, Backend, Database, and Nginx) on a Linux machine using **Docker**.

## 📋 Prerequisites

Ensure your Linux machine (Ubuntu, Debian, or Oracle Linux) has the following installed.

### ⚡ Quick Docker & Compose Install (Ubuntu/Debian)
Run these commands if you are using Ubuntu:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 🏮 Quick Docker & Compose Install (Oracle Linux 7.9)
Run these commands as the **root** user on OEL 7.9:

```bash
# 1. Install required utilities
yum install -y yum-utils

# 2. Modernize Repositories & Enable EPEL (Fixes legacy repo issues)
/usr/bin/ol_yum_configure.sh
yum install -y oracle-epel-release-el7
yum-config-manager --enable ol7_latest ol7_addons ol7_optional_latest ol7_developer ol7_developer_EPEL
yum clean all

# 3. Add the official Docker Stable repository
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 4. Install Docker CE (Community Edition)
# OEL 7.9 has strict dependency conflicts with newer Docker versions.
# The most reliable method is to download and force-install the stable v20.10 RPMs:
yum install -y containerd.io
cd /tmp
yumdownloader --resolve docker-ce-20.10.24-3.el7 docker-ce-cli-20.10.24-3.el7
rpm -ivh --nodeps docker-ce-20.10.24-3.el7*.rpm docker-ce-cli-20.10.24-3.el7*.rpm
systemctl daemon-reexec
# 4. Start and Enable Docker
systemctl start docker
systemctl enable docker

# 5. Install Docker Compose (V1)
# Using v1.29.2 as the most reliable version for this OEL 7.9 environment
curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Allow 'oracle' user to run docker (without sudo)
usermod -aG docker oracle
```
*Note: Log in as the `oracle` user after these steps to run the application.*

- **Git**: `yum install -y git`

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

---
1. Rebuild the backend cleanly (it will be very fast this time):

bash
docker-compose up -d --build backend
2. Delete the old 3GB image to get your hard drive space back:

bash
docker image prune -f

## 📦 Migrating Data from Localhost to Production

If you have existing data on your local Windows machine and want to migrate it to the Linux server:

1. **Export the data from Windows (Localhost):**
   Open Command Prompt (or PowerShell) in your local project folder and run:
   ```cmd
   cmd /c "docker exec -t hr_postgres pg_dump -U postgres -c --if-exists hrdb > erp_data.sql"
   ```

2. **Transfer the file:**
   Move the generated `erp_data.sql` file to your Linux server (using WinSCP, FileZilla, or `scp`).

3. **Import the data on Linux (Production):**
   Log into your Linux server, navigate to the folder containing `erp_data.sql`, and run:
   ```bash
   cat erp_data.sql | docker exec -i hr_postgres psql -U postgres -d hrdb
   ```
