import { z } from 'zod';

export const Role = {
	MEMBER: 'member',
	SCOUT: 'scout',
	COMMITTEE: 'committee',
	ADMIN: 'admin',
} as const;

export const RoleColors: Record<string, string> = {
	[Role.MEMBER]: 'bg-foreground/15 text-foreground',
	[Role.SCOUT]: 'bg-accent/60 text-foreground',
	[Role.COMMITTEE]: 'bg-amber-400/50 text-foreground',
	[Role.ADMIN]: 'bg-red-700/50 text-foreground',
};

export type Role = (typeof Role)[keyof typeof Role];

export const RoleSchema = z.enum(['member', 'scout', 'committee', 'admin']);

export const RequestOTPInputSchema = z.object({
	email: z.email(),
});

export const VerifyOTPInputSchema = z.object({
	email: z.email(),
	code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

/** `POST /api/accounts/otp/request` */
export const RequestOTPOutSchema = z.object({
	exists: z.boolean(),
});

/** `POST /api/accounts/otp/verify` */
export const VerifyOTPOutSchema = z.object({
	created: z.boolean(),
});

/** `GET /api/accounts/me` */
export const MeResponseSchema = z.object({
	// Stable, globally-unique user ID (never shown in the UI).
	username: z.string(),
	email: z.string(),
	role: RoleSchema,
	date_joined: z.string(),
	first_name: z.string(),
	last_name: z.string(),
	receives_update_emails: z.boolean(),
});

/** `PATCH /api/accounts/me` */
export const UpdateMeInputSchema = z.object({
	first_name: z.string().max(150).optional(),
	last_name: z.string().max(150).optional(),
	receives_update_emails: z.boolean().optional(),
});

/** `POST /api/accounts/email/change` */
export const ChangeEmailInputSchema = z.object({
	email: z.email(),
	code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits.'),
});

/** `GET /api/accounts/members` item */
export const MemberOutSchema = z.object({
	username: z.string(),
	first_name: z.string(),
	last_name: z.string(),
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
export type RequestOTPOut = z.infer<typeof RequestOTPOutSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPInputSchema>;
export type VerifyOTPOut = z.infer<typeof VerifyOTPOutSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type UpdateMeInput = z.infer<typeof UpdateMeInputSchema>;
export type ChangeEmailInput = z.infer<typeof ChangeEmailInputSchema>;
export type MemberOut = z.infer<typeof MemberOutSchema>;
export type SendAllEmailInput = z.infer<typeof SendAllEmailInputSchema>;
export type SendAllEmailOut = z.infer<typeof SendAllEmailOutSchema>;
