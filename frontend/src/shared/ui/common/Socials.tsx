import { Mail } from 'lucide-react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa6';

import '../../styles/button-underline.css';

export function Socials() {
	return (
		<div className="flex flex-col gap-2 sm:items-end">
			<div className="flex flex-row items-center gap-4">
				<a
					href="https://www.linkedin.com/company/edinburghventurepoint/"
					target="_blank"
					rel="noopener noreferrer"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="LinkedIn"
				>
					<FaLinkedin size={20} />
				</a>

				<a
					href="https://www.instagram.com/edinburghventurepoint/"
					target="_blank"
					rel="noopener noreferrer"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="Instagram"
				>
					<FaInstagram size={20} />
				</a>

				<a
					href="mailto:edinburghventurepoint@gmail.com"
					className="button-underline hover:text-foreground transition-colors duration-200"
					aria-label="Email"
				>
					<Mail size={20} />
				</a>
			</div>
		</div>
	);
}
