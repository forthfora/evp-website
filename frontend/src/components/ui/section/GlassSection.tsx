import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

const glassSectionVariants = cva('glass-box w-full overflow-hidden', {
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

interface GlassSectionProps
	extends HTMLAttributes<HTMLElement>, VariantProps<typeof glassSectionVariants> {
	as?: 'section' | 'div';
}

export function GlassSection({
	className,
	padding,
	as: Tag = 'section',
	...props
}: GlassSectionProps) {
	return <Tag className={cn(glassSectionVariants({ padding }), className)} {...props} />;
}

export { glassSectionVariants };
