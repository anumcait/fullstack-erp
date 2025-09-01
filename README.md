# 🧑‍💼 Fullstack ERP Application

A complete **HR management system** built with **React 19**, **Node.js**, **Sequelize**, **PostgreSQL/MySQL**, and **Docker** — designed for real-time, multi-unit enterprise use.

## 🚀 Features

- 🧾 Employee Master Management  
- 🗓️ Leave Application and Reports  
- 📊 Role-based Dashboards  
- 👨‍👩‍👧 Family & Reference Details per Employee  
- 📤 Export to PDF/Excel  
- 🌐 Responsive UI with React + MUI  
- 🐳 DevOps-ready with Docker and CI/CD support  

---

## 🧰 Tech Stack

| Layer         | Technology                      |
|---------------|----------------------------------|
| Frontend      | React 19 + Vite + MUI           |
| Backend       | Node.js + Express               |
| Database      | PostgreSQL / MySQL              |
| ORM           | Sequelize                       |
| DevOps        | Docker, GitHub Actions, Jenkins |
| Reports       | JasperReports (future)          |

---

## 📂 Project Structure
```
fullstack-hr-app/
├── frontend/ # React application (Vite)
├── backend/ # Node.js API with Sequelize
├── docker/ # Dockerfiles and configurations
├── docker-compose.yaml # One-command startup
├── .env.example # Sample environment file
├── README.md # You're here
└── docs/ # Technical docs & flow diagrams

---

```
## ⚙️ Getting Started

### 🔧 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- (Optional) PostgreSQL or MySQL installed locally

---

### 🚨 Environment Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/fullstack-erp-app.git
   cd fullstack-erp-app

Copy and edit environment variables:
```bash
cp .env.example .env
Start containers (frontend + backend + db):

```bash
docker-compose up --build

### Access the app:
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```
---

### 🧑‍💻 Contributing
We welcome new contributors!

👣 Steps to Contribute
Fork the repo

Create a new branch:
```
git checkout -b feature/your-feature-name
Make your changes and commit:

```
git commit -m "Add: new feature XYZ"
Push and open a Pull Request

---

### 📋 Common Scripts
Frontend (in /frontend)

npm install
npm run dev       # Start dev server
npm run build     # Production build
Backend (in /backend)

```
npm install
npm run dev       # Start dev server with nodemon
npm run migrate   # Sequelize DB migrations

```

### 🗂️ Documentation
Full app architecture, API specs, and flow diagrams are in the /docs folder.

📜 License
This project is licensed under the MIT License.

🙋 Need Help?
Join the team, raise an Issue, or connect via LinkedIn!

### Made with 💙 by Aliveni and open-source collaborators.

