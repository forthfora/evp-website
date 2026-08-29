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

export interface EventStat {
	value: number;
	suffix: string;
	label: string;
}
