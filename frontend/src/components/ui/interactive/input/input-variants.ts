import { cva } from 'class-variance-authority';

export const inputVariants = cva(
	'bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'px-4 py-2.5 text-sm',
				md: 'px-4 py-3 text-base',
				digit: 'h-14 w-12 text-center text-xl font-bold',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	},
);
