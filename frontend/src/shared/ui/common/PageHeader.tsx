import { motion } from 'framer-motion';
import { SectionDivider } from './SectionDivider';

interface PageHeaderProps {
	title: string;
	/** Extra Tailwind classes on the outer wrapper. */
	className?: string;
	/** Font-size class. Defaults to "text-5xl md:text-7xl". */
	size?: string;
	/** Whether to wrap in a motion.div with a slide-in animation. Defaults to true. */
	animated?: boolean;
	/** Delay before the animation starts. Defaults to 0. */
	delay?: number;

	/** Unique ID for page navigation / ScrollSpy. */
	id?: string;
	/** Optional override text for the ScrollSpy sidebar. */
	navLabel?: string;
}

export function PageHeader({
	title,
	className = '',
	size = 'text-5xl md:text-7xl',
	animated = true,
	delay = 0.0,
	id,
	navLabel,
}: PageHeaderProps) {
	const content = (
		<div className={`flex flex-col items-center ${className}`}>
			<h1 id={id} data-nav-label={navLabel} className={`${size} font-bold`}>
				{title}
			</h1>
			<SectionDivider />
		</div>
	);

	if (!animated) return content;

	return (
		<motion.div
			initial={{ opacity: 0, y: -50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 1 }}
			transition={{ delay: delay, duration: 0.5, ease: 'easeIn' }}
		>
			{content}
		</motion.div>
	);
}
