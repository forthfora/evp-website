export const slideIn = (direction: 'left' | 'right', delay = 0) => ({
	initial: { opacity: 0, x: direction === 'left' ? -60 : 60 },
	whileInView: { opacity: 1, x: 0 },
	viewport: { once: true as const, margin: '-100px' },
	transition: { duration: 0.8, ease: 'easeOut' as const, delay },
});

export const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: -50 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true as const, margin: '-150px' },
	transition: { duration: 0.6, ease: 'easeOut' as const, delay },
});
