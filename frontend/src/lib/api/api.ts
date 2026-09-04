import type { ZodType } from 'zod';

import { ApiRequestError } from './errors';

let csrfToken: string | null = null;
let csrfFetch: Promise<string> | null = null;

export function resetCsrfToken(): void {
	csrfToken = null;
}

async function fetchCsrfToken(): Promise<string> {
	if (csrfToken) return csrfToken;

	if (!csrfFetch) {
		csrfFetch = (async () => {
			const res = await fetch('/api/csrf', { credentials: 'include' });
			if (!res.ok) {
				throw new ApiRequestError(
					res.status,
					'Failed to fetch CSRF token. Our servers might be down, please try again later.',
				);
			}
			const data = (await res.json()) as { csrftoken?: string };
			if (!data.csrftoken) {
				throw new ApiRequestError(res.status, 'CSRF token missing from response.');
			}
			csrfToken = data.csrftoken;
			return csrfToken;
		})().finally(() => {
			csrfFetch = null;
		});
	}

	return csrfFetch;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
	unauthorizedHandler = handler;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
	const method = (options.method ?? 'GET').toUpperCase();
	const headers = new Headers(options.headers);
	const needsCsrf = MUTATING_METHODS.has(method);

	if (needsCsrf) {
		headers.set('X-CSRFToken', await fetchCsrfToken());
	}
	if (options.body !== undefined && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const res = await fetch(path, {
		...options,
		method,
		headers,
		credentials: 'include',
	});

	if (res.status === 401) {
		unauthorizedHandler?.();
	}

	if (
		res.status === 403 &&
		needsCsrf &&
		(res.headers.get('content-type') ?? '').includes('text/html')
	) {
		resetCsrfToken();
		headers.set('X-CSRFToken', await fetchCsrfToken());

		const retry = await fetch(path, {
			...options,
			method,
			headers,
			credentials: 'include',
		});

		if (retry.status === 401) {
			unauthorizedHandler?.();
		}

		return retry;
	}

	return res;
}

async function toApiRequestError(res: Response): Promise<ApiRequestError> {
	const body = (await res.json().catch(() => null)) as unknown;

	if (body && typeof body === 'object' && 'errors' in body) {
		const errors = (body as { errors: Record<string, string[]> }).errors;
		const detail = 'email' in errors ? 'Sorry, the email provided is invalid.' : null;
		return new ApiRequestError(res.status, detail, errors);
	}

	if (body && typeof body === 'object' && 'detail' in body) {
		return new ApiRequestError(res.status, String((body as { detail: unknown }).detail));
	}

	return new ApiRequestError(res.status);
}

/**
 * Fetch + parse helper: throws `ApiRequestError` on non-2xx, returns `undefined`
 * for 204 No Content, and runtime-validates the JSON body with a zod schema.
 */
export async function requestJson<T>(
	path: string,
	schema: ZodType<T>,
	init?: RequestInit,
): Promise<T> {
	const res = await apiFetch(path, init);

	if (!res.ok) {
		throw await toApiRequestError(res);
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const data = (await res.json()) as unknown;
	return schema.parse(data);
}
