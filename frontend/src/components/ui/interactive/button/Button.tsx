import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { buttonVariants } from './button-variants';

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, intent, size, ...props }: ButtonProps) {
	return (
		<button type="button" className={cn(buttonVariants({ intent, size }), className)} {...props} />
	);
}
