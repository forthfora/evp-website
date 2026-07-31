/**
 * An authenticated fetch wrapper that:
 *  1. Attaches the current access token.
 *  2. On 401, attempts a silent refresh using the HttpOnly cookie.
 *  3. If refresh succeeds, retries the original request with the new token.
 *  4. If refresh fails, calls ``onUnauthenticated`` so the caller can log out.
 */

import { apiErrorSchema } from './schemas';

export interface AuthFetchOptions extends RequestInit {
	/** If true, skip the 401 retry flow. Default false. */
	skipAuthRetry?: boolean;
}

export class AuthFetchError extends Error {
	status: number;
	body: unknown;

	constructor(status: number, body: unknown) {
		const parsed = apiErrorSchema.safeParse(body);
		const message = parsed.success
			? (parsed.data.detail ??
				Object.values(parsed.data.errors ?? {})
					.flat()
					.join('; '))
			: `Request failed with status ${status}`;
		super(message);
		this.name = 'AuthFetchError';
		this.status = status;
		this.body = body;
	}
}

let currentToken: string | null = null;

export function setAuthFetchToken(token: string | null) {
	currentToken = token;
}

/**
 * Perform an authenticated fetch request.
 *
 * @param url - The URL to fetch.
 * @param options - Fetch options (skipAuthRetry to disable 401 retry).
 * @param onUnauthenticated - Called when a 401 refresh fails (e.g. to log out).
 * @returns The parsed JSON response.
 */
export async function authFetch<T>(
	url: string,
	options: AuthFetchOptions = {},
	onUnauthenticated?: () => void,
): Promise<T> {
	const { skipAuthRetry, ...fetchOptions } = options;

	const headers = new Headers(fetchOptions.headers);
	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	if (currentToken) {
		headers.set('Authorization', `Bearer ${currentToken}`);
	}

	let response = await fetch(url, { ...fetchOptions, headers });

	// 401 → try silent refresh once
	if (response.status === 401 && !skipAuthRetry) {
		const refreshOk = await tryRefresh();

		if (refreshOk) {
			// Retry with the new token
			headers.set('Authorization', `Bearer ${currentToken}`);
			response = await fetch(url, { ...fetchOptions, headers });
		} else {
			onUnauthenticated?.();
			throw new AuthFetchError(401, {
				detail: 'Session expired. Please log in again.',
			});
		}
	}

	if (!response.ok) {
		let body: unknown;
		try {
			body = await response.json();
		} catch {
			body = { detail: response.statusText };
		}
		throw new AuthFetchError(response.status, body);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
	try {
		const resp = await fetch('/api/auth/refresh/', { method: 'POST' });
		if (!resp.ok) return false;

		const { access } = (await resp.json()) as { access: string };
		currentToken = access;
		return true;
	} catch {
		return false;
	}
}
