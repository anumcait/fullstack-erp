# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login) require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| GET | `/auth/me` | Get current user |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List all employees |
| GET | `/employees/:id` | Get employee by ID |
| POST | `/employees` | Create employee |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |

### Leave Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leave` | List leave applications |
| POST | `/leave/apply` | Apply for leave |
| PUT | `/leave/approve/:id` | Approve leave |
| GET | `/leave/master` | Get leave balance |

### Shift Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shift` | List shifts |
| POST | `/shift/change` | Request shift change |
| PUT | `/shift/approve/:id` | Approve shift change |

### On-Duty
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/onduty` | List on-duty requests |
| POST | `/onduty/apply` | Apply for on-duty |
| PUT | `/onduty/approve/:id` | Approve request |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

## Error Format
```json
{
  "success": false,
  "error": "Error message"
}
```