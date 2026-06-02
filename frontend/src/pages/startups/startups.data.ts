import crumblessImg from '@assets/startups/icons/crumbless.webp';
import doriotImg from '@assets/startups/icons/doriot.webp';
import edubaImg from '@assets/startups/icons/eduba.webp';
import elevatedImg from '@assets/startups/icons/elevated.webp';
import kumaImg from '@assets/startups/icons/kuma.webp';
import lotusdxImg from '@assets/startups/icons/lotusdx.webp';
import melangeImg from '@assets/startups/icons/melange.webp';
import snowshadowImg from '@assets/startups/icons/snowshadow.webp';
import tutorCampusImg from '@assets/startups/icons/tutor-campus.webp';

export interface StartupLink {
	type: string;
	url: string;
}

export interface Startup {
	id: string;
	name: string;
	tagline: string;
	description: string;
	links: StartupLink[];
	accent: string;
	img: string;
}

export const STARTUPS: Startup[] = [
	{
		id: 'elevat-ed',
		name: 'Elevat.Ed',
		tagline: 'Real-world consulting for IB students.',
		description:
			'Connecting international baccalaureate students with real-world consulting projects for NGOs.',
		links: [{ type: 'Website', url: 'https://elevat-ed.co.uk/' }],
		accent: '#26539C',
		img: elevatedImg,
	},
	{
		id: 'kuma',
		name: 'KUMA',
		tagline: 'Preserve the stories that matter.',
		description: 'Preserving family stories with AI-powered memory capture.',
		links: [{ type: 'Website', url: 'https://kumamemories.com/' }],
		accent: '#CD3A23',
		img: kumaImg,
	},
	{
		id: 'crumbless',
		name: 'Crumbless AI',
		tagline: 'No more cookies.',
		description: 'Privacy-first analytics — no more cookie consent banners, no compromises.',
		links: [{ type: 'Website', url: 'https://www.crumbless.ai/' }],
		accent: '#009E85',
		img: crumblessImg,
	},
	{
		id: 'melange',
		name: 'Mélange',
		tagline: 'The social network for creatives.',
		description:
			'A social platform built specifically for creative minds to share, connect, and grow.',
		links: [{ type: 'Website', url: 'https://melangerecords.online/home' }],
		accent: '#1B278A',
		img: melangeImg,
	},
	{
		id: 'doriot',
		name: 'Doriot AI',
		tagline: 'The perfect investor match.',
		description: 'Connecting start-ups with the perfect investors using AI-powered matching.',
		links: [{ type: 'Website', url: 'https://www.doriot.ai/' }],
		accent: '#0087E0',
		img: doriotImg,
	},
	{
		id: 'eduba',
		name: 'Eduba',
		tagline: 'Teachers in control of EdTech.',
		description:
			'Putting teachers back in control — EdTech that serves educators, not the other way around.',
		links: [{ type: 'Website', url: 'https://services.eduba.io/' }],
		accent: '#099CB0',
		img: edubaImg,
	},
	{
		id: 'lotus-dx',
		name: 'Lotus Dx',
		tagline: 'Simple early disease detection.',
		description: 'Driven by a simple question: How simple can early disease detection get?',
		links: [
			{
				type: 'LinkedIn',
				url: 'https://www.linkedin.com/company/lotus-dx/',
			},
		],
		accent: '#E6002B',
		img: lotusdxImg,
	},
	{
		id: 'snow-shadow',
		name: 'Snow Shadow',
		tagline: 'Martial arts, elevated.',
		description:
			'A high-quality, stylish martial arts clothing brand for those who train with intent.',
		links: [
			{
				type: 'Instagram',
				url: 'https://www.instagram.com/snowshadow.fs/?hl=en',
			},
		],
		accent: '#E64069',
		img: snowshadowImg,
	},
	{
		id: 'tutor-campus',
		name: 'Tutor Campus',
		tagline: 'Trusted tutors, online.',
		description:
			'An online tutoring platform connecting learners with trusted tutors for every subject and level.',
		links: [],
		accent: '#0091B3',
		img: tutorCampusImg,
	},
];
