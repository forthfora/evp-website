import { Link } from 'react-router';
import '../../styles/button-underline.css';

interface NavLinkItemProps {
	to: string;
	label: string;
}

export function NavLinkItem({ to, label }: NavLinkItemProps) {
	return (
		<Link
			to={to}
			className="button-underline content-center text-lg no-underline transition-opacity hover:opacity-70"
		>
			{label}
		</Link>
	);
}
