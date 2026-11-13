import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { AuthError } from "./middleware/auth";
import { checkRateLimit, RateLimitConfig, RATE_LIMITS } from "./middleware/rate-limit";

export function successResponse(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

export function handleApiError(error: unknown): Response {
  if (error instanceof Error && "digest" in error) throw error;

  if (error instanceof AuthError) {
    return errorResponse(error.message, error.status);
  }

  if (error instanceof Error && error.name === "ZodError" && "issues" in error) {
    const issues = (error as Error & { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
    const messages = issues.map((e) => `${e.path.join(".")}: ${e.message}`);
    return errorResponse(messages.join(", "), 422);
  }

  console.error("Unhandled API error:", error);
  return errorResponse("Internal server error", 500);
}

export function applyRateLimit(req: NextRequest, config: RateLimitConfig = RATE_LIMITS.api): Response | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const result = checkRateLimit(ip, config);

  if (!result.allowed) {
    return Response.json(
      { success: false, error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
