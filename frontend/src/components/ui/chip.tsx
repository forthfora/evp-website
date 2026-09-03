import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const chipVariants = cva('inline-block rounded-full font-bold tracking-widest uppercase', {
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

interface ChipProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof chipVariants> {}

export function Chip({ className, variant, size, ...props }: ChipProps) {
	return <span className={cn(chipVariants({ variant, size }), className)} {...props} />;
}

export { chipVariants };
