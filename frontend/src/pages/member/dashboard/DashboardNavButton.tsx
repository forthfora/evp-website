import '@/shared/styles/button-underline.css';

import { Link } from 'react-router';

import { cn } from '@/shared/lib/utils';

interface DashboardNavButtonProps {
	/** e.g. `/member#home`. */
	to: string;
	label: string;
	/** Whether this tab is the currently active subpage. */
	isActive: boolean;
}

export function DashboardNavButton({ to, label, isActive }: DashboardNavButtonProps) {
	return (
		<Link
			to={to}
			aria-current={isActive ? 'page' : undefined}
			className={cn(
				'button-underline text-base font-semibold no-underline transition-colors md:text-xl',
				isActive ? 'active text-accent' : 'text-foreground/70 hover:text-foreground',
			)}
		>
			{label}
		</Link>
	);
}
