import { NAV_LINKS } from './nav-links.data';
import { NavLinkButton } from './NavLinkButton';

export function HeaderNavButtons() {
	return (
		<ul className="contents">
			{NAV_LINKS.map((link, i) => (
				<li key={link.path} className="flex items-center gap-4 md:gap-6">
					<NavLinkButton to={link.path} label={link.label} />
					{i < NAV_LINKS.length - 1 && (
						<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
							|
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
