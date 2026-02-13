# Mini Software Requirements Specification (SRS)
**Project Name:** IT Service Analyst Dashboard

## 1. Introduction
The **IT Service Analyst Dashboard** is a comprehensive web application designed to streamline IT support operations. It allows organizations to manage helpdesk tickets, track performance analytics, and facilitate real-time communication between users and support analysts.

## 2. Technology Stack

### Frontend (Client)
*   **Core Framework**: React 19 (Latest) running on Vite 7 for blazing fast performance.
*   **Language**: Modern JavaScript (ES Modules).
*   **Styling**: TailwindCSS 4 (Utility-first CSS) + Custom animations.
*   **State Management**:
    *   **Zustand**: For simpler global state (User auth, Theme).
    *   **TanStack Query (React Query)**: For server state caching, background updates, and optimistic UI.
*   **Routing**: React Router v7.
*   **Forms & Validation**: React Hook Form + Zod Schema Validation.
*   **Real-time Comms**: Socket.io Client (WebSockets).
*   **Visualizations**: Chart.js for analytics dashboards.

### Backend (Server)
*   **Runtime**: Node.js.
*   **Framework**: Express 5 (Modern web framework).
*   **Database**: MongoDB (NoSQL) accessed via Mongoose v9 (ODM).
*   **Real-time Server**: Socket.io (WebSocket server).
*   **Authentication**: JSON Web Tokens (JWT) + bcryptjs (Password hashing).
*   **Security**: Helmet (Headers), CORS, and input validation.

### Tools & DevOps
*   **Package Manager**: npm.
*   **Version Control**: Git.
*   **Linting**: ESLint.

## 3. System Architecture & How It Works

### High-Level Overview
The application follows a **Client-Server Architecture** (MERN Stack: MongoDB, Express, React, Node).

1.  **Client (The Browser)**:
    *   Users interact with the React interface.
    *   When a user clicks a button (e.g., "Create Ticket"), the client sends an **HTTP Request** (via Axios) to the server.
    *   For live chat, the client maintains an open **WebSocket connection** to receive messages instantly without refreshing.

2.  **Server ( The API)**:
    *   The Express server listens for requests on specific **Endpoints** (e.g., `POST /api/tickets`).
    *   **Middleware** checks if the user is logged in (verifying the JWT token).
    *   **Controllers** handle the logic (e.g., "Save this message to the database").

3.  **Database (The Storage)**:
    *   MongoDB stores all data in **Collections** (Users, Tickets, Messages, Organizations).
    *   Data is structured using **Schemas** types defined in Mongoose.

### Key Data Flows

*   **Authentication**:
    *   User logs in -> Server verifies password -> Server sends back a **Token**.
    *   Client saves Token in `localStorage`.
    *   Future requests send this Token in the header: `Authorization: Bearer <token>`.

*   **Real-time Chat**:
    *   User A sends message -> Server saves to DB -> Server emits `message:new` event via Socket.io.
    *   User B's client listens for `message:new` -> Uniquely updates the UI instantly (Optimistic UI updates happens even faster on sender's side).

## 4. Key Features
*   **Role-Based Access**: Specialized views for **Users**, **Analysts**, and **Admins**.
*   **Ticket Management**: Create, view, update status, and assign priorities to tickets.
*   **Live Chat**: WhatsApp-style messaging within tickets with read receipts and typing indicators.
*   **Analytics Dashboard**: Visual charts showing ticket volume, resolution times, and team performance.
*   **SLA Tracking**: Monitors service level agreements to ensure timely issue resolution.
