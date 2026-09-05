import type { VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { inputVariants } from './input/input-variants';

interface InputProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {}

export function Input({ className, size, ...props }: InputProps) {
	return <input className={cn(inputVariants({ size }), className)} {...props} />;
}
