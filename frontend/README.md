# MythosGraph Frontend Client 🌐

[![Framework - Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Library - React](https://img.shields.io/badge/Library-React%2019-blue?style=flat-square&logo=react)](https://react.dev/)
[![Styling - Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Canvas - React Flow](https://img.shields.io/badge/Canvas-React%20Flow-emerald?style=flat-square)](https://reactflow.dev/)
[![Query - TanStack Query](https://img.shields.io/badge/Query-React%20Query%20v5-red?style=flat-square&logo=react-query)](https://tanstack.com/query/latest)

An interactive, responsive single-page dashboard and developer documentation hub for the **MythosGraph** project. It allows administrators to curate mythology data, and developers to explore, search, and visualize entity relationships.

---

## 🎨 Core Dashboard Pages & Features

The client application consists of several primary interfaces:

1.  **Home Dashboard ([page.tsx](file:///d:/Project/Vibbing/mythosgraph/frontend/app/page.tsx))**: Presents system-wide statistics (total entities, active relationship nodes, loaded traditions), lists random snapshot previews of the API responses, and showcases popular entities.
2.  **Graph Explorer**: Powered by **React Flow**. It visualizes the mythology database as nodes (deities, artifacts, places) and directed edges (relations like `rival_of`, `son_of`, `wields`), providing a visual way to navigate historical relationships.
3.  **CreatureDex Module**: A creature-specific index designed to query spirits, demons, ghosts, and mythical beasts. Users can filter entries by danger level, habitat types, and traditions.
4.  **API Playground**: A sandbox console allowing developers to run queries directly against the API endpoints and view formatted JSON payloads.
5.  **Traditions Hub**: Deep dives into Norse, Greek, and Vietnamese folklore traditions, charting entity counts, classifications, and historical contexts.
6.  **Admin Console**: Secured backend access panel to CRUD entities, modify taxonomy hierarchies, and update relationship models.

---

## 🏗️ Technology Stack

*   **Next.js 16 (App Router)**: Leverages React Server Components alongside client-side client components for performant routing.
*   **React 19**: Leverages the latest React updates including compiler optimizations.
*   **React Flow v11**: Provides the interactive canvas engine to render graph nodes and custom edges.
*   **Tailwind CSS v4**: Features a redesigned, faster build system and configuration schema.
*   **TanStack React Query v5**: Handles asynchronous caching, refetching, and state synchronization of backend API payloads.
*   **Framer Motion**: Delivers micro-animations and route transition animations.

---

## 📂 Folder Layout

```text
frontend/
├── app/                           # Next.js App Router routing directories
│   ├── admin/                     # Administrative CRUD dashboards
│   ├── api-playground/            # Interactive REST playground
│   ├── creatures/                 # CreatureDex grid index and details
│   ├── docs/                      # Inline documentation and schema pages
│   ├── explore/                   # Comprehensive database list filters
│   ├── graph-explorer/            # React Flow interactive canvas page
│   ├── traditions/                # Pantheon categories and stats overview
│   ├── layout.tsx                 # Core HTML shell & theme provider
│   ├── globals.css                # Tailwind configuration entrypoint
│   └── page.tsx                   # Main Dashboard landing page
├── components/                    # Reusable UI component blocks
│   └── ui/                        # Radix-based shadcn component primitives
├── lib/                           # Core utilities
│   └── api-client.ts              # API fetch integrations & type definitions
├── package.json                   # Dependency manager scripts
└── tsconfig.json                  # TypeScript compilation options
```

---

## 🚀 Running the Client Locally

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) and `npm` installed. Make sure the MythosGraph API backend is running (typically at `http://localhost:5098`).

### 2. Environment Configurations
Create a `.env` file at the root of the `frontend/` directory (or copy the example file):
```bash
cp .env.example .env
```
Ensure your configuration points to the active backend API:
```ini
NEXT_PUBLIC_API_URL="http://localhost:5098"
```

### 3. Installation & Run
Install project dependencies and execute the development server:
```bash
npm install
npm run dev
```
*   The application will start on: [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
To generate a compiled production bundle:
```bash
npm run build
npm run start
```

---

## 🔌 API Integrations

All API fetch calls, schema structures, and type configurations are centralized in [api-client.ts](file:///d:/Project/Vibbing/mythosgraph/frontend/lib/api-client.ts). This file maps backend controllers to React Query hooks, ensuring standardized error handling (`ApiClientError`) and payload sanitization.
