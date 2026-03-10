# SentinelGrid - SOC Analyzer (Frontend)

SentinelGrid is a sophisticated Security Operations Center (SOC) dashboard designed for analyzing ZScaler network logs. It leverages a modern, type-safe stack to provide real-time threat visualization and deep-dive forensic analysis.

## Key Features

* **AI-Powered Threat Triage:** Interface specifically designed to review anomalies detected by the Gemini/DeepSeek backend pipeline.
* **Global Intelligence:** Interactive dashboards visualizing security trends and severity distributions.
* **Log Ingestion Engine:** Drag-and-drop log uploading with real-time progress tracking and duplicate prevention (via file hashing).
* **Forensic Explorer:** Granular raw log viewing with server-side pagination and advanced filtering.
* **Robust Session Management:** Secure authentication with automatic inactivity timeouts and rolling token refreshes.

## Tech Stack

* **Framework:** [React 19](https://react.dev/) (Vite-powered)
* **UI Components:** [Mantine UI v8](https://mantine.dev/)
* **State Management:** [TanStack Query v5](https://tanstack.com/query) (React Query)
* **Routing:** [React Router 7](https://reactrouter.com/)
* **API Client:** [Axios](https://axios-http.com/)
* **Icons:** [Tabler Icons](https://tabler.io/icons)

## Local Setup

### 1. Install Dependencies
```bash
npm install

## Configure Environment

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Development Mode

Start the development server:

```bash
npm run start
```

---

## 📂 Project Structure

- **src/api/**  
  Axios instance and centralized API logic.

- **src/components/**  
  Shared UI components such as `LogJobCard`, `RawLogExplorer`, and layout components.

- **src/hooks/**  
  Custom hooks for data fetching (`useLogs`) and authentication (`useAuth`).

- **src/pages/**  
  Core application views including **Threat Intelligence**, **Log Analysis**, and **Log Ingestion**.

- **src/types/**  
  Centralized TypeScript interfaces for API responses and log models.

- **src/utils/**  
  Utility functions for file hashing and formatting.

---

## 🔐 Credentials for Testing

**Email:** `trial@soc.local`  
**Password:** `Password123!`

 ### More users creds:
 - email: "admin@soc.local", password: "SecurePassword123!"
 - email: "analyst1@soc.local", password: "Password123!"
 - email: "analyst2@soc.local", password: "Password123!"
 - email: "viewer@soc.local", password: "Password123!"

## Testing

- Testing files are located in /test-files folder