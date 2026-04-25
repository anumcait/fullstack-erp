# Fullstack ERP App - Documentation

## Overview
A comprehensive HR Management System built with React, Node.js, Sequelize, and PostgreSQL.

## Project Structure
```
fullstack-erp-app/
├── frontend/           # React 19 + Vite + MUI application
├── backend/            # Node.js + Express API
│   ├── routes/        # API route definitions
│   ├── controllers/  # Business logic
│   ├── models/       # Sequelize models
│   └── config/       # Database configuration
├── docker/           # Docker configuration
├── k8s/              # Kubernetes manifests
├── nginx/             # Nginx reverse proxy config
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 17

### Quick Start
```bash
docker-compose up --build
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api
- Nginx: http://localhost:80

## Modules
- Employee Master Management
- Leave Application & Approval
- Shift Management
- On-Duty Requests
- Dashboard & Reporting

## Tech Stack
| Component | Technology |
|-----------|-------------|
| Frontend  | React 19, Vite, MUI |
| Backend   | Node.js, Express |
| Database | PostgreSQL 17 |
| ORM | Sequelize |
| Styling | MUI + CSS Modules |

## Common Commands
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Database migration
cd backend && npm run migrate
```

## API Endpoints
See [API.md](API.md) for detailed endpoint documentation.

## License
MIT