import { Link } from 'react-router';

import { Socials } from '@/components/ui';

export function Footer() {
	return (
		<footer className="bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="text-foreground-muted flex flex-col justify-between gap-6 text-lg leading-relaxed sm:flex-row sm:items-start">
					<div className="max-w-lg">
						<p className="text-md">
							Edinburgh VenturePoint is an entrepreneurship and venture capital society at{' '}
							<a
								href="https://www.ed.ac.uk/"
								target="_blank"
								rel="noopener noreferrer"
								className="button-underline hover:text-foreground font-bold underline underline-offset-4"
							>
								The University of Edinburgh
							</a>
							.
						</p>
						<p className="text-foreground-muted mt-4 text-sm">
							EVP is a registered member of Scotland's largest tech society,{' '}
							<a
								href="https://comp-soc.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="button-underline hover:text-foreground font-bold underline underline-offset-3"
							>
								CompSoc
							</a>
							.
						</p>
						<p className="text-foreground-muted mt-4 text-sm">
							© {new Date().getFullYear()} Edinburgh VenturePoint. All rights reserved.
						</p>
					</div>

					<div className="flex flex-col gap-2 sm:items-end">
						<div className="text-foreground-muted text-sm font-bold tracking-wide uppercase">
							Socials
						</div>

						<div className="self-start md:self-auto">
							<Socials />
						</div>

						<Link
							to="privacy"
							className="button-underline hover:text-foreground mt-2 max-w-xs text-sm font-bold underline underline-offset-3 sm:text-right"
							viewTransition
						>
							Privacy Policy
						</Link>

						<Link
							to="terms"
							className="button-underline hover:text-foreground max-w-xs text-sm font-bold underline underline-offset-3 sm:text-right"
							viewTransition
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
