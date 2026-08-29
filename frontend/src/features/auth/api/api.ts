import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { requestJson, resetCsrfToken } from '@/lib/api/api';
import { ApiRequestError } from '@/lib/api/errors';

import type {
	ChangeEmailInput,
	MemberOut,
	MeResponse,
	RequestOTPInput,
	RequestOTPOut,
	SendAllEmailInput,
	SendAllEmailOut,
	UpdateMeInput,
	VerifyOTPInput,
	VerifyOTPOut,
} from '../schemas';
import {
	ChangeEmailInputSchema,
	MemberOutSchema,
	MeResponseSchema,
	RequestOTPOutSchema,
	SendAllEmailOutSchema,
	UpdateMeInputSchema,
	VerifyOTPOutSchema,
} from '../schemas';

export { ApiRequestError };

/**
 * Typed API client for the session-auth accounts endpoints.
 * See `docs/todo.md` for the authoritative endpoint reference.
 */

export async function requestOtp(email: string): Promise<RequestOTPOut> {
	return requestJson('/api/accounts/otp/request', RequestOTPOutSchema, {
		method: 'POST',
		body: JSON.stringify({ email }),
	});
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOTPOut> {
	const out = await requestJson('/api/accounts/otp/verify', VerifyOTPOutSchema, {
		method: 'POST',
		body: JSON.stringify({ email, code }),
	});
	// Django rotates the CSRF secret on login — drop our cached token so the
	// next mutating request fetches a fresh one.
	resetCsrfToken();
	return out;
}

export async function updateMe(input: UpdateMeInput): Promise<MeResponse> {
	const parsed = UpdateMeInputSchema.parse(input);
	return requestJson('/api/accounts/me', MeResponseSchema, {
		method: 'PATCH',
		body: JSON.stringify(parsed),
	});
}

export async function changeEmail(email: string, code: string): Promise<MeResponse> {
	const parsed = ChangeEmailInputSchema.parse({ email, code });
	return requestJson('/api/accounts/email/change', MeResponseSchema, {
		method: 'POST',
		body: JSON.stringify(parsed),
	});
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

export function useUpdateMe() {
	return useMutation({
		mutationFn: (input: UpdateMeInput) => updateMe(input),
	});
}

export function useChangeEmail() {
	return useMutation({
		mutationFn: (input: ChangeEmailInput) => changeEmail(input.email, input.code),
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
