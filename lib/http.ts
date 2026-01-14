/**
 * HTTP utilities for Next.js API routes
 */

/**
 * safeJson - Safely parse JSON from Request body
 * Returns null if body is empty or JSON is invalid
 * @param req - Request object
 * @returns Parsed JSON as T, or null if parsing fails
 */
export async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    const body = await req.text();
    if (!body || body.trim() === '') {
      return null;
    }
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}
