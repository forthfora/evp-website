/**
 * The radial-gradient "glow" overlay used to softly blend a hero background
 * image into the page background colour.
 *
 * Usage:
 *   <div className="relative">
 *     <img … />
 *     <RadialGlowOverlay />
 *   </div>
 */
export function RadialGlowOverlay({ className = '' }: { className?: string }) {
	return (
		<div
			className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
		>
			<div
				className="bg-background h-150 w-full md:h-200"
				style={{
					maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 5%, rgba(0,0,0,0) 70%)',
					WebkitMaskImage:
						'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
				}}
			/>
		</div>
	);
}
