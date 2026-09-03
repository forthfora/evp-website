import { animate, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to the target value when scrolled into view.
 */
export function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
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
