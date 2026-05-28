import '../../styles/button-underline.css';
import { FaInstagram, FaLinkedin } from 'react-icons/fa6';

export function Footer() {
	return (
		<footer className="bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="text-foreground-muted flex flex-col justify-between gap-6 text-lg leading-relaxed sm:flex-row sm:items-start">
					{/* LEFT BLOCK: General Info */}
					<div className="max-w-lg">
						<p className="text-md">
							Edinburgh VenturePoint is an entrepreneurship and venture capital society at The
							University of Edinburgh.
						</p>
						<br />
						<p className="text-foreground-muted text-sm">
							EVP is a member of Scotland's largest tech society,{' '}
							<a
								href="https://comp-soc.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="button-underline font-bold underline underline-offset-4"
							>
								CompSoc.
							</a>
						</p>
					</div>

					{/* RIGHT BLOCK: Socials & Website Support info */}
					<div className="flex flex-col gap-4 sm:items-end">
						{/* Socials Group */}
						<div className="flex flex-col gap-2 sm:items-end">
							<div className="text-foreground-muted text-sm font-bold tracking-wide uppercase">
								Socials
							</div>
							<div className="flex flex-row items-center gap-4">
								<a
									href="https://www.linkedin.com/company/edinburghventurepoint/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-foreground transition-colors duration-200"
									aria-label="LinkedIn"
								>
									<FaLinkedin size={20} />
								</a>

								<a
									href="https://www.instagram.com/edinburghventurepoint/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-foreground transition-colors duration-200"
									aria-label="Instagram"
								>
									<FaInstagram size={20} />
								</a>
							</div>
						</div>

						<div className="mt-2 max-w-xs text-sm sm:text-right">
							Issues with the website itself? <br className="hidden sm:inline" />
							<a
								href="mailto:s2787162@ed.ac.uk"
								className="button-underline font-bold underline underline-offset-3"
							>
								Contact the developer here.
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
