import { AuthSection } from './AuthSection';
import { ThemeToggle } from './ThemeToggle';

/**
 * Header actions: `ThemeToggle | separator | AuthSection`.
 * Used in the fixed header (desktop and mobile menu).
 */
export function HeaderActions() {
	return (
		<div className="flex items-center gap-2">
			<ThemeToggle />
			<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
				|
			</span>
			<div className="mx-auto w-max"></div>
			<AuthSection />
		</div>
	);
}
