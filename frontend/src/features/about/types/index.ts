export type Member = {
	role: string;
	name: string;
	image?: string;
	linkedin?: string;
	email?: string;
	website?: string;
};

export type YearData = {
	year: string;
	members: Member[];
};
