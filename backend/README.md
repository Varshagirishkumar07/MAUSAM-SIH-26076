# MAUSAM Backend (Module 3.1)
### Personalized Weather Advisory System — SIH Problem Statement 26076

REST API backend foundation built with **Node.js** and **Express.js**.

---

## 🛠️ Installation & Setup

1. Open terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure local `.env` exists (copied from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

---

## 🚀 Running the Server

- **Start production server**:
  ```bash
  npm start
  ```
- **Start development server (with watch mode)**:
  ```bash
  npm run dev
  ```

Server will start on port `5000` (or `PORT` specified in `.env`):
```
http://localhost:5000
```

---

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies backend service status and uptime.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "service": "mausam-backend",
    "timestamp": "2026-09-30T08:45:00.000Z",
    "uptime": 120,
    "environment": "development"
  }
  ```

### 2. Weather Route Placeholder
- **Endpoint**: `GET /api/weather`
- **Description**: Route placeholder for external meteorological data.
- **Status in Module 3.1**: **Intentionally Not Implemented Yet**. Real integration with the Open-Meteo weather API belongs strictly to **Module 3.2**. Zero external calls are made and zero fake data is returned.
- **Response**: `501 Not Implemented`
  ```json
  {
    "status": "not_implemented",
    "service": "mausam-backend",
    "message": "Weather service not connected yet. Integration with Open-Meteo belongs to Module 3.2.",
    "timestamp": "2026-09-30T08:45:00.000Z"
  }
  ```

---

## 🔒 Security & CORS

- **CORS**: Configured to permit requests from the local frontend (`http://localhost:3000`).
- **Secrets**: Environment variables (`.env`) are strictly ignored by Git. No database passwords or Supabase `service_role` keys are stored or exposed.
- **Error Handling**: Centralized error middleware ensures all errors (404, 400, 500) return structured JSON responses without leaking stack traces.
