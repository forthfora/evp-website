import { type Startup } from './startups.data';

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

const HEIGHT_POOL = [400, 450, 550, 600, 500];
const WIDTH_POOL = ['80%', '75%', '85%', '100%', '90%', '95%', '110%', '105%'];

/**
 * Fisher-Yates shuffle to randomize the startups on every refresh.
 */
function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Distributes startups into 3 columns with randomized sizes
 * to create a jagged, clustered outer edge.
 */
export function generateColumns(startups: Startup[]): ColumnLayout {
	const shuffled = shuffleArray(startups);
	const columns: ColumnLayout = { left: [], center: [], right: [] };
	const colKeys: (keyof ColumnLayout)[] = ['left', 'center', 'right'];

	shuffled.forEach((startup, i) => {
		const colIndex = i % 3; // Distribute evenly across the 3 columns

		const height = HEIGHT_POOL[Math.floor(Math.random() * HEIGHT_POOL.length)];

		// The center column acts as the "anchor" and should stay mostly full width.
		// The outer columns get random widths to create the jagged edges.
		let width = WIDTH_POOL[Math.floor(Math.random() * WIDTH_POOL.length)];
		if (colIndex === 1 && Math.random() > 0.3) {
			width = '100%';
		}

		columns[colKeys[colIndex]].push({
			...startup,
			height,
			width,
			globalIndex: i,
		});
	});

	return columns;
}
