import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
	'cursor-pointer font-bold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40',
	{
		variants: {
			intent: {
				primary: 'bg-accent hover:bg-accent/80 text-white rounded-lg',
				ghost: 'border-accent/30 hover:border-accent/60 border rounded-lg',
				pill: 'bg-accent hover:shadow-accent/40 relative inline-flex items-center gap-2 overflow-hidden rounded-full text-white shadow-lg transition-all duration-300 hover:shadow-xl',
				link: 'text-foreground/50 hover:text-foreground mt-2 cursor-pointer text-center text-sm underline-offset-2 transition-colors hover:underline',
			},
			size: {
				sm: 'px-4 py-2 text-sm',
				md: 'px-6 py-3 text-base',
			},
		},
		defaultVariants: {
			intent: 'primary',
			size: 'sm',
		},
	},
);
