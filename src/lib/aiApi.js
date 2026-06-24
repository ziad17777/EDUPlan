/**
 * AI API Service Layer
 * Wraps all 8 AI-powered backend endpoints.
 * Uses the existing authedFetch helper for JWT auth + auto-refresh.
 */
import { authedFetch, clearStoredTokens } from '@/lib/api';

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

/**
 * Internal helper — sends a request and normalizes the response.
 * @returns {{ ok: boolean, data: any, error: string|null }}
 */
async function aiRequest(path, { method = 'GET', body = null } = {}) {
  try {
    const opts = { method };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }

    const res = await authedFetch(`${API_BASE}${path}`, opts);

    // Auth expired even after refresh
    if (res.status === 401) {
      clearStoredTokens();
      return { ok: false, data: null, error: 'Session expired. Please sign in again.' };
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        data?.error ||
        data?.detail ||
        (res.status === 400 ? 'Invalid request. Please check your input.' : `Request failed (${res.status})`);
      return { ok: false, data, error: msg };
    }

    return { ok: true, data, error: null };
  } catch (err) {
    return { ok: false, data: null, error: `Network error: ${err.message}` };
  }
}

// ─── Study Plan ───────────────────────────────────────────

export async function generateStudyPlan({ duration = '2 weeks', lang = 'auto' } = {}) {
  return aiRequest('/chat/plan/generate/', {
    method: 'POST',
    body: { duration, lang },
  });
}

// ─── Essay Grading ────────────────────────────────────────

export async function gradeEssay({ essay_text, rubric = '', lang_choice = 'auto' }) {
  if (!essay_text?.trim()) {
    return { ok: false, data: null, error: 'Essay text is required.' };
  }
  return aiRequest('/chat/grade/', {
    method: 'POST',
    body: { essay_text, rubric, lang_choice },
  });
}

// ─── Audio Generation ─────────────────────────────────────

export async function generateAudio({ text, lang = 'auto' }) {
  if (!text?.trim()) {
    return { ok: false, data: null, error: 'Text is required.' };
  }
  return aiRequest('/chat/audio/generate/', {
    method: 'POST',
    body: { text, lang },
  });
}

// ─── Video Generation ─────────────────────────────────────

export async function generateVideo({ text, lang = 'auto' }) {
  if (!text?.trim()) {
    return { ok: false, data: null, error: 'Text is required.' };
  }
  return aiRequest('/chat/video/generate/', {
    method: 'POST',
    body: { text, lang },
  });
}

// ─── Vocabulary Generation ────────────────────────────────

export async function generateVocab({ lang = 'auto' } = {}) {
  return aiRequest('/chat/vocab/generate/', {
    method: 'POST',
    body: { lang },
  });
}

// ─── Analytics ────────────────────────────────────────────

export async function fetchAnalytics() {
  return aiRequest('/chat/analytics/');
}

// ─── Export Database ──────────────────────────────────────

export async function exportDatabase() {
  return aiRequest('/chat/export/db/');
}

// ─── Export Chat History ──────────────────────────────────

export async function exportHistory() {
  return aiRequest('/chat/export/history/');
}
