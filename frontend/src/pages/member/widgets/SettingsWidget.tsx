import { useState } from 'react';

import { useChangeEmail, useRequestOtp, useUpdateMe } from '@/shared/lib/auth/api';
import { useAuth } from '@/shared/lib/auth/use-auth';
import { cn } from '@/shared/lib/utils';
import { AnimatedCheckbox } from '@/shared/ui/common/AnimatedCheckbox';

const inputClass =
	'bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';
const labelClass = 'text-left text-xs font-semibold tracking-widest uppercase opacity-70';
const primaryBtnClass =
	'bg-accent hover:bg-accent/80 cursor-pointer rounded-lg px-4 py-2 text-sm font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';
const ghostBtnClass =
	'border-accent/30 hover:border-accent/60 cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40';

type StepMessage = { ok: boolean; text: string } | null;

/**
 * Account settings: name, email (OTP-verified change) and the update-email
 * opt-in. Visible to every authenticated role.
 */
export function SettingsWidget() {
	const { user, login } = useAuth();

	const [firstName, setFirstName] = useState(user?.first_name ?? '');
	const [lastName, setLastName] = useState(user?.last_name ?? '');
	const [nameMsg, setNameMsg] = useState<StepMessage>(null);

	const [newEmail, setNewEmail] = useState('');
	const [emailCode, setEmailCode] = useState('');
	const [emailStep, setEmailStep] = useState<'idle' | 'code'>('idle');
	const [emailMsg, setEmailMsg] = useState<StepMessage>(null);

	const [optIn, setOptIn] = useState(user?.receives_update_emails ?? true);

	const updateMeMut = useUpdateMe();
	const requestOtpMut = useRequestOtp();
	const changeEmailMut = useChangeEmail();

	async function handleSaveName() {
		setNameMsg(null);

		try {
			await updateMeMut.mutateAsync({
				first_name: firstName.trim(),
				last_name: lastName.trim(),
			});
			await login(); // refresh the profile in AuthContext
			setNameMsg({ ok: true, text: 'Saved.' });
		} catch (err) {
			setNameMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to save.' });
		}
	}

	async function handleSendEmailCode() {
		setEmailMsg(null);
		if (!newEmail.trim()) return;

		try {
			await requestOtpMut.mutateAsync({ email: newEmail.trim() });
			setEmailStep('code');
		} catch (err) {
			setEmailMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to send code.' });
		}
	}

	async function handleConfirmEmail() {
		setEmailMsg(null);

		try {
			await changeEmailMut.mutateAsync({
				email: newEmail.trim(),
				code: emailCode.trim(),
			});
			await login();
			setEmailStep('idle');
			setNewEmail('');
			setEmailCode('');
			setEmailMsg({ ok: true, text: 'Email updated.' });
		} catch (err) {
			setEmailMsg({
				ok: false,
				text: err instanceof Error ? err.message : 'Failed to change email.',
			});
		}
	}

	async function handleToggleOptIn(next: boolean) {
		setOptIn(next);
		setNameMsg(null);

		try {
			await updateMeMut.mutateAsync({ receives_update_emails: next });
			await login();
		} catch {
			setOptIn(!next); // revert on failure
		}
	}

	return (
		<div className="glass-box rounded-2xl p-8">
			<h2 className="text-2xl font-bold">Account Settings</h2>
			<p className="text-foreground/60 mt-1 text-sm">Manage your profile and email preferences.</p>

			{/* Name */}
			<div className="mt-5 flex flex-col gap-3">
				<p className={labelClass}>name</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<input
						type="text"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="First name"
						autoComplete="given-name"
						className={inputClass}
					/>
					<input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Last name"
						autoComplete="family-name"
						className={inputClass}
					/>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => void handleSaveName()}
						disabled={
							updateMeMut.isPending || (firstName == user?.first_name && lastName == user.last_name)
						}
						className={primaryBtnClass}
					>
						{updateMeMut.isPending ? 'updating...' : 'update'}
					</button>
					{nameMsg && (
						<p
							className={cn('text-sm', nameMsg.ok ? 'text-green-500' : 'text-red-500')}
							role="status"
						>
							{nameMsg.text}
						</p>
					)}
				</div>
			</div>

			{/* Email */}
			<div className="mt-6 flex flex-col gap-3">
				<p className={labelClass}>email</p>
				<p className="text-foreground/60 text-sm">Current: {user?.email}</p>

				{emailStep === 'idle' ? (
					<div className="flex flex-col gap-2">
						<input
							type="email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							placeholder="New email address"
							autoComplete="email"
							className={inputClass}
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => void handleSendEmailCode()}
								disabled={requestOtpMut.isPending || !newEmail.trim()}
								className={primaryBtnClass}
							>
								{requestOtpMut.isPending ? 'sending...' : 'send code'}
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<p className="text-foreground/60 text-sm">
							We sent a 6-digit code to <span className="font-semibold">{newEmail}</span>
						</p>
						<input
							type="text"
							inputMode="numeric"
							maxLength={6}
							value={emailCode}
							onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
							placeholder="6-digit code"
							className={inputClass}
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => void handleConfirmEmail()}
								disabled={changeEmailMut.isPending || emailCode.trim().length !== 6}
								className={primaryBtnClass}
							>
								{changeEmailMut.isPending ? 'confirming...' : 'confirm'}
							</button>
							<button
								type="button"
								onClick={() => setEmailStep('idle')}
								disabled={changeEmailMut.isPending}
								className={ghostBtnClass}
							>
								cancel
							</button>
						</div>
					</div>
				)}

				{emailMsg && (
					<p
						className={cn('text-sm', emailMsg.ok ? 'text-green-500' : 'text-red-500')}
						role="status"
					>
						{emailMsg.text}
					</p>
				)}
			</div>

			{/* Update-email opt-in */}
			<div className="mt-6 flex items-center gap-4">
				<div className="shrink-0">
					<p className="text-lg font-semibold">Update Emails</p>
					<p className="text-foreground/60 text-sm">
						Receive non-essential update emails from EVP.
					</p>
				</div>

				<div
					aria-hidden="true"
					className="text-foreground-muted/50 mx-3 mt-1 min-w-6 flex-1 self-center border-b-2 border-dotted"
				/>

				<label className="flex shrink-0 cursor-pointer items-center gap-2">
					<AnimatedCheckbox checked={optIn} onChange={(v) => void handleToggleOptIn(v)} />
				</label>
			</div>
		</div>
	);
}
