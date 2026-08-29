import campusXCapital2026Img from '@assets/events/campus-x-capital.webp';
import demoDay2026Img from '@assets/events/demo-day.webp';
import meetUpNight2026Img from '@assets/events/meet-up-night.webp';
import nextGenHack2026Img from '@assets/events/next-gen-hack.webp';

import type { EventStat, EVPEvent } from '../types';

export const EVENTS_STATS: EventStat[] = [
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
		location: 'TBC',
		highlights: [],
		image: meetUpNight2026Img,
		spotStatus: 'coming-soon',
	},
	{
		id: 'campus-x-capital-2026',
		title: 'Campus X Capital',
		date: 'TBC, Semester 1, 26/27',
		location: 'TBC',
		highlights: [],
		image: campusXCapital2026Img,
		spotStatus: 'coming-soon',
	},
];

export const PAST_EVENTS: EVPEvent[] = [
	{
		id: 'sov-ai-launch-2026',
		title: 'SOV AI Launch at STAC',
		date: 'Thursday, 21 May, 2026',
		location: 'STAC The Beyond',
		description:
			"An invitation to the launch of SOV AI at STAC The Beyond, featuring a speech from the SOV AI team, an overview of STAC's offerings, and guest speaker Jim Rowan (former CEO of Volvo and Dyson).",
		spotStatus: 'past',
	},
	{
		id: 'eden-campus-visit-2026',
		title: 'Eden Campus Visit',
		date: 'Tuesday, 14 April, 2026',
		location: 'Eden Campus, University of St Andrews',
		description:
			"A visit to Eden Campus - part of the University of St Andrews' innovation ecosystem with a focus on low-carbon innovation. The campus offers equipment and facilities (including a Rapid Prototyping Centre) that help startups ship their MVP faster, and is a hub for startups working on environmental causes.",
		spotStatus: 'past',
	},
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
			"Exclusive Rewards: Top teams won tech goodies and secured exclusive invitations to an upcoming corporate Insight Event at NatWest Group's Edinburgh headquarters.",
		],
		image: nextGenHack2026Img,
		spotStatus: 'past',
	},
	{
		id: 'apollo-fireside-march-2026',
		title: 'Fireside Chat: Angel Investing & VC Portfolio Construction',
		date: 'Wednesday, 18 March, 2026',
		description:
			'A fireside chat with Michiel Smith and Andrew Coleman from Apollo Informal Investments, Hannah Dent from Old College Capital, and Aidan Brennan on angel investing and venture capital portfolio construction.',
		spotStatus: 'past',
	},
	{
		id: 'apollo-quarterly-meeting-2026',
		title: 'Apollo Informal Investments Quarterly Meeting',
		date: 'Monday, 2 March, 2026',
		description:
			"An opportunity to be part of Apollo Informal Investments' quarterly meeting, where they vote on which startups to invest in.",
		spotStatus: 'past',
	},
	{
		id: 'apollo-fireside-february-2026',
		title: 'Fireside Chat with Andrew Coleman',
		date: 'Thursday, 12 February, 2026',
		description:
			"A fireside chat with Andrew Coleman, Director of Apollo Informal Investments and Honorary Chair of EVP. Discussions and Q&A on the UK's pre-seed & seed startups, Andrew’s investment philosophy, past experiences, and more.",
		spotStatus: 'past',
	},
	{
		id: 'vc-roleplay-2026',
		title: 'Startup Pitch Roleplay',
		date: 'Friday, 6 February, 2026',
		description:
			'Three startups rotated roles - one pitching, one questioning, and one acting as a VC deciding whether to invest. Angels from Apollo Informal Investments and Archangels joined.',
		spotStatus: 'past',
	},
];
