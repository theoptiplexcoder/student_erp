import axios from 'axios';
import { createClient } from './supabase/client';

const getApiUrl = () => {
  const url = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0; // Unix timestamp in ms
let authListenerInitialized = false;
let pendingTokenPromise: Promise<string | null> | null = null;

function initAuthListener() {
  if (authListenerInitialized || typeof window === 'undefined') return;
  authListenerInitialized = true;
  try {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        cachedAccessToken = session.access_token;
        tokenExpiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600 * 1000;
      } else {
        cachedAccessToken = null;
        tokenExpiresAt = 0;
      }
    });
  } catch (err) {
    // If Supabase init fails during build or SSR, ignore silently
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const now = Date.now();
  // If we have a cached token with at least 30 seconds before expiration, return it synchronously
  if (cachedAccessToken && tokenExpiresAt > now + 30_000) {
    return cachedAccessToken;
  }

  // Deduplicate concurrent in-flight session requests on cold start or token expiration
  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  // Token is missing, expired, or about to expire: fetch from Supabase
  pendingTokenPromise = (async () => {
    try {
      const supabase = createClient();
      initAuthListener();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        cachedAccessToken = session.access_token;
        tokenExpiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600 * 1000;
        return session.access_token;
      } else {
        cachedAccessToken = null;
        tokenExpiresAt = 0;
        return null;
      }
    } catch (err) {
      return null;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
}

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getValidAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
