import { UnderlinedTitle } from '@common';
import { motion } from 'framer-motion';

import { PARTNERS } from '../constants/partners';
import { PartnerBlock } from './PartnerBlock';

export function PartnersSection() {
	return (
		<section className="mx-auto mt-10 flex w-full flex-col gap-12 pt-30">
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 1 }}
				transition={{ duration: 0.5, ease: 'easeIn', delay: 0.5 }}
				className="max-w-4xl text-center text-5xl md:mx-auto"
			>
				<UnderlinedTitle
					id="our-partners"
					navLabel="Our Partners"
					title="Powered by our partners."
					size="text-5xl"
					level={2}
				/>
			</motion.div>

			{/* Partner blocks in frosted glass container */}
			<div className="glass-box mx-auto w-full">
				<div className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-x-6 gap-y-16 px-4 py-24">
					{PARTNERS.map((partner, index) => (
						<PartnerBlock key={partner.id} partner={partner} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
