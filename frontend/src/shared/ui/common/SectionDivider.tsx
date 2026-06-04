interface SectionDividerProps {
	className?: string;
	/** Tailwind width class, e.g. "w-100" or "w-150". Defaults to "w-100". */
	width?: string;
	/** Extra vertical margin override. Defaults to "my-4". */
	my?: string;
}

/**
 * Thin horizontal rule used between headings and body throughout the site.
 */
export function SectionDivider({
	className = '',
	width = 'w-100',
	my = 'my-4',
}: SectionDividerProps) {
	return <div className={`text-foreground-muted border text-center ${width} ${my} ${className}`} />;
}
