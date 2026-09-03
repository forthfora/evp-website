import type { ReactNode } from 'react';

import offerImg1 from '@/assets/contact/offer-1.webp';
import offerImg2 from '@/assets/contact/offer-2.webp';
import offerImg3 from '@/assets/contact/offer-3.webp';
import { PromoCard } from '@/components/ui';

/**
 * Three glass promo cards showcasing EVP's offerings (angel syndicates,
 * exclusive programmes, top tech societies). Used on the Contact page.
 */
export function OfferCardsSection() {
	const cards: { img: string; title: string; body: ReactNode }[] = [
		{
			img: offerImg1,
			title: 'Angel Syndicates',
			body: (
				<p>
					We have close relationships with some of the oldest and most established angel syndicates
					in the world.
				</p>
			),
		},
		{
			img: offerImg2,
			title: 'Exclusive Programmes',
			body: (
				<p>
					We work with accelerators, government-funded programs, and others to provide student
					founders with opportunities to grow their businesses
				</p>
			),
		},
		{
			img: offerImg3,
			title: 'Top Tech Societies',
			body: (
				<p>
					We are a CompSoc Special Interest Group. Our members have access to everything the largest
					computer science society in Scotland has to offer.
				</p>
			),
		},
	];

	return (
		<section className="w-full pt-25">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-10 overflow-x-hidden p-4 md:flex-row md:items-start">
				{cards.map(({ img, title, body }, i) => (
					<PromoCard
						key={i}
						image={img}
						title={title}
						body={body}
						index={i}
						className="min-h-200"
					/>
				))}
			</div>
		</section>
	);
}
