import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

interface HeadingData {
	id: string;
	text: string;
}

interface ScrollSpyProps {
	fadeThreshold?: number; // How many pixels to scroll before fading in
}

export function ScrollSpy({ fadeThreshold = 450 }: ScrollSpyProps = {}) {
	const [headings, setHeadings] = useState<HeadingData[]>([]);
	const [activeId, setActiveId] = useState<string>('');
	const [activeProgress, setActiveProgress] = useState(0);

	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const updateHeadings = () => {
			const elements = Array.from(
				document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'),
			);

			const newHeadings = elements.map((el) => ({
				id: el.id,
				// Check for custom data attribute first, fallback to textContent, then ID
				text: el.getAttribute('data-nav-label') || el.textContent || el.id,
			}));

			setHeadings((prev) =>
				JSON.stringify(prev) === JSON.stringify(newHeadings) ? prev : newHeadings,
			);
		};

		updateHeadings();

		const observer = new MutationObserver(updateHeadings);
		observer.observe(document.body, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, []);

	const handleScroll = useCallback(() => {
		// Check general scroll visibility independent of headings
		setIsVisible(window.scrollY > fadeThreshold);

		const headingElements = headings
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => el !== null);

		if (headingElements.length === 0) return;

		const threshold = window.innerHeight / 3;
		let currentActiveIdx = 0;

		// Find the current active section index
		for (let i = 0; i < headingElements.length; i++) {
			const rect = headingElements[i].getBoundingClientRect();
			if (rect.top <= threshold) {
				currentActiveIdx = i;
			}
		}

		setActiveId(headingElements[currentActiveIdx].id);

		// Calculate percentage filled for the active section's connecting line
		if (currentActiveIdx < headingElements.length - 1) {
			const currentEl = headingElements[currentActiveIdx];
			const nextEl = headingElements[currentActiveIdx + 1];

			const currentTop = currentEl.getBoundingClientRect().top;
			const nextTop = nextEl.getBoundingClientRect().top;

			const totalDistance = nextTop - currentTop;
			const scrolledPast = threshold - currentTop;

			// Ensure progress stays strictly between 0 and 1
			const progress = Math.max(0, Math.min(1, scrolledPast / totalDistance));
			setActiveProgress(progress);
		} else {
			setActiveProgress(1); // Bottom reached
		}
	}, [headings, fadeThreshold]);

	useEffect(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Defer the initial check to run immediately after mounting commits
		const frameId = requestAnimationFrame(() => {
			handleScroll();
		});

		return () => {
			window.removeEventListener('scroll', handleScroll);
			cancelAnimationFrame(frameId);
		};
	}, [handleScroll]);

	if (headings.length === 0) return null;

	const activeIndex = headings.findIndex((h) => h.id === activeId);

	return (
		<motion.nav
			initial={{ opacity: 0, x: -50 }}
			animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
			transition={{ duration: 0.3 }}
			className={`fixed top-1/2 left-8 z-50 hidden -translate-y-1/2 flex-col lg:flex ${
				isVisible ? 'pointer-events-auto' : 'pointer-events-none'
			}`}
		>
			{headings.map((heading, index) => {
				const isPassed = index < activeIndex;
				const isActive = index === activeIndex;
				const isLast = index === headings.length - 1;

				// Determine height percentage for the connecting line
				let fillPercentage = 0;
				if (isPassed) fillPercentage = 100;
				if (isActive) fillPercentage = activeProgress * 100;

				return (
					<div key={heading.id} className="group relative flex flex-col">
						<div className="pointer-events-none absolute -inset-1 rounded-md transition-all duration-300">
							<div
								className="bg-background-muted h-10 py-7"
								style={{
									maskImage:
										'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
									WebkitMaskImage:
										'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
								}}
							/>
						</div>

						{/* Node Row */}
						<div
							className="relative flex cursor-pointer items-center gap-2"
							onClick={() => {
								document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
							}}
						>
							{/* Dot */}
							<motion.div
								layout
								className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
									isActive || isPassed ? 'bg-accent' : 'border-foreground border-2 bg-transparent'
								}`}
							/>

							<span
								className={`text-shadow-3xl z-10 max-w-38 rounded-lg px-3 py-1.5 text-lg tracking-wide transition-all duration-300 ${
									isActive
										? 'text-accent font-bold'
										: 'font-md text-foreground group-hover:text-accent'
								}`}
							>
								{heading.text}
							</span>
						</div>

						{/* Connecting Line (Hidden on last item) */}
						{!isLast && (
							<div className="relative flex h-16 w-3.5 justify-center">
								<div className="bg-foreground-muted relative h-full w-0.5 overflow-hidden">
									<div
										className="bg-accent absolute top-0 left-0 w-full"
										style={{ height: `${fillPercentage}%` }}
									/>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</motion.nav>
	);
}
