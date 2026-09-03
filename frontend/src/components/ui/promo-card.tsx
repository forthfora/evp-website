import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/utils/cn';

interface PromoCardProps {
	image: string;
	title: string;
	body: ReactNode;
	/** Optional "Learn More" link target. */
	to?: string;
	/** Index for staggered animation delay. */
	index?: number;
	className?: string;
}

/**
 * Glass promo card with an image, title, body, and optional link.
 * Used in HomePage "What We Do" and ContactPage "What We Offer" sections.
 */
export function PromoCard({ image, title, body, to, index = 0, className }: PromoCardProps) {
	const content = (
		<>
			<img
				src={image}
				alt={title}
				className="mx-auto h-100 w-full max-w-md object-cover shadow-2xl"
			/>
			<h3 className="px-15 text-4xl font-bold">{title}</h3>
			<div className="px-10 text-lg">{body}</div>
			{to && (
				<Link
					to={to}
					viewTransition
					className="text-accent button-underline mx-auto text-2xl font-bold transition-opacity md:text-xl"
				>
					Learn More...
				</Link>
			)}
		</>
	);

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{ duration: 0.6, ease: 'easeOut' as const, delay: index * 0.2 }}
			className={cn('glass-box flex w-full flex-col gap-10 pb-15 text-center', className)}
		>
			{to ? content : <>{content}</>}
		</motion.div>
	);
}
