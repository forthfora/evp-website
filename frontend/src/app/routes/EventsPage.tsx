import { motion } from 'framer-motion';

import { EventsBanner, PageMeta, SectionHeading, UnderlinedTitle } from '@/components/ui';
import {
	AnimatedCounter,
	EventCard,
	EVENTS_STATS,
	PAST_EVENTS,
	UPCOMING_EVENTS,
} from '@/features/events';

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
						{
							"We're a community of the boldest founders and innovators at The University of Edinburgh and across Scotland."
						}
					</p>

					<p className="py-5 text-center text-2xl">
						If you're building something amazing, let's meet up.
					</p>
				</div>
			</div>
			<section className="mx-auto mt-50 w-full max-w-6xl px-4">
				<SectionHeading id="upcoming-events" title="Upcoming events" size="lg" />

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
				<SectionHeading
					id="past-events"
					title="Past events"
					size="lg"
					subtitle="A look back at where we've been."
				/>

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
