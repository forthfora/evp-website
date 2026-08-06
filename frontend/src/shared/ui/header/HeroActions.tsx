import { Socials } from '../common';
import { AuthSection } from './AuthSection';
import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';

/**
 * Hero actions: `Socials (left) | AuthSection (centered, enlarged) | ThemeToggle (right)`.
 * Used in the home page hero. AuthSection is centered independent of the
 * width of the side items; Join EVP button is enlarged.
 */
export function HeroActions() {
	return (
		<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-10">
			<div className="flex items-center justify-center">
				<Socials />
			</div>

			<div className="flex items-center gap-8">
				<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
					|
				</span>
				<AuthSection size="large" />
				<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
					|
				</span>
			</div>

			<div className="flex items-center justify-center gap-1">
				<ThemeToggle />
				<ShareButton />
			</div>
		</div>
	);
}
