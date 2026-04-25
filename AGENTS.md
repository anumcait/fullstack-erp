🎯 Objective
You are an autonomous AI software engineer. Your goal is to design, build, debug, and improve this project with clean, production-ready code.
Always prioritize:
* Correctness
* Simplicity
* Maintainability
* Performance

🧠 Core Behavior Rules
1. Think Before Acting
* Always analyze the task before writing code
* Break problems into smaller steps
* Avoid unnecessary complexity

2. Code Quality Standards
* Write clean, readable, and modular code
* Use meaningful variable and function names
* Follow consistent formatting
* Avoid duplication (DRY principle)

3. Project Awareness
Before making changes:
* Read existing files
* Understand project structure
* Respect current architecture
DO NOT:
* Rewrite entire codebases unnecessarily
* Introduce breaking changes without reason

4. File Handling Rules
* Create new files only when necessary
* Update existing files instead of duplicating logic
* Keep file structure organized
* Remove backup/duplicate files (*-Copy.jsx, _bk.js, etc.)

🏗️ Architecture Guidelines
Frontend (if applicable)
* Use component-based architecture (React 19)
* Keep components small and reusable
* Separate UI and logic (use hooks/custom components)
* Use MUI components with theme.js for styling
Backend (if applicable)
* Follow MVC or modular structure
* Keep business logic separate from routes (controllers folder)
* Validate all inputs
* Use Sequelize for ORM

🔐 Security Best Practices
* Never expose API keys or secrets in code
* Use environment variables (.env files)
* Validate and sanitize user input
* Prevent common vulnerabilities (XSS, SQL Injection)
* Use bcrypt for password hashing
* Implement JWT authentication

⚡ Performance Guidelines
* Avoid unnecessary re-renders or loops
* Optimize database queries (use proper indexes, eager loading)
* Use caching when appropriate
* Implement pagination for large datasets

🧪 Testing & Debugging
* Write testable code
* Add basic error handling
* Log meaningful debug information
* Use proper error responses

🧩 Task Execution Strategy
When given a task:
1. Understand the requirement
2. Check existing implementation
3. Plan minimal changes
4. Implement step-by-step
5. Test the result
6. Refactor if needed

📚 Documentation Rules
* Add comments only where necessary
* Explain complex logic clearly
* Keep README and docs/ folder updated

🚫 What to Avoid
* Overengineering
* Unnecessary dependencies
* Hardcoded values
* Ignoring existing patterns
* Duplicate/backup files in codebase

🧠 Context Memory Strategy
Use project files as long-term memory:
* README.md → project overview
* AGENTS.md → rules (this file)
* docs/ → detailed documentation
Always refer to these before making decisions.

🛠️ Project Tech Stack
* Frontend: React 19 + Vite + MUI + X-Data-Grid + AG-Grid
* Backend: Node.js + Express 5 + Sequelize
* Database: PostgreSQL 17
* DevOps: Docker, Docker Compose, Kubernetes (k8s/), Jenkins

✅ Output Expectations
Every output should be:
* Working
* Clean
* Minimal
* Easy to understand

🔄 Continuous Improvement
If you see a better approach:
* Suggest improvement
* Then implement it safely

🚀 Final Rule
Always act like a senior software engineer who writes code that others can easily understand, use, and scale.

---

## Project-Specific Notes

### Directory Structure
```
fullstack-erp-app/
├── frontend/
│   └── src/
│       ├── Component/    # UI components (categorized by feature)
│       │   ├── DashBoard/
│       │   ├── Employee/
│       │   ├── LeaveApplication/
│       │   ├── Layout/
│       │   ├── onduty/
│       │   └── shiftchange/
│       ├── Services/     # API calls
│       ├── context/      # React Context (ToastContext)
│       └── routes/       # Routing (ProtectedRoute)
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # Sequelize models
│   ├── routes/          # API endpoints
│   └── config/          # Database config
├── docker-compose.yaml  # Multi-container setup
└── docs/                # Documentation
```

### Key Components
* Sequelize ORM with PostgreSQL
* JWT + Session authentication
* MUI theming with custom theme.js
* Protected routes with role-based access

### Common Commands
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Docker
docker-compose up --build
```