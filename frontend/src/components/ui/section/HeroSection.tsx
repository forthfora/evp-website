import type { ReactNode } from 'react';

import { RadialGlowOverlay } from '../RadialGlowOverlay';

interface HeroSectionProps {
	/** Background image URL. */
	image: string;
	/** Accessible alt text for the background image. */
	imageAlt?: string;
	/** Centered hero content. */
	children: ReactNode;
	/** Minimum height class override. Default: "min-h-180". */
	minHeight?: string;
	/** Extra classes on the outer container. */
	className?: string;
}

/**
 * Full-bleed hero section: background image, dark overlay, and a soft radial
 * glow, with centered content stacked above. Shared by the About, Contact,
 * and Start-ups hero sections.
 */
export function HeroSection({
	image,
	imageAlt = '',
	children,
	minHeight = 'min-h-180',
	className = '',
}: HeroSectionProps) {
	return (
		<div
			className={`relative flex w-full items-center justify-center overflow-hidden pt-30 ${minHeight} ${className}`}
		>
			<img
				src={image}
				alt={imageAlt}
				className="absolute inset-0 h-full w-full object-cover shadow-2xl"
			/>
			<div className="bg-background/40 absolute inset-0" />
			<RadialGlowOverlay />
			<div className="relative z-10 mx-auto w-full max-w-6xl px-4 md:px-8">{children}</div>
		</div>
	);
}
