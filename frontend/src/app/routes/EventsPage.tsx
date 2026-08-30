import { animate, motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { EventsBanner, PageMeta, SectionDivider, UnderlinedTitle } from '@/components/ui';
import {
	EVENTS_STATS,
	type EventSpotStatus,
	type EVPEvent,
	PAST_EVENTS,
	UPCOMING_EVENTS,
} from '@/features/events';

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const motionValue = useMotionValue(0);
	const springValue = useSpring(motionValue, { damping: 25, stiffness: 150 });
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	useEffect(() => {
		if (isInView) animate(motionValue, value, { duration: 1 });
	}, [motionValue, value, isInView]);

	useEffect(() => {
		return springValue.on('change', (latest) => {
			if (ref.current) ref.current.textContent = Math.floor(latest).toString();
		});
	}, [springValue]);

	return (
		<div className="text-5xl font-extrabold tracking-tight md:text-6xl">
			<span ref={ref}>0</span>
			{suffix}
		</div>
	);
}

function ReserveButton({ status, url }: { status: EventSpotStatus; url?: string }) {
	if (status === 'past') return null;

	if (status === 'sold-out') {
		return (
			<span className="border-foreground-muted/40 text-foreground-muted inline-block rounded-full border px-5 py-2 text-sm font-semibold tracking-widest uppercase">
				sold out
			</span>
		);
	}

	if (status === 'coming-soon') {
		return (
			<span className="border-accent/40 text-accent/70 inline-block rounded-full border px-5 py-2 text-sm font-semibold tracking-widest uppercase">
				registration opening soon
			</span>
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

function EventCard({ event, index, isPast }: { event: EVPEvent; index: number; isPast?: boolean }) {
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
							className={`h-56 w-full object-cover md:h-full`}
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

export function EventsPage() {
	return (
		<div className="mx-auto flex w-full flex-col py-50">
			<PageMeta
				title="Our Events"
				description="See what's coming up, and how you can get involved."
			/>
			<UnderlinedTitle id="our-events" title="Our events" className="mb-10" />
			<div className="glass-box py-20">
				<EventsBanner />

				<div className="mx-auto max-w-6xl px-4">
					{/* Stats row */}
					<div className="my-12 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
						{EVENTS_STATS.map((stat, index) => (
							<div key={index} className="flex flex-col items-center justify-center">
								<AnimatedCounter value={stat.value} suffix={stat.suffix} />
								<p className="text-foreground-muted mt-2 text-sm font-medium tracking-wider uppercase">
									{stat.label}
								</p>
							</div>
						))}
					</div>

					<p className="mx-auto mt-10 max-w-4xl py-5 text-center text-3xl font-bold">
						We're a community of the boldest founders and innovators at The University of Edinburgh
						and across Scotland.
					</p>

					<p className="py-5 text-center text-2xl">
						If you're building something amazing, let's meet up.
					</p>
				</div>
			</div>
			<section className="mx-auto mt-50 w-full max-w-6xl px-4">
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-150px' }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="flex flex-col items-center text-center"
				>
					<h2 id="upcoming-events" className="mb-5 text-4xl font-bold md:text-6xl">
						Upcoming events
					</h2>
					<SectionDivider width="w-75 md:w-100" my="my-2" />
				</motion.div>

				{UPCOMING_EVENTS.length > 0 ? (
					<div className="mt-10 flex flex-col gap-6">
						{UPCOMING_EVENTS.map((event, i) => (
							<EventCard key={event.id} event={event} index={i} />
						))}
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="glass-box mt-10 rounded-xl py-16 text-center"
					>
						<p className="text-foreground-muted text-xl">
							Unfortunately, looks like there are no upcoming events right now - check back soon!
						</p>
					</motion.div>
				)}
			</section>
			<section className="mx-auto mt-50 w-full max-w-6xl px-4 pb-20">
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-150px' }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="flex flex-col items-center text-center"
				>
					<h2 id="past-events" className="mb-5 text-4xl font-bold md:text-6xl">
						Past events
					</h2>
					<SectionDivider width="w-75 md:w-100" my="my-2" />
					<p className="text-foreground-muted mt-4 text-2xl">A look back at where we've been.</p>
				</motion.div>

				{PAST_EVENTS.length > 0 ? (
					<div className="mt-10 flex flex-col gap-6">
						{PAST_EVENTS.map((event, i) => (
							<EventCard key={event.id} event={event} index={i} isPast />
						))}
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="glass-box mt-10 rounded-xl py-16 text-center"
					>
						<p className="text-foreground-muted text-xl">No past events yet.</p>
					</motion.div>
				)}
			</section>
		</div>
	);
}
