/**
 * Structured error thrown by the API layer.
 *
 * The backend returns two error shapes:
 *  - `{"errors": {field: [msgs]}}` for schema/permission/not-found failures (401/403/404/422)
 *  - `{"detail": "..."}` for `HttpError`-raised failures (invalid OTP, email-server 500s)
 *
 * `ApiRequestError` normalises both into one type. `message` is set to the
 * `detail` string when present, otherwise a generic fallback.
 */
export class ApiRequestError extends Error {
	readonly status: number;
	readonly detail: string | null;
	readonly fieldErrors: Record<string, string[]>;

	constructor(
		status: number,
		detail: string | null = null,
		fieldErrors: Record<string, string[]> = {},
	) {
		super(detail ?? 'Request failed.');
		this.name = 'ApiRequestError';
		this.status = status;
		this.detail = detail;
		this.fieldErrors = fieldErrors;
	}
}
