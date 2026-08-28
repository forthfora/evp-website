import { type ReactNode, useEffect, useState } from 'react';

import { ScrollVisibilityContext } from './scroll-visibility-context';

/**
 * Scroll‑visibility hysteresis thresholds (px from top of page).
 *
 * - `isScrolledPast` becomes **true** when `scrollY > HIDE_AT`.
 * - `isScrolledPast` becomes **false** when `scrollY < SHOW_AT`.
 *
 * The band between SHOW_AT and HIDE_AT is the hysteresis zone where no
 * state change occurs, preventing flicker.
 */
const SHOW_AT = 75;
const HIDE_AT = 100;

export function ScrollVisibilityProvider({ children }: { children: ReactNode }) {
	const [isScrolledPast, setIsScrolledPast] = useState(() => {
		if (typeof window !== 'undefined') {
			return window.scrollY > HIDE_AT;
		}
		return false;
	});

	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY;
			setIsScrolledPast((prev) => {
				if (!prev && y > HIDE_AT) return true;
				if (prev && y < SHOW_AT) return false;
				return prev;
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<ScrollVisibilityContext.Provider value={{ isScrolledPast }}>
			{children}
		</ScrollVisibilityContext.Provider>
	);
}
