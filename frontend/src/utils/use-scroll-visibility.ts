import { useContext } from 'react';

import { ScrollVisibilityContext } from './scroll-visibility-context';

export function useScrollVisibility() {
	return useContext(ScrollVisibilityContext);
}
