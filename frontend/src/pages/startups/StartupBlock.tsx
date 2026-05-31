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

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.5, ease: 'easeOut', delay: (globalIndex % 9) * 0.08 }}
			className="group relative shrink-0 cursor-default overflow-hidden rounded-xl bg-gray-300"
			style={{
				width,
				height: `${height}px`,
			}}
		>
			{/* Background Image Layer */}
			{img && (
				<div className="absolute inset-0 z-0 overflow-hidden">
					<img
						src={img}
						alt={`${name} background`}
						className="h-full w-full object-cover opacity-25 blur-[5px] transition-all duration-500 will-change-transform group-hover:scale-105 group-hover:blur-sm"
					/>
					<div className="from-foreground/60 to-background/50 absolute inset-0 bg-linear-to-t via-transparent mix-blend-multiply transition-opacity duration-300 group-hover:opacity-40" />
				</div>
			)}

			{/* Default state */}
			<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-6 text-center transition-all duration-300 group-hover:scale-95 group-hover:opacity-0">
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

			{/* Hover state */}
			<div className="absolute inset-0 z-20 flex scale-[0.97] flex-col items-center justify-center gap-5 p-6 text-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
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
					<div className="flex flex-wrap justify-center gap-2">
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
