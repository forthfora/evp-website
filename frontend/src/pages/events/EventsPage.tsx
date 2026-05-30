import { animate,useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { EventsBanner } from '@/shared/ui/common/EventsBanner';
import { PageHeader } from '@/shared/ui/common/PageHeader';

import { EVENTS_STATS } from './events.data';

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

export function EventsPage() {
	return (
		<div className="mx-auto flex w-full flex-col py-50">
			<PageHeader title="our events" className="mb-0" />

			<EventsBanner />

			<div className="mx-auto max-w-6xl px-4">
				<div className="my-12 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
					{EVENTS_STATS.map((stat, index) => (
						<div key={index} className="flex flex-col items-center justify-center">
							<AnimatedCounter value={stat.value} suffix={stat.suffix} />
							<p className="text-muted-foreground mt-2 text-sm font-medium tracking-wider uppercase">
								{stat.label}
							</p>
						</div>
					))}
				</div>

				<p className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold">
					We're a community of the boldest founders and innovators at The University of Edinburgh
					and across Scotland.
				</p>

				<p className="text-foreground-muted py-5 text-center text-xl">
					If you're building something amazing, we'd like to meet you.
				</p>

				<div className="py-50">
					<p className="text-center text-4xl">EVENTS GO HERE</p>
				</div>
			</div>
		</div>
	);
}
