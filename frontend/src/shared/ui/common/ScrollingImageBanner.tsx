import { useEffect, useRef } from 'react';

interface ScrollingImageBannerProps {
	images: { src: string; alt: string }[];
	speed?: number;
	heightClass?: string;
	className?: string;
}

export function ScrollingImageBanner({
	images = [],
	speed = 60,
	heightClass = 'h-64',
	className = '',
}: ScrollingImageBannerProps) {
	// 1. Double the images to create the infinite scroll illusion
	const doubled = [...images, ...images];
	const duration = (images.length * 320) / speed;
	const trackRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					// Force a reflow to restart the animation from the beginning
					track.style.animation = 'none';
					void track.offsetHeight; // trigger reflow
					track.style.animation = `scroll-left ${duration}s linear infinite`;
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(track);
		return () => observer.disconnect();
	}, [duration]);

	return (
		<div className={`w-full overflow-hidden ${className}`}>
			<div ref={trackRef} className="flex gap-4" style={{ width: 'max-content' }}>
				{doubled.map((img, i) => (
					<img
						key={i}
						src={img.src}
						alt={img.alt}
						className={`${heightClass} w-auto shrink-0 rounded-lg object-cover shadow-lg`}
						style={{
							viewTransitionName: `banner-image-${i}`,
						}}
					/>
				))}
			</div>
		</div>
	);
}
