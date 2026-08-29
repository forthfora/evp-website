import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface WidgetCardProps {
	/** Widget heading text. */
	title: string;
	/** Optional description shown under the title. */
	description?: string;
	/** Widget body content. */
	children: ReactNode;
	/** Extra classes on the outer wrapper. */
	className?: string;
}

/**
 * Shared card wrapper for member-dashboard widgets: glass box, title, and
 * optional description. Keeps widget chrome consistent across the dashboard.
 */
export function WidgetCard({ title, description, children, className }: WidgetCardProps) {
	return (
		<div className={cn('glass-box rounded-2xl p-8', className)}>
			<h2 className="text-2xl font-bold">{title}</h2>
			{description && <p className="text-foreground/60 mt-1 text-sm">{description}</p>}
			{children}
		</div>
	);
}
