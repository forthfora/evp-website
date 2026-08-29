import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { primaryBtnClass } from '@/styles/form-classes';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
}

/** Shared primary action button with the project's accent styling. */
export function PrimaryButton({ children, className, ...props }: PrimaryButtonProps) {
	return (
		<button type="button" className={cn(primaryBtnClass, className)} {...props}>
			{children}
		</button>
	);
}
