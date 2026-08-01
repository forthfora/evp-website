import joinImage from '@assets/homepage/promo-bar.webp';
import { motion } from 'framer-motion';

import { ErrorBanner } from '../ErrorBanner';
import { inputClass, primaryBtnClass } from '../styles';
import { useEffect, useState } from 'react';
import { SectionDivider } from '@/shared/ui/common';

type EmailStepProps = {
	email: string;
	onEmailChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
	error: string | null;
};

export function EmailStep({ email, onEmailChange, onSubmit, isSubmitting, error }: EmailStepProps) {
	const mounted = useMounted();

	return (
		<div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-14">
			<motion.img
				src={joinImage}
				alt="Auth page banner."
				initial={{ opacity: 0, x: -40 }}
				animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
				transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
				className="hidden h-140 w-1/2 max-w-lg rounded-2xl object-cover shadow-2xl lg:block"
			/>

			<div className="w-full max-w-md">
				<motion.p
					initial={{ opacity: 0, x: -1000 }}
					animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
					transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
					className="text-foreground mb-6 text-center text-3xl italic"
				>
					Become a member of EVP and receive the latest insights.
					<SectionDivider
						my="my-4 mb-8 md:mb-10"
						width="w-2/3 max-w-[200px] mx-auto md:max-w-none md:w-100"
					/>
				</motion.p>

				<motion.div
					className="glass-box rounded-2xl p-8 shadow-xl md:p-10"
					initial={{ opacity: 0, x: -40 }}
					animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
					transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
				>
					<p className="text-foreground mb-8 text-center text-3xl">Just enter your email below.</p>
					<p className="text-foreground mb-2 text-center text-xl">
						We'll send you a one-time code to get you setup.
					</p>

					<p className="text-foreground-muted text-md mb-4 text-center">
						Or if you're already a member, we'll sign you in.
					</p>

					{<ErrorBanner message={error ?? ''} />}

					<div className="flex flex-col gap-4">
						<input
							type="email"
							value={email}
							onChange={(e) => onEmailChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') onSubmit();
							}}
							placeholder="you@example.com"
							autoComplete="email"
							disabled={isSubmitting}
							className={inputClass}
						/>

						<button
							type="button"
							onClick={onSubmit}
							disabled={isSubmitting || !email.trim()}
							className={primaryBtnClass}
						>
							{isSubmitting ? 'sending...' : 'send code'}
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

export function useMounted() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return mounted;
}
