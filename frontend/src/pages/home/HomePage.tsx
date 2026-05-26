export function HomePage() {
	return (
		<div className="p-6">
			{Array.from({ length: 100 }).map((_, index) => (
				<h1 key={index}>Hello World! ({index + 1})</h1>
			))}
		</div>
	);
}
