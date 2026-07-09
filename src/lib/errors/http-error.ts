/** Typed HTTP errors for controllers — map to JSON responses in `runController`. */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function unauthorized(message = "Unauthorized") {
  return new HttpError(401, message, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden") {
  return new HttpError(403, message, "FORBIDDEN");
}

export function badRequest(message: string) {
  return new HttpError(400, message, "BAD_REQUEST");
}

export function notFound(message = "Not found") {
  return new HttpError(404, message, "NOT_FOUND");
}

export function conflict(message: string) {
  return new HttpError(409, message, "CONFLICT");
}
