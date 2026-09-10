# AI Attendance V2 - Frontend

This is the entirely rewritten, scalable, and professional frontend for the AI Attendance V2 system. Built exclusively for the Principal/Admin persona, it provides a comprehensive dashboard to monitor school attendance, track live face recognition AI events, and manage entities like Students, Teachers, and Classes.

## 🏗 Architecture & Design Philosophy

- **Framework**: Built on **React 19** and **Vite** for blazing fast HMR and optimized production builds.
- **Language**: Strictly typed using **TypeScript** (`src/types/`) to prevent runtime errors and ensure reliable scaling.
- **Styling**: **Tailwind CSS v4** powers the utility-first design system. A global theme is defined in `index.css`.
- **Routing**: **React Router v7** handles complex nested layouts and protected routes.
- **State & Data Layer**: API logic is cleanly separated into the `src/services/` layer. Currently, these services use static data from `src/mock/`, making it trivial to swap them out for real `fetch`/`axios` calls to the FastAPI backend later without touching the UI components.
- **Components**: Reusable, atomic design components reside in `src/components/common/`.

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and Icons
│   ├── components/
│   │   ├── common/         # Atomic UI (Button, Input, Card, DataTable, etc.)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── layout/         # Shell components (Sidebar, Topbar)
│   ├── layouts/            # Page wrappers (DashboardLayout, AuthLayout)
│   ├── pages/              # Route-level components grouped by feature
│   ├── routes/             # App routing and route protection logic
│   ├── services/           # Data fetching layer (currently pointing to mocks)
│   ├── mock/               # Static datasets matching TypeScript interfaces
│   ├── types/              # Strict domain entity interfaces
│   ├── utils/              # Helper functions (date formatting, class merging)
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind configuration and global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm

### Installation
1. Clone the repository and navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### Production Build
To run the TypeScript compiler and build the optimized production bundle:
```bash
npm run build
```

## 🔗 Route Map
- **Auth**: `/login`
- **Dashboard**: `/dashboard`
- **Students**: `/students`
- **Teachers**: `/teachers`
- **Classes**: `/classes`
- **Attendance**: `/attendance`
- **Live AI Monitor**: `/live-ai`
- **Analytics**: `/analytics`
- **Reports**: `/reports`
- **Settings**: `/settings`

## 🔮 Future Integration
- **Backend**: Replace the Promise delays in `src/services/` with real HTTP calls to the FastAPI backend.
- **AI Integration**: The `/live-ai` route currently simulates detections using mock polling. This should be replaced with a WebSocket connection and an RTSP player (e.g., JSMpeg or WebRTC) to stream the real camera feeds from the backend edge nodes.
