import { motion } from 'framer-motion';

import aboutBkg from '@/assets/about/about-bkg.webp';
import ideaImg from '@/assets/homepage/events-banner/event-2.webp';
import contactImg from '@/assets/homepage/events-banner/event-2.webp';
import {
	ContactSection,
	HeroSection,
	PageMeta,
	SectionDivider,
	UnderlinedTitle,
} from '@/components/ui';
import { COMMITTEE_DATA, MemberYearSection } from '@/features/about';

export default function AboutPage() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			<PageMeta title="About Us" description="Meet the team behind EVP, and find out what we do." />

			<HeroSection image={aboutBkg} imageAlt="About Background">
				<UnderlinedTitle id="who-we-are" title="Who we are" />
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
					className="mx-auto max-w-4xl py-5 text-center text-2xl font-bold italic md:text-3xl"
				>
					Built by students, for students.
				</motion.p>
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
					className="mx-auto max-w-2xl pb-5 text-center text-lg md:text-xl"
				>
					We bridge the gap between visionary student founders and forward-thinking investors.
				</motion.p>
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.35 }}
					className="mx-auto max-w-lg text-center text-lg font-bold md:text-xl"
				>
					If you're building something amazing, we want to hear about it.
				</motion.p>
			</HeroSection>

			<div className="glass-box mx-auto mt-15 w-full px-4 py-16 md:mt-40 md:px-8 md:py-32">
				<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row md:gap-15 lg:items-start">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.6 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
						className="flex-1 text-center md:text-left"
					>
						<h2
							id="idea"
							data-nav-label="Got an idea?"
							className="mb-4 text-3xl leading-tight font-bold italic md:text-5xl md:leading-16"
						>
							Have a great idea, but lack the funding?
						</h2>
						<SectionDivider
							my="my-6 md:my-10"
							width="w-3/4 max-w-[200px] mx-auto md:mx-0 md:w-100"
						/>
						<p className="text-base md:text-lg">
							EVP is committed to connecting the very best talent from across Scotland to top
							investors who are passionate and ready to hear about what you do.
						</p>
						<p className="pt-5 text-lg font-bold italic md:text-xl">
							We bring the capital, you bring the innovation.
						</p>
					</motion.div>
					<motion.img
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.6 }}
						transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
						src={ideaImg}
						alt="A start-up presenting at one of EVP's events"
						className="h-70 w-full max-w-sm rounded-lg object-cover shadow-2xl md:max-w-md"
					/>
				</div>
			</div>

			<div className="mx-auto mt-10 w-full max-w-6xl px-4 md:px-8">
				<UnderlinedTitle
					id="meet-the-team"
					title="Meet the team"
					className="py-10 pt-20 md:py-15 md:pt-50"
					size="text-4xl md:text-6xl"
					level={2}
				/>
			</div>

			{COMMITTEE_DATA.map((yearData) => (
				<MemberYearSection key={yearData.year} year={yearData.year} members={yearData.members} />
			))}

			<ContactSection
				image={contactImg}
				imageAlt="Event photo"
				heading="Want to get involved?"
				body={[
					'Our team is constantly bringing on new members.',
					<strong key="cta">Get in touch to see how you can be part of EVP.</strong>,
				]}
			/>
		</div>
	);
}
