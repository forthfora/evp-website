import { useState } from 'react';

import { FormField, PrimaryButton, WidgetCard } from '@/components/ui';
import { useSendAllEmail } from '@/lib/auth/api';
import type { SendAllEmailOut } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils/cn';
import { inputClass } from '@/styles/form-classes';

export function AdminUpdatesWidget() {
	const sendMut = useSendAllEmail();
	const [subject, setSubject] = useState('');
	const [body, setBody] = useState('');
	const [result, setResult] = useState<SendAllEmailOut | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setResult(null);

		try {
			const out = await sendMut.mutateAsync({ subject: subject.trim(), body: body.trim() });
			setResult(out);
			setSubject('');
			setBody('');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send the update.');
		}
	}

	return (
		<WidgetCard
			title="Send email to all members"
			description="Send an email update to all members of EVP (who haven't opted out)."
		>
			<form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
				<FormField id="update-subject" label="subject">
					<input
						id="update-subject"
						type="text"
						className={inputClass}
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Subject line"
						required
					/>
				</FormField>

				<FormField id="update-body" label="message">
					<textarea
						id="update-body"
						rows={6}
						className={cn(inputClass, 'resize-none')}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Plain-text message sent to all opted-in members."
						required
					/>
				</FormField>

				{error && (
					<p className="text-sm text-red-500" role="alert">
						{error}
					</p>
				)}

				{result && (
					<div className="border-accent/20 rounded-lg border p-3 text-sm" role="status">
						<p className="font-semibold">
							Sent to {result.sent} member{result.sent === 1 ? '' : 's'}
						</p>
						<p className="text-foreground/60 mt-1">
							{result.skipped} skipped (opted out) · {result.failed} failed
						</p>
					</div>
				)}

				<PrimaryButton
					type="submit"
					disabled={sendMut.isPending || !subject.trim() || !body.trim()}
				>
					{sendMut.isPending ? 'sending...' : 'send to all members'}
				</PrimaryButton>
			</form>
		</WidgetCard>
	);
}
