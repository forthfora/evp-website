import { Mail, Globe, User } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';
import { motion } from 'framer-motion';

import InteractiveContactButton from '../../shared/ui/common/InteractiveContactButton';

import '../../shared/styles/button-underline.css';

import aboutBkg from '../../shared/assets/about/about-bkg.webp';
import ideaImg from '../../shared/assets/homepage/events-banner/event-2.webp';
import contactImg from '../../shared/assets/homepage/events-banner/event-2.webp';

// 2026/2027
import teohImg from '../../shared/assets/about/pictures/teoh.webp';
import roryImg from '../../shared/assets/about/pictures/rory.webp';
import georgeImg from '../../shared/assets/about/pictures/george.webp';
import pahalImg from '../../shared/assets/about/pictures/pahal.webp';
import laureImg from '../../shared/assets/about/pictures/laure.webp';
import matisseImg from '../../shared/assets/about/pictures/matisse.webp';
import xavierImg from '../../shared/assets/about/pictures/xavier.webp';

// 2025/2026
import zachariasImg from '../../shared/assets/about/pictures/zacharias.webp';
import guillaumeImg from '../../shared/assets/about/pictures/guillaume.webp';
import christopherImg from '../../shared/assets/about/pictures/christopher.webp';
import freddieImg from '../../shared/assets/about/pictures/freddie.webp';
import arielImg from '../../shared/assets/about/pictures/ariel.webp';
import tobiImg from '../../shared/assets/about/pictures/tobi.webp';

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
				image: teohImg,
				linkedin: 'https://www.linkedin.com/in/teoh-zi-yang/',
			},
			{
				role: 'Head Venture Scout',
				name: 'Rory Condict',
				image: roryImg,
				linkedin: 'https://www.linkedin.com/in/rory-condict/',
				email: 's2787162@ed.ac.uk',
			},
			{
				role: 'Head of Relations & Treasurer',
				name: 'George Kelsey',
				image: georgeImg,
				linkedin: 'https://www.linkedin.com/in/george-kelsey-77012b28b/',
			},
			{
				role: 'Head of Operations',
				name: 'Pahal Sethia',
				image: pahalImg,
				linkedin: 'https://www.linkedin.com/in/pahal-sethia/',
			},
			{
				role: 'Head of Marketing',
				name: 'Laure Dehem',
				image: laureImg,
				linkedin: 'https://www.linkedin.com/in/laure-dehem-33ab2a1b9',
			},
			{
				role: 'Fund Manager',
				name: 'Xavier Martorell',
				image: xavierImg,
				linkedin: 'https://www.linkedin.com/in/xavier-martorell',
			},
			{
				role: 'Fund Manager',
				name: 'Matisse Afnan',
				image: matisseImg,
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
				image: zachariasImg,
				linkedin: 'https://www.linkedin.com/in/zacharias-onyejiaka-405940307/',
			},
			{
				role: 'Co-founder',
				name: 'Guillaume Verleyen',
				image: guillaumeImg,
				linkedin: 'https://www.linkedin.com/in/guillaume-verleyen-23158328a/',
			},
			{
				role: 'Co-founder',
				name: 'Christopher Wong',
				image: christopherImg,
				linkedin: 'https://www.linkedin.com/in/christopherwonghzq/',
			},
			{
				role: 'Head Venture Scout',
				name: 'Freddie Springett',
				image: freddieImg,
				linkedin: 'https://www.linkedin.com/in/freddiespringett/',
			},
			{
				role: 'Head of Operations',
				name: 'Ariel Rantung',
				image: arielImg,
				linkedin: 'https://www.linkedin.com/in/ariel-rantung-934561334/',
			},
			{
				role: 'Venture Scout',
				name: 'George Kelsey',
				image: georgeImg,
				linkedin: 'https://www.linkedin.com/in/george-kelsey-77012b28b/',
			},
			{
				role: 'Venture Scout',
				name: 'Pahal Sethia',
				image: pahalImg,
				linkedin: 'https://www.linkedin.com/in/pahal-sethia/',
			},
			{
				role: 'Venture Scout',
				name: 'Rory Condict',
				image: roryImg,
				linkedin: 'https://www.linkedin.com/in/rory-condict/',
			},
			{
				role: 'Venture Scout',
				name: 'Tobi Fatona',
				image: tobiImg,
				linkedin: 'https://www.linkedin.com/in/tobi-fatona/',
			},
		],
	},
];

export function AboutPage() {
	return (
		<div className="flex w-full flex-col">
			<div className="relative flex min-h-250 w-full items-center justify-center">
				{/* Background Image */}
				<img
					src={aboutBkg}
					alt="About Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>

				{/* Blur Overlay */}
				<div className="bg-background/40 absolute inset-0" />

				{/* Soft background glow */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
					<div
						className="bg-background h-150 w-full md:h-200"
						style={{
							maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 70%)',
							WebkitMaskImage:
								'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
						}}
					/>
				</div>

				{/* Foreground Content - Automatically centered now */}
				<div className="relative z-10 mx-auto w-full max-w-6xl px-4">
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
						className="flex flex-col items-center"
					>
						<h1 className="text-5xl font-bold">who we are</h1>
						<div className="text-foreground-muted my-4 w-100 border text-center" />
					</motion.div>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
						className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
					>
						Built by students, for students.
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
						<div className="text-foreground-muted my-10 w-100 border text-center" />
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

			<div className="mx-auto w-full max-w-6xl">
				{/* Team Section Header */}
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn' }}
				>
					<div className="flex flex-col items-center py-15 pt-50">
						<h1 className="text-center text-6xl font-bold">meet the team</h1>
						<div className="text-foreground-muted my-4 w-100 border text-center" />
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
		<section className="relative w-full pb-30">
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
