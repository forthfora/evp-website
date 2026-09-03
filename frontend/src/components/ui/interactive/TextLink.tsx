import { Link } from 'react-router';

import { cn } from '@/utils/cn';

interface TextLinkProps {
	to: string;
	children: React.ReactNode;
	className?: string;
	viewTransition?: boolean;
}

/**
 * Accent-coloured text link with the button-underline hover effect.
 * Used for "Learn More" / "See events" inline links throughout the site.
 */
export function TextLink({ to, children, className, viewTransition = true }: TextLinkProps) {
	return (
		<Link
			to={to}
			viewTransition={viewTransition}
			className={cn('text-accent button-underline font-bold transition-opacity', className)}
		>
			{children}
		</Link>
	);
}
