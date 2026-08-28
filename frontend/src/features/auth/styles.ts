/** Direction-aware slide variants: forward slides in from the right, back from the left. */
export const stepVariants = {
	enter: (dir: number) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
};

export const inputClass =
	'bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

export const primaryBtnClass =
	'bg-accent hover:bg-accent/80 mt-2 w-full cursor-pointer rounded-lg px-6 py-3 text-base font-bold tracking-widest text-white uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';

export const linkBtnClass =
	'text-foreground/50 hover:text-foreground mt-2 cursor-pointer text-center text-sm underline-offset-2 transition-colors hover:underline';

export const digitInputClass =
	'border-accent/30 bg-background/40 focus:border-accent focus:ring-accent/20 h-14 w-12 rounded-lg border text-center text-xl font-bold transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50';
