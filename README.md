# 🛠️ IT Service Analytics Platform

A professional IT Service Analytics and Ticketing platform built on the **MERN stack**. Designed to help organizations manage, track, and analyze IT service tickets with SLA enforcement, role-based dashboards, and real-time analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Branching & Commit Strategy](#branching--commit-strategy)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

The IT Service Analytics Platform enables organizations to:

- **Create & manage IT service tickets** with priority, status, and category tracking
- **Enforce SLAs** with automated breach detection
- **Visualize analytics** via dashboards (resolution times, ticket volumes, SLA compliance)
- **Role-based access** for Admins, Analysts, and End Users
- **Audit logging** for compliance and traceability

---

## Tech Stack

### Why MERN?

> MERN provides a **full JavaScript ecosystem** — unified language across frontend, backend, and database queries. MongoDB's flexible schema suits analytics-heavy ticketing systems. React enables a component-based UI. Express provides scalable middleware-driven API design.

| Layer       | Technology                            | Purpose                              |
|-------------|---------------------------------------|--------------------------------------|
| **Frontend**| React 18 + Vite                       | Fast, component-based UI             |
|             | Tailwind CSS                          | Clean enterprise styling             |
|             | Axios                                 | HTTP client                          |
|             | React Router v6                       | Client-side routing                  |
|             | TanStack Query (React Query)          | Server state management              |
|             | Zustand                               | Global client state (if needed)      |
|             | React Hook Form + Zod                 | Form handling & validation           |
| **Backend** | Node.js + Express.js                  | REST API server                      |
|             | MongoDB Atlas + Mongoose              | Cloud database + ODM                 |
|             | JWT + bcrypt                          | Authentication & password hashing    |
|             | Helmet                                | Security headers                     |
|             | Express Validator                     | Input validation                     |
|             | Morgan                                | HTTP request logging                 |
| **DevOps**  | Git + GitHub                          | Version control                      |
|             | Vercel                                | Frontend deployment                  |
|             | Render                                | Backend deployment                   |
|             | Postman + Swagger                     | API testing & documentation          |

---

## System Architecture

```
User (Browser)
       ↓
React Frontend (Vercel)
       ↓  Axios (HTTPS)
Express Backend (Render)
       ↓  Mongoose
MongoDB Atlas (Cloud DB)
```

**Request Flow:**
1. User interacts with React UI
2. Axios sends REST API request over HTTPS
3. Express receives request → middleware validates & authenticates (JWT)
4. Controller processes business logic
5. Mongoose interacts with MongoDB Atlas
6. Response returned to frontend
7. React updates UI via TanStack Query cache

> 📄 See [docs/architecture.md](docs/architecture.md) for detailed diagrams.

---

## Database Schema

### Core Entities

| Entity            | Description                                      |
|-------------------|--------------------------------------------------|
| **User**          | Platform users with roles (admin/analyst/user)   |
| **Organization**  | Companies/teams managing tickets                 |
| **Ticket**        | IT service requests with status & priority       |
| **ServiceCategory** | Ticket categories with SLA time limits        |
| **SLA**           | Response & resolution time targets per category  |
| **AnalyticsReport** | Aggregated ticket metrics per organization    |
| **AuditLog**      | System activity trail for compliance             |

### Key Relationships

```
User ──creates──▶ Ticket
Ticket ──belongs to──▶ ServiceCategory
Ticket ──belongs to──▶ Organization
Ticket ──follows──▶ SLA
AnalyticsReport ──aggregates──▶ Ticket
```

> 📄 See [docs/er-diagram.md](docs/er-diagram.md) for the full ER diagram.

---

## Folder Structure

```
IT-Service-Analyst-Dashboard/
│
├── client/                         # React Frontend
│   └── src/
│       ├── api/                    # Axios API service functions
│       ├── components/             # Reusable UI components
│       ├── pages/                  # Page-level components
│       ├── hooks/                  # Custom React hooks
│       ├── store/                  # Zustand stores
│       ├── layouts/                # Layout wrappers (Sidebar, Navbar)
│       ├── routes/                 # Route definitions
│       └── utils/                  # Helper functions
│
├── server/                         # Express Backend
│   ├── config/                     # DB connection, environment config
│   ├── controllers/                # Route handler logic
│   ├── models/                     # Mongoose schemas
│   ├── routes/                     # Express route definitions
│   ├── middleware/                  # Auth, error handling, validation
│   ├── utils/                      # Helper utilities
│   └── validators/                 # Express-validator rules
│
├── docs/                           # Design documentation
│   ├── architecture.md
│   ├── er-diagram.md
│   ├── api-design.md
│   └── wireframes.md
│
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method   | Endpoint                    | Description               | Auth     |
|----------|-----------------------------|---------------------------|----------|
| `POST`   | `/api/auth/register`        | Register new user         | Public   |
| `POST`   | `/api/auth/login`           | Login & get JWT           | Public   |
| `GET`    | `/api/auth/profile`         | Get current user profile  | Private  |
| `GET`    | `/api/tickets`              | List tickets (filtered)   | Private  |
| `POST`   | `/api/tickets`              | Create ticket             | Private  |
| `PUT`    | `/api/tickets/:id`          | Update ticket             | Private  |
| `DELETE` | `/api/tickets/:id`          | Delete ticket             | Admin    |
| `GET`    | `/api/analytics/summary`    | Dashboard analytics       | Private  |
| `GET`    | `/api/organizations`        | List organizations        | Admin    |
| `POST`   | `/api/organizations`        | Create organization       | Admin    |

> 📄 See [docs/api-design.md](docs/api-design.md) for the complete API specification.

---

## Setup & Installation

> ⚠️ **Prerequisites:** Node.js 18+, npm 9+, MongoDB Atlas account

```bash
# Clone the repo
git clone https://github.com/<your-username>/IT-Service-Analyst-Dashboard.git
cd IT-Service-Analyst-Dashboard

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/it-service-analytics
JWT_SECRET=your_jwt_secret_here
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## Branching & Commit Strategy

### Branches

| Branch            | Purpose                |
|-------------------|------------------------|
| `main`            | Production-ready code  |
| `develop`         | Integration/staging    |
| `feature/auth`    | Authentication module  |
| `feature/ticket`  | Ticket management      |
| `feature/analytics` | Analytics dashboard |

### Commit Prefixes

```
feat:      New feature
fix:       Bug fix
refactor:  Code restructuring
docs:      Documentation changes
test:      Adding/updating tests
chore:     Build/config changes
```

---

## Deployment

| Component   | Platform       | URL                     |
|-------------|----------------|-------------------------|
| Frontend    | Vercel         | `https://<app>.vercel.app` |
| Backend     | Render         | `https://<api>.onrender.com` |
| Database    | MongoDB Atlas  | Cloud-hosted cluster     |

---

## Roadmap

### Phase 1 ✅ — Planning & Review
- Architecture & ER diagrams
- API design specification
- Wireframes
- Project scaffolding

### Phase 2 — Core Implementation
- Authentication (JWT + bcrypt)
- Ticket CRUD operations
- Role-based access control
- Basic dashboard UI

### Phase 3 — Advanced Features
- SLA breach detection logic
- Chart.js analytics dashboard
- Ticket filtering (date, priority, status)
- Pagination
- CSV export
- Activity audit logs

### 🔮 Future Upgrades
- **AI-Powered Insights**: Auto-suggest solutions to analysts based on ticket content.
- **Mobile App**: React Native version for field technicians.
- **Email Integration**: Create tickets directly from incoming emails.
- **Dark Mode V2**: Enhanced theming options for user preference.
- **Slack/Teams Bot**: Notifications and quick actions directly in chat apps.

---

## License

This project is developed as part of an academic evaluation. All rights reserved.
