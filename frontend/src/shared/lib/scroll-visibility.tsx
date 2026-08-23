import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

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

interface ScrollVisibilityContextValue {
	/**
	 * `true` when the user has scrolled past the hero zone.
	 * On the home page the header is visible when this is `true` and the
	 * hero is visible when this is `false` — they are **mutually exclusive**.
	 */
	isScrolledPast: boolean;
}

const ScrollVisibilityContext = createContext<ScrollVisibilityContextValue>({
	isScrolledPast: false,
});

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

export function useScrollVisibility() {
	return useContext(ScrollVisibilityContext);
}
