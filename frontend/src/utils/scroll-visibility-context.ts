import { createContext } from 'react';

export interface ScrollVisibilityContextValue {
	/**
	 * `true` when the user has scrolled past the hero zone.
	 * On the home page the header is visible when this is `true` and the
	 * hero is visible when this is `false` — they are **mutually exclusive**.
	 */
	isScrolledPast: boolean;
}

export const ScrollVisibilityContext = createContext<ScrollVisibilityContextValue>({
	isScrolledPast: false,
});
