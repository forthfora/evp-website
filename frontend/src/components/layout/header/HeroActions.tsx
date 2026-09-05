import { Socials } from '@/components/ui';

import { AuthSection } from './AuthSection';
import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';

/**
 * Hero actions: `Socials (left) | AuthSection (centered, enlarged) | ThemeToggle (right)`.
 * Used in the home page hero. AuthSection is centered independent of the
 * width of the side items; Join EVP button is enlarged.
 *
 * On mobile the layout stacks instead: the Join EVP button (full width) on
 * top, with all icons (Socials, ThemeToggle, Share) on a single row below.
 */
export function HeroActions() {
	return (
		<div className="flex flex-col items-center gap-6 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-10">
			<div className="flex w-full items-center justify-center gap-8 md:col-start-2 md:row-start-1 md:w-auto">
				<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
					|
				</span>
				<AuthSection size="large" className="w-full justify-center md:w-auto" />
				<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
					|
				</span>
			</div>

			{/* Icons: one row on mobile; `md:contents` splits them to the grid
			    side columns on desktop. */}
			<div className="flex w-full items-center justify-center gap-10 md:contents">
				<div className="flex items-center justify-center md:col-start-1 md:row-start-1">
					<Socials />
				</div>

				<div className="flex items-center justify-center gap-4 md:col-start-3 md:row-start-1">
					<ThemeToggle />
					<ShareButton />
				</div>
			</div>
		</div>
	);
}
