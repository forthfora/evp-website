import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { requestJson, resetCsrfToken } from '@/shared/lib/api';
import { ApiRequestError } from '@/shared/lib/errors';

import type {
	MemberOut,
	MeResponse,
	RequestOTPInput,
	SendAllEmailInput,
	SendAllEmailOut,
	VerifyOTPInput,
} from './schemas';
import { MemberOutSchema, MeResponseSchema, SendAllEmailOutSchema } from './schemas';

export { ApiRequestError };

/**
 * Typed API client for the session-auth accounts endpoints.
 * See `docs/todo.md` for the authoritative endpoint reference.
 */

export async function requestOtp(email: string): Promise<void> {
	await requestJson('/api/accounts/otp/request', z.undefined(), {
		method: 'POST',
		body: JSON.stringify({ email }),
	});
}

export async function verifyOtp(email: string, code: string): Promise<void> {
	await requestJson('/api/accounts/otp/verify', z.undefined(), {
		method: 'POST',
		body: JSON.stringify({ email, code }),
	});
	// Django rotates the CSRF secret on login — drop our cached token so the
	// next mutating request fetches a fresh one.
	resetCsrfToken();
}

export async function logout(): Promise<void> {
	await requestJson('/api/accounts/logout', z.undefined(), { method: 'POST' });
	resetCsrfToken();
}

export async function fetchMe(): Promise<MeResponse> {
	return requestJson('/api/accounts/me', MeResponseSchema);
}

export async function fetchMembers(): Promise<MemberOut[]> {
	return requestJson('/api/accounts/members', z.array(MemberOutSchema));
}

export async function sendAllEmail(subject: string, body: string): Promise<SendAllEmailOut> {
	return requestJson('/api/accounts/sendall', SendAllEmailOutSchema, {
		method: 'POST',
		body: JSON.stringify({ subject, body }),
	});
}

export function useRequestOtp() {
	return useMutation({
		mutationFn: (input: RequestOTPInput) => requestOtp(input.email),
	});
}

export function useVerifyOtp() {
	return useMutation({
		mutationFn: (input: VerifyOTPInput) => verifyOtp(input.email, input.code),
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => logout(),
		onSuccess: () => {
			queryClient.clear();
		},
	});
}

export function useMe() {
	return useQuery({
		queryKey: ['me'],
		queryFn: fetchMe,
		retry: false,
	});
}

export function useMembers() {
	return useQuery({
		queryKey: ['members'],
		queryFn: fetchMembers,
	});
}

export function useSendAllEmail() {
	return useMutation({
		mutationFn: (input: SendAllEmailInput) => sendAllEmail(input.subject, input.body),
	});
}
