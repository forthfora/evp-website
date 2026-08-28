import apolloImg from '@assets/startups/partner-icons/apollo.webp';
import googleCloudImg from '@assets/startups/partner-icons/google-cloud.webp';
import natwestImg from '@assets/startups/partner-icons/natwest.webp';
import youngEdgeImg from '@assets/startups/partner-icons/young-edge.webp';

export interface Partner {
	id: string;
	name: string;
	img: string;
}

export const PARTNERS: Partner[] = [
	{
		id: 'young-edge',
		name: 'Young EDGE',
		img: youngEdgeImg,
	},
	{
		id: 'google-cloud',
		name: 'Google Cloud',
		img: googleCloudImg,
	},
	{
		id: 'natwest',
		name: 'NatWest',
		img: natwestImg,
	},
	{
		id: 'apollo-informal-investments',
		name: 'Apollo Informal Investments',
		img: apolloImg,
	},
];
