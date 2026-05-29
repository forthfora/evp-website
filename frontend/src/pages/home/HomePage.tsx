import { HomePageHero } from './HomePageHero';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EventsBanner } from '../events/EventsBanner';

import InteractiveContactButton from '../../shared/ui/InteractiveContactButton';

import homepageBkg from '../../shared/assets/homepage/homepage-bkg.webp';
import aboutUsImg from '../../shared/assets/homepage/promo-chairs.webp';

import whatWeDoImg1 from '../../shared/assets/homepage/promo-present.webp';
import whatWeDoImg2 from '../../shared/assets/homepage/promo-conf.webp';
import whatWeDoImg3 from '../../shared/assets/homepage/promo-bar.webp';

import contactImg from '../../shared/assets/homepage/promo-tower.webp';

export function HomePage() {
	return (
		<div className="flex w-full flex-col">
			{/* Hero */}
			<HomePageHero />

			<div className="relative h-screen w-full shrink-0">
				<img
					src={homepageBkg}
					alt="Homepage Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
			</div>

			{/* Content */}
			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				{aboutUsSection()}
				{whatWeDoSection()}
				{eventsSection()}
				{contactSection()}
			</div>
		</div>
	);
}

function aboutUsSection() {
	return (
		<section className="bg-background-muted w-full overflow-hidden py-25 md:py-50">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start">
				{/* Left Column: Image Section (Slides from Left) */}
				<motion.div
					initial={{ opacity: 0, x: -60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className="flex w-full justify-center md:w-1/2"
				>
					<img
						src={aboutUsImg}
						alt="Students collaborating at an event"
						className="w-full max-w-md rounded-lg object-cover shadow-2xl"
					/>
				</motion.div>

				{/* Right Column: Content Section (Slides from Right) */}
				<motion.div
					initial={{ opacity: 0, x: 60 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-150px' }}
					transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} // Added a 0.2s delay for a cleaner rhythm
					className="flex w-full flex-col items-center gap-5 text-center md:w-1/2 md:items-start md:text-left"
				>
					<h2 className="text-4xl font-bold md:text-5xl">who we are</h2>

					<div className="text-foreground-muted my-2 w-75 border md:w-100" />

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
						className="text-accent button-underline mt-5 text-lg font-bold transition-opacity md:text-xl"
						viewTransition
					>
						Learn More...
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

function whatWeDoSection() {
	return (
		<section className="w-full py-25">
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-150px' }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
			>
				<h2 className="text-center text-4xl font-bold md:text-5xl">what we do</h2>
				<div className="text-foreground-muted mx-auto my-2 w-75 border md:w-100" />
			</motion.div>

			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-250px' }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-15 text-center"
				>
					<img
						src={whatWeDoImg1}
						alt="Students collaborating at an event"
						className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
					/>
					<h3 className="text-3xl font-bold">discover our start-ups</h3>
					<p className="px-10 text-lg">
						Read about the student-led start-ups that we've worked with.
					</p>
					<Link
						to="startups"
						className="text-accent button-underline mx-auto text-lg font-bold transition-opacity md:text-xl"
						viewTransition
					>
						Learn More...
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-250px' }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-15 text-center"
				>
					<img
						src={whatWeDoImg2}
						alt="Students collaborating at an event"
						className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
					/>
					<h3 className="text-3xl font-bold">our investing program</h3>
					<p className="px-10 text-lg">We grant students real exposure to early-stage investing.</p>
					<Link
						to="TODO"
						className="text-accent button-underline mx-auto text-lg font-bold transition-opacity md:text-xl"
						viewTransition
					>
						Learn More...
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-250px' }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-15 text-center"
				>
					<img
						src={whatWeDoImg3}
						alt="Students collaborating at an event"
						className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
					/>
					<h3 className="text-3xl font-bold">network & partnerships</h3>
					<p className="px-10 text-lg">From angel syndicates to celebrated founders.</p>
					<Link
						to="partners"
						className="text-accent button-underline mx-auto text-lg font-bold transition-opacity md:text-xl"
						viewTransition
					>
						Learn More...
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

function eventsSection() {
	return (
		<section className="bg-background-muted w-full overflow-hidden py-25 md:py-35">
			<motion.div
				initial={{ opacity: 0, x: 25 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true, margin: '-150px' }}
				transition={{ duration: 1.0, ease: 'easeOut' }}
			>
				<EventsBanner />
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: -50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-200px' }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="flex flex-col items-center"
			>
				<h1 className="pt-10 pb-5 text-center text-5xl font-bold">join us at our next event!</h1>
				<div className="text-foreground-muted my-4 w-100 border text-center" />

				<p className="mx-auto max-w-2xl py-5 text-center text-2xl">
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

function contactSection() {
	return (
		<section className="relative w-full pt-25 pb-5">
			<div className="relative w-full">
				<img
					src={contactImg}
					alt="The scottish flag on a cathedral tower"
					className="mx-auto h-250 w-full object-cover object-[50%_5%] shadow-2xl"
				/>

				{/* Soft background glow*/}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden pb-50">
					<div
						className="bg-background h-150 w-full max-w-3xl md:h-150 md:max-w-7xl"
						style={{
							maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)',
							WebkitMaskImage:
								'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
						}}
					/>
				</div>

				<div className="bg-background/40 absolute inset-0 z-10" />

				<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pb-20">
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-150px' }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
						className="text-center"
					>
						<h1 className="pt-10 pb-5 text-7xl font-bold">interested?</h1>

						<p className="mx-auto max-w-2xl py-5 text-2xl">
							Whether you're a start-up looking for funding or a student looking for a role, reach
							out and find a place at EVP.
						</p>
					</motion.div>

					<div className="text-foreground-muted my-10 mb-20 w-100 border" />

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-150px' }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
					>
						<InteractiveContactButton />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
