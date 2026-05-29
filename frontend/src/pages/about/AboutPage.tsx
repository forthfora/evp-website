import { Mail, Globe, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';
import { motion } from 'framer-motion';

import InteractiveContactButton from '../../shared/ui/InteractiveContactButton';

import '../../shared/styles/button-underline.css';

import contactImg from '../../shared/assets/homepage/events-banner/event-2.webp';

type Member = {
	role: string;
	name: string;
	image?: string;
	linkedin?: string;
	email?: string;
	website?: string;
};

type YearData = {
	year: string;
	members: Member[];
};

const committeeData: YearData[] = [
	{
		year: '2026/2027 (current)',
		members: [
			{
				role: 'President',
				name: 'Teoh Yi Zang',
				linkedin: 'https://www.linkedin.com/in/teoh-zi-yang/',
			},
			{
				role: 'Head Venture Scout',
				name: 'Rory Condict',
				linkedin: 'https://www.linkedin.com/in/rory-condict/',
				email: 's2787162@ed.ac.uk',
			},
			{
				role: 'Head of Relations & Treasurer',
				name: 'George Kelsey',
				linkedin: 'https://www.linkedin.com/in/george-kelsey-77012b28b/',
			},
			{
				role: 'Head of Operations',
				name: 'Pahal Sethia',
				linkedin: 'https://www.linkedin.com/in/pahal-sethia/',
			},
			{
				role: 'Head of Marketing',
				name: 'Laure Dehem',
				linkedin: 'https://www.linkedin.com/in/laure-dehem-33ab2a1b9',
			},
			{
				role: 'Fund Manager',
				name: 'Xavier Martorell',
				linkedin: 'https://www.linkedin.com/in/xavier-martorell',
			},
			{
				role: 'Fund Manager',
				name: 'Matisse Afnan',
				linkedin: 'https://www.linkedin.com/in/matisseafnan/',
			},
		],
	},
	{
		year: '2025/2026',
		members: [
			{
				role: 'Co-founder, President',
				name: 'Zacharias Onyejiaka',
				linkedin: 'https://www.linkedin.com/in/zacharias-onyejiaka-405940307/',
			},
			{
				role: 'Co-founder',
				name: 'Guillaume Verleyen',
				linkedin: 'https://www.linkedin.com/in/guillaume-verleyen-23158328a/',
			},
			{
				role: 'Co-founder',
				name: 'Christopher Wong',
				linkedin: 'https://www.linkedin.com/in/christopherwonghzq/',
			},
			{
				role: 'Head Venture Scout',
				name: 'Freddie Springett',
				linkedin: 'https://www.linkedin.com/in/freddiespringett/',
			},
			{
				role: 'Head of Operations',
				name: 'Ariel Rantung',
				linkedin: 'https://www.linkedin.com/in/ariel-rantung-934561334/',
			},
			{
				role: 'Venture Scout',
				name: 'George Kelsey',
				linkedin: 'https://www.linkedin.com/in/george-kelsey-77012b28b/',
			},
			{
				role: 'Venture Scout',
				name: 'Pahal Sethia',
				linkedin: 'https://www.linkedin.com/in/pahal-sethia/',
			},
			{
				role: 'Venture Scout',
				name: 'Rory Condict',
				linkedin: 'https://www.linkedin.com/in/rory-condict/',
			},
			{
				role: 'Venture Scout',
				name: 'Tobi Fatona',
				linkedin: 'https://www.linkedin.com/in/tobi-fatona/',
			},
		],
	},
];

export function AboutPage() {
	return (
		<div className="flex w-full flex-col py-90">
			<div className="mx-auto w-full max-w-6xl">
				{/* Header Text */}
				<div className="flex flex-col items-center">
					<h1 className="text-5xl font-bold">about us</h1>
					<div className="text-foreground-muted my-4 w-100 border text-center" />
				</div>

				{/* Paragraphs */}
				<p className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold">
					As founders, business owners, and students, we are changing the way students approach
					their careers.
				</p>

				<p className="text-muted-foreground text-foreground-muted py-5 text-center text-xl">
					We provide opportunities to current and prospective student founders and investors.
				</p>

				{/* Team Section Header */}
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn' }}
				>
					<div className="flex flex-col items-center py-15 pt-150">
						<h1 className="text-center text-6xl font-bold">meet the team</h1>
						<div className="text-foreground-muted my-4 w-50 border text-center" />
					</div>
				</motion.div>
			</div>

			{/* Dynamic Year Sections */}
			{committeeData.map((yearData) => generateMemberCards(yearData))}

			{contactSection()}
		</div>
	);
}

function generateMemberCards(yearData: YearData): import('react/jsx-runtime').JSX.Element {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: {
			opacity: 0,
			x: 50, // Start 50px to the right
		},
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				type: 'spring' as const,
				stiffness: 100,
				damping: 15,
			},
		},
	};

	return (
		<div key={yearData.year} className="bg-background-muted mx-auto mb-50 w-full py-30">
			<div className="mx-auto w-full max-w-6xl">
				<h3 className="text-foreground mb-6 text-4xl font-bold">{yearData.year}</h3>
				<div className="text-foreground-muted my-4 mb-10 w-150 border text-center" />

				{/* Member Cards Grid wrapped in a motion.div for context orchestration */}
				<motion.div
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }} // Triggers when the top of the grid enters the screen
					variants={containerVariants}
				>
					{yearData.members.map((member, index) => (
						<motion.div
							key={index}
							variants={cardVariants}
							className="bg-background hover:border-accent border-background flex flex-col rounded-xl border-2 p-4 transition-colors"
						>
							{/* Profile Image Placeholder */}
							<div className="mt-2 mb-6 flex justify-center">
								{member.image ? (
									<img
										src={member.image}
										alt={`${member.name}'s profile`}
										className="border-background-muted h-32 w-32 rounded-full border-2 object-cover"
									/>
								) : (
									/* Clean Lucide head-and-shoulders fallback */
									<div className="text-foreground-muted bg-background-muted flex h-32 w-32 items-center justify-center rounded-full">
										<User size={64} strokeWidth={1.5} className="opacity-60" />
									</div>
								)}
							</div>

							{/* Member Info */}
							<div className="mt-auto">
								<p className="text-foreground-muted mb-1 text-xs">{member.role}</p>
								<p className="text-foreground mb-3 text-base font-semibold">{member.name}</p>

								{/* Icons */}
								<div className="text-foreground-muted flex gap-3">
									{member.linkedin && (
										<a
											href={member.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="button-underline hover:text-accent transition-colors duration-200"
											aria-label="Linkedin"
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
					))}
				</motion.div>
			</div>
		</div>
	);
}

function contactSection() {
	return (
		<section className="relative w-full pb-5">
			<div className="relative w-full">
				<img
					src={contactImg}
					alt="The scottish flag on a cathedral tower"
					className="mx-auto h-150 w-full object-cover object-[50%_5%] shadow-2xl"
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
						<h1 className="pt-10 pb-5 text-5xl font-bold">want to get involved?</h1>

						<p className="mx-auto max-w-2xl py-5 text-xl">
							Our team is constantly bringing on new members.
						</p>

						<p className="mx-auto max-w-2xl text-xl">
							Get in touch to to see how you can be part of EVP.
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
