import { useState } from 'react';

import { useSendAllEmail } from '@/lib/auth/api';
import type { SendAllEmailOut } from '@/lib/auth/schemas';
import { cn } from '@/lib/utils/cn';
import { inputClass, labelClass } from '@/styles/formClasses';

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
		<div className="glass-box rounded-2xl p-8">
			<h2 className="text-2xl font-bold">Send email to all members</h2>
			<p className="text-foreground/60 mt-1 text-sm">
				Send an email update to all members of EVP (who haven't opted out).
			</p>

			<form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
				<div className="flex flex-col gap-1.5">
					<label htmlFor="update-subject" className={labelClass}>
						subject
					</label>
					<input
						id="update-subject"
						type="text"
						className={inputClass}
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Subject line"
						required
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="update-body" className={labelClass}>
						message
					</label>
					<textarea
						id="update-body"
						rows={6}
						className={cn(inputClass, 'resize-none')}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Plain-text message sent to all opted-in members."
						required
					/>
				</div>

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

				<button
					type="submit"
					disabled={sendMut.isPending || !subject.trim() || !body.trim()}
					className="bg-accent hover:bg-accent/80 mt-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
				>
					{sendMut.isPending ? 'sending...' : 'send to all members'}
				</button>
			</form>
		</div>
	);
}
