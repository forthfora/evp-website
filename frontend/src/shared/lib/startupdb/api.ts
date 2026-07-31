import { z } from 'zod';

import { requestJson } from '@/shared/lib/api';

/**
 * Typed client for `/api/startupdb` (Founder + StartupEntry records).
 * Mirrors `apps/startupdb/schemas.py`. All endpoints are gated server-side to
 * scout/committee/admin; ownership rules are enforced by the backend.
 */

export const OccupationSchema = z.enum(['bachelors', 'masters', 'phd', 'graduated']);

export const FounderOutSchema = z.object({
	id: z.number(),
	first_name: z.string(),
	last_name: z.string(),
	location: z.string(),
	occupation: OccupationSchema,
	linkedin: z.string(),
	email: z.string(),
	notes: z.string(),
	// Stable user ID (username) of the creator.
	created_by: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const FounderInSchema = z.object({
	first_name: z.string().trim().min(1, 'First name is required.'),
	last_name: z.string().trim().min(1, 'Last name is required.'),
	location: z.string().default(''),
	occupation: OccupationSchema.default('graduated'),
	linkedin: z.string().default(''),
	email: z.string().default(''),
	notes: z.string().default(''),
});

export const StartupOutSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	website: z.string(),
	linkedin: z.string(),
	email: z.string(),
	location: z.string(),
	notes: z.string(),
	founding_date: z.string().nullable(),
	founders: z.array(FounderOutSchema),
	// Stable user ID (username) of the creator.
	created_by: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const StartupInSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.'),
	description: z.string().default(''),
	website: z.string().default(''),
	linkedin: z.string().default(''),
	email: z.string().default(''),
	location: z.string().default(''),
	notes: z.string().default(''),
	founding_date: z.string().nullable().default(null),
	founder_ids: z.array(z.number()).default([]),
});

export const StartupPatchSchema = StartupInSchema.partial();

export type FounderOut = z.infer<typeof FounderOutSchema>;
export type FounderIn = z.infer<typeof FounderInSchema>;
export type StartupOut = z.infer<typeof StartupOutSchema>;
export type StartupIn = z.infer<typeof StartupInSchema>;
export type StartupPatch = z.infer<typeof StartupPatchSchema>;

export async function fetchFounders(): Promise<FounderOut[]> {
	return requestJson('/api/startupdb/founders', z.array(FounderOutSchema));
}

export async function createFounder(input: FounderIn): Promise<FounderOut> {
	return requestJson('/api/startupdb/founders', FounderOutSchema, {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

export async function updateFounder(id: number, patch: Partial<FounderIn>): Promise<FounderOut> {
	return requestJson(`/api/startupdb/founders/${id}`, FounderOutSchema, {
		method: 'PATCH',
		body: JSON.stringify(patch),
	});
}

export async function deleteFounder(id: number): Promise<void> {
	await requestJson(`/api/startupdb/founders/${id}`, z.undefined(), { method: 'DELETE' });
}

export async function fetchStartups(): Promise<StartupOut[]> {
	return requestJson('/api/startupdb/', z.array(StartupOutSchema));
}

export async function createStartup(input: StartupIn): Promise<StartupOut> {
	return requestJson('/api/startupdb/', StartupOutSchema, {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

export async function updateStartup(id: number, patch: StartupPatch): Promise<StartupOut> {
	return requestJson(`/api/startupdb/${id}`, StartupOutSchema, {
		method: 'PATCH',
		body: JSON.stringify(patch),
	});
}

export async function deleteStartup(id: number): Promise<void> {
	await requestJson(`/api/startupdb/${id}`, z.undefined(), { method: 'DELETE' });
}
