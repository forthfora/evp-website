import '@/shared/styles/button-underline.css';

import { NavLink } from 'react-router';

interface NavLinkItemProps {
	to: string;
	label: string;
}

export function NavLinkButton({ to, label }: NavLinkItemProps) {
	return (
		<NavLink
			to={to}
			className="button-underline content-center text-lg no-underline transition-opacity hover:opacity-70"
			viewTransition
		>
			{label}
		</NavLink>
	);
}
