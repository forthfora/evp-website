import { useEffect, useState } from 'react';

import { useScrollVisibility } from '@/shared/lib/scroll-visibility';
import { HeroActions } from '@/shared/ui/header/HeroActions';
import { LogoAndTitle } from '@/shared/ui/header/LogoAndTitle';
import { HeaderNavButtons } from '@/shared/ui/header/nav-link-buttons/NavLinkButtons';

interface HomePageHeroProps {
	/** Transition duration in milliseconds. @default 600 */
	transitionDuration?: number;
	/**
	 * How far (px) the hero slides upward when leaving / slides back from when entering.
	 * Positive = slides up when dismissing.
	 * @default 300
	 */
	slideDistance?: number;
	/**
	 * Delay before the mount fade-in starts, in milliseconds.
	 * @default 100
	 */
	mountDelay?: number;
}

const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function HomePageHero({
	transitionDuration = 600,
	slideDistance = 300,
	mountDelay = 100,
}: HomePageHeroProps) {
	const { isScrolledPast } = useScrollVisibility();

	// Always start hidden so the mount fade-in transition fires.
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		const id = setTimeout(() => setHasMounted(true), mountDelay);
		return () => clearTimeout(id);
	}, [mountDelay]);

	// Hero is visible when: mounted AND not scrolled past the hero zone.
	// This is the exact inverse of the header's visibility on the home page,
	// guaranteeing they never appear together.
	const visible = hasMounted && !isScrolledPast;
	const transition = `opacity ${transitionDuration}ms ${EASING}, transform ${transitionDuration}ms ${EASING}`;

	return (
		<div
			className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden text-shadow-2xs"
			style={{
				transition,
				opacity: visible ? 1 : 0,
				transform: `translateY(${visible ? 0 : -slideDistance}px)`,
				pointerEvents: visible ? 'auto' : 'none',
			}}
			aria-hidden={!visible}
		>
			{/* Soft background glow*/}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
				<div
					className="bg-background h-150 w-full md:h-200"
					style={{
						maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)',
						WebkitMaskImage:
							'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
					}}
				/>
			</div>

			{/* Content - Center everything on mobile */}
			<div className="relative flex w-full max-w-7xl flex-col items-center gap-6 px-6 text-center">
				<LogoAndTitle isLarge={true} />

				{/* Scaled text sizes for mobile, allowed text wrapping, kept nowrap for md+ */}
				<div className="animate-shimmer bg-[linear-gradient(135deg,var(--color-foreground)_35%,var(--color-highlight-inverted)_50%,var(--color-foreground)_65%)] bg-size-[300%_300%] bg-clip-text text-2xl leading-tight font-bold whitespace-normal text-transparent [animation-delay:1.2s] md:text-4xl md:whitespace-nowrap">
					<i>Where students build and invest.</i>
				</div>

				{/* Responsive divider line */}
				<div className="text-foreground-muted my-2 w-32 border md:w-64" />

				{/* Tighter gap on mobile, wrap links if necessary */}
				<nav className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
					<HeaderNavButtons />
				</nav>

				<div className="flex flex-row items-center gap-7">
					<HeroActions />
				</div>
			</div>
		</div>
	);
}
