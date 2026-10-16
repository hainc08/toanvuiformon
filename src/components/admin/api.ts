"use client";

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  details?: { path: string; message: string }[] | unknown;
}

/** Same-origin JSON fetch for admin mutations (cookies are sent automatically). */
export async function api<T = unknown>(url: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const json = (await res.json().catch(() => null)) as (T & { error?: { message?: string; details?: unknown } }) | null;
    if (!res.ok) {
      const details = json?.error?.details;
      let message = json?.error?.message ?? `Lỗi ${res.status}`;
      if (Array.isArray(details) && details.length && typeof details[0] === "object" && details[0] && "message" in details[0]) {
        message += " " + (details as { path: string; message: string }[]).map((d) => `${d.path ? d.path + ": " : ""}${d.message}`).join("; ");
      }
      return { ok: false, status: res.status, data: json, error: message, details };
    }
    return { ok: true, status: res.status, data: json, error: null };
  } catch {
    return { ok: false, status: 0, data: null, error: "Không kết nối được máy chủ." };
  }
}
