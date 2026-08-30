import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { requestJson } from '@/lib/api/api';

/** `POST /api/contact` — public contact form (still requires a CSRF header). */
export const ContactInputSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.').max(200),
	email: z.email('Enter a valid email address.'),
	message: z.string().trim().min(1, 'Message is required.').max(5000),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;

export async function sendContact(input: ContactInput): Promise<void> {
	const parsed = ContactInputSchema.parse(input);
	await requestJson('/api/contact', z.void(), {
		method: 'POST',
		body: JSON.stringify(parsed),
	});
}

export function useSendContact() {
	return useMutation({
		mutationFn: sendContact,
	});
}
