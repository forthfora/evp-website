import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { type Partner } from '../types';

interface PartnerBlockProps {
	partner: Partner;
	index: number;
}

/** Mirrors Tailwind's `md` breakpoint (768px), which is what the `md:w-1/3` grid switches on. */
function useIsDesktop() {
	const [isDesktop, setIsDesktop] = useState(() =>
		typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
	);

	useEffect(() => {
		const mql = window.matchMedia('(min-width: 768px)');
		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	}, []);

	return isDesktop;
}

export function PartnerBlock({ partner, index }: PartnerBlockProps) {
	const { name, img } = partner;
	const isDesktop = useIsDesktop();
	const delay = isDesktop ? (index % 9) * 0.08 : 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.5, ease: 'easeOut', delay }}
			className="group relative flex h-60 w-full flex-col items-center justify-center gap-5 md:w-1/3"
		>
			{/* Ambient glow behind the logo */}
			<div className="from-accent/25 absolute top-1/2 left-1/2 -z-10 h-40 w-40 -translate-x-1/2 translate-y-[-70%] rounded-full bg-radial to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

			{/* Logo */}
			{img && (
				<img
					src={img}
					alt={`${name} logo`}
					className="h-24 max-w-[80%] object-contain drop-shadow-lg transition-all duration-500 will-change-transform group-hover:-translate-y-2 group-hover:scale-110 group-hover:drop-shadow-2xl"
				/>
			)}

			{/* Name with accent flourish */}
			<div className="flex flex-col items-center gap-2 text-center">
				<h2 className="font-title text-shadow-3xl text-3xl leading-tight font-bold lg:text-4xl">
					{name}
				</h2>
				<div className="bg-accent h-1 w-15 rounded-full transition-all duration-500 group-hover:w-30" />
			</div>
		</motion.div>
	);
}
