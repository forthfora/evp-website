import campusXCapital2026Img from '@assets/events/campus-x-capital.webp';
import demoDay2026Img from '@assets/events/demo-day.webp';
import meetUpNight2026Img from '@assets/events/meet-up-night.webp';
import nextGenHack2026Img from '@assets/events/next-gen-hack.webp';

export type EventSpotStatus =
	| 'available' // Show reserve button
	| 'sold-out' // Full - button disabled/labelled
	| 'past' // Event has ended - no button
	| 'coming-soon'; // Registration not yet open

export interface EVPEvent {
	id: string;
	title: string;
	date: string; // e.g. "14 August 2025"
	time?: string; // e.g. "6:30 PM"
	location?: string;
	description?: string;
	highlights?: string[]; // Optional bullet points
	image?: string;
	spotStatus?: EventSpotStatus;
	reserveUrl?: string;
}

export const EVENTS_STATS = [
	{ value: 10, suffix: '+', label: 'Events' },
	{ value: 100, suffix: '+', label: 'Members' },
	{ value: 20, suffix: '+', label: 'Speakers' },
	{ value: 2, suffix: '', label: 'Years running' },
];

export const UPCOMING_EVENTS: EVPEvent[] = [
	{
		id: 'meet-up-night-2026',
		title: 'Meet Up Night',
		date: 'TBC, Semester 1, 26/27',
		// time: 'TBC',
		location: 'TBC',
		// description: '...',
		highlights: [],
		image: meetUpNight2026Img,
		spotStatus: 'coming-soon',
	},
	{
		id: 'campus-x-capital-2026',
		title: 'Campus X Capital',
		date: 'TBC, Semester 1, 26/27',
		// time: 'TBC',
		location: 'TBC',
		// description: '...',
		highlights: [],
		image: campusXCapital2026Img,
		spotStatus: 'coming-soon',
	},
];

export const PAST_EVENTS: EVPEvent[] = [
	{
		id: 'demo-day-2026',
		title: 'Demo Day',
		date: 'Friday, 27 March, 2026',
		time: '4:00PM',
		location: 'Edinburgh Futures Institute, EH3 9EF',
		description:
			"Our annual flagship event brought together Edinburgh's brightest early-stage student startups for an unforgettable evening of high-stakes pitching.",
		highlights: [
			'Live Pitching & Funding: Student finalists went head-to-head, pitching live to real investors for crucial early-stage backing.',
			'Elite Networking: Founders, local tech leaders, and angel investors connected over food and drinks to spark future collaborations.',
			'Next-Gen Innovation: Showcased a diverse lineup of student-led ventures tackling real-world challenges across multiple industries.',
		],
		image: demoDay2026Img,
		spotStatus: 'past',
	},
	{
		id: 'next-gen-hack-2026',
		title: 'NextGenHack',
		date: 'Saturday, 21 March, 2026',
		location: 'Business School, University of Edinburgh',
		description:
			'Hosted in partnership with NatWest Group, Google Cloud, and ECFI, NextGenHack was a high-energy, fast-paced hackathon where students tackled real-world banking challenges using responsible technology.',
		highlights: [
			'Three Critical Themes: Teams designed cutting-edge solutions for fraud detection, ethical banking & financial inclusion, and AI-powered customer experiences.',
			'Industry Mentorship & Networking: Students received direct guidance from NatWest and Google Cloud experts, accelerating their ideas from brainstorming to rapid prototyping.',
			'Exclusive Rewards: Top teams won tech goodies and secured exclusive invitations to an upcoming corporate Insight Event at NatWest Group’s Edinburgh headquarters.',
		],
		image: nextGenHack2026Img,
		spotStatus: 'past',
	},
];
