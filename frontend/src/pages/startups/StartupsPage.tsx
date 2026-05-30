import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { STARTUPS } from './startups.data';
import { assignSizes } from './startups.layout';
import { StartupBlock } from './StartupBlock';

const YOU_LINK = '/contact';

export function StartupsPage() {
	const startups = useMemo(() => assignSizes(STARTUPS), []);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 pt-100">
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				className="flex flex-col items-center gap-4 text-center"
			>
				<h1 className="text-5xl font-bold md:text-6xl">our start-ups</h1>
				<div className="text-foreground-muted mx-auto w-100 border" />
				<p className="text-foreground-muted max-w-xl text-lg md:text-xl">
					Meet the student-led ventures we've worked with, hover to learn more.
				</p>
			</motion.div>

			<div
				className="grid w-full gap-4"
				style={{
					gridTemplateColumns: 'repeat(3, 1fr)',
					gridAutoRows: '220px',
				}}
			>
				{startups.map((startup, i) => (
					<StartupBlock key={startup.id} startup={startup} index={i} />
				))}
			</div>

			{/* You? */}
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
	);
}
