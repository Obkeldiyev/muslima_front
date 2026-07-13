// Typed client for the muslima Express backend.
// All methods return parsed JSON or throw ApiError.

const configuredApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

const normalizeApiBase = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = configuredApiBase
  ? normalizeApiBase(configuredApiBase)
  : "/api";

const TOKEN_KEY = "muslima_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem(TOKEN_KEY, t);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type FetchOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  isForm?: boolean;
};

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {};
  if (!opts.isForm) headers["Content-Type"] = "application/json";
  if (opts.auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body:
      opts.body === undefined
        ? undefined
        : opts.isForm
          ? (opts.body as FormData)
          : JSON.stringify(opts.body),
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    if (opts.auth && (res.status === 401 || res.status === 403)) {
      setToken(null);
    }
    const msg = extractMessage(data, res.statusText) || "Request failed";
    throw new ApiError(msg, res.status);
  }
  return unwrapPayload<T>(data);
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrapPayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const candidate = (payload as { data?: unknown }).data;
    if (candidate !== undefined) return candidate as T;
  }
  return payload as T;
}

function extractMessage(payload: unknown, fallback: string): string | null {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
    if (typeof record.error === "string" && record.error.trim()) return record.error;
  }
  return fallback || null;
}

/* ---------- Domain types ---------- */

export type MediaKind = "IMAGE" | "VIDEO" | "FILE";
export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  kind: MediaKind;
  createdAt: string;
}
export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  order: number;
  featuredImageId: string | null;
  featuredImage?: MediaAsset | null;
  essays?: Essay[];
  createdAt: string;
  updatedAt: string;
}
export interface Essay {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  published: boolean;
  order: number;
  topicId: string | null;
  topic?: Topic | null;
  coverImageId: string | null;
  coverImage?: MediaAsset | null;
  createdAt: string;
  updatedAt: string;
}
export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  published: boolean;
  order: number;
  coverImageId: string | null;
  coverImage?: MediaAsset | null;
  fileId: string | null;
  file?: MediaAsset | null;
  createdAt: string;
  updatedAt: string;
}
export interface PageSection {
  id: string;
  pageId: string;
  type: string;
  title: string | null;
  content: string | null;
  order: number;
  imageId: string | null;
  image?: MediaAsset | null;
  topicId: string | null;
  topic?: Topic | null;
  essayId: string | null;
  essay?: Essay | null;
  bookId: string | null;
  book?: Book | null;
  metadata: unknown;
}
export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  sections: PageSection[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteColors {
  background: string;
  foreground: string;
  ink: string;
  inkSoft: string;
  rule: string;
  accent: string;
  accentForeground: string;
  card: string;
  cardForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

export interface SiteTypography {
  headingFont: string;
  bodyFont: string;
  paragraphSize: string;
  headingSize: string;
}

export interface SiteBorderRadius {
  card: string;
  button: string;
  input: string;
}

export interface SiteNavLabels {
  essays: string;
  topics: string;
  books: string;
  about: string;
  studio: string;
}

export interface SiteBorderRadius {
  card: string;
  button: string;
  input: string;
}

export interface SiteHomeText {
  mastheadKicker: string;
  mastheadTitle: string;
  mastheadDescription: string;
  mastheadPills: string[];
  featuredKicker: string;
  featuredTitle: string;
  recentKicker: string;
  recentTitle: string;
  topicsKicker: string;
  topicsTitle: string;
  booksKicker: string;
  booksTitle: string;
  moreKicker: string;
  moreTitle: string;
  noContentMessage: string;
  seeAllLabel: string;
}

export interface SiteAboutText {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  paragraphs: string[];
}

export interface SiteFooterText {
  description: string;
  copyrightTemplate: string;
  tag: string;
}

export interface SiteSocialLink {
  label: string;
  url: string;
}

export interface SiteTextSettings {
  siteTitle: string;
  siteSubtitle: string;
  issueLabel: string;
  issueTagline: string;
  nav: SiteNavLabels;
  socials: SiteSocialLink[];
  footer: SiteFooterText;
  home: SiteHomeText;
  about: SiteAboutText;
}

export interface SiteSettings {
  colors: SiteColors;
  typography: SiteTypography;
  borderRadius: SiteBorderRadius;
  text: SiteTextSettings;
}

/* ---------- Public endpoints ---------- */

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: { id: string; email: string; role: string } }>(
        "/auth/login",
        { method: "POST", body: { email, password } },
      ),
  },
  publicApi: {
    topics: () => request<Topic[]>("/public/topics"),
    topic: (slug: string) => request<Topic>(`/public/topics/${slug}`),
    essays: () => request<Essay[]>("/public/essays"),
    essay: (slug: string) => request<Essay>(`/public/essays/${slug}`),
    books: () => request<Book[]>("/public/books"),
    page: (slug: string) => request<Page>(`/public/pages/${slug}`),
    siteSettings: () => request<SiteSettings>("/public/site-settings"),
  },
  admin: {
    topics: {
      list: () => request<Topic[]>("/admin/topics", { auth: true }),
      create: (data: Partial<Topic>) =>
        request<Topic>("/admin/topics", { method: "POST", body: data, auth: true }),
      update: (id: string, data: Partial<Topic>) =>
        request<Topic>(`/admin/topics/${id}`, { method: "PUT", body: data, auth: true }),
      remove: (id: string) =>
        request<void>(`/admin/topics/${id}`, { method: "DELETE", auth: true }),
    },
    essays: {
      list: () => request<Essay[]>("/admin/essays", { auth: true }),
      create: (data: Partial<Essay>) =>
        request<Essay>("/admin/essays", { method: "POST", body: data, auth: true }),
      update: (id: string, data: Partial<Essay>) =>
        request<Essay>(`/admin/essays/${id}`, { method: "PUT", body: data, auth: true }),
      remove: (id: string) =>
        request<void>(`/admin/essays/${id}`, { method: "DELETE", auth: true }),
    },
    books: {
      list: () => request<Book[]>("/admin/books", { auth: true }),
      create: (data: Partial<Book>) =>
        request<Book>("/admin/books", { method: "POST", body: data, auth: true }),
      update: (id: string, data: Partial<Book>) =>
        request<Book>(`/admin/books/${id}`, { method: "PUT", body: data, auth: true }),
      remove: (id: string) =>
        request<void>(`/admin/books/${id}`, { method: "DELETE", auth: true }),
    },
    pages: {
      get: (slug: string) => request<Page>(`/admin/pages/${slug}`, { auth: true }),
      create: (data: Partial<Page>) =>
        request<Page>("/admin/pages", { method: "POST", body: data, auth: true }),
      update: (id: string, data: Partial<Page>) =>
        request<Page>(`/admin/pages/${id}`, { method: "PUT", body: data, auth: true }),
      createSection: (data: Partial<PageSection>) =>
        request<PageSection>("/admin/pages/sections", {
          method: "POST",
          body: data,
          auth: true,
        }),
      updateSection: (id: string, data: Partial<PageSection>) =>
        request<PageSection>(`/admin/pages/sections/${id}`, {
          method: "PUT",
          body: data,
          auth: true,
        }),
      removeSection: (id: string) =>
        request<void>(`/admin/pages/sections/${id}`, { method: "DELETE", auth: true }),
    },
    siteSettings: {
      get: () => request<SiteSettings>("/admin/settings", { auth: true }),
      update: (settings: SiteSettings) => request<SiteSettings>("/admin/settings", { method: "PUT", body: settings, auth: true }),
    },
    media: {
      list: () => request<MediaAsset[]>("/admin/media", { auth: true }),
      upload: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return request<MediaAsset>("/admin/upload", {
          method: "POST",
          body: form,
          isForm: true,
          auth: true,
        });
      },
    },
  },
};

/** Resolve a media URL (absolute or backend-relative). */
export function mediaUrl(m?: { url?: string | null; path?: string | null } | null): string | null {
  if (!m) return null;
  const raw = m.url || m.path;
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("data:")) return raw;
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return new URL(normalized, `${API_BASE_URL}${API_BASE_URL.endsWith("/") ? "" : "/"}`).toString();
}
