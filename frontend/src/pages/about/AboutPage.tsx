import '@/shared/styles/button-underline.css';

import aboutBkg from '@assets/about/about-bkg.webp';
import ideaImg from '@assets/homepage/events-banner/event-2.webp';
import contactImg from '@assets/homepage/events-banner/event-2.webp';
import { motion } from 'framer-motion';
import { Globe, Mail, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';

import { ContactSection } from '@/shared/ui/common/ContactSection';
import { PageHeader } from '@/shared/ui/common/PageHeader';
import { RadialGlowOverlay } from '@/shared/ui/common/RadialGlowOverlay';
import { SectionDivider } from '@/shared/ui/common/SectionDivider';

import { COMMITTEE_DATA, type Member, type YearData } from './about.data';

// Framer Motion variants shared by all member-card grids
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
		<div className="flex w-full flex-col">
			{/* Hero */}
			<div className="relative flex min-h-250 w-full items-center justify-center">
				<img
					src={aboutBkg}
					alt="About Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
				<RadialGlowOverlay />

				<div className="relative z-10 mx-auto w-full max-w-6xl px-4">
					<PageHeader title="who we are" />

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
						className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
					>
						built by students, for students.
					</motion.p>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
						className="mx-auto max-w-2xl pb-5 text-center text-xl"
					>
						We bridge the gap between visionary student founders and forward-thinking investors.
					</motion.p>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.35 }}
						className="mx-auto max-w-lg text-center text-xl font-bold"
					>
						If you're building something amazing, we want to hear about it.
					</motion.p>
				</div>
			</div>

			{/* Idea / pitch block */}
			<div className="bg-background-muted mx-auto mt-60 w-full py-30">
				<div className="mx-auto flex w-full max-w-5xl flex-row gap-15">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					>
						<h3 className="mb-4 text-5xl leading-16 font-bold italic">
							Have a great idea, but lack the funding?
						</h3>
						<SectionDivider my="my-10" width="w-100" />
						<p className="text-lg">
							EVP is committed to connecting the very best talent from across Scotland to top
							investors who are passionate and ready to hear about what you do.
						</p>
						<p className="pt-5 text-xl font-bold italic">
							We bring the capital, you bring the innovation.
						</p>
					</motion.div>

					<motion.img
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
						src={ideaImg}
						alt="Students collaborating at an event"
						className="w-full max-w-md rounded-lg object-cover shadow-2xl"
					/>
				</div>
			</div>

			{/* Team header */}
			<div className="mx-auto w-full max-w-6xl">
				<PageHeader title="meet the team" className="py-15 pt-50" size="text-6xl" />
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
		<div className="bg-background-muted mx-auto mb-50 w-full py-30">
			<div className="mx-auto w-full max-w-6xl">
				<h3 className="text-foreground mb-6 text-4xl font-bold">{yearData.year}</h3>
				<SectionDivider my="my-4 mb-10" width="w-150" />

				<motion.div
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
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
			className="bg-background hover:border-accent border-background flex flex-col rounded-xl border-2 p-4 transition-colors"
		>
			{/* Avatar */}
			<div className="mt-2 mb-6 flex justify-center">
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
			<div className="mt-auto">
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
							<FaLinkedin size={20} />
						</a>
					)}
					{member.email && (
						<a
							href={`mailto:${member.email}`}
							className="button-underline hover:text-accent transition-colors duration-200"
							aria-label="Email"
						>
							<Mail size={20} />
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
