import { cva, type VariantProps } from 'class-variance-authority';
import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const labelVariants = cva('text-left font-semibold tracking-widest uppercase opacity-70', {
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

interface LabelProps
	extends LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

export function Label({ className, size, ...props }: LabelProps) {
	return <label className={cn(labelVariants({ size }), className)} {...props} />;
}

export { labelVariants };
