# ERP Attendance & Payroll — Demo & Deployment Guide

## 1. What It Is
A full-stack HR/ERP web app for attendance tracking, muster rolls, late-coming analysis, and payroll. Built to run on-prem or in the cloud.

## 2. Tech Stack
- **Frontend:** React 19 + Vite, MUI v7, AG-Grid / X-Data-Grid, jsPDF + html2canvas (PDF), SheetJS (Excel).
- **Backend:** Node.js + Express 5, Sequelize ORM.
- **Database:** PostgreSQL 17.
- **DevOps:** Docker / Docker Compose, Kubernetes manifests (`k8s/`), Jenkinsfile, Nginx, Google Cloud Build.
- **Auth:** JWT + session, role-based route protection.

## 3. Run Locally (Dev)
```bash
# Backend
cd backend && npm install && npm run dev      # port 5000 (see .env)

# Frontend (new terminal)
cd frontend && npm install && npm run dev     # Vite dev server
```
Open the Vite URL. Set `VITE_API_URL` in `frontend/.env` to point at the backend.

## 4. Deploy (Production)
```bash
docker-compose up --build      # builds backend + frontend + postgres
```
- Postgres init scripts live in `db-init/` / `init-scripts/`.
- Kubernetes: apply manifests in `k8s/`; Jenkins pipeline in `Jenkinsfile` builds & pushes images.
- Nginx (`nginx/`) serves the built frontend and proxies API calls.

## 5. Non-Technical Demo Script (≈10 min)
1. **Login** — show role-based access (HR vs employee menus).
2. **Attendance entry** — open attendance, show present/absent/leave/HO statuses per day.
3. **Muster Roll** — pick a past month → see the grid: P/F/A/H/W/CL/EL per date, plus Present, H/W, CL, EL, LOP, Total, OT, Bonus columns, subtotals and grand total. Export Excel / PDF.
4. **Late Coming Report tab** (next to Muster Roll) — show per-employee late minutes per date (`HH.MM`, e.g. `0.05` = 5 min), and summary: Late Count, Actual Hrs (first late exempt), Total late Hrs, Half Days, Cost (₹). Stress the "Cost" column auto-computes the payroll late deduction.
5. **Weekly-off change** — show a Woff change application and how it reflects correctly in both Muster Roll and Payroll (fix: approved woff changes now apply within the month).
6. **Payroll** — "Proceed for Payslip" from Muster Roll; show late deduction pulled into the salary.

## 6. Technical Highlights (for reviewers)
- **Late logic** (`backend/controllers/HR/attendanceController.js`): `calculateLateHrs` derives late minutes from shift start (grace 0). Stored as `HH.MM`.
- **Late report** (`frontend/.../MusterRoll.jsx`): tabbed UI reusing the same muster payload — no extra API call. `computeLateSummary` derives Late Count, eligible (first exempt), total late minutes, half days, and ₹ cost (mirrors payroll: ≤10 min → 1 hr basic; else → ½ day basic, using employee `basic` + DOJ-adjusted `workingDays`).
- **Woff fix:** woff `DATE` values normalized via `toLocalDateStr` (local, not UTC) and the query widened to catch both `woff_from_date` and `woff_to_date` in-month, so approved weekly-off changes reflect in muster & payroll.
- **Excel/PDF** export mirrors the on-screen grid exactly.

## 7. Key Files
- `frontend/src/Component/HR/Attendance/MusterRoll.jsx` — Muster Roll + Late Coming Report.
- `backend/controllers/HR/attendanceController.js` — `getMusterRoll`, `saveMusterRoll`, late/woff logic.
- `backend/controllers/HR/payrollController.js` — late deduction rule.
- `docker-compose.yaml`, `k8s/`, `Jenkinsfile`, `nginx/` — deployment.

## 8. Tips
- Use a past, fully-closed month for the demo (payroll requires the immediately preceding month).
- If data looks empty, click **Refresh** or pick a month with records (e.g. Jun).
