# 🐛 Problems Raised & Solutions

A log of every issue encountered during the development of the **IT Service Analyst Dashboard**, why it happened, and how it was fixed.

---

## Problem #1 — Landing Page Alignment & Navigation Issues

| Detail | Info |
|--------|------|
| **When** | During frontend build phase |
| **Symptom** | Feature cards on the landing page were misaligned, and clicking them didn't navigate anywhere |

### Why It Happened
- CSS cascade issues caused layout misalignment on the landing page.
- Feature cards were plain `<div>` elements with no routing logic — they weren't wrapped in `<Link>` components.

### How We Fixed It
- Corrected the CSS cascade/specificity problems to fix card alignment.
- Wrapped feature cards in React Router `<Link>` components so clicking them navigates to the corresponding pages (Tickets, Analytics, SLA, etc.).

### Files Changed
- `client/src/pages/LandingPage.jsx`

---

## Problem #2 — Port 5000 Hijacked by macOS AirPlay Receiver (403 Forbidden)

| Detail | Info |
|--------|------|
| **When** | First time running the backend server |
| **Symptom** | All API requests returned **HTTP 403 Forbidden**. Registration page showed "No organizations found — run the database seeder first" even after seeding. Demo login buttons returned "Demo login failed". |

### Why It Happened
On **macOS Monterey and later**, the **AirPlay Receiver** service listens on port **5000** by default. When our Express server tried to start on port 5000, AirPlay was already occupying it. macOS silently intercepted all HTTP requests on that port and returned `403 Forbidden` with headers like:

```
Server: AirTunes/925.5.1
X-Apple-ProcessingTime: 0
```

Our Vite dev server proxy was forwarding `/api` → `http://localhost:5000`, which hit AirPlay instead of Express.

### How We Diagnosed It
```bash
# This revealed AirPlay (ControlCenter) was on port 5000
lsof -i :5000
# Output: ControlCe 435 apple ... TCP *:commplex-main (LISTEN)

# Direct curl showed the AirTunes headers
curl -v http://localhost:5000/api/organizations
# Response: Server: AirTunes/925.5.1
```

### How We Fixed It
Changed the server port from `5000` → `5001`:

1. **`server/.env`** — Changed `PORT=5000` to `PORT=5001`
2. **`client/vite.config.js`** — Updated proxy target from `http://localhost:5000` to `http://localhost:5001`

### Lesson Learned
> **Always avoid port 5000 on macOS.** Use 5001, 3001, 8080, or any port not reserved by system services. You can check port usage with `lsof -i :<port>`.

---

## Problem #3 — "next is not a function" Error on Ticket Creation (Mongoose 9 Breaking Change)

| Detail | Info |
|--------|------|
| **When** | Creating a new ticket via the UI or API |
| **Symptom** | POST `/api/tickets` returned `{"success":false,"error":{"message":"next is not a function"}}` |

### Why It Happened
The Ticket model had a Mongoose **pre-save hook** using the old callback style:

```javascript
// ❌ Old pattern — Mongoose 8 and below
ticketSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'resolved') {
        this.resolvedAt = new Date();
    }
    next();  // <-- This "next" is undefined in Mongoose 9!
});
```

**Mongoose 9 removed the `next` callback from middleware hooks.** Hooks now use promises or simply return. The `next` parameter was `undefined`, and calling `next()` threw `TypeError: next is not a function`.

### How We Fixed It
Removed the `next` parameter and the `next()` call:

```javascript
// ✅ Mongoose 9 compatible
ticketSchema.pre('save', function () {
    if (this.isModified('status') && this.status === 'resolved') {
        this.resolvedAt = new Date();
    }
});
```

### Files Changed
- `server/models/Ticket.js`

### Lesson Learned
> **Mongoose 9 migration**: All `pre`/`post` hooks must drop `next`. Use `async` functions and `return`/`throw` instead. See: [Mongoose 9 Migration Guide](https://mongoosejs.com/docs/migrating_to_9.html)

---

## Problem #4 — Express 5 + express-validator Incompatibility (Login & Routes Hanging)

| Detail | Info |
|--------|------|
| **When** | All POST routes that used express-validator (login, register, ticket creation) |
| **Symptom** | POST requests hung indefinitely or returned "next is not a function" |

### Why It Happened
The project uses **Express 5** (`express@^5.2.1`) which handles middleware differently.

**express-validator** validation chains (e.g., `body('title').notEmpty()`) implement a `.then()` method, making them **"thenables"**. Express 5 detects thenables and tries to handle them as Promises instead of treating them as normal middleware functions.

The old pattern was:
```javascript
// ❌ Doesn't work in Express 5
router.post('/login', loginValidator, validate, login);
//                     ^ Array of thenables — Express 5 mishandles these
```

### How We Fixed It
Rewrote `middleware/validate.js` as a **factory function** that manually runs validators using `.run(req)`:

```javascript
// ✅ Express 5 compatible
const validate = (validations) => async (req, res, next) => {
    for (const validation of validations) {
        await validation.run(req);   // Run each validator explicitly
    }
    // Then check results...
    const errors = validationResult(req);
    if (!errors.isEmpty()) { /* return 400 */ }
    next();
};
```

Routes now pass the validator array INTO validate:
```javascript
// ✅ New pattern
router.post('/login', validate(loginValidator), login);
router.post('/', validate(createTicketValidator), createTicket);
```

### Files Changed
- `server/middleware/validate.js` — Rewritten as factory function
- `server/routes/auth.js` — Updated to `validate(validatorArray)` pattern
- `server/routes/tickets.js` — Updated to `validate(validatorArray)` pattern
- `server/routes/organizations.js` — Updated to `validate(validatorArray)` pattern
- `server/routes/categories.js` — Updated to `validate(validatorArray)` pattern

### Lesson Learned
> **Express 5 + express-validator**: Never pass validation chains directly as route middleware. Always use `validator.run(req)` inside a wrapper function. This is the recommended pattern for Express 5.

---

## Problem #5 — No Demo Login Credentials Visible to Users

| Detail | Info |
|--------|------|
| **When** | First time visiting the login page |
| **Symptom** | User didn't know what credentials to enter. No demo accounts were displayed. |

### Why It Happened
The seeder creates test accounts (`admin@acme.com`, `analyst@acme.com`, `user@acme.com`) but the login page had no way to show or use these credentials without manually looking at the seeder code.

### How We Fixed It
Added a **"Quick Demo Login"** section to `LoginPage.jsx` with three color-coded buttons:

| Button | Email | Password | Color |
|--------|-------|----------|-------|
| **Admin** | admin@acme.com | admin1234 | Purple |
| **Analyst** | analyst@acme.com | analyst1234 | Emerald |
| **User** | user@acme.com | user1234 | Amber |

Each button directly calls the login API — no form filling needed.

### Files Changed
- `client/src/pages/LoginPage.jsx`

---

## Summary Table

| # | Problem | Root Cause | Severity |
|---|---------|-----------|----------|
| 1 | Landing page alignment & nav | CSS cascade + missing `<Link>` wrappers | Medium |
| 2 | 403 on all API calls | macOS AirPlay on port 5000 | Critical |
| 3 | "next is not a function" | Mongoose 9 removed `next` from hooks | Critical |
| 4 | Validators breaking routes | Express 5 mishandles thenable middleware | Critical |
| 5 | No demo login visible | Missing UX for test credentials | Low |
