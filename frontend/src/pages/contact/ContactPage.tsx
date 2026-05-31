import contactImg from '@assets/homepage/promo-tower.webp';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

import { SectionDivider } from '@/shared/ui/common/SectionDivider';

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: -50 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true as const, margin: '-150px' },
	transition: { duration: 0.6, ease: 'easeOut' as const, delay },
});

const slideIn = (direction: 'left' | 'right', delay = 0) => ({
	initial: { opacity: 0, x: direction === 'left' ? -60 : 60 },
	whileInView: { opacity: 1, x: 0 },
	viewport: { once: true as const, margin: '-100px' },
	transition: { duration: 0.8, ease: 'easeOut' as const, delay },
});

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
	name: string;
	email: string;
	message: string;
}

export function ContactPage() {
	return (
		<div className="flex w-full flex-col">
			<ContactHero />

			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				<ContactFormSection />
			</div>
		</div>
	);
}

function ContactHero() {
	return (
		<section className="relative flex h-[50vh] min-h-80 w-full items-end overflow-hidden">
			<img
				src={contactImg}
				alt="The Scottish flag on a cathedral tower"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="bg-background/60 absolute inset-0" />

			<motion.div {...fadeUp(0.1)} className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
				<h1 className="text-5xl font-bold md:text-7xl">get in touch</h1>
				<SectionDivider width="w-75 md:w-100" my="my-3" />
				<p className="max-w-xl text-lg md:text-xl">
					Whether you're a founder, investor or just curious about what EVP can offer - we'd love to
					hear from you.
				</p>
			</motion.div>
		</section>
	);
}

function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>({ name: '', email: '', message: '' });
	const [status, setStatus] = useState<FormState>('idle');
	const formRef = useRef<HTMLDivElement>(null);

	// TODO: Replace with your company email address
	const COMPANY_EMAIL = 'edinburghventurepoint@gmail.com';

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		const { name, email, message } = fields;
		if (!name.trim() || !email.trim() || !message.trim()) return;

		setStatus('submitting');

		try {
			// Uses the mailto: protocol as a reliable, zero-dependency fallback.
			// Swap this block for a fetch() call to your API / email service when ready.
			const subject = encodeURIComponent(`EVP Contact: ${name}`);
			const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
			window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;

			setStatus('success');
			setFields({ name: '', email: '', message: '' });
		} catch {
			setStatus('error');
		}
	}

	const isSubmitting = status === 'submitting';
	const isSuccess = status === 'success';

	function isEmailValid(email: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	return (
		<section className="glass-box w-full overflow-hidden py-25 md:py-50">
			<div
				ref={formRef}
				className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start"
			>
				{/* Left: image */}
				<motion.div {...slideIn('left')} className="flex w-full justify-center md:w-1/2">
					<img
						src={contactImg}
						alt="Cathedral tower with Scottish flag"
						className="w-full max-w-md rounded-lg object-cover shadow-2xl"
					/>
				</motion.div>

				{/* Right: form */}
				<motion.div
					{...slideIn('right', 0.2)}
					className="flex w-full flex-col items-center gap-6 text-center md:w-1/2 md:items-start md:text-left"
				>
					<h2 className="text-4xl font-bold md:text-5xl">contact us</h2>
					<SectionDivider width="w-75 md:w-100" my="my-2" />
					<p className="text-lg md:text-xl">
						Fill in the form below and we'll get back to you as soon as possible.
					</p>

					<div className="flex w-full flex-col gap-4">
						{/* Name */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="name"
								className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
							>
								name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								value={fields.name}
								onChange={handleChange}
								placeholder="Your full name"
								disabled={isSubmitting || isSuccess}
								className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{/* Email */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
							>
								email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={fields.email}
								onChange={handleChange}
								placeholder="you@example.com"
								disabled={isSubmitting || isSuccess}
								className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{/* Message */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="message"
								className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
							>
								message
							</label>
							<textarea
								id="message"
								name="message"
								rows={6}
								value={fields.message}
								onChange={handleChange}
								placeholder="How can we help?"
								disabled={isSubmitting || isSuccess}
								className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full resize-none rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>

						{/* Submit */}
						<button
							type="button"
							onClick={handleSubmit}
							disabled={
								isSubmitting ||
								isSuccess ||
								!fields.name.trim() ||
								!fields.email.trim() ||
								!isEmailValid(fields.email.trim()) ||
								!fields.message.trim()
							}
							className="bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{isSubmitting ? 'sending...' : isSuccess ? 'sent!' : 'send message'}
						</button>

						{/* Feedback messages */}
						{isSuccess && (
							<motion.p
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-accent text-center text-sm md:text-left"
							>
								Thanks for reaching out - we'll be in touch soon.
							</motion.p>
						)}
						{status === 'error' && (
							<motion.p
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center text-sm text-red-400 md:text-left"
							>
								Something went wrong. Please try again or email us directly.
							</motion.p>
						)}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
