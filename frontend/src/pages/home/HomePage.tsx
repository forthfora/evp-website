import { HomePageHero } from './HomePageHero';

import homepageBkg from '../../shared/assets/homepage-bkg.jpg';
import aboutUsImg from '../../shared/assets/promo/promo-2.jpg';
import { Link } from 'react-router-dom';

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
			<div className="mx-auto w-full max-w-6xl">{aboutUsSection()}</div>
		</div>
	);
}

function aboutUsSection() {
	return (
		<section className="flex gap-10 py-40">
			{/* Left Column: Image Section */}
			<div className="w-300">
				<img src={aboutUsImg} alt="Students collaborating at an event" className="shadow-2xl" />
			</div>

			{/* Right Column: Content Section */}
			<div className="flex flex-col gap-5">
				<h2 className="text-5xl font-bold">about us</h2>
				<div className="text-foreground-muted my-4 w-100 border" />

				<p className="text-xl">
					Edinburgh VenturePoint is a student-led community for ambitious founders and future
					investors.
				</p>

				<p>
					We exist to identify, support, and showcase the most promising student-led start-ups in
					Scotland.
				</p>

				<p>
					Through curated investment programs and founder support, we sit at the intersection of
					entrepreneurship and venture capital.
				</p>

				<Link
					to="about"
					className="text-accent button-underline mt-5 mr-auto text-xl font-bold transition-opacity"
				>
					Learn More...
				</Link>
			</div>
		</section>
	);
}
