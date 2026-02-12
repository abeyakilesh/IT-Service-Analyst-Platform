# REST API Design Specification

Base URL: `/api`

---

## Authentication

All private endpoints require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

Role hierarchy: `admin` > `analyst` > `user`

---

## 1. Auth Endpoints

### `POST /api/auth/register`
Register a new user.

| Field           | Type   | Required | Notes                          |
|-----------------|--------|----------|--------------------------------|
| `name`          | String | ✅       | Min 2 chars                    |
| `email`         | String | ✅       | Valid email, unique            |
| `password`      | String | ✅       | Min 8 chars                    |
| `role`          | String | ❌       | Default: `user`                |
| `organizationId`| String | ✅       | Valid Organization ObjectId    |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { "_id", "name", "email", "role", "organizationId" },
    "token": "jwt_token_string"
  }
}
```

**Errors:** `400` (validation) · `409` (email taken)

---

### `POST /api/auth/login`
Authenticate and receive JWT.

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | String | ✅       |
| `password` | String | ✅       |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "_id", "name", "email", "role" },
    "token": "jwt_token_string"
  }
}
```

**Errors:** `401` (invalid credentials)

---

### `GET /api/auth/profile`
Get current user's profile. **Auth: Private**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "_id", "name", "email", "role", "organizationId", "createdAt" }
}
```

---

## 2. Ticket Endpoints

### `GET /api/tickets`
List tickets with filtering and pagination. **Auth: Private**

| Query Param   | Type   | Description                            |
|---------------|--------|----------------------------------------|
| `status`      | String | Filter: `open`, `in-progress`, `resolved` |
| `priority`    | String | Filter: `low`, `medium`, `high`        |
| `categoryId`  | String | Filter by category                     |
| `assignedTo`  | String | Filter by assigned user                |
| `startDate`   | String | Filter: created after (ISO 8601)       |
| `endDate`     | String | Filter: created before (ISO 8601)      |
| `page`        | Number | Page number (default: 1)               |
| `limit`       | Number | Items per page (default: 20, max: 100) |
| `sort`        | String | Sort field (default: `-createdAt`)     |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ { ticket }, ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Access Rules:**
- `admin` / `analyst` — see all tickets in their organization
- `user` — sees only their own tickets

---

### `GET /api/tickets/:id`
Get single ticket by ID. **Auth: Private**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id", "title", "description", "status", "priority",
    "category": { "_id", "name" },
    "organization": { "_id", "name" },
    "createdBy": { "_id", "name", "email" },
    "assignedTo": { "_id", "name", "email" },
    "createdAt", "resolvedAt"
  }
}
```

**Errors:** `404` (not found) · `403` (not authorized)

---

### `POST /api/tickets`
Create a new ticket. **Auth: Private**

| Field         | Type   | Required | Notes                          |
|---------------|--------|----------|--------------------------------|
| `title`       | String | ✅       | Min 5 chars                    |
| `description` | String | ✅       | Min 10 chars                   |
| `priority`    | String | ✅       | `low` / `medium` / `high`     |
| `categoryId`  | String | ✅       | Valid ServiceCategory ObjectId |

**Auto-set fields:** `status` → `open`, `createdBy` → from JWT, `organizationId` → from user

**Response:** `201 Created`

**Errors:** `400` (validation)

---

### `PUT /api/tickets/:id`
Update a ticket. **Auth: Private (owner/analyst/admin)**

| Field         | Type   | Required | Notes                                |
|---------------|--------|----------|--------------------------------------|
| `title`       | String | ❌       |                                      |
| `description` | String | ❌       |                                      |
| `status`      | String | ❌       | `open` / `in-progress` / `resolved`  |
| `priority`    | String | ❌       | `low` / `medium` / `high`           |
| `assignedTo`  | String | ❌       | Analyst/Admin only                   |

**Auto-set:** `resolvedAt` → set when status changes to `resolved`

**Response:** `200 OK`

**Errors:** `400` · `403` · `404`

---

### `DELETE /api/tickets/:id`
Delete a ticket. **Auth: Admin only**

**Response:** `200 OK`
```json
{ "success": true, "message": "Ticket deleted" }
```

**Errors:** `403` · `404`

---

## 3. Organization Endpoints

### `GET /api/organizations`
List all organizations. **Auth: Admin**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ { "_id", "name", "industry", "size", "createdAt" }, ... ]
}
```

---

### `GET /api/organizations/:id`
Get single organization. **Auth: Admin**

**Response:** `200 OK`

---

### `POST /api/organizations`
Create an organization. **Auth: Admin**

| Field      | Type   | Required |
|------------|--------|----------|
| `name`     | String | ✅       |
| `industry` | String | ❌       |
| `size`     | String | ❌       |

**Response:** `201 Created`

---

### `PUT /api/organizations/:id`
Update an organization. **Auth: Admin**

**Response:** `200 OK`

---

### `DELETE /api/organizations/:id`
Delete an organization. **Auth: Admin**

**Response:** `200 OK`

---

## 4. Service Category Endpoints

### `GET /api/categories`
List all categories. **Auth: Private**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ { "_id", "name", "description", "slaTimeLimit" }, ... ]
}
```

---

### `POST /api/categories`
Create a category. **Auth: Admin**

| Field          | Type   | Required | Notes              |
|----------------|--------|----------|--------------------|
| `name`         | String | ✅       |                    |
| `description`  | String | ❌       |                    |
| `slaTimeLimit` | Number | ✅       | Hours              |

**Response:** `201 Created`

---

### `PUT /api/categories/:id`
Update a category. **Auth: Admin**

---

### `DELETE /api/categories/:id`
Delete a category. **Auth: Admin**

---

## 5. SLA Endpoints

### `GET /api/sla`
List all SLA rules. **Auth: Private**

---

### `GET /api/sla/:categoryId`
Get SLA for a specific category. **Auth: Private**

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "_id", "categoryId", "responseTime", "resolutionTime" }
}
```

---

### `POST /api/sla`
Create/update SLA rule. **Auth: Admin**

| Field            | Type   | Required | Notes              |
|------------------|--------|----------|--------------------|
| `categoryId`     | String | ✅       | ServiceCategory ID |
| `responseTime`   | Number | ✅       | Minutes            |
| `resolutionTime` | Number | ✅       | Hours              |

**Response:** `201 Created`

---

## 6. Analytics Endpoints

### `GET /api/analytics/summary`
Get dashboard summary analytics. **Auth: Private (Admin/Analyst)**

| Query Param      | Type   | Description                  |
|------------------|--------|------------------------------|
| `organizationId` | String | Filter by org (admin only)   |
| `startDate`      | String | Period start (ISO 8601)      |
| `endDate`        | String | Period end (ISO 8601)        |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalTickets": 342,
    "openTickets": 45,
    "resolvedTickets": 280,
    "inProgressTickets": 17,
    "avgResolutionTimeHours": 4.2,
    "slaBreaches": 12,
    "slaComplianceRate": 96.5,
    "ticketsByPriority": { "low": 120, "medium": 150, "high": 72 },
    "ticketsByCategory": [ { "name": "Network", "count": 89 }, ... ],
    "resolutionTrend": [ { "date": "2026-02-01", "avg": 3.8 }, ... ]
  }
}
```

---

### `GET /api/analytics/reports`
List generated reports. **Auth: Admin**

---

### `POST /api/analytics/reports/generate`
Generate a new analytics report. **Auth: Admin**

| Field            | Type   | Required |
|------------------|--------|----------|
| `organizationId` | String | ✅       |

**Response:** `201 Created`

---

### `GET /api/analytics/export`
Export analytics as CSV. **Auth: Admin/Analyst**

| Query Param | Type   | Description        |
|-------------|--------|--------------------|
| `format`    | String | `csv` (default)    |

**Response:** `200 OK` with `Content-Type: text/csv`

---

## 7. Audit Log Endpoints

### `GET /api/audit-logs`
List audit logs with filtering. **Auth: Admin**

| Query Param | Type   | Description                        |
|-------------|--------|------------------------------------|
| `userId`    | String | Filter by user                     |
| `action`    | String | Filter: `CREATE`, `UPDATE`, `DELETE` |
| `entity`    | String | Filter: `Ticket`, `User`, etc.    |
| `page`      | Number | Pagination (default: 1)           |
| `limit`     | Number | Items per page (default: 50)      |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id", "userId", "action", "entity", "entityId",
      "changes": { "status": { "from": "open", "to": "resolved" } },
      "timestamp"
    }
  ],
  "pagination": { "total", "page", "limit", "pages" }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "VALIDATION_ERROR",
    "details": [ { "field": "email", "message": "Email is required" } ]
  }
}
```

### Standard HTTP Status Codes

| Code | Meaning               | Usage                        |
|------|-----------------------|------------------------------|
| 200  | OK                    | Successful read/update       |
| 201  | Created               | Successful creation          |
| 400  | Bad Request           | Validation error             |
| 401  | Unauthorized          | Missing/invalid token        |
| 403  | Forbidden             | Insufficient role            |
| 404  | Not Found             | Resource not found           |
| 409  | Conflict              | Duplicate resource           |
| 500  | Internal Server Error | Unexpected server error      |
