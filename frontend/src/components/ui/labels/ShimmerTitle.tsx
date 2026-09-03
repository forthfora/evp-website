import { cn } from '@/utils/cn';

interface ShimmerTitleProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Gradient-shimmer title text. Used on the Member Dashboard and Welcome Widget.
 * Apply this to an h1/h2 element with `font-title animate-shimmer bg-clip-text text-transparent`.
 */
export function ShimmerTitle({ children, className }: ShimmerTitleProps) {
	return (
		<span
			className={cn(
				'font-title animate-shimmer bg-[linear-gradient(135deg,var(--color-highlight)_35%,var(--color-highlight-inverted)_50%,var(--color-highlight)_65%)] bg-size-[300%_300%] bg-clip-text text-transparent',
				className,
			)}
		>
			{children}
		</span>
	);
}
