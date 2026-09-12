# ENRG-FRONTEND

This is a React/Vite frontend. Set `BACKEND_API_URL` to the backend origin before starting the frontend, for example `BACKEND_API_URL=http://localhost:5000`.

Google sign-in uses a redirect-based Authorization Code flow: the frontend navigates to the backend's `/auth/google` endpoint, and the backend handles the client secret, callback, and session cookie. On return, the frontend checks `/auth/me`; it does not exchange Google credentials in the browser.
