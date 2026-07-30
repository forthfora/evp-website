import { useMutation } from '@tanstack/react-query';

import { ApiRequestError } from '../auth/api';
import type { ContactInput } from './schemas';

async function sendContact(body: ContactInput): Promise<{ success: string }> {
	const response = await fetch('/api/contact', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new ApiRequestError(response.status, data);
	}

	return data as { success: string };
}

export function useContact() {
	return useMutation({
		mutationFn: (body: ContactInput) => sendContact(body),
	});
}

export { sendContact };
