# DCC Guidelines (Updated)

## General Project Rules
1. **Purpose**: DCC is a crowd-sourced platform to track city services and expose corruption in Degahbur, targeting all citizens with a focus on simplicity and accessibility.
2. **Scope**: Core features include Dashboard, Reporting, Verification, Budget Tracking, Alerts. Build a minimal system first, then add features one by one.
3. **Tech Stack**:
   - Frontend: React (mobile-responsive, lightweight).
   - Backend: Node.js with Express.
   - Database: MongoDB (using provided MongoDB Atlas URI).
   - SMS: Twilio (using provided credentials).
   - Styling: Tailwind CSS (minimal, smooth, interactive).
4. **Project Size and Complexity**:
   - Keep the project lightweight: <50 MB total (excluding `node_modules`).
   - Avoid large dependencies or heavy assets.
5. **Development Approach**:
   - Build the core system first.
   - Implement features one by one, completing frontend and backend separately.
   - Test each feature before moving on.

## Development Guidelines
6. **Code Style**:
   - Use functional React components with hooks.
   - Follow RESTful API conventions.
   - Use explicit variable names.
   - Add minimal comments for major functions.
   - Use descriptive file names.
7. **UI/UX**:
   - Mobile-first, smooth, interactive interface.
   - Use Tailwind CSS: minimal, clean, user-friendly.
   - Ensure touch-friendly interactions.
   - Avoid heavy animations or large assets.
   - Add frontend text and messages:
     - Include a purpose statement on the homepage.
     - Add placeholder texts for each feature (e.g., form labels, success/error messages).
     - Keep texts simple and user-friendly.
     - Mark texts as placeholders to be adjusted later.
8. **Feature Implementation**:
   - For each feature: Build backend, then frontend (including texts), then test.
   - Order: Dashboard > Reporting > Verification > Budget > Alerts.
   - Ensure all frontend components include relevant placeholder texts.
9. **Testing**:
   - Test each feature: Backend (API), Frontend (UI, text visibility), Integration (end-to-end).
   - Do not proceed until tests pass.
   - Keep tests simple: manual testing is sufficient.
10. **Security and Accessibility**:
    - Skip fancy security features.
    - Use basic input validation.
    - Support SMS for low-tech users.
    - Keep the app lightweight.
    - Use simple language in the UI.
11. **Project Management**:
    - Use `NEXT_STEPS.md` as the primary action plan (replacing `IMPLEMENTATION-PLAN.md`).
    - Update `NEXT_STEPS.md` after each feature to mark it as "Done".

## Automation Flowchart
Use this flowchart for all tasks to ensure consistency: