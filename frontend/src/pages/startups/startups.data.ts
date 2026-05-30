export interface StartupLink {
	label: string;
	url: string;
	icon: string;
}

export interface Startup {
	id: string;
	name: string;
	tagline: string;
	description: string;
	links: StartupLink[];
	accent: string;
}

export const STARTUPS: Startup[] = [
	{
		id: 'elevat-ed',
		name: 'Elevat.Ed',
		tagline: 'Real-world consulting for IB students.',
		description:
			'Connecting international baccalaureate students with real-world consulting projects for NGOs.',
		links: [{ label: 'Website', url: 'https://elevat-ed.co.uk/', icon: 'ti-world' }],
		accent: '#4F7CFF',
	},
	{
		id: 'kuma',
		name: 'KUMA',
		tagline: 'Preserve the stories that matter.',
		description: 'Preserving family stories with AI-powered memory capture.',
		links: [{ label: 'Website', url: 'https://kumamemories.com/', icon: 'ti-world' }],
		accent: '#E06B5A',
	},
	{
		id: 'crumbless',
		name: 'Crumbless AI',
		tagline: 'No more cookies.',
		description: 'Privacy-first analytics — no more cookie consent banners, no compromises.',
		links: [{ label: 'Website', url: 'https://www.crumbless.ai/', icon: 'ti-world' }],
		accent: '#27A96C',
	},
	{
		id: 'melange',
		name: 'Mélange',
		tagline: 'The social network for creatives.',
		description: 'A social platform built specifically for creative minds to share, connect, and grow.',
		links: [{ label: 'Website', url: 'https://melangerecords.online/home', icon: 'ti-world' }],
		accent: '#C05FD8',
	},
	{
		id: 'doriot',
		name: 'Doriot AI',
		tagline: 'The perfect investor match.',
		description: 'Connecting start-ups with the perfect investors using AI-powered matching.',
		links: [{ label: 'Website', url: 'https://www.doriot.ai/', icon: 'ti-world' }],
		accent: '#F5A623',
	},
	{
		id: 'eduba',
		name: 'Eduba',
		tagline: 'Teachers in control of EdTech.',
		description:
			'Putting teachers back in control — EdTech that serves educators, not the other way around.',
		links: [{ label: 'Website', url: 'https://services.eduba.io/', icon: 'ti-world' }],
		accent: '#1ABCCA',
	},
	{
		id: 'lotus-dx',
		name: 'Lotus Dx',
		tagline: 'Simple early disease detection.',
		description: 'Driven by a simple question: How simple can early disease detection get?',
		links: [
			{
				label: 'LinkedIn',
				url: 'https://www.linkedin.com/company/lotus-dx/',
				icon: 'ti-brand-linkedin',
			},
		],
		accent: '#E84D8A',
	},
	{
		id: 'snow-shadow',
		name: 'Snow Shadow',
		tagline: 'Martial arts, elevated.',
		description:
			'A high-quality, stylish martial arts clothing brand for those who train with intent.',
		links: [
			{
				label: 'Instagram',
				url: 'https://www.instagram.com/snowshadow.fs/?hl=en',
				icon: 'ti-brand-instagram',
			},
		],
		accent: '#6B7B99',
	},
	{
		id: 'tutor-campus',
		name: 'Tutor Campus',
		tagline: 'Trusted tutors, online.',
		description:
			'An online tutoring platform connecting learners with trusted tutors for every subject and level.',
		links: [],
		accent: '#3DAF7A',
	},
];
