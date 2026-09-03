import { motion } from 'framer-motion';

import type { EVPEvent } from '../types';
import { ReserveButton } from './ReserveButton';

/**
 * Single event card with image, meta chips, description, highlights, and CTA.
 * Handles both upcoming and past event display variants.
 */
export function EventCard({
	event,
	index,
	isPast,
}: {
	event: EVPEvent;
	index: number;
	isPast?: boolean;
}) {
	const hasImage = !!event.image;

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-80px' }}
			transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.1 }}
			className={`glass-box group relative my-5 overflow-hidden rounded-xl transition-all duration-300 ${
				isPast ? 'opacity-70 hover:opacity-90' : 'hover:border-accent/30'
			}`}
		>
			{!isPast && (
				<div className="from-accent absolute top-0 left-0 h-1 w-0 bg-linear-to-r to-blue-500 transition-all duration-500 group-hover:w-full" />
			)}

			<div className={`flex ${hasImage ? 'flex-col md:flex-row' : 'flex-col'}`}>
				{/* Image */}
				{hasImage && (
					<div className="w-full shrink-0 md:w-72 lg:w-80">
						<img
							src={event.image}
							alt={event.title}
							className="h-56 w-full object-cover md:h-full"
						/>
					</div>
				)}

				{/* Content */}
				<div className="flex flex-col gap-5 p-8">
					{/* Meta chips */}
					<div className="flex flex-wrap items-center gap-3">
						<span
							className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${
								isPast ? 'bg-foreground-muted/15 text-foreground-muted' : 'bg-accent/10 text-accent'
							}`}
						>
							{event.date}
						</span>
						{event.time && (
							<span className="text-foreground-muted text-xs font-medium tracking-wide">
								{event.time}
							</span>
						)}
						{event.location && (
							<span className="text-foreground-muted flex items-center gap-1 text-xs font-medium tracking-wide">
								<svg
									className="h-3 w-3 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
									<circle cx="12" cy="9" r="2.5" />
								</svg>
								{event.location}
							</span>
						)}
					</div>

					{/* Title */}
					<h3 className="text-2xl leading-tight font-bold md:text-3xl">{event.title}</h3>

					{/* Description */}
					{event.description && (
						<p className="text-foreground-muted text-base leading-relaxed">{event.description}</p>
					)}

					{/* Highlights */}
					{event.highlights && event.highlights.length > 0 && (
						<ul className="flex flex-col gap-2">
							{event.highlights.map((point, i) => (
								<li key={i} className="flex items-start gap-3 text-sm">
									<span className="text-accent mt-0.5 shrink-0 text-lg leading-none">◆</span>
									<span className="text-foreground-muted">{point}</span>
								</li>
							))}
						</ul>
					)}

					{/* CTA */}
					{event.spotStatus && event.spotStatus !== 'past' && (
						<div className="mt-2">
							<ReserveButton status={event.spotStatus} url={event.reserveUrl} />
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
