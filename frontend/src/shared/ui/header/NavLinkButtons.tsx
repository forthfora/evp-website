import { NavLinkItem } from './NavLinkItem';

export const NAV_LINKS = [
	{ path: '/about', label: 'about' },
	{ path: '/startups', label: 'services' },
	{ path: '/investing', label: 'contact' },
	{ path: '/partners', label: 'partners' },
	{ path: '/events', label: 'events' },
];

export function NavLinkButtons() {
	return (
		<>
			{NAV_LINKS.map((link, i) => (
				<span key={link.path} className="flex items-center gap-4 md:gap-6">
					<NavLinkItem to={link.path} label={link.label} />
					{i < NAV_LINKS.length - 1 && (
						<span className="text-foreground-muted select-none" aria-hidden>
							|
						</span>
					)}
				</span>
			))}
		</>
	);
}
