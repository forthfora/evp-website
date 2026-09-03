import { motion } from 'framer-motion';
import { useState } from 'react';

import contactImg from '@/assets/homepage/promo-tower.webp';
import {
	buttonVariants,
	inputVariants,
	MediaTextSection,
	PageMeta,
	SectionDivider,
} from '@/components/ui';
import { sendContact } from '@/lib/api/contact';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface FormFields {
	name: string;
	email: string;
	message: string;
}

/**
 * Contact form: two-column layout (image + form) with name/email/message fields.
 * Renders inside the Contact route page with its own form state.
 */
export function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>({ name: '', email: '', message: '' });
	const [status, setStatus] = useState<FormState>('idle');

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		const { name, email, message } = fields;
		if (!name.trim() || !email.trim() || !message.trim()) return;

		setStatus('submitting');

		try {
			await sendContact(fields);
			setStatus('success');
			setFields({ name: '', email: '', message: '' });
		} catch {
			setStatus('error');
		}
	}

	const isSubmitting = status === 'submitting';
	const isSuccess = status === 'success';

	return (
		<section className="glass-box w-full overflow-hidden py-25 md:py-50">
			<PageMeta title="Contact" description="Reach out and see what EVP can do for you." />
			<MediaTextSection
				image={contactImg}
				imageAlt="Cathedral tower with Scottish flag"
				className="md:flex-row md:items-start"
			>
				<h2 id="email" className="-scroll-mt-25 text-4xl font-bold md:text-5xl">
					Contact us
				</h2>
				<SectionDivider width="w-75 md:w-100" my="my-2" />
				<p className="text-lg md:text-xl">
					Fill in the form below and we'll get back to you as soon as possible.
				</p>

				<div className="flex w-full flex-col gap-4">
					{/* Name */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="name-field"
							className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
						>
							name
						</label>
						<input
							id="name-field"
							name="name"
							type="text"
							autoComplete="name"
							value={fields.name}
							onChange={handleChange}
							placeholder="Your full name"
							disabled={isSubmitting || isSuccess}
							className={inputVariants({ size: 'md' })}
						/>
					</div>

					{/* Email */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="email-field"
							className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
						>
							email
						</label>
						<input
							id="email-field"
							name="email"
							type="email"
							autoComplete="email"
							value={fields.email}
							onChange={handleChange}
							placeholder="[EMAIL]"
							disabled={isSubmitting || isSuccess}
							className={inputVariants({ size: 'md' })}
						/>
					</div>

					{/* Message */}
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="message-field"
							className="text-left text-sm font-semibold tracking-widest uppercase opacity-70"
						>
							message
						</label>
						<textarea
							id="message-field"
							name="message"
							rows={6}
							value={fields.message}
							onChange={handleChange}
							placeholder="What can EVP do for you?"
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
							!fields.message.trim()
						}
						className={buttonVariants({ intent: 'primary', size: 'md', className: 'mt-2 w-full' })}
					>
						{isSubmitting ? 'sending...' : isSuccess ? 'sent!' : 'send message'}
					</button>

					{/* Feedback messages */}
					{isSuccess && (
						<motion.p
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-foreground text-center text-lg md:text-left"
						>
							Thanks for reaching out - we'll be in touch soon.
						</motion.p>
					)}
					{status === 'error' && (
						<motion.p
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-lg-400 text-center text-sm md:text-left"
						>
							Something went wrong. Please try again or email us directly.
						</motion.p>
					)}
				</div>
			</MediaTextSection>
		</section>
	);
}
