# Beginner's Guide to the IT Service Analyst Dashboard

This guide is designed to help you understand the project structure, learn the basics of React used in this app, and how to work with the tools.

---

## 1. Project Structure Explained

The project is split into two main folders: **Client** (Frontend) and **Server** (Backend).

### 📂 Client (`/client`)
This is the React application that runs in the user's browser.

*   `src/api/`: Contains files like `authApi.js` and `ticketApi.js`. These are helper functions that make **HTTP requests** to the backend. Instead of writing `fetch(...)` everywhere, we just call `loginUser(data)`.
*   `src/components/`: Reusable UI pieces.
    *   `NotificationPanel.jsx`: The slide-out panel for notifications and chat.
    *   `Sidebar.jsx`: The navigation menu on the left.
    *   `StatCard.jsx`: Small cards showing numbers (e.g., "Total Tickets").
*   `src/pages/`: Full pages that users navigate to.
    *   `LoginPage.jsx`: The sign-in screen.
    *   `TicketCreatePage.jsx`: The form to submit a new ticket.
*   `src/store/`: Global state management.
    *   `authStore.js`: Keeps track of the logged-in user and their token using **Zustand**.
*   `src/App.jsx`: The main entry point. It handles **Routing** (which page to show based on the URL).

### 📂 Server (`/server`)
This is the Node.js API that talks to the database.

*   `controllers/`: The logic for each route.
    *   `authController.js`: Handles logic for logging in and registering.
    *   `ticketController.js`: Logic for creating and fetching tickets.
*   `models/`: Defines the **Database Schema** (structure).
    *   `User.js`: Defines what a user looks like (name, email, password, role).
    *   `Ticket.js`: Defines a ticket (title, status, priority).
*   `routes/`: Defines the **API Endpoints**.
    *   `GET /api/tickets` -> Goes to `ticketController.getTickets`.
*   `middleware/`: Code that runs *before* the controller.
    *   `auth.js`: Checks if the user sent a valid token (is logged in?).

---

## 2. React Concepts Used

### Components (`.jsx`)
React apps are built from components. A component is a JavaScript function that returns HTML (JSX).
```jsx
// Example Component
const Welcome = ({ name }) => {
    return <h1>Hello, {name}!</h1>;
};
```

### Hooks (The "Magic" Functions)
*   `useState`: Remembers data within a component.
    *   `const [count, setCount] = useState(0);`
*   `useEffect`: Runs code when the component loads or when data changes.
    *   Used for: Fetching data, connecting to sockets.
*   `useQuery` (React Query): The advanced way to fetch data. It handles caching, loading states, and errors automatically.
    *   *Used heavily in `NotificationPanel.jsx` to load chats instantly.*
*   `useMutation`: Used for sending data (creating tickets, sending messages).

### Props vs State
*   **Props**: Data passed *down* from a parent to a child (like arguments to a function). Read-only.
*   **State**: Data created *inside* a component that can change (like local variables).

---

## 3. How to Use the Tools

### Terminal Commands
You'll use the terminal to run the project.

*   `npm install`: Installs all the dependencies listed in `package.json`. Run this once in both `/client` and `/server`.
*   `npm run dev`: Starts the development server.
    *   In `/server`: Starts the backend on port 5001.
    *   In `/client`: Starts the frontend on port 5173.
*   `npm run seed`: (Server only) Resets the database and fills it with dummy data (Users, Tickets) for testing.

### Debugging Tips
1.  **Browser Console**: Right-click -> Inspect -> Console. Look here for frontend errors (red text).
2.  **Network Tab**: In Inspect tools, go to the "Network" tab to see API requests. If a request is red (400 or 500 error), click it to see the response from the server.
3.  **Server Logs**: Check your terminal where the server is running. `morgan` logs every request made to the API.

---

## 4. Common Workflows

### Creating a New Feature
1.  **Backend**:
    *   Create a **Model** (Schema) if needed.
    *   Create a **Controller** function (the logic).
    *   Add a **Route** in `routes/` and link it to the controller.
2.  **Frontend**:
    *   Create an **API helper** function in `src/api/`.
    *   Create a **Component** or **Page** to display the feature.
    *   Use `useQuery` to fetch data or `useMutation` to save data.

### Fixing a Bug
1.  Reproduce the bug.
2.  Check the **Console** and **Network Tab**.
3.  If it's an API error, check the **Server Terminal**.
4.  Find the relevant code (use specific file names like `ticketController.js`).
5.  Apply the fix and test again.

---

*This guide is intended for beginners onboarding to the IT Service Analyst Dashboard project.*
