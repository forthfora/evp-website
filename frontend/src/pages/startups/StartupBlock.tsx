import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa6';
import { type StartupWithSize } from './startups.layout';

interface StartupBlockProps {
	startup: StartupWithSize;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	instagram: FaInstagram,
	linkedin: FaLinkedin,
	website: FaGlobe,
};

export function StartupBlock({ startup }: StartupBlockProps) {
	const { name, tagline, description, links, accent, img, width, height, globalIndex } = startup;
	const [isRevealed, setIsRevealed] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.5, ease: 'easeOut', delay: (globalIndex % 9) * 0.08 }}
			onClick={() => {
				if (window.matchMedia('(max-width: 767px)').matches) {
					setIsRevealed(!isRevealed);
				}
			}}
			className="group relative max-h-60 max-w-full min-w-full shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-300 md:max-h-none md:min-w-0 md:cursor-auto"
			style={{
				width,
				height: `${height}px`,
				['--startup-accent' as any]: accent,
			}}
		>
			{/* Background Image Layer */}
			{img && (
				<div className="absolute inset-0 z-0 overflow-hidden">
					<img
						src={img}
						alt={`${name} background`}
						className={`h-full w-full object-cover opacity-25 transition-all duration-500 will-change-transform md:group-hover:scale-105 md:group-hover:blur-sm ${
							isRevealed ? 'scale-105 blur-sm' : 'blur-[5px]'
						}`}
					/>
					<div
						className={`to-background/50 absolute inset-0 bg-linear-to-t from-(--startup-accent)/20 via-transparent mix-blend-multiply transition-opacity duration-300 md:group-hover:opacity-40 ${
							isRevealed ? 'opacity-40' : ''
						}`}
					/>
				</div>
			)}

			{/* Default state */}
			<div
				className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-6 text-center transition-all duration-300 md:group-hover:scale-95 md:group-hover:opacity-0 ${
					isRevealed ? 'scale-95 opacity-0' : 'opacity-100'
				}`}
			>
				<div>
					<h2
						className="font-title text-shadow-3xl mb-5 text-4xl leading-tight font-bold lg:text-5xl"
						style={{ color: accent }}
					>
						{name}
					</h2>
					<b className="mt-1 text-xl text-gray-800 italic lg:text-2xl">{tagline}</b>
				</div>
			</div>

			{/* Hover/Revealed state */}
			<div
				className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 p-6 text-center transition-all duration-300 md:pointer-events-auto md:group-hover:scale-100 md:group-hover:opacity-100 ${
					isRevealed
						? 'pointer-events-auto scale-100 opacity-100'
						: 'pointer-events-none scale-[0.97] opacity-0'
				}`}
			>
				<div
					className="absolute inset-0 -z-10 rounded-xl border-4 bg-white/15 backdrop-blur-sm"
					style={{ borderColor: accent }}
				/>
				<h3
					className="font-title text-3xl leading-snug font-bold lg:text-5xl"
					style={{ color: accent }}
				>
					{name}
				</h3>
				<p className="max-w-lg text-lg leading-relaxed text-black lg:text-xl">{description}</p>

				{links.length > 0 && (
					<div className="flex flex-wrap justify-center gap-2" onClick={(e) => e.stopPropagation()}>
						{links.map((link) => {
							const IconComponent = iconMap[link.type.toLowerCase()] || FaGlobe;
							return (
								<a
									key={link.url}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-base font-medium transition-colors duration-200 lg:text-lg"
									style={{ borderColor: accent, color: accent }}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = accent;
										e.currentTarget.style.color = '#fff';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = 'transparent';
										e.currentTarget.style.color = accent;
									}}
								>
									<IconComponent className="h-3.5 w-3.5" />
									<span className="capitalize">{link.type}</span>
								</a>
							);
						})}
					</div>
				)}
			</div>
		</motion.div>
	);
}
