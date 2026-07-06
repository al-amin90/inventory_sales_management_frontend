# Inventory Sales Management Frontend

A React + Vite frontend for inventory and sales management, built with TypeScript, Redux Toolkit, Redux Persist, RTK Query, React Router, and Tailwind CSS.

## Email Password

- Admin: admin@erp.com | Password: admin123
- Employee: employee@gmail.com | Password: 12345678
- Manager: manager@gmail.com | Password: 12345678
  **Create a new Role, then Give Permission to web in that role. Register with that role and test it. You also use Pre created Account**

## Key Features

- **Dynamic Role & Permission Management:** Database-driven roles and permissions allowing runtime updates without code changes.
- **Role-Based Route Protection:** Granular route guarding on the client using protected routes and server-side checks for APIs.

## Role-Based Authentication & Authorization

- **Modular Feature-Based Architecture:**
- **Generic Query Builder:**
- **Global Error Handler:**
- **Reusable Utilities:**

## Validation & Best Practices

The project follows these validation and best-practice guidelines:

- **Proper Error Handling:**
- **Input Validation:**
- **Protected APIs:**
- **Proper HTTP Status Codes:**
- **Consistent API Response Structure:** Standardized JSON response envelope (e.g., `{ success: boolean, data: any, error?: { code, message } }`).

- Dynamic Role & Dynamic Access control
- Redux Toolkit store with RTK Query API integration
- Redux Persist for auth state persistence
- Client-side routing with React Router v7
- Tailwind CSS for styling
- Modular component and page structure

## Notes

- The Redux store persists authentication state using `redux-persist`.
- The API layer is defined under `src/redux/api/baseApi.ts` and integrated via `baseApi.middleware`.
- Route protection is provided by `src/routes/ProtectedRoute.tsx`.

## Project Setup & Installation Guide

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`) to view the app.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Lint the project

```bash
npm run lint
```
