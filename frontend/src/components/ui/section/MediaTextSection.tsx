import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { slideIn } from '@/utils/motion';

interface MediaTextSectionProps {
	/** Image on the left (default) or right. */
	image: string;
	imageAlt: string;
	/** Image container height class. Defaults to "h-120". */
	imageHeight?: string;
	/** Content (heading, text, etc.). */
	children: ReactNode;
	/** Put the image on the right side. */
	reverse?: boolean;
	/** Extra classes on the outer container. */
	className?: string;
}

/**
 * Two-column section: image on one side, text content on the other.
 * Used for About Us, Scout Programme, Network, and Contact Form sections.
 */
export function MediaTextSection({
	image,
	imageAlt,
	imageHeight = 'h-120',
	children,
	reverse = false,
	className,
}: MediaTextSectionProps) {
	const imageCol = (
		<motion.div
			{...slideIn(reverse ? 'right' : 'left')}
			className={`flex ${imageHeight} w-full justify-center md:w-1/2`}
		>
			<img
				src={image}
				alt={imageAlt}
				className="w-full max-w-md rounded-lg object-cover shadow-2xl"
			/>
		</motion.div>
	);

	const textCol = (
		<motion.div
			{...slideIn(reverse ? 'left' : 'right', 0.2)}
			className={cn(
				'flex w-full flex-col items-center gap-5 text-center md:w-1/2',
				reverse ? 'md:items-end md:text-right' : 'md:items-start md:text-left',
			)}
		>
			{children}
		</motion.div>
	);

	return (
		<div
			className={cn(
				'mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row',
				className,
			)}
		>
			{reverse ? (
				<>
					{textCol}
					{imageCol}
				</>
			) : (
				<>
					{imageCol}
					{textCol}
				</>
			)}
		</div>
	);
}
