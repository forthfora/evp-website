import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	apiErrorSchema,
	type AuthResponse,
	type MeResponse,
	type RequestCodeInput,
	type VerifyCodeInput,
} from './schemas';

class ApiRequestError extends Error {
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
		this.name = 'ApiRequestError';
		this.status = status;
		this.body = body;
	}
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	});

	if (!response.ok) {
		let body: unknown;
		try {
			body = await response.json();
		} catch {
			body = { detail: response.statusText };
		}
		throw new ApiRequestError(response.status, body);
	}

	// 204 No Content — nothing to parse
	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export function requestCode(body: RequestCodeInput): Promise<void> {
	return apiFetch<void>('/api/auth/request-code', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function verifyCode(body: VerifyCodeInput): Promise<AuthResponse> {
	return apiFetch<AuthResponse>('/api/auth/verify-code', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function fetchMe(token: string): Promise<MeResponse> {
	return apiFetch<MeResponse>('/api/accounts/me', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

export function useRequestCode() {
	return useMutation({
		mutationFn: (body: RequestCodeInput) => requestCode(body),
	});
}

export function useVerifyCode() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: VerifyCodeInput) => verifyCode(body),
		onSuccess: () => {
			// Invalidate any cached queries that depend on auth state
			void queryClient.invalidateQueries({ queryKey: ['me'] });
		},
	});
}

export function useMe(token: string | null) {
	return useQuery({
		queryKey: ['me'],
		queryFn: () => fetchMe(token!),
		enabled: token !== null,
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Re-export the error class so consumers can catch and inspect it
export { ApiRequestError };
