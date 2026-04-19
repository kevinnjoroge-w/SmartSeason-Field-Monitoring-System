# 🌾 SmartSeason Field Monitoring System

SmartSeason is a streamlined, data-driven crop tracking platform designed for modern agriculture. It empowers agricultural coordinators and field agents to monitor crop progress, identify risks early, and maintain detailed observation logs throughout the growing season.

Built for efficiency and high-fidelity monitoring, SmartSeason bridges the gap between the field and the office.

---

## ✨ Key Features

- **Dynamic Field Tracking**: Real-time status Monitoring (Active, At Risk, Completed) based on growth stages and planting timelines.
- **Role-Based Access**: Specialized dashboards for Admins (Coordinators) and Field Agents.
- **Interactive Timelines**: Log detailed field observations and visual stage transitions.
- **Modern Aesthetics**: A bespoke design system using earthy greens and clay ambers, tailored for an intuitive agricultural experience.
- **Intelligent Risk Detection**: Automated "At Risk" flags for fields showing stagnant growth in early stages.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Local or Cloud instance)

### 1. Installation
Install all dependencies for the entire monorepo with a single command:
```bash
npm run install:all
```

### 2. Configuration
Create a `.env` file in the `server/` directory:
```env
DATABASE_URL=postgres://user:password@localhost:5432/smartseason
JWT_SECRET=your_secure_secret_here
PORT=5000
```

### 3. Database Initialization
Prepare your database schema and seed initial data:
```bash
npm run seed
```

### 4. Development
Launch both the API and the Frontend concurrently:
```bash
npm run dev
```
- **Platform**: `http://localhost:5173`
- **API Server**: `http://localhost:5000`

---

## 📐 Architecture & Design

### Intelligent Status Derivation
SmartSeason features a computed status logic that ensures data integrity by deriving field health in real-time:
- **Completed**: Crops successfully harvested.
- **At Risk**: Crops in 'Planted' or 'Growing' stages for >90 days without progression.
- **Active**: Healthy, ongoing growth cycles.

### Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Raw SQL for performance and simplicity)
- **Security**: JWT-based authentication with Bcrypt hashing

---

## 🛠 Deployment
The system is optimized for deployment on modern cloud platforms:
- **API/Database**: Render
- **Frontend**: Vercel

*Ensure `VITE_API_URL` and `FRONTEND_URL` environment variables are configured for cross-origin production communication.*
