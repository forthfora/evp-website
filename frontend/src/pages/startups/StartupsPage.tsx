import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/shared/ui/common/PageHeader';

import { StartupBlock } from './StartupBlock';
import { STARTUPS } from './startups.data';
import { assignSizes, computeContainerHeight } from './startups.layout';
import { RadialGlowOverlay } from '@/shared/ui/common/RadialGlowOverlay';

import startupsBkg from '@assets/startups/startups-bkg.webp';

const YOU_LINK = '/contact';

const COL_WIDTH = 'calc(50% - 10px)'; // two columns with 20px total gap between them

export function StartupsPage() {
	const startups = useMemo(() => assignSizes(STARTUPS), []);
	const containerHeight = useMemo(() => computeContainerHeight(startups), [startups]);

	return (
		<div className="w-full">
			{/* Hero */}
			<div className="relative flex min-h-250 w-full items-center justify-center">
				<img
					src={startupsBkg}
					alt="About Background"
					className="absolute inset-0 h-full w-full object-cover shadow-2xl"
				/>
				<div className="bg-background/40 absolute inset-0" />
				<RadialGlowOverlay />

				<div className="relative z-10 mx-auto w-full max-w-6xl px-4">
					<PageHeader title="our start-ups" />

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 1 }}
						transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
						className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold italic"
					>
						born in Scotland, built for the world.
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

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-40">
				<motion.p
					initial={{ opacity: 0, y: -50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeIn', delay: 0.25 }}
					className="mx-auto max-w-3xl text-center text-5xl"
				>
					<PageHeader title="meet the student-led ventures we've worked with." />
				</motion.p>

				{/* Two-column staggered masonry */}
				<div className="relative w-full" style={{ height: `${containerHeight}px` }}>
					{startups.map((startup, i) => (
						<StartupBlock key={startup.id} startup={startup} index={i} colWidth={COL_WIDTH} />
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="pt-50"
				>
					<Link
						to={YOU_LINK}
						viewTransition
						className="border-border/30 bg-background-muted group hover:border-border mx-auto flex h-100 w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border transition-all duration-300"
					>
						<h3 className="text-foreground-muted group-hover:text-foreground text-7xl font-bold transition-colors duration-300">
							you?
						</h3>
						<p className="text-foreground-muted group-hover:text-foreground text-lg transition-colors duration-300">
							We'd love to see you up here
						</p>
					</Link>
				</motion.div>
			</div>
		</div>
	);
}
