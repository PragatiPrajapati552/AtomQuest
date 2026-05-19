# In-House Goal Setting & Tracking Portal
**Comprehensive Project Structure & File Reference**

## Architecture Overview
The project is split into two connected repositories within the `atmoquest` workspace:
1. `/backend`: A Node.js and Express RESTful API utilizing MongoDB for storage.
2. `/frontend`: A Next.js 14 App Router application styled with Tailwind CSS Dark Theme.

## Backend Directory (`/backend`)

The backend manages all data logic, authentication, and validation required by the BRD.

### Core Configuration
- `server.js`: The main Express server entry point. Connects to the database, configures CORS, and registers API routers.
- `config/db.js`: Contains the logic to connect to the MongoDB instance using Mongoose.
- `.env`: Holds environment variables (Mongo URI, JWT Secret, Port).
- `seeder.js`: A utility script to inject initial `admin`, `manager`, and `employee` mock accounts into the database to test the workflow.

### Middleware
- `middleware/auth.js`: Protects routes ensuring only logged-in users can access them. Implements Role-Based Access Control (RBAC) by checking JWT tokens and validating `employee`, `manager`, or `admin` roles.

### Database Models (`models/`)
- `User.js`: Schema for users (Name, Email, Password, Role, Manager ID). Uses `bcrypt` to hash passwords.
- `GoalSheet.js`: Schema representing an employee's goals for a given year. Tracks the state (`Draft`, `Submitted`, `Approved`, `Returned`).
- `Goal.js`: Schema for individual goals (Thrust Area, UoM, Target, Weightage). Enforces data types.
- `CheckIn.js`: Schema storing structured quarterly feedback from managers.
- `AuditLog.js`: Schema to track changes to goals after they are locked (Phase 2 Governance).

### Controllers & Routes (`controllers/` & `routes/`)
- `auth.js`: Handles `/api/auth/login`, generating JWT cookies.
- `users.js`: Handles fetching a manager's direct reports and fetching all users for admins.
- `goalsheets.js`: Handles submitting goal sheets (verifies 100% weightage, max 8 goals rules) and manager approval workflows.
- `goals.js`: Handles updating quarterly achievements (Actuals and Status) for specific goals.
- `checkins.js`: Handles the creation of quarterly feedback by managers.

---

## Frontend Directory (`/frontend`)

The frontend is a React application built on Next.js, utilizing a sleek dark theme with glassmorphism UI elements.

### Core Configuration
- `package.json`: Contains React, Next.js, Axios, and Tailwind CSS dependencies.
- `src/lib/api.js`: Pre-configures Axios with the backend base URL (`http://localhost:5000/api`) and ensures cookies/credentials are passed in every request.
- `src/context/AuthContext.js`: React Context Provider that manages global user state. It checks if the user is authenticated, handles login routing, and provides logout functionality.

### Layouts & Styling
- `src/app/globals.css`: Contains custom Tailwind CSS variables defining our dark mode color palette (Slates, Emeralds, Blues) and custom utilities like `.glass-card` for translucent UI components.
- `src/app/layout.js`: The root layout wrapping the entire app in the `AuthProvider`.
- `src/components/DashboardLayout.js`: A highly dynamic sidebar layout. It reads the user's role from `AuthContext` and renders the appropriate navigation links (e.g., Employees see "My Goals", Managers see "Team Dashboard").

### Pages (`src/app/`)
- `login/page.js`: The entry point. A beautifully animated login form.
- `employee/page.js`: The employee dashboard. Shows goal sheet status (Draft, Approved, Returned). If no sheet exists, it conditionally renders the `GoalSettingForm`.
- `employee/achievements/page.js`: Allows employees to input their quarterly "Actual" numbers and update their goal statuses (On Track, Completed).
- `manager/page.js`: The Team Dashboard. Shows aggregate stats on how many employees have submitted goals versus how many are pending.
- `manager/approvals/page.js`: Interface for managers to review submitted goal sheets. Allows inline editing of targets and weightages before approving/rejecting.
- `manager/checkins/page.js`: The Quarterly Check-in screen. Displays employee progress vs targets and provides a text area for the manager's structured quarterly feedback.
- `admin/page.js`: The Admin Console. Displays high-level system usage stats, lists all users, and provides a CSV export feature for achievement reports.

### Components
- `src/components/GoalSettingForm.js`: A complex, highly interactive form used by employees to draft goals. It actively calculates the total weightage and prevents submission until the strict rules (Total = 100%, Min Weight = 10%, Max Goals = 8) are met.
