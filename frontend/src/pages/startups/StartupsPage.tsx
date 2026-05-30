import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/shared/ui/common/PageHeader';

import { StartupBlock } from './StartupBlock';
import { STARTUPS } from './startups.data';
import { assignSizes } from './startups.layout';

const YOU_LINK = '/contact';

export function StartupsPage() {
	const startups = useMemo(() => assignSizes(STARTUPS), []);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 pt-100">
			<PageHeader title="our start-ups" size="text-5xl md:text-6xl" />

			<p className="text-foreground-muted mx-auto -mt-8 max-w-xl text-center text-lg md:text-xl">
				Meet the student-led ventures we've worked with, hover to learn more.
			</p>

			<div
				className="grid w-full gap-4"
				style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '220px' }}
			>
				{startups.map((startup, i) => (
					<StartupBlock key={startup.id} startup={startup} index={i} />
				))}
			</div>

			{/* "You?" CTA */}
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
