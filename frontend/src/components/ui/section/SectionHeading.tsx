import { motion } from 'framer-motion';

import { SectionDivider } from './SectionDivider';

interface SectionHeadingProps {
	/** Heading text. */
	title: string;
	/** Heading level. Defaults to h2. */
	level?: 1 | 2 | 3;
	/** Font size. Defaults to "text-4xl md:text-5xl". */
	size?: 'md' | 'lg';
	/** Optional subtitle displayed below the divider. */
	subtitle?: string;
	/** Extra classes on the wrapper. */
	className?: string;
	/** Unique ID for ScrollSpy. */
	id?: string;
	/** Animate on scroll. Defaults to true. */
	animated?: boolean;
}

/**
 * In-page section heading: title + SectionDivider + optional subtitle,
 * with a standardized slide-in animation. Use `UnderlinedTitle` for
 * centered hero titles instead.
 */
export function SectionHeading({
	title,
	level = 2,
	size = 'md',
	subtitle,
	className = '',
	id,
	animated = true,
}: SectionHeadingProps) {
	const Tag = `h${level}` as const;
	const sizeClass = size === 'lg' ? 'text-4xl md:text-6xl' : 'text-4xl md:text-5xl';

	const content = (
		<div className={`flex flex-col items-center text-center ${className}`}>
			<Tag id={id} className={`mb-5 font-bold ${sizeClass}`}>
				{title}
			</Tag>
			<SectionDivider width="w-75 md:w-100" my="my-2" />
			{subtitle && <p className="text-foreground-muted mt-4 text-2xl">{subtitle}</p>}
		</div>
	);

	if (!animated) return content;

	return (
		<motion.div
			initial={{ opacity: 0, y: -50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-150px' }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			{content}
		</motion.div>
	);
}
