import { InteractiveLinkButton } from '../InteractiveLinkButton';

/**
 * Large, interactive contact button. Takes the user to the email contact section.
 */
export function InteractiveContactButton() {
	return (
		<div className="mx-auto inline-block">
			<InteractiveLinkButton to="/contact" className="px-30 py-4 text-2xl md:text-4xl">
				Reach out
			</InteractiveLinkButton>
		</div>
	);
}
