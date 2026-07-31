import { z } from 'zod';

export const Role = {
	MEMBER: 'member',
	SCOUT: 'scout',
	COMMITTEE: 'committee',
	ADMIN: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const RoleSchema = z.enum(['member', 'scout', 'committee', 'admin']);

export const RequestOTPInputSchema = z.object({
	email: z.string().email(),
});

export const VerifyOTPInputSchema = z.object({
	email: z.string().email(),
	code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

/** `GET /api/accounts/me` */
export const MeResponseSchema = z.object({
	id: z.number(),
	email: z.string(),
	role: RoleSchema,
	date_joined: z.string(),
});

/** `GET /api/accounts/members` item */
export const MemberOutSchema = z.object({
	id: z.number(),
	email: z.string(),
	role: RoleSchema,
	date_joined: z.string(),
	receives_update_emails: z.boolean(),
});

/** `POST /api/accounts/sendall` */
export const SendAllEmailInputSchema = z.object({
	subject: z.string().min(1),
	body: z.string().min(1),
});

export const SendAllEmailOutSchema = z.object({
	subject: z.string(),
	body: z.string(),
	sent: z.number(),
	skipped: z.number(),
	failed: z.number(),
});

export type RequestOTPInput = z.infer<typeof RequestOTPInputSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPInputSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type MemberOut = z.infer<typeof MemberOutSchema>;
export type SendAllEmailInput = z.infer<typeof SendAllEmailInputSchema>;
export type SendAllEmailOut = z.infer<typeof SendAllEmailOutSchema>;
