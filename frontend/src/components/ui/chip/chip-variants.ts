import { cva } from 'class-variance-authority';

export const chipVariants = cva('inline-block rounded-full font-bold tracking-widest uppercase', {
	variants: {
		variant: {
			accent: 'bg-accent/10 text-accent',
			muted: 'border-foreground-muted/40 text-foreground-muted border',
			dimmed: 'bg-foreground-muted/15 text-foreground-muted',
			outline: 'border-accent/40 text-accent/70 border',
		},
		size: {
			sm: 'px-3 py-1 text-xs',
			md: 'px-5 py-2 text-sm font-semibold',
		},
	},
	defaultVariants: {
		variant: 'accent',
		size: 'sm',
	},
});
