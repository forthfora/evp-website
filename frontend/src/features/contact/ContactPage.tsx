import offerImg1 from '@assets/contact/offer-1.webp';
import offerImg2 from '@assets/contact/offer-2.webp';
import offerImg3 from '@assets/contact/offer-3.webp';
import networkImg from '@assets/contact/promo-network.webp';
import scoutImg from '@assets/contact/promo-scout.webp';
import contactImg from '@assets/homepage/promo-tower.webp';
import { PageMeta, RadialGlowOverlay, SectionDivider, Socials, UnderlinedTitle } from '@common';
import { motion } from 'framer-motion';
import { type ReactNode, useRef, useState } from 'react';

import { sendContact } from '@/lib/api/contact';
import { slideIn } from '@/lib/utils/motion';

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

			<section className="py-10 pt-50">
				<UnderlinedTitle title={'What we offer'} delay={0.5} level={2} />

				<div className="glass-box my-20 w-full overflow-hidden py-25 md:py-40">
					<div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start">
						<motion.div
							{...slideIn('right', 0.2)}
							className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left"
						>
							<h2 id="scout-programme" className="text-4xl font-bold md:text-5xl">
								The Scout Programme
							</h2>
							<SectionDivider width="w-75 md:w-100" my="my-2" />
							<b className="text-lg md:text-xl">
								Each semester, EVP handpicks a few student 'venture scouts' following a vetted
								application process.
							</b>

							<p className="text-lg md:text-xl">
								Scouts are tasked with identifying and evaluating the most promising student-led
								start-ups across Scotland.
							</p>

							<p>
								Scouts produce investment memoranda on the most promising start-ups they identify,
								which are shared with our wider investor network at our annual Demo Day.
							</p>

							<p>
								Scouts gain access to free educational sessions with real early-stage investors,
								experiences at exclusive investment meetings, and much more!
							</p>
						</motion.div>
						<motion.div {...slideIn('left')} className="flex h-120 w-full justify-center md:w-1/2">
							<img
								src={scoutImg}
								alt="A group photo with several members of EVP's committee"
								className="w-full max-w-md rounded-lg object-cover shadow-2xl"
							/>
						</motion.div>
					</div>
				</div>

				<div className="glass-box my-10 mt-40 w-full overflow-hidden py-25 md:py-40">
					<div className="mx-auto flex max-w-6xl flex-col justify-end gap-10 px-4 md:flex-row">
						<motion.div {...slideIn('left')} className="flex h-120 w-full justify-center md:w-1/2">
							<img
								src={networkImg}
								alt="A group photo with several members of EVP's committee"
								className="w-full max-w-md rounded-lg object-cover shadow-2xl"
							/>
						</motion.div>
						<motion.div
							{...slideIn('right', 0.2)}
							className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-end md:text-right"
						>
							<h2 id="network" className="text-4xl font-bold md:text-5xl">
								Our network
							</h2>
							<SectionDivider width="w-75 md:w-100" my="my-2" />
							<b className="text-lg md:text-xl">
								Angel syndicates, accelerators, venture capital funds, industry luminaries, and
								more.
							</b>

							<p className="text-lg md:text-xl">
								We provide access to exclusive accelerator pipelines and government-backed
								programmes designed to scale student ventures from idea to execution.
							</p>

							<p>
								As part of CompSoc, EVP has unparalleled access to Edinburgh's top technical talent,
								for those looking to collaborate on groundbreaking projects, find elite co-founders,
								and bring ambitious ideas to life.
							</p>
						</motion.div>
					</div>
				</div>

				<OfferCardsSection />
			</section>

			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				<ContactFormSection />
			</div>
		</div>
	);
}

function OfferCardsSection() {
	const cards: { img: string; title: string; body: ReactNode }[] = [
		{
			img: offerImg1,
			title: 'Angel Syndicates',
			body: (
				<p>
					We have close relationships with some of the oldest and most established angel syndicates
					in the world.
				</p>
			),
		},
		{
			img: offerImg2,
			title: 'Exclusive Programmes',
			body: (
				<p>
					We work with accelerators, government-funded programs, and others to provide student
					founders with opportunities to grow their businesses
				</p>
			),
		},
		{
			img: offerImg3,
			title: 'Top Tech Societies',
			body: (
				<p>
					We are a CompSoc Special Interest Group. Our members have access to everything the largest
					computer science society in Scotland has to offer.
				</p>
			),
		},
	];

	return (
		<section className="w-full pt-25">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body }, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.6, ease: 'easeOut' as const, delay: i * 0.2 }}
						className="glass-box flex min-h-200 w-full flex-col gap-10 text-center"
					>
						<img
							src={img}
							alt={title}
							className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
						/>
						<h3 className="px-15 text-4xl font-bold">{title}</h3>
						<div className="px-10 text-lg">{body}</div>
					</motion.div>
				))}
			</div>
		</section>
	);
}

function ContactHero() {
	return (
		<section className="relative mx-auto flex h-[50vh] min-h-180 w-full items-center overflow-hidden text-center">
			<img
				src={contactImg}
				alt="The Scottish flag on a cathedral tower"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="bg-background/40 absolute inset-0" />
			<RadialGlowOverlay />

			<div className="relative z-10 mx-auto mt-40 w-full max-w-6xl px-4">
				<UnderlinedTitle id="get-in-touch" title="Get in touch" />

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
					className="mx-auto max-w-4xl py-5 text-3xl font-bold italic"
				>
					Whether you're a founder, investor or just curious about what EVP can offer - we'd love to
					hear from you.
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.3 }}
					className="mx-auto max-w-2xl pb-5 text-xl"
				>
					<p className="mb-5">Stay in the loop. Find us on:</p>
					<Socials className="mx-2 h-11 w-11 md:h-9 md:w-9" />
				</motion.div>
			</div>
		</section>
	);
}

function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>({ name: '', email: '', message: '' });
	const [status, setStatus] = useState<FormState>('idle');
	const formRef = useRef<HTMLDivElement>(null);

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
			<div
				ref={formRef}
				className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start"
			>
				{/* Left: image */}
				<motion.div {...slideIn('left')} className="flex w-full items-center md:w-1/2">
					<img
						src={contactImg}
						alt="Cathedral tower with Scottish flag"
						className="w-full max-w-120 rounded-lg object-cover shadow-2xl"
					/>
				</motion.div>

				{/* Right: form */}
				<motion.div
					{...slideIn('right', 0.2)}
					className="flex w-full flex-col items-center gap-6 text-center md:w-1/2 md:items-start md:text-left"
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
								className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
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
								placeholder="you@example.com"
								disabled={isSubmitting || isSuccess}
								className="bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
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
							className="bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
				</motion.div>
			</div>
		</section>
	);
}
