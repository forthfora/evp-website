import '@/styles/button-underline.css';

import { Socials } from '@common';
import { Link } from 'react-router';

export function Footer() {
	return (
		<footer className="bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="text-foreground-muted flex flex-col justify-between gap-6 text-lg leading-relaxed sm:flex-row sm:items-start">
					{/* LEFT BLOCK: General Info */}
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
						<br />
						<p className="text-foreground-muted text-sm">
							EVP is a member of Scotland's largest tech society,{' '}
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
					</div>

					{/* RIGHT BLOCK: Socials & Website Support info */}
					<div className="flex flex-col gap-4 sm:items-end">
						<div className="text-foreground-muted text-sm font-bold tracking-wide uppercase">
							Socials
						</div>

						<div className="self-start md:self-auto">
							<Socials />
						</div>

						<div className="mt-2 max-w-xs text-sm sm:text-right">
							Experiencing issues with the website? <br className="hidden sm:inline" />
							<Link
								to="contact#email"
								className="button-underline hover:text-foreground font-bold underline underline-offset-3"
								viewTransition
							>
								Please report them here.
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
