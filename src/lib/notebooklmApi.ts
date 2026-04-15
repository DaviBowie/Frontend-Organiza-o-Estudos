const BASE = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';

async function apiFetch<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).detail || (err as any).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Notebooks ─────────────────────────────────────────────────────────────────

export async function nlmCreateNotebook(title: string): Promise<{ id: string }> {
  return apiFetch('/api/notebooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

// ── Sources ───────────────────────────────────────────────────────────────────

export async function nlmAddUrlSource(notebookId: string, url: string) {
  return apiFetch(`/api/notebooks/${notebookId}/sources/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export async function nlmAddYouTubeSource(notebookId: string, url: string) {
  return apiFetch(`/api/notebooks/${notebookId}/sources/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

export async function nlmAddTextSource(notebookId: string, title: string, content: string) {
  return apiFetch(`/api/notebooks/${notebookId}/sources/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
}

export async function nlmAddFileSource(notebookId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiFetch(`/api/notebooks/${notebookId}/sources/file`, {
    method: 'POST',
    body: form,
  });
}

// ── Artifact generation ───────────────────────────────────────────────────────

export async function nlmGenerateAudio(notebookId: string) {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'pt' }),
  });
}

export async function nlmGenerateVideo(notebookId: string) {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'pt' }),
  });
}

export async function nlmGenerateSlideDeck(notebookId: string) {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/slide-deck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'pt' }),
  });
}

export async function nlmGenerateInfographic(notebookId: string) {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/infographic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'pt' }),
  });
}

// ── Downloads ─────────────────────────────────────────────────────────────────

export interface DownloadResult {
  filename: string;
  url: string;
}

export function nlmFullUrl(relativeUrl: string): string {
  return `${BASE}${relativeUrl}`;
}

export async function nlmDownloadAudio(notebookId: string): Promise<DownloadResult> {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/download/audio`);
}

export async function nlmDownloadVideo(notebookId: string): Promise<DownloadResult> {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/download/video`);
}

export async function nlmDownloadSlideDeck(notebookId: string): Promise<DownloadResult> {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/download/slide-deck?format=pdf`);
}

export async function nlmDownloadInfographic(notebookId: string): Promise<DownloadResult> {
  return apiFetch(`/api/notebooks/${notebookId}/artifacts/download/infographic`);
}
