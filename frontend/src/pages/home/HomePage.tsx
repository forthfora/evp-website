import homepageBkg from '../../shared/assets/homepage-bkg.jpg';

export function HomePage() {
	return (
		<div className="flex w-full flex-col">
			{/* Hero */}
			<div className="relative h-screen w-full shrink-0">
				<img
					src={homepageBkg}
					alt="Homepage Background"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="bg-background/30 absolute inset-0 backdrop-blur-[2px]" />
			</div>

			{/* Text */}
			<div className="mx-auto w-full max-w-6xl">
				{Array.from({ length: 200 }).map((_, index) => (
					<h1 key={index}>({index + 1})</h1>
				))}
			</div>
		</div>
	);
}
