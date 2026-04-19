# SmartSeason Field Monitoring System

A full-stack crop tracking platform built with React, Node.js + Express, and PostgreSQL, designed to help agricultural coordinators (Admins) and Field Agents monitor field stages and log observations during a growing season.

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL active database

### 1. Installation

Clone this repository and install all dependencies from the root directory:

```bash
npm run install:all
```
*(This installs packages for the root, server, and client concurrently)*

### 2. Environment Variables

In the `server/` directory, create a `.env` file (or Postgres will fallback to defaults `localhost:5432` / `postgres`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartseason
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=super_secret_jwt_key_123
PORT=5000
```

### 3. Database Setup & Seeding

Ensure your local PostgreSQL instance is running. Then, run the seed script which drops existing tables, creates the schema, and populates the database with demo users, fields, and updates.

```bash
# from the root folder
npm run seed
```

### 4. Running the Application

Start both the backend server and frontend development server concurrently from the root directory:

```bash
npm run dev
```

- **Client:** `http://localhost:5173`
- **Server:** `http://localhost:5000`

---

## Field Status Logic

The status of a field is **computed entirely on the fly** when data is fetched, rather than stored persistently. It is derived using the following logic hierarchy:

1. **Completed**: The field's current stage is `Harvested`.
2. **At Risk**: The field's stage is `Planted` or `Growing` **AND** the planting date is more than 90 days ago. (This implies it's stuck in early stages without progressing).
3. **Active**: If neither of the above conditions apply.

This logic is encapsulated cleanly in the backend inside `server/utils/statusHelper.js` to adhere to separation of concerns.

---

## Design Decisions & Assumptions

- **Architecture:** Monorepo using `concurrently` for easy development.
- **Backend Simplicity:** We used raw `pg` queries avoiding heavy ORMs like Prisma to keep the footprint strictly minimal as requested.
- **UI & Aesthetics:** Tailwind CSS v4 was configured strictly to meet the "No default UI library" constraint. We implemented a custom `DM Sans` font, disabled all drop shadows site-wide (`@theme { --shadow-sm: none; ... }`), and used a curated Earthy Green and Amber color palette.
- **No Component Logic:** All API fetching is abstracted into hook-agnostic functions inside `client/src/services/api.js`. Components strictly handle presentation and local form state.

---

## Demo Credentials

You can test the application using the following roles (pre-seeded):

**Admin (Coordinator):**
- **Email:** `admin@smartseason.com`
- **Password:** `admin123`

**Field Agent:**
- **Email:** `agent@smartseason.com`
- **Password:** `agent123`
# SmartSeason-Field-Monitoring-System
