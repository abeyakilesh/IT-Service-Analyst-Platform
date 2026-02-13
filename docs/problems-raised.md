# Problems Raised & Resolved

This document tracks issues encountered during development and their resolutions.

---

## 1. Login Page Refresh Instead of Error Toast
- **Date**: 2026-02-13
- **Problem**: Login with wrong credentials caused a silent page refresh instead of showing an error toast.
- **Root Cause**: The 401 response interceptor in `client/src/api/axios.js` was redirecting to `/login` for *all* 401 responses, including failed login attempts.
- **Fix**: Added a check in the interceptor to skip redirect for auth endpoints (`/auth/login`, `/auth/register`).
- **File**: `client/src/api/axios.js`

## 2. Socket.io Connection Failure (Wrong Port)
- **Date**: 2026-02-13
- **Problem**: Real-time notifications were not working — Socket.io connection failing silently.
- **Root Cause**: `SOCKET_URL` was hardcoded to `http://localhost:5000` but the server runs on port `5001`.
- **Fix**: Changed to use `import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'`.
- **File**: `client/src/components/NotificationPanel.jsx`

## 3. Double `/api` Prefix in API Calls (404 Errors)
- **Date**: 2026-02-13
- **Problem**: Notification API returning 404. Browser showed requests going to `/api/api/notifications`.
- **Root Cause**: Axios instance `baseURL` is set to `/api`, but `notificationApi.js` and `messageApi.js` paths started with `/api/...`, causing double prefix.
- **Fix**: Removed `/api` prefix from API files — paths should be relative to the baseURL (e.g., `/notifications` not `/api/notifications`).
- **Files**: `client/src/api/notificationApi.js`, `client/src/api/messageApi.js`

## 4. Notifications Not Showing Ticket Details
- **Date**: 2026-02-13
- **Problem**: Notification panel showed "No notifications yet" even after ticket creation; no ticket info visible.
- **Root Cause**: (a) Notifications were only emitted via socket but not persisted to DB. (b) No demo data existed to populate the panel. (c) The `ticketId` field was not being populated with ticket details in notifications.
- **Fix**: 
  - Updated `ticketController.js` to persist notifications to DB (using `Notification.create/insertMany`) alongside socket events.
  - Created scaled seeder with 41 users, 50 tickets, 90 messages, and 51 notifications.
  - Backend `getNotifications` already populates `ticketId` with `title status priority`.
  - Frontend updated to show ticket title, status badge, priority badge in notification items.
- **Files**: `server/controllers/ticketController.js`, `server/utils/seeder.js`, `client/src/components/NotificationPanel.jsx`

## 5. No "Start Chat" or Chat Functionality
- **Date**: 2026-02-13
- **Problem**: Messages tab relied on notifications to build a chat list — no way to start a new chat, and empty when no notifications existed.
- **Root Cause**: Chat ticket list was derived from notification data (extracting unique `ticketId`s), which is unreliable and empty on fresh accounts.
- **Fix**: 
  - Added `GET /api/tickets/my-chats` backend endpoint that returns all tickets the user can chat on (with last message preview, message count).
  - Chat list now fetches from dedicated API, not parsed from notifications.
  - Users see all their tickets; analysts see their assigned tickets; admin sees all.
- **Files**: `server/controllers/ticketController.js`, `server/routes/tickets.js`, `client/src/api/messageApi.js`, `client/src/components/NotificationPanel.jsx`

## 6. Vite Proxy Missing for Socket.io WebSocket
- **Date**: 2026-02-13
- **Problem**: WebSocket connections through Vite dev server failing.
- **Root Cause**: Only `/api` proxy was configured; `/socket.io` needed its own proxy with `ws: true`.
- **Fix**: Added `/socket.io` proxy to `vite.config.js` with `ws: true`.
- **File**: `client/vite.config.js`
