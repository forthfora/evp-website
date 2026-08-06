import '@/shared/styles/button-underline.css';

import { Share2 } from 'lucide-react';

export function ShareButton() {
	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: document.title,
					url: window.location.href,
				});
				return;
			} catch (err) {
				// Fall back to clipboard if user cancels native share
			}
		}

		try {
			await navigator.clipboard.writeText(window.location.href);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	};

	return (
		<button
			onClick={handleShare}
			className="button-underline flex cursor-pointer items-center justify-center border-none bg-transparent p-2"
			aria-label="Share page"
			title="Share"
		>
			<span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden md:h-5 md:w-5">
				<Share2 className="h-6 w-6 md:h-5 md:w-5" />
			</span>
		</button>
	);
}
