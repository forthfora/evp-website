import { cva } from 'class-variance-authority';

export const labelVariants = cva('text-left font-semibold tracking-widest uppercase opacity-70', {
	variants: {
		size: {
			sm: 'text-xs',
			md: 'text-sm',
		},
	},
	defaultVariants: {
		size: 'sm',
	},
});
