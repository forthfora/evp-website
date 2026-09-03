import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { cn } from '@/utils/cn';

import { BlobBackground } from './blob-background';

interface InteractiveLinkButtonProps {
	/** Route the button navigates to. */
	to: string;
	/** Button label or content. */
	children: ReactNode;
	/** Extra Tailwind classes for sizing and typography (e.g. padding, text size). */
	className?: string;
	/** Optional accessible label. */
	ariaLabel?: string;
}

/**
 * Interactive pill-shaped link button: a cursor-tracking spotlight, animated
 * gradient blobs, and an underline-on-hover label. Shared by the "Reach out"
 * contact button and the header "Join EVP" button.
 */
export function InteractiveLinkButton({
	to,
	children,
	className,
	ariaLabel,
}: InteractiveLinkButtonProps) {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const el = linkRef.current;
		if (!el) return;
		const handle = (e: MouseEvent) => {
			if (!linkRef.current) return;
			const rect = linkRef.current.getBoundingClientRect();
			setMousePos({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		};

		el.addEventListener('mousemove', handle);
		return () => el.removeEventListener('mousemove', handle);
	}, []);

	return (
		<Link
			ref={linkRef}
			to={to}
			viewTransition
			aria-label={ariaLabel}
			className={cn(
				'group relative flex overflow-hidden rounded-2xl text-center font-bold text-white shadow-lg',
				className,
			)}
			style={{ backgroundColor: 'var(--color-accent)' }}
		>
			{/* Blobs */}
			<BlobBackground />

			{/* Spotlight */}
			<span
				className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{
					background: `radial-gradient(circle 100px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.35), transparent)`,
				}}
			/>

			<span className="button-underline relative z-10 drop-shadow-md">{children}</span>
		</Link>
	);
}
