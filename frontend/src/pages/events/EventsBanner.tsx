import { ScrollingImageBanner } from '../../shared/ui/common/ScrollingImageBanner';

import eventsImg1 from '../../shared/assets/homepage/events-banner/event-1.webp';
import eventsImg2 from '../../shared/assets/homepage/events-banner/event-2.webp';
import eventsImg3 from '../../shared/assets/homepage/events-banner/event-3.webp';

const eventImages = [
	{ src: eventsImg1, alt: 'Students collaborating' },
	{ src: eventsImg2, alt: 'Workshop session' },
	{ src: eventsImg3, alt: 'Networking event' },
];

export function EventsBanner() {
	return (
		<ScrollingImageBanner images={eventImages} speed={25} heightClass="h-80" className="w-full" />
	);
}
