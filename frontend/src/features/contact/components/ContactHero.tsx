import { motion } from 'framer-motion';

import contactImg from '@/assets/homepage/promo-tower.webp';
import { HeroSection, Socials, UnderlinedTitle } from '@/components/ui';

/**
 * Contact page hero: background image + overlay + glow + title + socials.
 * Rendered inside the Contact route page.
 */
export function ContactHero() {
	return (
		<HeroSection image={contactImg} imageAlt="The Scottish flag on a cathedral tower">
			<UnderlinedTitle id="get-in-touch" title="Get in touch" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.15 }}
				className="mx-auto max-w-4xl py-5 text-3xl font-bold italic"
			>
				Whether you're a founder, investor or just curious about what EVP can offer - we'd love to
				hear from you.
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.3 }}
				className="mx-auto max-w-2xl pb-5 text-xl"
			>
				<p className="mb-5">Stay in the loop. Find us on:</p>
				<Socials className="mx-2 h-11 w-11 md:h-9 md:w-9" />
			</motion.div>
		</HeroSection>
	);
}
