import { z } from 'zod';

export const contactInputSchema = z.object({
	name: z.string().min(1, 'Name is required.'),
	email: z.email('Please enter a valid email address.'),
	message: z.string().min(1, 'Message is required.'),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

export const contactSuccessSchema = z.object({
	success: z.string(),
});

export const contactErrorSchema = z.object({
	error: z.string(),
});
