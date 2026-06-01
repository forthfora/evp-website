import contactImg from '@assets/homepage/promo-tower.webp';
import { motion } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';

import { SectionDivider } from '@/shared/ui/common/SectionDivider';
import { PageHeader } from '@/shared/ui/common/PageHeader';

import scoutImg from '@assets/contact/promo-scout.webp';
import networkImg from '@assets/contact/promo-network.webp';

import offerImg1 from '@assets/contact/offer-1.webp';
import offerImg2 from '@assets/contact/offer-2.webp';
import offerImg3 from '@assets/contact/offer-3.webp';

const fadeDown = (delay = 0) => ({
	initial: { opacity: 0, y: -50 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true as const, margin: '-150px' },
	transition: { duration: 0.6, ease: 'easeOut' as const, delay },
});

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 50 },
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

			<section className="py-10 pt-40">
				<PageHeader title={'what we offer'} />

				<div className="glass-box my-10 w-full overflow-hidden py-25 md:py-40">
					<div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start">
						<motion.div
							{...slideIn('right', 0.2)}
							className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left"
						>
							<h2 className="text-4xl font-bold md:text-5xl">the scout programme</h2>
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
							<h2 className="text-4xl font-bold md:text-5xl">our network</h2>
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
			title: 'angel syndicates',
			body: (
				<p>
					We have close relationships with some of the oldest and most established angel syndicates
					in the world.
				</p>
			),
		},
		{
			img: offerImg2,
			title: 'exclusive programmes',
			body: (
				<p>
					We work with accelerators, government-funded programs, and others to provide student
					founders with opportunities to grow their businesses
				</p>
			),
		},
		{
			img: offerImg3,
			title: 'tech societies',
			body: (
				<p>
					We are a CompSoc Special Interest Group. Our members have access to everything the the
					largest computer science society in Scotland has to offer.
				</p>
			),
		},
	];

	return (
		<section className="w-full pt-25">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body }, i) => (
					<motion.div
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
						<p className="px-10 text-lg">{body}</p>
					</motion.div>
				))}
			</div>
		</section>
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

			<div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
				<motion.div {...fadeDown(0.1)}>
					<h1 className="text-5xl font-bold md:text-7xl">get in touch</h1>
					<SectionDivider width="w-75 md:w-100" my="my-3" />
				</motion.div>
				<motion.div {...fadeUp(0.1)}>
					<p className="max-w-xl text-lg md:text-xl">
						Whether you're a founder, investor or just curious about what EVP can offer - we'd love
						to hear from you.
					</p>
				</motion.div>
			</div>
		</section>
	);
}

function ContactFormSection() {
	const [fields, setFields] = useState<FormFields>({ name: '', email: '', message: '' });
	const [status, setStatus] = useState<FormState>('idle');
	const formRef = useRef<HTMLDivElement>(null);

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
