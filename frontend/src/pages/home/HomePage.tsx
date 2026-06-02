import '@/shared/styles/button-underline.css';

import homepageBkg from '@assets/homepage/homepage-bkg.webp';
import aboutUsImg from '@assets/homepage/promo-chairs.webp';
import whatWeDoImg1 from '@assets/homepage/promo-present.webp';
import whatWeDoImg2 from '@assets/homepage/promo-conf.webp';
import whatWeDoImg3 from '@assets/homepage/promo-bar.webp';
import contactImg from '@assets/homepage/promo-tower.webp';

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { ContactSection } from '@/shared/ui/common/contact/ContactSection';
import { EventsBanner } from '@/shared/ui/common/EventsBanner';
import { SectionDivider } from '@/shared/ui/common/SectionDivider';

import { HomePageHero } from './HomePageHero';

// Shared Motion Presets

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

// Page

export function HomePage() {
	return (
		<div className="flex w-full flex-col">
			<HomePageHero />

			{/* Full-bleed background image spacer */}
			<div className="relative h-screen w-full shrink-0">
				<img
					src={homepageBkg}
					alt="Homepage Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
			</div>

			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				<AboutUsSection />
				<WhatWeDoSection />
				<EventsSection />
				<ContactSection
					image={contactImg}
					imageAlt="The Scottish flag on a cathedral tower"
					heading="interested?"
					body={[
						"Whether you're a start-up looking for funding or a student looking for a role, reach out and find a place at EVP.",
					]}
					className="pt-25 pb-5"
				/>
			</div>
		</div>
	);
}

// Sections

function AboutUsSection() {
	return (
		<section className="glass-box w-full overflow-hidden py-25 md:py-50">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start">
				<motion.div {...slideIn('left')} className="flex w-full justify-center md:w-1/2">
					<img
						src={aboutUsImg}
						alt="A group photo with several members of EVP's committee"
						className="w-full max-w-md rounded-lg object-cover shadow-2xl"
					/>
				</motion.div>

				<motion.div
					{...slideIn('right', 0.2)}
					className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left"
				>
					<h2 id="who-we-are" className="text-4xl font-bold md:text-5xl">
						who we are
					</h2>
					<SectionDivider width="w-75 md:w-100" my="my-2" />
					<p className="text-lg md:text-xl">
						Edinburgh VenturePoint is a student-led community for ambitious founders and future
						investors.
					</p>
					<p>
						We exist to identify, support, and showcase the most promising student-led start-ups in
						Scotland.
					</p>
					<Link
						to="about"
						className="text-accent button-underline mt-5 text-2xl font-bold transition-opacity md:text-xl"
						viewTransition
					>
						Learn More...
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

function WhatWeDoSection() {
	const cards: { img: string; title: string; body: string; to: string }[] = [
		{
			img: whatWeDoImg1,
			title: 'discover our start-ups',
			body: "Read about the student-led start-ups that we've worked with.",
			to: 'startups',
		},
		{
			img: whatWeDoImg2,
			title: 'our investing programme',
			body: 'We grant students real exposure to early-stage investing.',
			to: 'contact#scout-programme',
		},
		{
			img: whatWeDoImg3,
			title: 'network & partnerships',
			body: 'From angel syndicates to celebrated founders.',
			to: 'contact#network',
		},
	];

	return (
		<section className="w-full py-25">
			<motion.div {...fadeUp()}>
				<h2 id="what-we-do" className="text-center text-4xl font-bold md:text-5xl">
					what we do
				</h2>
				<SectionDivider className="mx-auto" width="w-75 md:w-100" my="my-2" />
			</motion.div>

			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body, to }, i) => (
					<motion.div
						key={to}
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.6, ease: 'easeOut' as const, delay: i * 0.2 }}
						className="glass-box flex w-full flex-col gap-10 pb-15 text-center"
					>
						<img
							src={img}
							alt={title}
							className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
						/>
						<h3 className="px-15 text-4xl font-bold">{title}</h3>
						<p className="px-10 text-lg">{body}</p>
						<Link
							to={to}
							className="text-accent button-underline mx-auto text-2xl font-bold transition-opacity md:text-xl"
							viewTransition
						>
							Learn More...
						</Link>
					</motion.div>
				))}
			</div>
		</section>
	);
}

function EventsSection() {
	return (
		<section className="glass-box w-full overflow-hidden py-25 md:py-35">
			<motion.div
				initial={{ opacity: 0, x: 25 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true, margin: '-150px' }}
				transition={{ duration: 1.0, ease: 'easeOut' as const }}
			>
				<EventsBanner />
			</motion.div>

			<motion.div {...fadeUp()} className="flex flex-col items-center">
				<h1
					id="events"
					data-nav-label="our events"
					className="pt-10 pb-5 text-center text-5xl font-bold"
				>
					join us at our next event!
				</h1>
				<SectionDivider />
				<p className="mx-auto max-w-2xl py-5 text-center text-lg md:text-2xl">
					From exclusive investor meet-ups to the most promising start-ups, we've got something to
					offer everyone.
				</p>
				<Link
					to="events"
					className="text-accent button-underline mx-auto pt-5 text-3xl font-bold transition-opacity md:text-2xl"
					viewTransition
				>
					See events...
				</Link>
			</motion.div>
		</section>
	);
}
