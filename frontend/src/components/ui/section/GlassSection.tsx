import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { glassSectionVariants } from './glass-section/glass-section-variants';

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
