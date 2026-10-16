import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INSUFFICIENT_QUESTIONS"
  | "PAYLOAD_TOO_LARGE"
  | "PDF_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (message = "Không tìm thấy dữ liệu.") => new ApiError(404, "NOT_FOUND", message);
export const badRequest = (message: string, details?: unknown) => new ApiError(400, "BAD_REQUEST", message, details);

export function jsonOk<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(data, { status: init?.status ?? 200, headers: init?.headers });
}

export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status, headers: { "Cache-Control": "no-store", ...err.headers } },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Dữ liệu không hợp lệ.",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  // Never leak internals to clients; log a short message without request data.
  console.error("[api] unexpected error:", err instanceof Error ? `${err.name}: ${err.message}` : "unknown");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." } },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

type RouteContext<P> = { params: Promise<P> };

/** Wraps a route handler with uniform error handling. */
export function route<P = Record<string, string>>(
  handler: (req: Request, ctx: RouteContext<P>) => Promise<Response>,
): (req: Request, ctx: RouteContext<P>) => Promise<Response> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

const MAX_JSON_BYTES = 256 * 1024;

/** Reads and size-limits a JSON body. */
export async function readJson(req: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > maxBytes) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Dữ liệu gửi lên quá lớn.");
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Dữ liệu gửi lên quá lớn.");
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw badRequest("Dữ liệu JSON không hợp lệ.");
  }
}

export function searchParamsObject(req: Request): Record<string, string> {
  return Object.fromEntries(new URL(req.url).searchParams.entries());
}
