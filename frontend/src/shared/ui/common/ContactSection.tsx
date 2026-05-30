import { motion } from 'framer-motion';

import InteractiveContactButton from './InteractiveContactButton';
import { SectionDivider } from './SectionDivider';

interface ContactSectionProps {
	image: string;
	imageAlt?: string;
	/** Main heading text. */
	heading: string;
	/** One or two lines of body copy rendered as <p> tags. */
	body: string[];
	/** Extra Tailwind classes on the outer <section>. */
	className?: string;
}

/**
 * Full-bleed image section with a centred CTA.
 * Replaces the duplicated `contactSection()` in HomePage and AboutPage.
 */
export function ContactSection({
	image,
	imageAlt = '',
	heading,
	body,
	className = '',
}: ContactSectionProps) {
	return (
		<section className={`relative w-full pb-30 ${className}`}>
			<div className="relative w-full">
				<img
					src={image}
					alt={imageAlt}
					className="mx-auto h-150 w-full object-cover object-[50%_5%] shadow-2xl"
				/>

				{/* Soft background glow */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden pb-50">
					<div
						className="bg-background h-150 w-full max-w-3xl md:h-150 md:max-w-7xl"
						style={{
							maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)',
							WebkitMaskImage:
								'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
						}}
					/>
				</div>

				<div className="bg-background/40 absolute inset-0 z-10" />

				<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pb-20">
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-150px' }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
						className="text-center"
					>
						<h1 className="pt-10 pb-5 text-5xl font-bold">{heading}</h1>
						{body.map((line, i) => (
							<p key={i} className="mx-auto max-w-2xl py-5 text-xl">
								{line}
							</p>
						))}
					</motion.div>

					<SectionDivider my="my-10 mb-20" />

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-150px' }}
						transition={{ duration: 0.5, ease: 'easeIn' }}
					>
						<InteractiveContactButton />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
