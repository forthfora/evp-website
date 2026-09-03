/**
 * Animated gradient blobs for use as backgrounds behind interactive elements.
 * Used by InteractiveLinkButton and the Startups Page "You?" CTA card.
 */
export function BlobBackground() {
	return (
		<>
			<span className="animate-blob1 pointer-events-none absolute -top-4 -left-4 h-16 w-16 rounded-full bg-[#8b85fa] opacity-70 blur-xl" />
			<span className="animate-blob2 pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-[#c084fc] opacity-60 blur-xl" />
			<span className="animate-blob3 pointer-events-none absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b85fa] opacity-50 blur-lg" />
		</>
	);
}
