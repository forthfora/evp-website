import '@/styles/button-underline.css';

import { NavLink } from 'react-router';

interface NavLinkItemProps {
	to: string;
	label: string;
}

export function NavLinkButton({ to, label }: NavLinkItemProps) {
	return (
		<NavLink
			to={to}
			className="button-underline content-center text-2xl no-underline transition-opacity hover:opacity-70 md:text-xl"
			viewTransition
		>
			{label}
		</NavLink>
	);
}
