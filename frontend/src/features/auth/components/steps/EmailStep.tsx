import joinImage from '@assets/homepage/promo-bar.webp';
import { motion } from 'framer-motion';

import { SectionDivider } from '@/components/ui';

import { inputClass, primaryBtnClass } from '../../styles';
import { ErrorBanner } from '../ErrorBanner';

type EmailStepProps = {
	email: string;
	onEmailChange: (value: string) => void;
	onSubmit: () => void;
	isSubmitting: boolean;
	error: string | null;
	playIntro: boolean;
};

export function EmailStep({
	email,
	onEmailChange,
	onSubmit,
	isSubmitting,
	error,
	playIntro,
}: EmailStepProps) {
	return (
		<div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-14">
			<motion.img
				src={joinImage}
				alt="Auth page banner."
				initial={playIntro ? { opacity: 0, x: -40 } : false}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
				className="hidden h-140 w-1/2 max-w-lg rounded-2xl object-cover shadow-2xl lg:block"
			/>

			<div className="w-full max-w-md">
				<motion.p
					initial={playIntro ? { opacity: 0, x: 40 } : false}
					animate={{ opacity: 1, x: 0 }}
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
					initial={playIntro ? { opacity: 0, x: 40 } : false}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
				>
					<p className="text-foreground mb-8 text-center text-3xl">
						<b>Just enter your email below.</b>
					</p>
					<p className="text-foreground mb-2 text-center text-xl">
						We'll send you a one-time code to get you setup.
					</p>

					<p className="text-foreground-muted text-md mb-4 text-center">
						Or if you're already a member, we'll sign you in.
					</p>

					{<ErrorBanner message={error ?? ''} />}

					<div className="flex flex-col gap-4 pt-2">
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
