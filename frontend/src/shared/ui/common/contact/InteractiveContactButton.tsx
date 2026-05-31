import '@/shared/styles/button-underline.css';

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function InteractiveContactButton() {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!wrapperRef.current) return;
			const rect = wrapperRef.current.getBoundingClientRect();
			setMousePos({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	return (
		<div ref={wrapperRef} className="mx-auto inline-block">
			<Link
				to="contact"
				viewTransition
				className="group relative flex overflow-hidden rounded-full px-30 py-4 text-center text-3xl font-bold text-white shadow-lg md:text-4xl"
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

				<span className="button-underline relative z-10 drop-shadow-md">Reach out</span>
			</Link>
		</div>
	);
}
