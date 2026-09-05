import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { apiFetch, requestJson, resetCsrfToken, setUnauthorizedHandler } from './api';
import { ApiRequestError } from './errors';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

describe('apiFetch', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
		resetCsrfToken();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends credentials and attaches the CSRF header to POST requests', async () => {
		fetchMock.mockImplementation((url: string) =>
			url === '/api/csrf'
				? Promise.resolve(jsonResponse({ csrftoken: 'tok-1' }))
				: Promise.resolve(jsonResponse({ ok: true })),
		);

		const res = await apiFetch('/api/contact', { method: 'POST', body: '{}' });

		expect(res.ok).toBe(true);
		// 1) CSRF bootstrap, 2) the POST
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			'/api/csrf',
			expect.objectContaining({ credentials: 'include' }),
		);
		const [, postInit] = fetchMock.mock.calls[1];
		expect(postInit.credentials).toBe('include');
		expect(new Headers(postInit.headers).get('X-CSRFToken')).toBe('tok-1');
	});

	it('does not fetch a CSRF token or attach the header for GET requests', async () => {
		fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ email: 'a@b.com' })));

		await apiFetch('/api/accounts/me');

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [, init] = fetchMock.mock.calls[0];
		expect(new Headers(init.headers).get('X-CSRFToken')).toBeNull();
	});

	it('retries once with a fresh token when Django rejects CSRF (HTML 403)', async () => {
		let csrfCalls = 0;
		fetchMock.mockImplementation((url: string, init?: RequestInit) => {
			if (url === '/api/csrf') {
				csrfCalls += 1;
				return Promise.resolve(jsonResponse({ csrftoken: csrfCalls === 1 ? 'tok-1' : 'tok-2' }));
			}
			const header = new Headers(init?.headers).get('X-CSRFToken');
			if (header === 'tok-1') {
				return Promise.resolve(
					new Response('CSRF verification failed', {
						status: 403,
						headers: { 'Content-Type': 'text/html' },
					}),
				);
			}
			return Promise.resolve(jsonResponse({ ok: true }));
		});

		const res = await apiFetch('/api/contact', { method: 'POST', body: '{}' });

		expect(res.status).toBe(200);
		// csrf, POST (stale token), csrf (fresh), POST (fresh token)
		expect(fetchMock).toHaveBeenCalledTimes(4);
	});

	it('does not retry on JSON 403 (authorization errors are final)', async () => {
		fetchMock.mockImplementation((url: string) =>
			url === '/api/csrf'
				? Promise.resolve(jsonResponse({ csrftoken: 'tok-1' }))
				: Promise.resolve(jsonResponse({ errors: { resource: ['forbidden'] } }, 403)),
		);

		const res = await apiFetch('/api/contact', { method: 'POST', body: '{}' });

		expect(res.status).toBe(403);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('invokes the unauthorized handler on 401', async () => {
		const handler = vi.fn();
		setUnauthorizedHandler(handler);
		fetchMock.mockImplementation((url: string) =>
			url === '/api/csrf'
				? Promise.resolve(jsonResponse({ csrftoken: 'tok-1' }))
				: Promise.resolve(jsonResponse({ detail: 'not signed in' }, 401)),
		);

		await apiFetch('/api/accounts/me');

		expect(handler).toHaveBeenCalledTimes(1);
	});
});

describe('requestJson error normalisation', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubGlobal('fetch', fetchMock);
		resetCsrfToken();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('shows a friendly message for invalid-email validation errors', async () => {
		fetchMock.mockImplementation((url: string) =>
			url === '/api/csrf'
				? Promise.resolve(jsonResponse({ csrftoken: 'tok-1' }))
				: Promise.resolve(
						jsonResponse({ errors: { email: ['value is not a valid email address'] } }, 422),
					),
		);

		const err: unknown = await requestJson('/api/accounts/otp/request', z.void(), {
			method: 'POST',
			body: '{}',
		}).then(
			() => null,
			(e: unknown) => e,
		);

		expect(err).toBeInstanceOf(ApiRequestError);
		const apiErr = err as ApiRequestError;
		expect(apiErr.message).toBe('Sorry, the email provided is invalid.');
		expect(apiErr.status).toBe(422);
		expect(apiErr.fieldErrors).toEqual({
			email: ['value is not a valid email address'],
		});
	});

	it('keeps the generic fallback for other field errors', async () => {
		fetchMock.mockImplementation(() =>
			Promise.resolve(jsonResponse({ errors: { resource: ['not found'] } }, 404)),
		);

		const err: unknown = await requestJson('/api/nope', z.void()).then(
			() => null,
			(e: unknown) => e,
		);

		expect(err).toBeInstanceOf(ApiRequestError);
		const apiErr = err as ApiRequestError;
		expect(apiErr.message).toBe('Request failed.');
		expect(apiErr.status).toBe(404);
	});
});
