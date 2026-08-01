import '@/shared/styles/button-underline.css';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/utils';

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
				'group relative flex overflow-hidden rounded-full text-center font-bold text-white shadow-lg',
				className,
			)}
			style={{ backgroundColor: 'var(--color-accent)' }}
		>
			{/* Blobs */}
			<span className="animate-blob1 pointer-events-none absolute -top-4 -left-4 h-16 w-16 rounded-full bg-[#8b85fa] opacity-70 blur-xl" />
			<span className="animate-blob2 pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-[#c084fc] opacity-60 blur-xl" />
			<span className="animate-blob3 pointer-events-none absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b85fa] opacity-50 blur-lg" />

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
