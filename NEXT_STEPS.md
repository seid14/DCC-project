In Cursor, for the DCC project, we’ve completed the core authentication and role-based access features in Step 4. Now, let’s expand the `AdminPanel` with advanced admin features: user management, report management, and dashboard insights. Use `DCC_GUIDELINES.md` as the knowledge base and follow `NEXT_STEPS.md`. I’ll provide high-level instructions, and you should implement the features consistently with the existing codebase. Do not rely on previously provided code snippets; instead, use the project’s current state and best practices to write the code.

**Current State**:
- **Frontend**:
  - `App.jsx` has routes for `/`, `/statistics`, `/about`, `/dashboard`, `/report`, `/verify`, `/auth/*` (with nested routes `/auth` and `/auth/admin`), `/admin`, and `/unauthorized`.
  - `Auth.jsx` handles login for both regular users (`/auth`) and admins (`/auth/admin`), making a `POST` request to `http://localhost:5000/api/auth/login`.
  - `ProtectedRoute.jsx` restricts routes based on user roles (e.g., `/admin` requires `role: "admin"`).
  - `AdminPanel.jsx` is a placeholder with sections titled "User Management" and "Report Management", but no functionality yet.
  - Axios is used for API requests (e.g., in `Auth.jsx`).
- **Backend**:
  - Running on port `5000`.
  - MongoDB is set up with a `User` model (fields: `phone`, `role`, `verified`, and possibly others).
  - `POST /api/auth/login` authenticates users, assigns roles (`admin` for phone `1234567890`, `user` for others), and saves users to MongoDB.
  - Twilio SMS sending is temporarily disabled.
- **Completed Steps**:
  - Step 2: Login and Sign-Up System (fully functional).
  - Step 4: Role-Based Access with Admin Roles (basic `AdminPanel` implemented, ready for advanced features).

**Advanced Admin Features to Implement**:
1. **User Management**:
   - Display a table of all users with columns: phone number, role, status (banned or active), and actions.
   - Add a `banned` field to the `User` model (default: `false`) if not already present.
   - Allow admins to ban/unban users (toggle the `banned` field).
   - Allow admins to delete users.
2. **Report Management**:
   - Create a `Report` model in the backend (if not present) with fields: `userId` (reference to `User`), `content` (string), `status` (enum: `pending`, `resolved`, default: `pending`), `createdAt` (timestamp).
   - Display a table of all reports with columns: user phone (from `userId`), content, status, created date, and actions.
   - Allow admins to delete reports.
   - Allow admins to mark reports as resolved (update `status` to `resolved`).
3. **Admin Dashboard Insights**:
   - Add a "Dashboard Insights" section above user and report management.
   - Display user statistics: total users, number of admins, number of banned users.
   - Display report statistics: total reports, number of pending reports, number of resolved reports.

**High-Level Implementation Steps**:

1. **Backend Enhancements**:
   - **Update the `User` Model**:
     - Ensure the `User` model in `/backend/models/User.js` has a `banned` field (type: Boolean, default: `false`).
     - Add any missing fields like `createdAt` (type: Date, default: current timestamp).
   - **Create a `Report` Model**:
     - If `/backend/models/Report.js` doesn’t exist, create it with the fields: `userId` (reference to `User`), `content` (string, required), `status` (enum: `pending` or `resolved`, default: `pending`), `createdAt` (timestamp, default: current timestamp).
   - **Create Admin API Endpoints**:
     - Create a new file `/backend/routes/admin.js` (if not present).
     - Add the following endpoints (all restricted to admins):
       - `GET /api/admin/users`: Fetch all users.
       - `PUT /api/admin/users/:id/ban`: Update a user’s `banned` status (pass `banned: true` or `false` in the request body).
       - `DELETE /api/admin/users/:id`: Delete a user by ID.
       - `GET /api/admin/reports`: Fetch all reports, populating the `userId` field to include the user’s phone number.
       - `DELETE /api/admin/reports/:id`: Delete a report by ID.
       - `PUT /api/admin/reports/:id/status`: Update a report’s `status` (pass `status: "resolved"` in the request body).
       - `GET /api/admin/stats`: Fetch statistics (total users, admins, banned users, total reports, pending reports, resolved reports).
     - Add middleware to ensure only admins can access these endpoints (check the requesting user’s role using a phone number passed in the request body, e.g., `adminPhone`).
     - Mount the admin routes in the main server file (e.g., `/backend/server.js`) under `/api/admin`.

2. **Frontend Enhancements**:
   - **Update `AdminPanel.jsx`**:
     - Fetch data from the backend using Axios when the component mounts:
       - Fetch users from `GET /api/admin/users`.
       - Fetch reports from `GET /api/admin/reports`.
       - Fetch statistics from `GET /api/admin/stats`.
     - Include the admin’s phone number (from `localStorage`) in the request body for authentication (e.g., `{ adminPhone: user.phone }`).
     - Add a "Dashboard Insights" section at the top with two columns:
       - User Statistics: Show total users, number of admins, and number of banned users.
       - Report Statistics: Show total reports, number of pending reports, and number of resolved reports.
     - Update the "User Management" section to display a table with columns: phone, role, status (banned or active), and actions.
       - Actions: Add buttons to ban/unban (toggle between "Ban" and "Unban" based on status) and delete users.
       - On ban/unban, make a `PUT` request to `/api/admin/users/:id/ban`.
       - On delete, make a `DELETE` request to `/api/admin/users/:id`.
     - Update the "Report Management" section to display a table with columns: user phone (from `userId`), content, status, created date (formatted as a readable date), and actions.
       - Actions: Add a "Mark as Resolved" button (only for pending reports) and a "Delete" button.
       - On mark as resolved, make a `PUT` request to `/api/admin/reports/:id/status`.
       - On delete, make a `DELETE` request to `/api/admin/reports/:id`.
     - Add error handling: Display error messages (e.g., from API failures) in a red alert box above the sections.
     - Refresh the data after each action (ban, unban, delete, mark as resolved).

3. **Test the Features**:
   - Ensure both the backend and frontend are running:
     - Backend: `cd backend && npm start` (port `5000`).
     - Frontend: `cd frontend && npm start` (port `3000`).
   - Open the browser’s developer tools (`F12`) and monitor the "Network" tab for API requests.
   - **Test User Management**:
     - Log in as an admin (phone: `"1234567890"`) and navigate to `/admin`.
     - Verify that the user table shows all users with their phone, role, status, and actions.
     - Ban a user and confirm their status updates to "Banned".
     - Unban the user and confirm their status updates to "Active".
     - Delete a user and confirm they are removed from the table.
   - **Test Report Management**:
     - Verify that the report table shows all reports (it may be empty if no reports exist).
     - If possible, log in as a regular user, submit a report via `/report`, and refresh the admin panel to see the report.
     - Mark a report as resolved and confirm the status updates to "resolved".
     - Delete a report and confirm it is removed from the table.
   - **Test Dashboard Insights**:
     - Verify that user statistics (total, admins, banned) and report statistics (total, pending, resolved) are displayed correctly.
   - Report any errors encountered during testing.

4. **Update `NEXT_STEPS.md`**:
   - Open `NEXT_STEPS.md` in the root directory.
   - Mark Step 4: Role-Based Access with Admin Roles as complete (e.g., add "[x]" or "Completed" next to Step 4).
   - Add a note that advanced admin features (user management, report management, dashboard insights) have been implemented.
   - Update the file if needed.

5. **Proceed to the Next Step**:
   - Proceed to the next step in `NEXT_STEPS.md` (likely Step 5, which may involve the reporting system or statistics).
   - Use the prompt: "In Cursor, for the DCC project, use `DCC_GUIDELINES.md` as the knowledge base. Follow `NEXT_STEPS.md`. Proceed to the next step."