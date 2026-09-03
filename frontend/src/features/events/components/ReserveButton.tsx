import { Chip } from '@/components/ui';

import type { EventSpotStatus } from '../types';

/**
 * Renders the correct affordance for an event's spot status:
 * a reserve link, a sold-out badge, a coming-soon badge, or nothing (past events).
 */
export function ReserveButton({ status, url }: { status: EventSpotStatus; url?: string }) {
	if (status === 'past') return null;

	if (status === 'sold-out') {
		return (
			<Chip variant="muted" size="md">
				sold out
			</Chip>
		);
	}

	if (status === 'coming-soon') {
		return (
			<Chip variant="outline" size="md">
				registration opening soon
			</Chip>
		);
	}

	return (
		<a
			href={url ?? '#'}
			target="_blank"
			rel="noopener noreferrer"
			className="group bg-accent hover:shadow-accent/40 relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-all duration-300 hover:shadow-xl"
		>
			<span className="relative z-10">reserve a spot</span>
			<span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
		</a>
	);
}
