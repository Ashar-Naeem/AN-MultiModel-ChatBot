/**
 * API base URL helper.
 *
 * In development (vite proxy): relative paths like "/api/..." work via the
 *   vite dev server proxy to http://localhost:5000.
 *
 * In production (separate deployments): set VITE_API_URL to your backend URL,
 *   e.g. VITE_API_URL=https://your-backend.vercel.app
 *   Fetches will then call https://your-backend.vercel.app/api/...
 *
 * If frontend and backend are on the SAME Vercel project, leave VITE_API_URL
 *   unset and use vercel.json rewrites to proxy /api/* to the backend.
 */
export const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "") // strip trailing slash
  : "";

/**
 * Build a full URL for an API path.
 * @param {string} path - e.g. "/api/chat/stream"
 * @returns {string}
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
