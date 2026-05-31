import { NavLinkButton } from './NavLinkButton';

export const NAV_LINKS = [
	{ path: '/about', label: 'about us' },
	{ path: '/startups', label: 'start-ups' },
	{ path: '/contact', label: 'contact' },
	{ path: '/events', label: 'events' },
];

export function HeaderNavButtons() {
	return (
		<>
			{NAV_LINKS.map((link, i) => (
				<span key={link.path} className="flex items-center gap-4 md:gap-6">
					<NavLinkButton to={link.path} label={link.label} />
					{i < NAV_LINKS.length - 1 && (
						<span className="text-foreground-muted hidden select-none md:inline" aria-hidden>
							|
						</span>
					)}
				</span>
			))}
		</>
	);
}
