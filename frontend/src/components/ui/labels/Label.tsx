import type { VariantProps } from 'class-variance-authority';
import type { LabelHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { labelVariants } from './label-variants';

interface LabelProps
	extends LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

export function Label({ className, size, ...props }: LabelProps) {
	return <label className={cn(labelVariants({ size }), className)} {...props} />;
}
