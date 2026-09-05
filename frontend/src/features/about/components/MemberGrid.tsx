import { motion } from 'framer-motion';
import { Globe, Mail, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';

import type { Member } from '../types';

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

export function MemberCard({ member }: { member: Member }) {
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

export function MemberYearSection({ year, members }: { year: string; members: Member[] }) {
	return (
		<div className="glass-box mx-auto mb-20 w-full px-4 py-16 md:mb-50 md:px-8 md:py-30">
			<div className="mx-auto w-full max-w-6xl">
				<h3 className="text-foreground mb-4 text-center text-3xl font-bold md:mb-6 md:text-left md:text-4xl">
					{year}
				</h3>
				<div className="bg-foreground/20 mx-auto my-4 mb-8 h-px w-2/3 max-w-[200px] md:mx-0 md:mb-10 md:w-150 md:max-w-none" />

				<motion.div
					className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					variants={containerVariants}
				>
					{members.map((member, index) => (
						<MemberCard key={index} member={member} />
					))}
				</motion.div>
			</div>
		</div>
	);
}
