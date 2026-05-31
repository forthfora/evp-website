import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa6';
import { type StartupWithSize } from './startups.layout';

interface StartupBlockProps {
	startup: StartupWithSize;
	index: number;
	colWidth: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	instagram: FaInstagram,
	linkedin: FaLinkedin,
	website: FaGlobe,
};

// Column 0 = left (starts at 0), column 1 = right (starts at calc(50% + 10px))
const COL_LEFT: Record<0 | 1, string> = {
	0: '0',
	1: 'calc(50% + 10px)',
};

export function StartupBlock({ startup, index, colWidth }: StartupBlockProps) {
	const { name, tagline, description, links, accent, img, column, top, height } = startup;

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 5) * 0.07 }}
			className="group absolute cursor-default overflow-hidden rounded-xl bg-gray-300"
			style={{
				left: COL_LEFT[column],
				top: `${top}px`,
				width: colWidth,
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
						className="font-title text-shadow-3xl mb-5 text-5xl leading-tight font-bold"
						style={{ color: accent }}
					>
						{name}
					</h2>
					<b className="mt-1 text-2xl text-gray-800 italic">{tagline}</b>
				</div>
			</div>

			{/* Hover state */}
			<div className="absolute inset-0 z-20 flex scale-[0.97] flex-col items-center justify-center gap-5 p-6 text-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
				<div
					className="absolute inset-0 -z-10 rounded-xl border-4 bg-white/15 backdrop-blur-sm"
					style={{ borderColor: accent }}
				/>
				<h3 className="font-title text-5xl leading-snug font-bold" style={{ color: accent }}>
					{name}
				</h3>
				<p className="max-w-lg text-xl leading-relaxed text-black">{description}</p>

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
									className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-lg font-medium transition-colors duration-200"
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
