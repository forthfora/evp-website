import startupsBkg from '@assets/startups/startups-bkg.webp';
import { InteractiveContactButton, PageMeta, RadialGlowOverlay, UnderlinedTitle } from '@common';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { generateColumns, STARTUPS, PartnersSection, StartupBlock } from '@/features/startups';

export function StartupsPage() {
	const columns = useMemo(() => generateColumns(STARTUPS), []);

	return (
		<div className="w-full overflow-hidden">
			<PageMeta
				title="Start-ups"
				description="Learn about the partners & start-ups EVP has worked with."
			/>
			{/* Hero */}
			<div className="relative flex min-h-180 w-full items-center justify-center">
				<img
					src={startupsBkg}
					alt="About Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
				<RadialGlowOverlay />

				<div className="relative z-10 mx-auto mt-40 w-full max-w-6xl px-4">
					<UnderlinedTitle id="our-start-ups" title="Our start-ups" />

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
						className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
					>
						Born in Scotland, built for the world.
					</motion.p>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
						className="mx-auto max-w-2xl pb-5 text-center text-xl"
					>
						We identify the most promising student-led start-ups across Scotland and provide them
						with access to the resources and connections they need to thrive.
					</motion.p>
				</div>
			</div>

			<PartnersSection />

			<div className="mx-auto mt-10 flex w-full flex-col gap-12 py-40">
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.8 }}
					transition={{ duration: 0.5, ease: 'easeIn' }}
					className="max-w-3xl text-center text-5xl md:mx-auto"
				>
					<UnderlinedTitle
						id="meet-the-startups"
						navLabel="Meet the startups"
						title="Meet the student-led ventures we've worked with."
						size="text-5xl"
						level={2}
					/>
				</motion.div>

				{/* 3-Column Ragged Edge Layout */}
				<div className="glass-box mx-auto w-full">
					<div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 py-20 lg:grid-cols-3">
						{/* Left Column - Aligns inward (right) */}
						<div className="flex flex-col items-center gap-6 lg:items-end lg:pt-16">
							{columns.left.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>

						{/* Center Column - Acts as the anchor */}
						<div className="flex flex-col items-center gap-6">
							{columns.center.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>

						{/* Right Column - Aligns inward (left) */}
						<div className="flex flex-col items-center gap-6 lg:items-start lg:pt-32">
							{columns.right.map((startup) => (
								<StartupBlock key={startup.id} startup={startup} />
							))}
						</div>
					</div>
				</div>

				<div className="relative mt-30 flex w-full items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-40px' }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
						className="border-accent group relative z-10 mx-auto flex h-150 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-4 text-center transition-all duration-300"
					>
						{/* Background Blobs */}
						<div className="glass-box pointer-events-none absolute inset-0 overflow-hidden">
							{/* Blob 1 */}
							<div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl transition-colors duration-500 group-hover:bg-purple-500/20" />
							{/* Blob 2 */}
							<div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl transition-colors duration-500 group-hover:bg-blue-500/20" />
						</div>

						<div className="z-10 flex flex-col items-center justify-center gap-4">
							<UnderlinedTitle
								id="you"
								navLabel="Reach out"
								title={'You?'}
								size="text-7xl"
								animated={false}
								level={2}
							/>
							<b className="text-foreground text-2xl transition-colors duration-300">
								We'd love to see you up here.
							</b>

							<p className="text-foreground-muted px-10 pb-10 text-xl transition-colors duration-300">
								Share your vision with us, and we'll help you realise it.
							</p>

							<InteractiveContactButton />
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
