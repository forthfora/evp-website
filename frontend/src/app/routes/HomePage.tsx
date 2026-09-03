import { motion } from 'framer-motion';

import homepageBkg from '@/assets/homepage/homepage-bkg.webp';
import whatWeDoImg3 from '@/assets/homepage/promo-bar.webp';
import aboutUsImg from '@/assets/homepage/promo-chairs.webp';
import whatWeDoImg2 from '@/assets/homepage/promo-conf.webp';
import whatWeDoImg1 from '@/assets/homepage/promo-present.webp';
import contactImg from '@/assets/homepage/promo-tower.webp';
import { ContactSection, EventsBanner, PageMeta, PromoCard, SectionDivider } from '@/components/ui';
import { TextLink } from '@/components/ui/interactive/TextLink';
import { MediaTextSection } from '@/components/ui/section/MediaTextSection';
import { HomePageHero } from '@/features/homepage';
import { fadeUp } from '@/utils/motion';

export function HomePage() {
	return (
		<div className="flex w-full flex-col">
			<PageMeta title="Edinburgh VenturePoint" description="Where students build and invest." />

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
					heading="Interested?"
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
			<MediaTextSection
				image={aboutUsImg}
				imageAlt="A group photo with several members of EVP's committee"
			>
				<h2 id="who-we-are" className="text-4xl font-bold md:text-5xl">
					Who we are
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
				<TextLink to="about" className="mt-5 text-2xl md:text-xl">
					Learn More...
				</TextLink>
			</MediaTextSection>
		</section>
	);
}

function WhatWeDoSection() {
	const cards: { img: string; title: string; body: string; to: string }[] = [
		{
			img: whatWeDoImg1,
			title: 'Discover our start-ups',
			body: "Read about the student-led start-ups that we've worked with.",
			to: 'startups',
		},
		{
			img: whatWeDoImg2,
			title: 'Our investing programme',
			body: 'We grant students real exposure to early-stage investing.',
			to: 'contact#scout-programme',
		},
		{
			img: whatWeDoImg3,
			title: 'Network & partnerships',
			body: 'From angel syndicates to celebrated founders.',
			to: 'contact#network',
		},
	];

	return (
		<section className="w-full py-25">
			<motion.div {...fadeUp()}>
				<h2 id="what-we-do" className="text-center text-4xl font-bold md:text-5xl">
					What we do
				</h2>
				<SectionDivider className="mx-auto" width="w-75 md:w-100" my="my-2" />
			</motion.div>

			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body, to }, i) => (
					<PromoCard key={to} image={img} title={title} body={<p>{body}</p>} to={to} index={i} />
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
					data-nav-label="Our events"
					className="pt-10 pb-5 text-center text-5xl font-bold"
				>
					Join us at our next event!
				</h1>
				<SectionDivider />
				<p className="mx-auto max-w-2xl py-5 text-center text-lg md:text-2xl">
					From exclusive investor meet-ups to the most promising start-ups, we've got something to
					offer everyone.
				</p>
				<TextLink to="events" className="mx-auto pt-5 text-3xl md:text-2xl">
					See events...
				</TextLink>
			</motion.div>
		</section>
	);
}
