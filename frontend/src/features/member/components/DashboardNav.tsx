import { motion } from 'framer-motion';

import type { DashboardPage } from '../types';
import { DashboardNavButton } from './DashboardNavButton';

interface DashboardNavProps {
	pages: DashboardPage[];
	activePageId: string;
}

export function DashboardNav({ pages, activePageId }: DashboardNavProps) {
	if (pages.length <= 1) return null;

	return (
		<nav aria-label="Dashboard sections" className="flex justify-center">
			<ul className="flex flex-wrap items-center justify-center gap-8 md:gap-15">
				{pages.map((page, i) => (
					<li key={page.id} className="flex items-center gap-8 md:gap-15">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 1 }}
							transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + 0.1 * i }}
						>
							<DashboardNavButton
								to={`/member#${page.id}`}
								label={page.label}
								isActive={page.id === activePageId}
							/>
						</motion.div>
						{i < pages.length - 1 && (
							<motion.span
								className="text-foreground-muted select-none"
								aria-hidden
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 1 }}
								transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 + 0.1 * i }}
							>
								|
							</motion.span>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}
