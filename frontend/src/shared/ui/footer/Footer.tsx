import '../../styles/button-underline.css';

export function Footer() {
	return (
		<footer className="bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
			<div className="max-w-4xl">
				<div className="text-foreground-muted mx-auto max-w-md px-6 py-12 text-lg leading-relaxed">
					<p className="text-md">
						An entrepreneurship and venture capital society at The University of Edinburgh.
					</p>
					<br />
					<p className="text-sm">
						Edinburgh VenturePoint is a member of Scotland's largest tech society,{' '}
						<a
							href="https://comp-soc.com/"
							className="button-underline font-bold underline underline-offset-4"
						>
							CompSoc.
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
