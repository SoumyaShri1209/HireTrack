# HireTrack Frontend

React + Vite + Tailwind CSS frontend for the HireTrack AI job tracker backend.

## Tech Stack
- **React 19** + **Vite 8** + **Tailwind CSS v4**
- **React Router v7** — client-side routing
- **Axios** — HTTP client with JWT interceptors
- **react-hot-toast** — notifications
- **@hello-pangea/dnd** — drag-and-drop kanban

## Design System
| Token | Value |
|-------|-------|
| Background | `#0a0b0d` |
| Surface | `#111318` |
| Surface-2 | `#1a1d26` |
| Accent | `#00d084` |
| Font (display) | Syne |
| Font (mono) | DM Mono |

## Quick Start

```bash
# 1. Make sure the backend is running first
cd ../hiretrack-backend && npm run dev

# 2. Start the frontend dev server
cd ../hiretrack-frontend && npm run dev
```

Frontend runs at → **http://localhost:5173**  
Backend proxy → **http://localhost:5000**

## Folder Structure

```
src/
├── services/
│   └── api.js              # Axios instance + all API modules
├── context/
│   └── AuthContext.jsx     # Auth state, login/register/logout
├── components/
│   ├── ProtectedRoute.jsx  # JWT-guard wrapper
│   ├── layout/
│   │   ├── AppLayout.jsx   # Sidebar + Topbar shell
│   │   ├── Sidebar.jsx     # Nav with active links
│   │   └── Topbar.jsx      # Page title + user avatar
│   └── shared/
│       ├── JobCard.jsx     # Job card with Quick Apply
│       ├── KanbanCard.jsx  # Draggable pipeline card
│       ├── MatchBadge.jsx  # Color-coded match score
│       ├── Modal.jsx       # Reusable modal
│       ├── Spinner.jsx     # Loading spinner
│       └── EmptyState.jsx  # Empty placeholder
└── pages/
    ├── Login.jsx           # Sign In / Register + Google OAuth
    ├── GoogleSuccess.jsx   # OAuth redirect handler
    ├── Dashboard.jsx       # Stats, mini kanban, activity
    ├── JobFeed.jsx         # Search + filter + job cards
    ├── Pipeline.jsx        # 6-column drag-and-drop kanban
    ├── Offers.jsx          # Table + compare modal + add offer
    ├── Resume.jsx          # Drag-drop PDF upload + AI insights
    ├── SkillGap.jsx        # Skills vs job market analysis
    └── Activity.jsx        # Filterable activity timeline
```

## Auth Flow
1. Login/Register → `accessToken` stored in `localStorage`
2. Refresh token stored in **HTTP-only cookie** (set by backend)
3. Axios request interceptor attaches `Bearer <token>` to every request
4. Axios response interceptor auto-refreshes on `401` using `/api/auth/refresh`
5. On refresh failure → clears token and redirects to `/login`

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/login` | Login / Register | Public |
| `/auth/google-success` | Google OAuth handler | Public |
| `/dashboard` | Stats + pipeline preview | ✅ Protected |
| `/jobs` | AI job feed + apply | ✅ Protected |
| `/pipeline` | Drag-drop kanban | ✅ Protected |
| `/offers` | Offers table + compare | ✅ Protected |
| `/resume` | PDF upload + AI insights | ✅ Protected |
| `/skill-gap` | Skill gap analysis | ✅ Protected |
| `/activity` | Activity timeline | ✅ Protected |
