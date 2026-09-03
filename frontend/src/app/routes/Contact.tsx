import networkImg from '@/assets/contact/promo-network.webp';
import scoutImg from '@/assets/contact/promo-scout.webp';
import { SectionDivider, UnderlinedTitle } from '@/components/ui';
import { MediaTextSection } from '@/components/ui/section/MediaTextSection';
import { ContactFormSection, ContactHero, OfferCardsSection } from '@/features/contact';

export default function Contact() {
	return (
		<div className="flex w-full flex-col">
			<ContactHero />

			<section className="py-10 pt-50">
				<UnderlinedTitle title="What we offer" delay={0.5} level={2} />

				<div className="glass-box my-20 w-full overflow-hidden py-25 md:py-40">
					<MediaTextSection
						image={scoutImg}
						imageAlt="A group photo with several members of EVP's committee"
						reverse
					>
						<h2 id="scout-programme" className="text-4xl font-bold md:text-5xl">
							The Scout Programme
						</h2>
						<SectionDivider width="w-75 md:w-100" my="my-2" />
						<b className="text-lg md:text-xl">
							Each semester, EVP handpicks a few student 'venture scouts' following a vetted
							application process.
						</b>
						<p className="text-lg md:text-xl">
							Scouts are tasked with identifying and evaluating the most promising student-led
							start-ups across Scotland.
						</p>
						<p>
							Scouts produce investment memoranda on the most promising start-ups they identify,
							which are shared with our wider investor network at our annual Demo Day.
						</p>
						<p>
							Scouts gain access to free educational sessions with real early-stage investors,
							experiences at exclusive investment meetings, and much more!
						</p>
					</MediaTextSection>
				</div>

				<div className="glass-box my-10 mt-40 w-full overflow-hidden py-25 md:py-40">
					<MediaTextSection
						image={networkImg}
						imageAlt="A group photo with several members of EVP's committee"
					>
						<h2 id="network" className="text-4xl font-bold md:text-5xl">
							Our network
						</h2>
						<SectionDivider width="w-75 md:w-100" my="my-2" />
						<b className="text-lg md:text-xl">
							Angel syndicates, accelerators, venture capital funds, industry luminaries, and more.
						</b>
						<p className="text-lg md:text-xl">
							We provide access to exclusive accelerator pipelines and government-backed programmes
							designed to scale student ventures from idea to execution.
						</p>
						<p>
							As part of CompSoc, EVP has unparalleled access to Edinburgh's top technical talent,
							for those looking to collaborate on groundbreaking projects, find elite co-founders,
							and bring ambitious ideas to life.
						</p>
					</MediaTextSection>
				</div>

				<OfferCardsSection />
			</section>

			<div className="mx-auto flex w-full flex-col gap-20 py-30">
				<ContactFormSection />
			</div>
		</div>
	);
}
