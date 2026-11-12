import { getAuthToken, setAuthToken } from "./authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Prevents multiple simultaneous 401s (e.g. several requests firing at
// once) from each independently calling /refresh — they all share one
// in-flight refresh attempt instead.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/refresh`, {
          method: "POST",
          credentials: "include", // sends the httpOnly refreshToken cookie automatically
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.accessToken as string;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Drop-in replacement for fetch() on any request that needs the access
 * token attached. Automatically retries once with a fresh token if the
 * first attempt comes back 401 (the expected, routine case of an expired
 * 15-minute access token) — the caller never needs to think about refresh
 * logic directly.
 *
 * If the refresh itself fails (refresh token expired, revoked by logout,
 * or never existed), this clears the access token and sends the browser
 * to /login — that's the real "you're logged out" moment, not the
 * original 401.
 */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  async function attempt(token: string | null): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  }

  const firstResponse = await attempt(getAuthToken());

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  // Access token was missing/expired — try to get a new one and retry once.
  const newToken = await refreshAccessToken();

  if (!newToken) {
    setAuthToken(null);
    window.location.href = "/login";
    return firstResponse; // caller won't actually see this, since the redirect happens first
  }

  setAuthToken(newToken);
  return attempt(newToken);
}