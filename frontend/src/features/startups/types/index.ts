export interface Partner {
	id: string;
	name: string;
	img: string;
}

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

export interface StartupWithSize extends Startup {
	width: string;
	height: number;
	globalIndex: number;
}

export interface ColumnLayout {
	left: StartupWithSize[];
	center: StartupWithSize[];
	right: StartupWithSize[];
}
