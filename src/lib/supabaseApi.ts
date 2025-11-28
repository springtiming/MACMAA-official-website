import type { PostgrestError } from "@supabase/supabase-js";
import {
  getSupabaseAdminClient,
  getSupabaseClient,
  logSupabaseError,
} from "./supabaseClient";

export interface NewsPostRecord {
  id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string | null;
  summary_en: string | null;
  content_zh: string | null;
  content_en: string | null;
  cover_source: string | null;
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
  registration_date: string;
  created_at: string;
}

interface FetchNewsOptions {
  publishedOnly?: boolean;
  limit?: number;
}

interface FetchEventsOptions {
  includeMembersOnly?: boolean;
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
      "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id"
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
  const { includeMembersOnly = true, fromDate, limit } = options;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("events")
    .select(
      "id, title_zh, title_en, description_zh, description_en, event_date, start_time, end_time, location, fee, member_fee, capacity, access_type, image_type, image_keyword, image_url, created_by, created_at, updated_at, published"
    )
    .eq("published", true)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (!includeMembersOnly) {
    query = query.or("access_type.is.null,access_type.eq.all-welcome");
  }
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
      "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id"
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

export async function fetchAdminNewsPosts() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, published_at, published, author_id"
    )
    .order("published_at", { ascending: false });

  if (error) {
    logSupabaseError("fetchAdminNewsPosts", error);
    throw error;
  }
  return data ?? [];
}

export async function fetchMyDrafts() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("article_versions")
    .select(
      "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number, created_by, created_at, updated_at"
    )
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) {
    logSupabaseError("fetchMyDrafts", error);
    throw error;
  }
  return data ?? [];
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
};

export async function saveNewsDraft(payload: NewsDraftInput) {
  const supabase = getSupabaseAdminClient();

  // Determine next version_number
  let versionNumber = 1;
  if (payload.id) {
    const { data: latestVersion } = await supabase
      .from("article_versions")
      .select("version_number")
      .eq("article_id", payload.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestVersion?.version_number) {
      versionNumber = latestVersion.version_number + 1;
    }
  }

  const { data, error } = await supabase
    .from("article_versions")
    .insert({
      article_id: payload.id ?? null,
      title_zh: payload.title_zh,
      title_en: payload.title_en,
      summary_zh: payload.summary_zh ?? null,
      summary_en: payload.summary_en ?? null,
      content_zh: payload.content_zh ?? null,
      content_en: payload.content_en ?? null,
      cover_source: payload.cover_source ?? null,
      status: "draft",
      version_number: versionNumber,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError("saveNewsDraft", error);
    throw error;
  }
  return data as ArticleVersionRecord;
}

export async function publishNewsFromDraft(versionId: string) {
  const supabase = getSupabaseAdminClient();
  // Fetch draft
  const { data: draft, error: draftError } = await supabase
    .from("article_versions")
    .select(
      "id, article_id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, cover_source, status, version_number"
    )
    .eq("id", versionId)
    .maybeSingle();
  if (draftError || !draft) {
    logSupabaseError("publishNewsFromDraft", draftError);
    throw draftError;
  }

  const articleId = draft.article_id || crypto.randomUUID();

  // Upsert article with draft content
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .upsert({
      id: articleId,
      title_zh: draft.title_zh,
      title_en: draft.title_en,
      summary_zh: draft.summary_zh,
      summary_en: draft.summary_en,
      content_zh: draft.content_zh,
      content_en: draft.content_en,
      cover_source: draft.cover_source,
      published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (articleError) {
    logSupabaseError("publishNewsFromDraft", articleError);
    throw articleError;
  }

  // Mark version as published and ensure article_id is set
  const { data: version, error: versionError } = await supabase
    .from("article_versions")
    .update({ status: "published", article_id: article.id })
    .eq("id", draft.id)
    .select()
    .single();

  if (versionError) {
    logSupabaseError("publishNewsFromDraft", versionError);
    throw versionError;
  }

  return {
    article: article as NewsPostRecord,
    version: version as ArticleVersionRecord,
  };
}

export async function deleteArticle(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    logSupabaseError("deleteArticle", error);
    throw error;
  }
}

export async function deleteDraft(versionId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("article_versions")
    .delete()
    .eq("id", versionId)
    .eq("status", "draft");
  if (error) {
    logSupabaseError("deleteDraft", error);
    throw error;
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

export class ConcurrencyError extends Error {
  constructor(message = "Record was modified by another user") {
    super(message);
    this.name = "ConcurrencyError";
  }
}

const MEMBERS_API_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_API_BASE
    ? (import.meta.env.VITE_ADMIN_API_BASE as string)
    : "/api/members";

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
  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      ...payload,
      payment_method: payload.payment_method ?? null,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError("createEventRegistration", error);
    throw error;
  }
  return data as EventRegistrationRecord;
}
