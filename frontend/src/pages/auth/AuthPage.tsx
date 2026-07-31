import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { ApiRequestError, useRequestOtp, useUpdateMe, useVerifyOtp } from '@/shared/lib/auth/api';
import { useAuth } from '@/shared/lib/auth/use-auth';

type Step = 'email' | 'code' | 'names';

export function AuthPage() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [step, setStep] = useState<Step>('email');
	const [email, setEmail] = useState('');
	const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''));
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [error, setError] = useState<string | null>(null);

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const requestCodeMut = useRequestOtp();
	const verifyCodeMut = useVerifyOtp();
	const updateMeMut = useUpdateMe();

	const handleSendCode = async () => {
		if (!email.trim()) return;

		setError(null);

		try {
			await requestCodeMut.mutateAsync({ email: email.trim() });
			// Existing users log straight in after the code; new accounts are
			// created on verify (`created: true`) and then prompted for a name.
			setStep('code');
			// Focus the first digit input after step transition
			setTimeout(() => inputRefs.current[0]?.focus(), 100);
		} catch (err) {
			if (err instanceof ApiRequestError) {
				setError(err.message);
			} else {
				setError('Something went wrong. Please try again.');
			}
		}
	};

	const handleDigitChange = (index: number, value: string) => {
		if (!/^\d?$/.test(value)) return; // only digits

		const newDigits = [...codeDigits];
		newDigits[index] = value;
		setCodeDigits(newDigits);

		// Auto-advance to the next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, key: string) => {
		if (key === 'Backspace' && !codeDigits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
		const newDigits = [...codeDigits];
		for (let i = 0; i < pasted.length; i++) {
			newDigits[i] = pasted[i];
		}
		setCodeDigits(newDigits);
		inputRefs.current[Math.min(pasted.length, 5)]?.focus();
	};

	const handleVerify = async () => {
		const code = codeDigits.join('');
		if (code.length !== 6) return;

		setError(null);

		try {
			const { created } = await verifyCodeMut.mutateAsync({
				email: email.trim(),
				code,
			});

			// The session cookie is set by verify — hydrate the profile.
			await login();

			if (created) {
				// Brand-new account — collect first/last name before entering.
				setStep('names');
			} else {
				navigate('/member');
			}
		} catch (err) {
			if (err instanceof ApiRequestError) {
				setError(err.message);
			} else {
				setError('Invalid or expired verification code.');
			}
		}
	};

	const handleBack = () => {
		setStep('email');
		setCodeDigits(Array(6).fill(''));
		setError(null);
	};

	const handleSubmitNames = async () => {
		setError(null);

		try {
			await updateMeMut.mutateAsync({
				first_name: firstName.trim(),
				last_name: lastName.trim(),
			});
			navigate('/member');
		} catch (err) {
			if (err instanceof ApiRequestError) {
				setError(err.message);
			} else {
				setError('Something went wrong. Please try again.');
			}
		}
	};

	return (
		<div className="flex w-full items-center justify-center px-4 py-30">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				className="glass-box w-full max-w-md rounded-2xl p-8 shadow-xl md:p-12"
			>
				{/* Title */}
				<h1 className="mb-2 text-center text-3xl font-bold">
					{step === 'email' && 'Join EVP'}
					{step === 'code' && 'Check your email'}
					{step === 'names' && 'Tell us your name'}
				</h1>
				<p className="text-foreground/60 mb-8 text-center text-sm">
					{step === 'email' && "Enter your email and we'll send you a one-time code."}
					{step === 'code' && `We sent a 6-digit code to ${email}`}
					{step === 'names' && 'Your account is ready — add your first and last name.'}
				</p>

				{/* Error */}
				{error && (
					<motion.p
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-4 text-center text-sm text-red-500"
						role="alert"
					>
						{error}
					</motion.p>
				)}

				{step === 'email' && (
					<div className="flex flex-col gap-4">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSendCode();
							}}
							placeholder="you@example.com"
							autoComplete="email"
							disabled={requestCodeMut.isPending}
							className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>

						<button
							type="button"
							onClick={handleSendCode}
							disabled={requestCodeMut.isPending || !email.trim()}
							className="bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{requestCodeMut.isPending ? 'sending...' : 'send code'}
						</button>
					</div>
				)}

				{step === 'code' && (
					<div className="flex flex-col gap-4">
						{/* Digit inputs */}
						<div className="flex justify-center gap-2" onPaste={handlePaste}>
							{codeDigits.map((digit, i) => (
								<input
									key={i}
									ref={(el) => {
										inputRefs.current[i] = el;
									}}
									type="text"
									inputMode="numeric"
									maxLength={1}
									value={digit}
									onChange={(e) => handleDigitChange(i, e.target.value)}
									onKeyDown={(e) => handleKeyDown(i, e.key)}
									disabled={verifyCodeMut.isPending}
									className="border-accent/30 bg-background/40 focus:border-accent focus:ring-accent/20 h-14 w-12 rounded-lg border text-center text-xl font-bold transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
							))}
						</div>

						{/* Verify button */}
						<button
							type="button"
							onClick={handleVerify}
							disabled={verifyCodeMut.isPending || codeDigits.some((d) => !d)}
							className="bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{verifyCodeMut.isPending ? 'verifying...' : 'verify'}
						</button>

						{/* Back link */}
						<button
							type="button"
							onClick={handleBack}
							disabled={verifyCodeMut.isPending}
							className="text-foreground/50 hover:text-foreground mt-2 cursor-pointer text-center text-sm underline-offset-2 transition-colors hover:underline"
						>
							Use a different email
						</button>
					</div>
				)}

				{step === 'names' && (
					<div className="flex flex-col gap-4">
						<input
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSubmitNames();
							}}
							placeholder="First name"
							autoComplete="given-name"
							disabled={updateMeMut.isPending}
							className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>
						<input
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleSubmitNames();
							}}
							placeholder="Last name"
							autoComplete="family-name"
							disabled={updateMeMut.isPending}
							className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
						/>

						<button
							type="button"
							onClick={handleSubmitNames}
							disabled={updateMeMut.isPending || !firstName.trim() || !lastName.trim()}
							className="bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{updateMeMut.isPending ? 'saving...' : 'continue'}
						</button>
					</div>
				)}
			</motion.div>
		</div>
	);
}
