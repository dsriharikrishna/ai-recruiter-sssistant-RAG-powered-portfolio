import { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly isUnauthorized: boolean;
  public readonly isForbidden: boolean;
  public readonly isNotFound: boolean;

  constructor(
    status: number,
    message: string,
    errorResponse?: ApiErrorResponse
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = errorResponse?.error?.code;
    this.details = errorResponse?.error?.details || errorResponse?.detail;
    this.isUnauthorized = status === 401;
    this.isForbidden = status === 403;
    this.isNotFound = status === 404;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(status: number, data: ApiErrorResponse): ApiError {
    let message = "An unexpected error occurred.";

    if (data.error?.message) {
      message = data.error.message;
    } else if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      message = data.detail.map((d) => d.msg).join(", ");
    } else if (status === 401) {
      message = "Session expired or unauthorized. Please log in.";
    } else if (status === 403) {
      message = "You do not have permission to perform this action.";
    } else if (status === 404) {
      message = "Requested resource was not found.";
    }

    return new ApiError(status, message, data);
  }
}
