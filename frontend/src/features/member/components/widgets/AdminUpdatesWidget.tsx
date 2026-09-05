import { useMemo, useState } from 'react';

import { Button, FormField, PrimaryButton, WidgetCard } from '@/components/ui';
import { inputVariants } from '@/components/ui/interactive/input/input-variants';
import {
	fetchSendAllJob,
	useMembers,
	useSendAllEmail,
	useSendAllJobs,
} from '@/features/auth/api/api';
import type { SendAllEmailOut, SendAllJob } from '@/features/auth/api/schemas';
import { cn } from '@/utils/cn';

import { renderMarkdown } from './render-markdown';

const CONFIRM_PHRASE = 'CONFIRM';

/** Styling for the rendered Markdown preview, mirroring the email's look. */
const PREVIEW_STYLES = [
	'bg-white text-[#333333] p-6 pb-0 text-sm leading-relaxed',
	'[&>*:last-child]:mb-0',
	'[&_a]:text-blue-600 [&_a]:underline',
	'[&_blockquote]:my-3 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic',
	'[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs',
	'[&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold',
	'[&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold',
	'[&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold',
	'[&_hr]:my-4 [&_hr]:border-gray-200',
	'[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded',
	'[&_li]:mb-1',
	'[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5',
	'[&_p]:my-3',
	'[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3',
	'[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5',
].join(' ');

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 120_000;
const POLL_MAX_ERRORS = 3;

/** A job unfinished for this long was probably interrupted (worker restart). */
const STALE_JOB_MS = 10 * 60_000;

async function pollSendAllJob(
	jobId: number,
	onProgress: (job: SendAllJob) => void,
): Promise<SendAllJob | null> {
	const deadline = Date.now() + POLL_TIMEOUT_MS;
	let errors = 0;

	while (Date.now() < deadline) {
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
		try {
			const job = await fetchSendAllJob(jobId);
			errors = 0;
			onProgress(job);
			if (job.finished_at) return job;
		} catch {
			errors += 1;
			if (errors >= POLL_MAX_ERRORS) return null;
		}
	}
	return null;
}

function isJobStale(job: SendAllJob): boolean {
	return job.finished_at === null && Date.now() - new Date(job.created_at).getTime() > STALE_JOB_MS;
}

function formatJobDate(iso: string): string {
	return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AdminUpdatesWidget() {
	const sendMut = useSendAllEmail();
	const { data: members = [], isLoading: membersLoading, error: membersError } = useMembers();
	const { data: recentJobs = [], refetch: refetchRecentJobs } = useSendAllJobs();

	const [step, setStep] = useState<'compose' | 'confirm'>('compose');
	const [subject, setSubject] = useState('');
	const [body, setBody] = useState('');
	const [confirmation, setConfirmation] = useState('');
	const [result, setResult] = useState<SendAllEmailOut | null>(null);
	const [job, setJob] = useState<SendAllJob | null>(null);
	const [statusError, setStatusError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const recipients = members.filter((member) => member.receives_update_emails);
	const optedOut = members.length - recipients.length;
	const bodyHtml = useMemo(() => renderMarkdown(body), [body]);

	const canSend =
		confirmation.trim() === CONFIRM_PHRASE &&
		!membersLoading &&
		!membersError &&
		!sendMut.isPending;

	function reviewDraft(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setResult(null);
		setConfirmation('');
		setStep('confirm');
	}

	async function sendUpdate(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setResult(null);
		setJob(null);
		setStatusError(null);

		try {
			const out = await sendMut.mutateAsync({ subject: subject.trim(), body: bodyHtml });
			setResult(out);
			setSubject('');
			setBody('');
			setConfirmation('');
			setStep('compose');

			// Poll the job until delivery finishes so failures are reported.
			const finished = await pollSendAllJob(out.job_id, setJob);
			if (finished) {
				void refetchRecentJobs();
			} else {
				setStatusError(
					'Delivery status unavailable — the server may have restarted mid-send. Check recent sends or server logs.',
				);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send the update.');
		}
	}

	return (
		<WidgetCard
			title="Send Email to All Members"
			description="Send an email update to all members of EVP (excluding those who have opted out)."
		>
			{step === 'compose' ? (
				<form className="mt-5 flex flex-col gap-3" onSubmit={reviewDraft}>
					<FormField id="update-subject" label="subject">
						<input
							id="update-subject"
							type="text"
							className={inputVariants({ size: 'sm' })}
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Subject line"
							required
						/>
					</FormField>

					<FormField id="update-body" label="message (markdown)">
						<textarea
							id="update-body"
							rows={8}
							className={cn(inputVariants({ size: 'sm' }), 'resize-y font-mono')}
							value={body}
							onChange={(e) => setBody(e.target.value)}
							placeholder="Email content"
							required
						/>
					</FormField>

					{error && (
						<p className="text-sm text-red-500" role="alert">
							{error}
						</p>
					)}

					{result && (
						<div
							className={cn(
								'rounded-lg border p-3 text-sm',
								job?.finished_at && job.failed > 0 ? 'border-red-500' : 'border-green-600',
							)}
							role="status"
						>
							{job?.finished_at ? (
								<>
									<p
										className={cn(
											'text-3xl font-semibold',
											job.sent > 0 ? 'text-green-600' : 'text-red-500',
										)}
									>
										{job.sent > 0
											? `Sent to ${job.sent} member${job.sent === 1 ? '' : 's'}`
											: 'Delivery failed'}
									</p>
									<p className="text-foreground/60 mt-1">
										{result.skipped} skipped (opted out)
										{job.failed > 0 && (
											<span className="font-medium text-red-500">
												{' '}
												· {job.failed} failed — check server logs
											</span>
										)}
									</p>
								</>
							) : job ? (
								<p className="text-foreground/60">
									Sending… {job.sent + job.failed}/{job.total} delivered
								</p>
							) : (
								<p className="text-foreground/60">
									Queued for {result.queued} member{result.queued === 1 ? '' : 's'} ·{' '}
									{result.skipped} skipped (opted out)
								</p>
							)}

							{statusError && <p className="mt-1 text-red-500">{statusError}</p>}
						</div>
					)}
					<PrimaryButton type="submit" disabled={!subject.trim() || !body.trim()}>
						review & confirm
					</PrimaryButton>
				</form>
			) : (
				<form className="mt-5 flex flex-col gap-4" onSubmit={sendUpdate}>
					<div className="border-accent/20 bg-accent/5 rounded-lg border p-3 text-sm">
						{membersLoading && <p className="text-foreground/60">Loading recipient count…</p>}

						{membersError && (
							<p className="text-red-500" role="alert">
								Couldn't load the recipient count, go back and try again.
							</p>
						)}

						{!membersLoading && !membersError && (
							<p>
								This email will be sent to{' '}
								<strong>
									{recipients.length} member{recipients.length === 1 ? '' : 's'}
								</strong>
								{optedOut > 0 && (
									<span className="text-foreground/60">
										{' '}
										({optedOut} opted out of update emails)
									</span>
								)}
								.
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<p className="text-foreground/50 text-xs font-semibold tracking-widest uppercase">
							subject
						</p>
						<p className="text-sm font-semibold">{subject}</p>

						<p className="text-foreground/50 mt-2 text-xs font-semibold tracking-widest uppercase">
							preview
						</p>
						{/* The HTML here is the admin's own Markdown, rendered for preview. */}
						<div className="border-accent/20 rounded-lg border bg-[#f4f4f7] p-4">
							<div className="mx-auto w-full max-w-120 overflow-hidden rounded-lg bg-white">
								<div className={PREVIEW_STYLES}>
									{/* Greeting is filled in per-recipient on the backend. */}
									<p className="text-[15px] text-[#333333]">Hi [First Name],</p>
									<div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
								</div>
								{/* Signature + logo, mirroring the shared email template. */}
								<div className="px-6 pb-6 text-[#333333]">
									<p className="mt-6 text-sm font-bold">
										Kind Regards,
										<br />
										The Edinburgh VenturePoint Team
									</p>
									<img
										src="https://www.edinburghventurepoint.com/favicon.png"
										alt="Edinburgh VenturePoint"
										className="mt-8 block h-auto w-40"
									/>
								</div>
								{/* Footer, mirroring the shared email template. */}
								<div className="bg-[#f4f4f7] px-8 py-4 text-center">
									<p className="m-0 mb-2 text-[11px] text-[#999999]">
										Edinburgh VenturePoint is an entrepreneurship and venture capital society at The
										University of Edinburgh.
									</p>
									<p className="m-0 mb-2.5 text-[11px] text-[#999999]">
										<a
											href="https://www.edinburghventurepoint.com"
											className="text-[#999999] underline"
										>
											edinburghventurepoint.com
										</a>
										{' | '}
										<a
											href="https://www.edinburghventurepoint.com/privacy"
											className="text-[#999999] underline"
										>
											Privacy Policy
										</a>
										{' | '}
										<a
											href="https://www.edinburghventurepoint.com/terms"
											className="text-[#999999] underline"
										>
											Terms of Service
										</a>
									</p>
									<div className="mb-2.5 flex items-center justify-center gap-2">
										<a
											href="https://www.linkedin.com/company/edinburghventurepoint/"
											target="_blank"
											rel="noopener noreferrer"
											aria-label="LinkedIn"
										>
											<img src="/icons/linkedin.png" alt="LinkedIn" className="h-6 w-6" />
										</a>
										<a
											href="https://www.instagram.com/edinburghventurepoint/"
											target="_blank"
											rel="noopener noreferrer"
											aria-label="Instagram"
										>
											<img src="/icons/instagram.png" alt="Instagram" className="h-6 w-6" />
										</a>
									</div>
									<p className="m-0 text-[11px] text-[#999999]">
										© 2026 Edinburgh VenturePoint. All rights reserved.
									</p>
								</div>
							</div>
						</div>
						<p className="text-foreground/50 text-xs">
							Preview of content. Greeting, signature and footer are added automatically.
						</p>
					</div>

					<FormField id="update-confirm" label={`type ${CONFIRM_PHRASE} to send`}>
						<input
							id="update-confirm"
							type="text"
							autoComplete="off"
							spellCheck={false}
							className={cn(inputVariants({ size: 'sm' }), 'font-mono tracking-widest')}
							value={confirmation}
							onChange={(e) => setConfirmation(e.target.value)}
							placeholder={CONFIRM_PHRASE}
						/>
					</FormField>

					{error && (
						<p className="text-sm text-red-500" role="alert">
							{error}
						</p>
					)}

					<div className="flex items-center gap-3">
						<Button intent="ghost" onClick={() => setStep('compose')} disabled={sendMut.isPending}>
							back to edit
						</Button>
						<PrimaryButton type="submit" disabled={!canSend}>
							{sendMut.isPending
								? 'sending...'
								: `send to ${recipients.length} member${recipients.length === 1 ? '' : 's'}`}
						</PrimaryButton>
					</div>
				</form>
			)}

			{recentJobs.length > 0 && (
				<div className="border-foreground/10 mt-6 border-t pt-4">
					<h3 className="text-foreground/50 text-xs font-semibold tracking-widest uppercase">
						recent sends
					</h3>
					<ul className="mt-2 flex flex-col gap-1.5 text-sm">
						{recentJobs.map((j) => (
							<li key={j.id} className="flex items-baseline justify-between gap-3">
								<span className="min-w-0 truncate">
									{j.subject}
									<span className="text-foreground/40"> · {formatJobDate(j.created_at)}</span>
									{!j.finished_at && (
										<span className="text-foreground/50">
											{isJobStale(j) ? ' · interrupted?' : ' · in progress'}
										</span>
									)}
								</span>
								<span
									className={cn('shrink-0', j.failed > 0 ? 'text-red-500' : 'text-foreground/60')}
								>
									{j.sent}/{j.total} sent
									{j.failed > 0 && ` · ${j.failed} failed`}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</WidgetCard>
	);
}
