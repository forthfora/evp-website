import { Link } from 'react-router';
import './NavLinkItem.css';

interface NavLinkItemProps {
	to: string;
	label: string;
}

export function NavLinkItem({ to, label }: NavLinkItemProps) {
	return (
		<Link
			to={to}
			className="nav-link content-center font-medium no-underline transition-opacity hover:opacity-70"
		>
			{label}
		</Link>
	);
}
