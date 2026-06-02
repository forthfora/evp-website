import '@/shared/styles/button-underline.css';

import { Mail } from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

interface SocialsProps {
	className?: string;
}

export function Socials({ className = 'h-8 w-8 md:h-6 md:w-6' }: SocialsProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div className="flex flex-row items-center gap-4">
				<a
					href="https://www.linkedin.com/company/edinburghventurepoint/"
					target="_blank"
					rel="noopener noreferrer"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="LinkedIn"
				>
					<FaLinkedin className={className} />
				</a>

				<a
					href="https://www.instagram.com/edinburghventurepoint/"
					target="_blank"
					rel="noopener noreferrer"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="Instagram"
				>
					<FaInstagram className={className} />
				</a>

				<Link
					to="/contact#email"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="Email"
					viewTransition
				>
					<Mail className={className} />
				</Link>
			</div>
		</div>
	);
}
