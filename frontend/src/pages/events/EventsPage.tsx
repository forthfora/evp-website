import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion';

const STATS_DATA = [
	{ value: 10, suffix: '+', label: 'Events' },
	{ value: 100, suffix: '+', label: 'Members' },
	{ value: 20, suffix: '+', label: 'Speakers' },
	{ value: 2, suffix: '', label: 'Years running' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	const motionValue = useMotionValue(0);
	const springValue = useSpring(motionValue, {
		damping: 25,
		stiffness: 150,
	});
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	useEffect(() => {
		if (isInView) {
			animate(motionValue, value, { duration: 1 });
		}
	}, [motionValue, value, isInView]);

	useEffect(() => {
		return springValue.on('change', (latest) => {
			if (ref.current) {
				ref.current.textContent = Math.floor(latest).toString();
			}
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
		<div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-50">
			{/* Header Text */}
			<div className="flex flex-col items-center">
				<h1 className="text-5xl font-bold">our events</h1>
				<div className="text-foreground-muted my-4 w-100 border text-center" />
			</div>

			{/* Animated Stats Section */}
			<div className="my-12 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
				{STATS_DATA.map((stat, index) => (
					<div key={index} className="flex flex-col items-center justify-center">
						<AnimatedCounter value={stat.value} suffix={stat.suffix} />
						<p className="text-muted-foreground mt-2 text-sm font-medium tracking-wider uppercase">
							{stat.label}
						</p>
					</div>
				))}
			</div>

			{/* Paragraphs */}
			<p className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold">
				We’re a community of the boldest founders and innovators at The University of Edinburgh and
				across Scotland.
			</p>

			<p className="text-muted-foreground text-foreground-muted py-5 text-center text-xl">
				If you’re building something amazing, we’d like to meet you.
			</p>

			<div className="py-50">
				<p className="text-4xl">
					Unfortunately, there don't appear to be any events in the near future...
				</p>

				<p className="text-foreground-muted py-10 text-2xl">
					We're always planning something, so check back soon!
				</p>
			</div>
		</div>
	);
}
