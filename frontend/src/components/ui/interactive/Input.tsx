import { cva, type VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const inputVariants = cva(
	'bg-background/40 border-accent/30 placeholder:text-foreground/30 focus:border-accent focus:ring-accent/20 w-full rounded-lg border transition-colors duration-200 outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'px-4 py-2.5 text-sm',
				md: 'px-4 py-3 text-base',
				digit: 'h-14 w-12 text-center text-xl font-bold',
			},
		},
		defaultVariants: {
			size: 'sm',
		},
	},
);

interface InputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {}

export function Input({ className, size, ...props }: InputProps) {
	return <input className={cn(inputVariants({ size }), className)} {...props} />;
}

export { inputVariants };
