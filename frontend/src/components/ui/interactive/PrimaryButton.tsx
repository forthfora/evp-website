import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { buttonVariants } from './button/button-variants';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
}

/** Shared primary action button with the project's accent styling. */
export function PrimaryButton({ children, className, ...props }: PrimaryButtonProps) {
	return (
		<button
			type="button"
			className={cn(buttonVariants({ intent: 'primary', size: 'sm' }), className)}
			{...props}
		>
			{children}
		</button>
	);
}
