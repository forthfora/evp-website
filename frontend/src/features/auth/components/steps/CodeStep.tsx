import type { RefObject } from 'react';

import { buttonVariants } from '@/components/ui/interactive/Button';
import { inputVariants } from '@/components/ui/interactive/Input';

import { ErrorBanner } from '../ErrorBanner';

type CodeStepProps = {
	email: string;
	codeDigits: string[];
	inputRefs: RefObject<(HTMLInputElement | null)[]>;
	onDigitChange: (index: number, value: string) => void;
	onDigitKeyDown: (index: number, key: string) => void;
	onDigitPaste: (e: React.ClipboardEvent) => void;
	onVerify: () => void;
	onResend: () => void;
	onBack: () => void;
	isVerifying: boolean;
	isResending: boolean;
	error: string | null;
};

export function CodeStep({
	email,
	codeDigits,
	inputRefs,
	onDigitChange,
	onDigitKeyDown,
	onDigitPaste,
	onVerify,
	onResend,
	onBack,
	isVerifying,
	isResending,
	error,
}: CodeStepProps) {
	return (
		<div className="mx-auto w-full max-w-md">
			<div className="glass-box rounded-2xl p-8 shadow-xl md:p-12">
				<h1 className="mb-2 text-center text-4xl font-bold">Check your inbox!</h1>
				<p className="text-foreground mb-2 text-center text-lg">
					We've sent a 6-digit code to{' '}
					<u>
						<b>{email}</b>
					</u>
				</p>
				<p className="text-foreground-muted mb-2 text-center text-sm">
					If you don't see the email, try checking spam.
					<br />
					The code expires in 10 minutes.
				</p>

				<ErrorBanner message={error ?? ''} />

				<div className="flex flex-col gap-4 pt-2">
					<div className="flex justify-center gap-2" onPaste={onDigitPaste}>
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
								onChange={(e) => onDigitChange(i, e.target.value)}
								onKeyDown={(e) => onDigitKeyDown(i, e.key)}
								disabled={isVerifying}
								className={inputVariants({ size: 'digit' })}
							/>
						))}
					</div>

					<button
						type="button"
						onClick={onVerify}
						disabled={isVerifying || codeDigits.some((d) => !d)}
						className={buttonVariants({ intent: 'primary', size: 'md' })}
					>
						{isVerifying ? 'verifying...' : 'verify'}
					</button>

					<button
						type="button"
						onClick={onResend}
						disabled={isResending}
						className={buttonVariants({ intent: 'link', size: 'sm' })}
					>
						{isResending ? 'resending...' : "Didn't receive anything? Request a new code."}
					</button>

					<button
						type="button"
						onClick={onBack}
						disabled={isVerifying}
						className={buttonVariants({ intent: 'link', size: 'sm' })}
					>
						Use a different email.
					</button>
				</div>
			</div>
		</div>
	);
}
