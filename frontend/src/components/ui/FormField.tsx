import type { ReactNode } from 'react';

import { labelClass } from '@/styles/form-classes';
import { cn } from '@/utils/cn';

interface FormFieldProps {
	/** ID shared by the label's htmlFor and the control's id. */
	id: string;
	/** Label text. */
	label: string;
	/** The form control (input, textarea, etc.). */
	children: ReactNode;
	/** Extra classes on the wrapper. */
	className?: string;
}

/**
 * Labelled form field wrapper: renders an accessible <label> tied to a form
 * control with the shared label styling.
 */
export function FormField({ id, label, children, className }: FormFieldProps) {
	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<label htmlFor={id} className={labelClass}>
				{label}
			</label>
			{children}
		</div>
	);
}
