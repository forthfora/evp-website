import { HomePageHero } from './HomePageHero';
import homepageBkg from '../../shared/assets/homepage-bkg.jpg';
import aboutUsImg from '../../shared/assets/promo/promo-2.jpg';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
				<div className="bg-background/30 absolute inset-0 backdrop-blur-[2px]" />
			</div>

			{/* Content */}
			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				{aboutUsSection()}
				{eventsSection()}
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
					viewport={{ once: true, margin: '-100px' }}
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

function eventsSection() {
	return (
		<section className="w-full py-25">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				<motion.div
					initial={{ opacity: 0, x: 100 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-60 text-center"
				>
					<img
						src={aboutUsImg}
						alt="Students collaborating at an event"
						className="mx-auto h-64 w-full max-w-md object-cover shadow-2xl"
					/>
					<p>1</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 100 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-60 text-center"
				>
					<img
						src={aboutUsImg}
						alt="Students collaborating at an event"
						className="mx-auto h-64 w-full max-w-md object-cover shadow-2xl"
					/>
					<p>2</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 100 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
					className="bg-background-muted flex w-full flex-col gap-10 pb-60 text-center"
				>
					<img
						src={aboutUsImg}
						alt="Students collaborating at an event"
						className="mx-auto h-64 w-full max-w-md object-cover shadow-2xl"
					/>
					<p>3</p>
				</motion.div>
			</div>
		</section>
	);
}
