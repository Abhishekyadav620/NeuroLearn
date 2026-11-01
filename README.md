# NeuroLearn – AI-Powered Adaptive Learning System

[![Architecture: MERN Monorepo](https://img.shields.io/badge/Architecture-MERN%20Monorepo-8B5CF6?style=flat-square)](https://github.com)
[![Frontend: React + Vite + Tailwind](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-EC4899?style=flat-square)](https://vitejs.dev)
[![Backend: Express + Node + Mongoose](https://img.shields.io/badge/Backend-Express%20%7C%20Node%20%7C%20Mongoose-10B981?style=flat-square)](https://nodejs.org)
[![Privacy: First](https://img.shields.io/badge/Privacy-First%20%7C%20Zero--Gaze--Unconsented-blue?style=flat-square)](https://github.com)

---

## 1. Project Introduction

**NeuroLearn** is an AI-powered adaptive learning platform designed to elevate the educational journey by monitoring non-intrusive learner interaction patterns and utilizing Machine Learning to predict **attention drift** and **cognitive friction**.

Traditional e-learning platforms present static material at a uniform velocity regardless of student cognitive load or engagement. NeuroLearn solves this challenge by dynamically adapting content delivery to maintain the learner in optimal **cognitive flow**.

---

## 2. Project Objectives

NeuroLearn dynamically personalizes learning experiences through autonomous adaptive interventions:

- **Simplifying Lengthy Learning Material:** Automatically transforming dense theoretical passages into digestible summaries and visual outlines when reading fatigue is detected.
- **Micro-Section Chunking:** Dividing long modules into 3–5 minute focused micro-learning sprints.
- **Dynamic Playback Speed Adjustment:** Modulating multimedia playback speed based on real-time comprehension metrics.
- **Interactive Pulse Quizzes:** Triggering single-question interactive check-ins to reignite focus when attention drift latency is observed.
- **Targeted Summaries & Recommendations:** Providing contextual study guides and alternate explanatory resources.
- **Privacy-Preserving Telemetry Monitoring:** Evaluating engagement through non-biometric interaction patterns.

### Core Behavioral Signals
1. **Scrolling Behaviour:** Scroll acceleration, micro-reversals, and erratic velocity changes indicating confusion or skimming.
2. **Mouse Movement:** Cursor trajectory jitter, dwell time, and idle latency.
3. **Reading Time & Pacing:** Comparing actual reading duration with benchmarked comprehension norms.
4. **Quiz Performance:** Formative checkpoint accuracy, response latency, and confidence indexing.
5. **Optional Gaze & Blink Patterns (Privacy-Gated):** Optical attention telemetry active *only* with explicit, revocable student opt-in.

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js (v18.3+)
- **Build Tool:** Vite (v6.0+)
- **Language:** JavaScript (ES6+ Modules)
- **Styling:** Tailwind CSS (v3.4+) with customized dark-purple SaaS tokens
- **Routing:** React Router DOM (v6.28+)
- **HTTP Client:** Axios (v1.7+) with unified interceptors
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Typography:** Inter (Google Fonts)

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4.21+)
- **Module System:** JavaScript ES Modules (`"type": "module"`)
- **Database Engine:** MongoDB via Mongoose (v8.9+)
- **Security Middleware:** Helmet, CORS
- **Logging:** Morgan (dev/combined modes)
- **Environment Management:** Dotenv

### Tooling & Monorepo
- **Orchestration:** Concurrently (v9.1+)
- **Live Reload:** Nodemon (v3.1+)

---

## 4. Architecture Overview

NeuroLearn employs a modular **MERN Monorepo** architecture designed with strict separation of concerns:

```
neurolearn/
├── client/              # React + Vite frontend application
│   ├── public/          # Static assets & favicons
│   └── src/
│       ├── assets/      # Visual media & imagery
│       ├── components/  # Reusable UI component library
│       │   ├── common/  # Buttons, Cards, Inputs
│       │   ├── layout/  # Navbar, Footer, MainLayout
│       │   └── ui/      # Badges, Tooltips, Status indicators
│       ├── context/     # React state providers (Theme, Auth, Session)
│       ├── data/        # Static navigation & signal metadata
│       ├── hooks/       # Custom React hooks (useHealthCheck)
│       ├── pages/       # Route-level page views (LandingPage, Dashboard)
│       ├── routes/      # Centralized React Router configuration
│       ├── services/    # Axios API client & health service contracts
│       ├── utils/       # String formatters & style helpers
│       ├── App.jsx      # Root routing & layout container
│       ├── index.css    # Tailwind CSS & global design tokens
│       └── main.jsx     # Vite client entrypoint
├── server/              # Express + Node.js backend API
│   └── src/
│       ├── config/      # Environment variables & Mongoose connection
│       ├── controllers/ # HTTP route controllers
│       ├── middleware/  # Error handlers, 404, CORS, Morgan logger
│       ├── models/      # Mongoose schemas (Sessions, Telemetry, Users)
│       ├── routes/      # Express API routers (/api/health)
│       ├── services/    # Core business logic & diagnostic collectors
│       ├── utils/       # Standardized response formatters & logger
│       ├── validators/  # Request validation schemas
│       ├── app.js       # Express application configuration
│       └── server.js    # HTTP listener & database connection bootstrap
├── .gitignore           # Global git ignore configuration
├── package.json         # Monorepo root scripts & dev orchestration
└── README.md            # System documentation & developer guide
```

---

## 5. Design System

NeuroLearn uses a curated **Dark-Purple SaaS** aesthetic:

| Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Background** | `neuro-bg` | `#0B0B16` | Main app background canvas |
| **Secondary Background** | `neuro-bgSecondary` | `#111124` | Navbars, footers, secondary panels |
| **Card Background** | `neuro-card` | `#19192F` | Primary content cards |
| **Elevated Surface** | `neuro-elevated` | `#232340` | Hover states, active tabs, dialogs |
| **Brand Purple** | `neuro-purple` | `#8B5CF6` | Primary CTAs, highlights, active states |
| **Secondary Purple** | `neuro-purpleLight` | `#A78BFA` | Subheadings, links, accent borders |
| **Pink Accent** | `neuro-pink` | `#EC4899` | Energy metrics, drift warnings, gradients |
| **Primary Text** | `neuro-text` | `#F8FAFC` | Headings and high-contrast body text |
| **Secondary Text** | `neuro-textMuted` | `#9CA3AF` | Supporting labels, hints, metadata |

---

## 6. Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Local MongoDB Community Edition or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

---

## 7. Installation & Setup

### Step 1: Install All Dependencies
From the root directory, run the batch installation script:

```bash
npm run install:all
```

Alternatively, install dependencies manually:
```bash
# Install root orchestration tools
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

---

## 8. Environment Variables

### Server Configuration (`server/.env`)
Copy the example environment file:
```bash
cp server/.env.example server/.env
```

Contents of `server/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Update with your MongoDB Atlas or local URI)
MONGODB_URI=mongodb://127.0.0.1:27017/neurolearn

# Client Application URL (For CORS whitelist)
CLIENT_URL=http://localhost:5173

# Authentication Secret (Used in future auth milestones)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### Client Configuration (`client/.env`)
Copy the client environment file:
```bash
cp client/.env.example client/.env
```

Contents of `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="NeuroLearn – AI-Powered Adaptive Learning System"
```

---

## 9. Running the Application

### Start Both Frontend and Backend Concurrently (Recommended)
From the project root:
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5173`

### Start Independently
To run the server alone:
```bash
npm run server
```

To run the client alone:
```bash
npm run client
```

### Build Frontend for Production
```bash
npm run build
```

---

## 10. API Documentation

All API responses follow a uniform, predictable JSON envelope.

### 1. System Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies application status, server uptime, memory footprint, Node version, and database state.
- **Sample Response:**
```json
{
  "success": true,
  "message": "NeuroLearn API health check completed",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "application": {
      "name": "NeuroLearn API",
      "version": "1.0.0",
      "status": "operational",
      "environment": "development",
      "uptimeSeconds": 42,
      "timestamp": "2026-11-01T12:00:00.000Z"
    },
    "database": {
      "connected": true,
      "status": "connected",
      "readyState": 1,
      "host": "127.0.0.1",
      "databaseName": "neurolearn",
      "lastError": null
    },
    "system": {
      "nodeVersion": "v24.19.0",
      "platform": "win32",
      "memoryUsage": {
        "rssMb": 48,
        "heapUsedMb": 24,
        "heapTotalMb": 32
      }
    }
  }
}
```

### 2. Database Health Diagnostic
- **Endpoint:** `GET /api/health/db`
- **Description:** Reports accurate MongoDB connection state. Returns `200 OK` when connected, or `503 Service Unavailable` with diagnostic feedback when disconnected.
- **Sample Connected Response (HTTP 200):**
```json
{
  "success": true,
  "message": "MongoDB connection is healthy and active",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "connected": true,
    "status": "connected",
    "readyState": 1,
    "host": "127.0.0.1",
    "databaseName": "neurolearn",
    "targetUri": "mongodb://127.0.0.1:27017/neurolearn",
    "lastError": null,
    "timestamp": "2026-11-01T12:00:00.000Z"
  }
}
```
- **Sample Standby/Disconnected Response (HTTP 503):**
```json
{
  "success": false,
  "message": "MongoDB is currently disconnected or unavailable.",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "connected": false,
    "status": "disconnected",
    "readyState": 0,
    "host": null,
    "databaseName": null,
    "targetUri": "mongodb://127.0.0.1:27017/neurolearn",
    "lastError": "connect ECONNREFUSED 127.0.0.1:27017",
    "timestamp": "2026-11-01T12:00:00.000Z"
  }
}
```

### 3. Student Registration
- **Endpoint:** `POST /api/auth/register`
- **Rate Limit:** 30 requests per 15 minutes
- **Request Body:**
```json
{
  "fullName": "Demo Student",
  "username": "demostudent",
  "email": "demo@example.com",
  "password": "SecurePassword@123"
}
```
- **Sample Success Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "user": {
      "_id": "6ae731e94f543e2f233bc832",
      "fullName": "Demo Student",
      "username": "demostudent",
      "email": "demo@example.com",
      "role": "student",
      "profileImage": "",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2026-11-01T12:00:00.000Z",
      "updatedAt": "2026-11-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Student Login
- **Endpoint:** `POST /api/auth/login`
- **Rate Limit:** 30 requests per 15 minutes
- **Request Body:**
```json
{
  "emailOrUsername": "demostudent",
  "password": "SecurePassword@123"
}
```
- **Sample Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "user": {
      "_id": "6ae731e94f543e2f233bc832",
      "fullName": "Demo Student",
      "username": "demostudent",
      "email": "demo@example.com",
      "role": "student",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Student Logout
- **Endpoint:** `POST /api/auth/logout`
- **Description:** Acknowledges client-side stateless token clearing and documents future token blacklisting extensions.
- **Sample Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "timestamp": "2026-11-01T12:00:00.000Z",
  "data": {
    "note": "Stateless JWT logout: Client should clear the stored Bearer token from local storage or cookie."
  }
}
```

---

## 11. Current Implementation Status

- [x] Clean Monorepo directory structure (`client/`, `server/`).
- [x] Express backend configured with ES Modules, Helmet, CORS, and Morgan.
- [x] Light SaaS Design System (`#F8F9FC`, `#FFFFFF`, `#8B5CF6`, `#F1ECFF`, `#202033`).
- [x] Diagnostic health endpoints (`/api/health` and `/api/health/db`).
- [x] Mongoose User Model with bcryptjs password hashing and password hash protection (`User.js`).
- [x] Authentication controllers, services, and route validators (`/api/auth/*`).
- [x] Cryptographic JWT token generation utility with user ID and role payload.
- [x] Brute-force rate limiting protection via `express-rate-limit`.
- [x] Registration split-screen UI (`/register`) with real-time password strength analyzer.
- [x] Login split-screen UI (`/login`) with credential validation and password toggle.
- [x] Reusable Axios authentication service (`authService.js`).
- [x] ErrorBoundary component preventing blank screens on unhandled client exceptions.

---

## 12. Future Development Roadmap

- **Milestone 5:** Protected Frontend Route Guards (`ProtectedRoute`), persistent auth session context, and student state hydration.
- **Milestone 6:** Adaptive Learning Player, interactive module chunking, live behavioral event listeners (scrolling velocity, mouse trajectory, dwell time).
- **Milestone 7:** Machine Learning state prediction engine integration (predicting cognitive flow, boredom, confusion, and attention drift).
- **Milestone 8:** Adaptive Intervention Engine (automatic content summarization, pulse quiz generation, pace adjustment).
- **Milestone 9:** Educator/Researcher Analytics Dashboard with longitudinal cognitive flow reports.
