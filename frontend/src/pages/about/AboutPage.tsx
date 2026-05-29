export function AboutPage() {
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-50">
			{/* Header Text */}
			<div className="flex flex-col items-center">
				<h1 className="text-5xl font-bold">about us</h1>
				<div className="text-foreground-muted my-4 w-100 border text-center" />
			</div>

			{/* Paragraphs */}
			<p className="mx-auto max-w-4xl py-5 text-center text-3xl font-bold">
				We’re a community of the boldest founders and innovators at The University of Edinburgh and
				across Scotland.
			</p>
		</div>
	);
}
