import '@/shared/styles/button-underline.css';

import aboutBkg from '@assets/about/about-bkg.webp';
import ideaImg from '@assets/homepage/events-banner/event-2.webp';
import contactImg from '@assets/homepage/events-banner/event-2.webp';
import { motion } from 'framer-motion';
import { Globe, Mail, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';

import { ContactSection } from '@/shared/ui/common/contact/ContactSection';
import { PageHeader } from '@/shared/ui/common/PageHeader';
import { RadialGlowOverlay } from '@/shared/ui/common/RadialGlowOverlay';
import { SectionDivider } from '@/shared/ui/common/SectionDivider';

import { COMMITTEE_DATA, type Member, type YearData } from './about.data';

const containerVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
	hidden: { opacity: 0, x: 50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
	},
};

export function AboutPage() {
	return (
		<div className="flex w-full flex-col overflow-x-hidden">
			{/* Hero */}
			<div className="relative flex min-h-[50vh] w-full items-center justify-center py-40 md:min-h-180 md:py-0">
				<img
					src={aboutBkg}
					alt="About Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
				<RadialGlowOverlay />

				<div className="relative z-10 mx-auto mt-30 w-full max-w-6xl px-4 md:px-8">
					<PageHeader id="who-we-are" title="who we are" />

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
						className="mx-auto max-w-4xl py-5 text-center text-2xl font-bold italic md:text-3xl"
					>
						built by students, for students.
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
				</div>
			</div>

			{/* Idea / pitch block */}
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
							data-nav-label="got an idea?"
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

			{/* Team header */}
			<div className="mx-auto mt-10 w-full max-w-6xl px-4 md:px-8">
				<PageHeader
					id="meet-the-team"
					title="meet the team"
					className="py-10 pt-20 md:py-15 md:pt-50"
					size="text-4xl md:text-6xl"
				/>
			</div>

			{/* Member grids per year */}
			{COMMITTEE_DATA.map((yearData) => (
				<MemberYearSection key={yearData.year} yearData={yearData} />
			))}

			<ContactSection
				image={contactImg}
				imageAlt="Event photo"
				heading="want to get involved?"
				body={[
					'Our team is constantly bringing on new members.',
					<strong>Get in touch to see how you can be part of EVP.</strong>,
				]}
			/>
		</div>
	);
}

// Sub Components

function MemberYearSection({ yearData }: { yearData: YearData }) {
	return (
		<div className="glass-box mx-auto mb-20 w-full px-4 py-16 md:mb-50 md:px-8 md:py-30">
			<div className="mx-auto w-full max-w-6xl">
				<h3 className="text-foreground mb-4 text-center text-3xl font-bold md:mb-6 md:text-left md:text-4xl">
					{yearData.year}
				</h3>
				<SectionDivider
					my="my-4 mb-8 md:mb-10"
					width="w-2/3 max-w-[200px] mx-auto md:mx-0 md:max-w-none md:w-150"
				/>

				<motion.div
					className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					variants={containerVariants}
				>
					{yearData.members.map((member, index) => (
						<MemberCard key={index} member={member} />
					))}
				</motion.div>
			</div>
		</div>
	);
}

function MemberCard({ member }: { member: Member }) {
	return (
		<motion.div
			variants={cardVariants}
			className="bg-background hover:border-accent border-background flex flex-col items-center rounded-xl border-2 p-6 text-center transition-colors md:items-start md:p-4 md:text-left"
		>
			{/* Avatar */}
			<div className="mx-auto mt-2 mb-4 flex justify-center md:mb-6">
				{member.image ? (
					<img
						src={member.image}
						alt={`${member.name}'s profile`}
						className="border-background-muted h-32 w-32 rounded-full border-2 object-cover"
					/>
				) : (
					<div className="text-foreground-muted bg-background-muted flex h-32 w-32 items-center justify-center rounded-full">
						<User size={64} strokeWidth={1.5} className="opacity-60" />
					</div>
				)}
			</div>

			{/* Info */}
			<div className="mt-auto flex w-full flex-col items-center md:items-start">
				<p className="text-foreground-muted mb-1 text-xs">{member.role}</p>
				<p className="text-foreground mb-3 text-base font-semibold">{member.name}</p>

				<div className="text-foreground-muted flex gap-3">
					{member.linkedin && (
						<a
							href={member.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							className="button-underline hover:text-accent transition-colors duration-200"
							aria-label="LinkedIn"
						>
							<FaLinkedin className="h-8 w-8 md:h-5 md:w-5" />
						</a>
					)}
					{member.email && (
						<a
							href={`mailto:${member.email}`}
							className="button-underline hover:text-accent transition-colors duration-200"
							aria-label="Email"
						>
							<Mail className="h-8 w-8 md:h-5 md:w-5" />
						</a>
					)}
					{member.website && (
						<a
							href={member.website}
							target="_blank"
							rel="noopener noreferrer"
							className="button-underline hover:text-accent transition-colors duration-200"
							aria-label="Website"
						>
							<Globe size={20} />
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}
