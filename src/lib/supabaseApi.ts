import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient, logSupabaseError } from "./supabaseClient";

export interface NewsPostRecord {
  id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  cover_source: string | null;
  cover_type?: "unsplash" | "upload" | null;
  cover_keyword?: string | null;
  cover_url?: string | null;
  published_at: string | null;
  published: boolean;
  author_id: string | null;
}

export interface EventRecord {
  id: string;
  title_zh: string;
  title_en: string;
  description_zh: string | null;
  description_en: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  fee: number;
  member_fee: number | null;
  capacity: number | null;
  access_type: "members-only" | "all-welcome" | null;
  image_type: "unsplash" | "upload" | null;
  image_keyword: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export type UpsertEventInput = {
  id?: string;
  title_zh: string;
  title_en: string;
  description_zh?: string | null;
  description_en?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  fee: number;
  member_fee?: number | null;
  capacity?: number | null;
  access_type?: "members-only" | "all-welcome" | null;
  image_type?: "unsplash" | "upload" | null;
  image_keyword?: string | null;
  image_url?: string | null;
  published?: boolean;
  author_id?: string | null;
};

export interface ArticleVersionRecord {
  id: string;
  article_id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  cover_source: string | null;
  cover_type?: "unsplash" | "upload" | null;
  cover_keyword?: string | null;
  cover_url?: string | null;
  status: "draft" | "published";
  version_number: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationRecord {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  tickets: number;
  payment_method: "card" | "cash" | "transfer" | null;
  payment_status?: string | null;
  payment_proof?: string | null;
  payment_proof_url?: string | null;
  paymentStatus?: string | null;
  paymentProof?: string | null;
  paymentProofUrl?: string | null;
  registration_date: string;
  created_at: string;
}

interface FetchNewsOptions {
  publishedOnly?: boolean;
  limit?: number;
}

interface FetchEventsOptions {
  fromDate?: string;
  limit?: number;
}

interface FetchRegistrationsOptions {
  eventId?: string;
  userId?: string;
}

type QueryResult<T> = PromiseLike<{
  data: T[] | null;
  error: PostgrestError | null;
}>;
async function runQuery<T>(context: string, query: QueryResult<T>) {
  const { data, error } = await query;
  if (error) {
    logSupabaseError(context, error);
    throw error;
  }
  return data ?? [];
}

export async function fetchNewsPosts(options: FetchNewsOptions = {}) {
  const { publishedOnly = true, limit } = options;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("articles")
    .select(
      "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, cover_type, cover_keyword, cover_url, published_at, published, author_id"
    )
    .order("published_at", { ascending: false });

  if (publishedOnly) {
    query = query.eq("published", true);
  }
  if (limit) {
    query = query.limit(limit);
  }

  return runQuery<NewsPostRecord>("fetchNewsPosts", query);
}

export async function fetchEvents(options: FetchEventsOptions = {}) {
  const { fromDate, limit } = options;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("events")
    .select(
      "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published"
    )
    .eq("published", true)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (fromDate) {
    query = query.gte("event_date", fromDate);
  }
  if (limit) {
    query = query.limit(limit);
  }

  return runQuery<EventRecord>("fetchEvents", query);
}

export async function fetchEventRegistrations(
  options: FetchRegistrationsOptions = {}
) {
  const { eventId, userId } = options;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("event_registrations")
    .select(
      "id, event_id, user_id, name, phone, email, tickets, payment_method, registration_date, created_at"
    )
    .order("registration_date", { ascending: false });

  if (eventId) {
    query = query.eq("event_id", eventId);
  }
  if (userId) {
    query = query.eq("user_id", userId);
  }

  return runQuery<EventRegistrationRecord>("fetchEventRegistrations", query);
}

export async function fetchNewsPostById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, cover_type, cover_keyword, cover_url, published_at, published, author_id"
    )
    .eq("id", id)
    .eq("published", true)
    .single<NewsPostRecord>();

  if (error) {
    logSupabaseError("fetchNewsPostById", error);
    throw error;
  }
  return data;
}

export async function fetchEventById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published"
    )
    .eq("id", id)
    .eq("published", true)
    .single<EventRecord>();

  if (error) {
    logSupabaseError("fetchEventById", error);
    throw error;
  }
  return data;
}

const ADMIN_API_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_API_BASE
    ? (import.meta.env.VITE_ADMIN_API_BASE as string)
    : "/api";

function buildAdminApiUrl(path: string) {
  const normalizedBase = ADMIN_API_BASE.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedBase.endsWith(normalizedPath)) {
    return normalizedBase;
  }
  return `${normalizedBase}${normalizedPath}`;
}

const PAYMENTS_API_BASE = buildAdminApiUrl("/payments");
const ADMIN_NEWS_API_BASE = buildAdminApiUrl("/news");
const ADMIN_ACCOUNTS_API_BASE = buildAdminApiUrl("/admin-accounts");
const NOTIFICATIONS_API_BASE = buildAdminApiUrl("/notifications");
const SUPABASE_URL =
  typeof import.meta !== "undefined"
    ? (import.meta.env.VITE_SUPABASE_URL as string)
    : "";
const SUPABASE_ANON_KEY =
  typeof import.meta !== "undefined"
    ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
    : "";

function ensureEdgeConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase URL or anon key for Edge Function calls");
  }
}

async function callEdgeFunction(path: string, init?: RequestInit) {
  ensureEdgeConfig();
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${path}`;
  const headers: HeadersInit = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(init?.headers ?? {}),
  };
  return fetch(url, { ...init, headers });
}
export async function adminAuthLogin(payload: {
  username: string;
  password: string;
}) {
  const res = await callEdgeFunction("admin-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    throw new Error("invalid-credentials");
  }
  if (!res.ok) {
    throw new Error("login-failed");
  }
  const body = (await res.json()) as {
    id: string;
    username: string;
    role: "owner" | "admin";
  };
  return body;
}

export async function fetchAdminEvents() {
  const res = await callEdgeFunction("events-admin", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin events");
  }

  const body = (await res.json()) as { events: EventRecord[] };
  return body.events ?? [];
}

export async function saveEvent(payload: UpsertEventInput) {
  const authorId =
    payload.author_id ??
    (typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("adminId")
      : null);
  const res = await callEdgeFunction("events-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      author_id: authorId ?? undefined,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to save event");
  }

  const body = (await res.json()) as { event: EventRecord };
  return body.event;
}

export async function deleteEvent(id: string) {
  const res = await callEdgeFunction(
    `events-admin?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete event");
  }
}

export async function fetchAdminEventRegistrations(eventId?: string) {
  const params = new URLSearchParams();
  if (eventId) params.set("eventId", eventId);
  const res = await callEdgeFunction(
    `events-registrations${params.toString() ? `?${params.toString()}` : ""}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event registrations");
  }

  const body = (await res.json()) as {
    registrations: EventRegistrationRecord[];
  };
  return body.registrations ?? [];
}

const LOCAL_ADMIN_ACCOUNTS_KEY = "vmca.mockAdminAccounts";
const FALLBACK_ADMIN_ACCOUNTS: AdminAccountRecord[] = [
  {
    id: "mock-owner",
    username: "owner_admin",
    email: "owner@macmaa.org",
    role: "owner",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    last_login_at: null,
  },
  {
    id: "mock-admin-zhang",
    username: "zhang_admin",
    email: "zhang_admin@macmaa.org",
    role: "admin",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    last_login_at: null,
  },
  {
    id: "mock-admin",
    username: "admin",
    email: "admin@macmaa.org",
    role: "admin",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    last_login_at: null,
  },
];

function getLocalAdminAccounts(): AdminAccountRecord[] {
  const base = FALLBACK_ADMIN_ACCOUNTS.map((acc) => ({
    ...acc,
    last_login_at: acc.last_login_at ?? new Date().toISOString(),
  }));
  if (typeof window === "undefined") return base;
  const raw = window.localStorage.getItem(LOCAL_ADMIN_ACCOUNTS_KEY);
  if (!raw) {
    window.localStorage.setItem(LOCAL_ADMIN_ACCOUNTS_KEY, JSON.stringify(base));
    return base;
  }
  try {
    return JSON.parse(raw) as AdminAccountRecord[];
  } catch {
    window.localStorage.setItem(LOCAL_ADMIN_ACCOUNTS_KEY, JSON.stringify(base));
    return base;
  }
}

function setLocalAdminAccounts(accounts: AdminAccountRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_ADMIN_ACCOUNTS_KEY,
    JSON.stringify(accounts)
  );
}

export async function fetchAdminAccounts() {
  try {
    const res = await fetch(ADMIN_ACCOUNTS_API_BASE, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch admin accounts");
    }

    const body = (await res.json()) as { accounts: AdminAccountRecord[] };
    return body.accounts?.length ? body.accounts : getLocalAdminAccounts();
  } catch (err) {
    console.warn("[admin-accounts] falling back to local data", err);
    return getLocalAdminAccounts();
  }
}

export async function createAdminAccount(payload: {
  username: string;
  email: string;
  password: string;
  role: "owner" | "admin";
}) {
  try {
    const res = await fetch(ADMIN_ACCOUNTS_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      throw new Error("duplicate");
    }
    if (!res.ok) {
      throw new Error("Failed to create admin account");
    }

    const body = (await res.json()) as { account: AdminAccountRecord };
    return body.account;
  } catch {
    const accounts = getLocalAdminAccounts();
    const duplicate = accounts.some(
      (acc) => acc.username === payload.username || acc.email === payload.email
    );
    if (duplicate) {
      throw new Error("duplicate");
    }
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `local-${Date.now()}`;
    const account: AdminAccountRecord = {
      id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      status: "active",
      created_at: new Date().toISOString(),
      last_login_at: null,
    };
    setLocalAdminAccounts([...accounts, account]);
    return account;
  }
}

export async function updateAdminAccount(
  id: string,
  payload: { email?: string; password?: string }
) {
  try {
    const res = await fetch(`${ADMIN_ACCOUNTS_API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to update admin account");
    }

    const body = (await res.json()) as { account: AdminAccountRecord };
    return body.account;
  } catch (err) {
    console.warn("[admin-accounts] update fallback", err);
    const accounts = getLocalAdminAccounts();
    const idx = accounts.findIndex((acc) => acc.id === id);
    if (idx === -1) {
      throw err;
    }
    const updated: AdminAccountRecord = {
      ...accounts[idx],
      email: payload.email ?? accounts[idx].email,
      last_login_at: new Date().toISOString(),
    };
    const next = [...accounts];
    next[idx] = updated;
    setLocalAdminAccounts(next);
    return updated;
  }
}

export async function deleteAdminAccount(id: string) {
  try {
    const res = await fetch(`${ADMIN_ACCOUNTS_API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (res.status === 403) {
      throw new Error("forbidden");
    }
    if (!res.ok && res.status !== 204) {
      throw new Error("Failed to delete admin account");
    }
  } catch (err) {
    console.warn("[admin-accounts] delete fallback", err);
    const accounts = getLocalAdminAccounts();
    const filtered = accounts.filter((acc) => acc.id !== id);
    setLocalAdminAccounts(filtered);
  }
}

export async function fetchActivities(options?: {
  limit?: number;
  days?: number;
}) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.days) params.set("days", String(options.days));
  const res = await callEdgeFunction(
    `activities${params.toString() ? `?${params.toString()}` : ""}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch activities");
  }
  const body = (await res.json()) as { activities: ActivityRecord[] };
  return body.activities ?? [];
}

export async function fetchAdminNewsPosts() {
  const res = await callEdgeFunction("news-admin", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin news");
  }

  const body = (await res.json()) as { articles: NewsPostRecord[] };
  return body.articles ?? [];
}

export async function fetchMyDrafts() {
  const res = await callEdgeFunction("news-drafts", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch drafts");
  }

  const body = (await res.json()) as { drafts: ArticleVersionRecord[] };
  return body.drafts ?? [];
}

export type NewsDraftInput = {
  id?: string; // article id
  title_zh: string;
  title_en: string;
  summary_zh?: string | null;
  summary_en?: string | null;
  content_zh?: string | null;
  content_en?: string | null;
  cover_source?: string | null;
  cover_type?: "unsplash" | "upload" | null;
  cover_keyword?: string | null;
  cover_url?: string | null;
  author_id?: string | null;
};

export async function saveNewsDraft(payload: NewsDraftInput) {
  const authorId =
    payload.author_id ??
    (typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("adminId")
      : null);
  const res = await callEdgeFunction("news-drafts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      author_id: authorId ?? undefined,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to save draft");
  }

  const body = (await res.json()) as { draft: ArticleVersionRecord };
  return body.draft;
}

export async function publishNewsFromDraft(versionId: string) {
  const res = await callEdgeFunction("news-publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ versionId }),
  });

  if (!res.ok) {
    throw new Error("Failed to publish draft");
  }

  const body = (await res.json()) as {
    article: NewsPostRecord;
    version: ArticleVersionRecord;
  };

  return body;
}

export async function deleteArticle(id: string) {
  const res = await fetch(`${ADMIN_NEWS_API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete article");
  }
}

export async function deleteDraft(versionId: string) {
  const res = await callEdgeFunction(
    `news-drafts-delete?versionId=${encodeURIComponent(versionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete draft");
  }
}

// Members
export interface MemberRecord {
  id: string;
  chinese_name: string;
  english_name: string;
  gender: "male" | "female";
  birthday: string | null;
  phone: string;
  email: string | null;
  address: string;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relation: string | null;
  apply_date: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  handled_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminAccountRecord {
  id: string;
  username: string;
  email: string;
  role: "owner" | "admin";
  status: "active" | "disabled";
  created_at: string | null;
  last_login_at: string | null;
}

export type ActivityRecord = {
  id: string;
  type: "registration" | "member" | "news" | "event";
  timestamp: string;
  user: string;
  action: { zh: string; en: string };
  metadata: Record<string, unknown>;
};

export class ConcurrencyError extends Error {
  constructor(message = "Record was modified by another user") {
    super(message);
    this.name = "ConcurrencyError";
  }
}

const MEMBERS_API_BASE = buildAdminApiUrl("/members");

export async function fetchMembers() {
  const res = await fetch(MEMBERS_API_BASE, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch members");
  }

  const body = (await res.json()) as { members: MemberRecord[] };
  return body.members ?? [];
}

export async function updateMemberStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
  options?: {
    expectedStatus?: MemberRecord["status"];
    expectedUpdatedAt?: string | null;
  }
) {
  const res = await fetch(`${MEMBERS_API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      status,
      expectedStatus: options?.expectedStatus,
      expectedUpdatedAt: options?.expectedUpdatedAt,
    }),
  });

  if (res.status === 409) {
    throw new ConcurrencyError();
  }

  if (!res.ok) {
    throw new Error("Failed to update member");
  }

  const body = (await res.json()) as { member: MemberRecord };
  return body.member;
}

export async function deleteMember(id: string) {
  const res = await fetch(`${MEMBERS_API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete member");
  }
}

export type MemberApplicationInput = {
  chinese_name: string;
  english_name: string;
  gender: "male" | "female";
  birthday?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  emergency_name?: string | null;
  emergency_phone?: string | null;
  emergency_relation?: string | null;
};

export async function createMemberApplication(payload: MemberApplicationInput) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("members").insert(
    {
      ...payload,
      birthday: payload.birthday ?? null,
      email: payload.email ?? null,
      emergency_name: payload.emergency_name ?? null,
      emergency_phone: payload.emergency_phone ?? null,
      emergency_relation: payload.emergency_relation ?? null,
      status: "pending",
      apply_date: new Date().toISOString().slice(0, 10),
    },
    { returning: "minimal" } as never
  );

  if (error) {
    logSupabaseError("createMemberApplication", error);
    throw error;
  }
  return null;
}

export type CreateStripeCheckoutSessionInput = {
  eventId: string;
  tickets: number;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CreateStripeCheckoutSessionResponse = {
  sessionId: string;
  url: string | null;
};

export async function createStripeCheckoutSession(
  payload: CreateStripeCheckoutSessionInput
): Promise<CreateStripeCheckoutSessionResponse> {
  const res = await fetch(`${PAYMENTS_API_BASE}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to create Stripe checkout session");
  }

  return (await res.json()) as CreateStripeCheckoutSessionResponse;
}

// helper to set handled_by when available
export async function createEventRegistration(payload: {
  event_id: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  tickets: number;
  payment_method?: "card" | "cash" | "transfer" | null;
}) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("event_registrations").insert(
    {
      ...payload,
      payment_method: payload.payment_method ?? null,
    },
    { returning: "minimal" } as never
  );

  if (error) {
    logSupabaseError("createEventRegistration", error);
    throw error;
  }
  return null;
}

export async function notifyMemberApplication(payload: {
  chineseName?: string | null;
  englishName?: string | null;
  email?: string | null;
  phone?: string | null;
  applyDate?: string | null;
}) {
  try {
    await fetch(`${NOTIFICATIONS_API_BASE}/member-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[notifications] member application failed", err);
  }
}

export async function notifyEventRegistration(payload: {
  eventTitleZh?: string | null;
  eventTitleEn?: string | null;
  name: string;
  email?: string | null;
  tickets?: number;
  paymentMethod?: string | null;
  notes?: string | null;
  notifyAdminNotes?: boolean;
}) {
  try {
    await fetch(`${NOTIFICATIONS_API_BASE}/event-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[notifications] event registration failed", err);
  }
}
