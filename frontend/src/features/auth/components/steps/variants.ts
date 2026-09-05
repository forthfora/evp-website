/** Direction-aware slide variants: forward slides in from the right, back from the left. */
export const stepVariants = {
	enter: (dir: number) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
};
