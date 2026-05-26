import homepageBkg from '../../shared/assets/homepage-bkg.jpg';

export function HomePage() {
	return (
		<div className="h-screen w-screen">
			<img
				src={homepageBkg}
				alt="Homepage Background"
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="bg-background/30 absolute inset-0 backdrop-blur-xs" />

			<div className="p-6">
				{Array.from({ length: 200 }).map((_, index) => (
					<h1 key={index}>({index + 1})</h1>
				))}
			</div>
		</div>
	);
}
