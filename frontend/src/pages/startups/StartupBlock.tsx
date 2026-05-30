import { type StartupWithSize } from './startups.layout';
import { motion } from 'framer-motion';

interface StartupBlockProps {
	startup: StartupWithSize;
	index: number;
}

export function StartupBlock({ startup, index }: StartupBlockProps) {
	const { name, tagline, description, links, accent, colSpan, rowSpan } = startup;

	const initials = name
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();

	const gridStyle: React.CSSProperties = {
		gridColumn: `span ${colSpan}`,
		gridRow: `span ${rowSpan}`,
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 5) * 0.07 }}
			style={gridStyle}
			className="group relative cursor-default overflow-hidden rounded-xl"
		>
			{/* Default state — solid accent fill */}
			<div
				className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center transition-all duration-300 group-hover:scale-95 group-hover:opacity-0"
				style={{ background: accent }}
			>
				<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold tracking-wide text-white">
					{initials}
				</div>
				<div>
					<h3 className="text-5xl leading-tight font-bold text-white">{name}</h3>
					<p className="mt-1 text-xl text-white/70">{tagline}</p>
				</div>
			</div>

			{/* Hover state */}
			<div className="border-border/30 bg-background-muted absolute inset-0 flex scale-[0.97] flex-col items-center justify-center gap-5 rounded-xl border p-6 text-center opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
				<h3 className="text-5xl leading-snug font-bold" style={{ color: accent }}>
					{name}
				</h3>
				<p className="text-foreground max-w-lg text-xl leading-relaxed">{description}</p>

				{links.length > 0 && (
					<div className="flex flex-wrap justify-center gap-2">
						{links.map((link) => (
							<a
								key={link.url}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200"
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
								<i className={`${link.icon} text-sm`} aria-hidden="true" />
								{link.label}
							</a>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
}
