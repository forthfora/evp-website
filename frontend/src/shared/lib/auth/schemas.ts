import { z } from 'zod';

export const Role = {
	MEMBER: 'member',
	SCOUT: 'scout',
	COMMITTEE: 'committee',
	ADMIN: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Structured error returned by the backend on 422, 401, 403.
 * Field-level errors: `{ errors: { field: [msg, ...] } }`
 * General errors:     `{ detail: "message" }`
 */
export const apiErrorSchema = z.object({
	errors: z.record(z.string(), z.array(z.string())).optional(),
	detail: z.string().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const requestCodeInputSchema = z.object({
	email: z.email('Please enter a valid email address.'),
});

export type RequestCodeInput = z.infer<typeof requestCodeInputSchema>;

export const verifyCodeInputSchema = z.object({
	email: z.email(),
	code: z.string().length(6, 'Code must be exactly 6 digits.'),
});

export type VerifyCodeInput = z.infer<typeof verifyCodeInputSchema>;

export const authResponseSchema = z.object({
	access: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const meResponseSchema = z.object({
	email: z.string(),
	role: z.string(),
	date_joined: z.string(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
