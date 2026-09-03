import { cva } from 'class-variance-authority';

export const glassSectionVariants = cva('glass-box w-full overflow-hidden', {
	variants: {
		padding: {
			md: 'py-25 md:py-40',
			lg: 'py-25 md:py-50',
		},
	},
	defaultVariants: {
		padding: 'md',
	},
});
