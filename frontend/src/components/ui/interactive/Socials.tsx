import { Mail } from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { Link } from 'react-router';

interface SocialsProps {
	className?: string;
}

/**
 * Represents list of clickable social icons used throughout the site (LinkedIn, Instagram, etc.)
 */
export function Socials({ className = 'h-6 w-6 md:h-5 md:w-5' }: SocialsProps) {
	const linkClass =
		'button-underline flex cursor-pointer items-center justify-center p-2 hover:text-foreground transition-colors';

	return (
		<div className="flex flex-row items-center justify-center gap-2">
			<a
				href="https://www.linkedin.com/company/edinburghventurepoint/"
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
				aria-label="LinkedIn"
				title="LinkedIn"
			>
				<FaLinkedin className={className} />
			</a>

			<a
				href="https://www.instagram.com/edinburghventurepoint/"
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
				aria-label="Instagram"
				title="Instagram"
			>
				<FaInstagram className={className} />
			</a>

			<Link
				to="/contact#email"
				className={linkClass}
				aria-label="Email"
				title="Email"
				viewTransition
			>
				<Mail className={className} />
			</Link>
		</div>
	);
}
