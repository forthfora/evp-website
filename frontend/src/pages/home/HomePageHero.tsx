import { Socials } from '@common';
import { useEffect, useState } from 'react';

import { AccountAndSettings } from '@/shared/ui/header/AccountAndSettings';
import { LogoAndTitle } from '@/shared/ui/header/LogoAndTitle';
import { HeaderNavButtons } from '@/shared/ui/header/nav-link-buttons/NavLinkButtons';

interface HomePageHeroProps {
	/**
	 * How far the user must scroll DOWN (px) before the hero fades out.
	 * @default 100
	 */
	fadeOutAt?: number;
	/**
	 * How far the user must scroll back UP (px) before the hero fades in again.
	 * @default 75
	 */
	fadeInAt?: number;
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
	fadeOutAt = 100,
	fadeInAt = 75,
	transitionDuration = 600,
	slideDistance = 300,
	mountDelay = 100,
}: HomePageHeroProps) {
	// Always start hidden so the fade-in transition fires on mount.
	const [visible, setVisible] = useState(false);

	// Mount fade-in — evaluates scroll AFTER the delay to account for async scroll restoration
	useEffect(() => {
		const id = setTimeout(() => {
			// If the browser restored scroll down the page during the delay, this prevents the fade-in.
			if (window.scrollY <= fadeOutAt) {
				setVisible(true);
			}
		}, mountDelay);

		return () => clearTimeout(id);
	}, [fadeOutAt, mountDelay]);

	// Scroll listener — always active.
	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY;

			// React automatically bails out of state updates if the new value is the same as the old one,
			// so we don't need to check `prev` before returning false/true.
			setVisible((prev) => {
				if (y > fadeOutAt) return false;
				if (y < fadeInAt) return true;
				return prev;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [fadeOutAt, fadeInAt]);

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
					<i>where students build and invest.</i>
				</div>

				{/* Responsive divider line */}
				<div className="text-foreground-muted my-2 w-32 border md:w-64" />

				{/* Tighter gap on mobile, wrap links if necessary */}
				<nav className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
					<HeaderNavButtons />
				</nav>

				<div className="flex flex-row items-center gap-7">
					<Socials />
					<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
						|
					</span>
					<AccountAndSettings />
				</div>
			</div>
		</div>
	);
}
