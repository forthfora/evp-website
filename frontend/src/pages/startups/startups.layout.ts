import { type Startup } from './startups.data';

export interface StartupWithSize extends Startup {
	column: 0 | 1;
	top: number; // px offset within its column
	height: number; // px
}

function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const HEIGHT_POOL = [350, 400, 500, 550, 650, 750, 800];

const GAP = 14;
const RIGHT_COL_OFFSET = 130; // px — right col starts lower for diagonal silhouette

/**
 * Two-column masonry with strongly varied block heights.
 *
 * To avoid two similar-height blocks ending up side-by-side (which looks
 * uniform), we track the last height used in each column and pick a height
 * from a different "band" (short / medium / tall) each time.
 */
export function assignSizes(startups: Startup[]): StartupWithSize[] {
	const rng = mulberry32(42);

	const SHORT = HEIGHT_POOL.slice(0, 2); // 140–160
	const MEDIUM = HEIGHT_POOL.slice(2, 4); // 200–220
	const TALL = HEIGHT_POOL.slice(4); // 260–320

	const BANDS = [SHORT, MEDIUM, TALL];

	function pickHeight(lastHeight: number): number {
		// Which band was the last height in?
		const lastBandIdx = BANDS.findIndex((b) => b.includes(lastHeight));
		// Pick a different band (weighted toward not repeating)
		let bandIdx: number;
		const r = rng();
		if (lastBandIdx === 0) bandIdx = r < 0.5 ? 1 : 2;
		else if (lastBandIdx === 1) bandIdx = r < 0.5 ? 0 : 2;
		else bandIdx = r < 0.5 ? 0 : 1;
		const band = BANDS[bandIdx];
		return band[Math.floor(rng() * band.length)];
	}

	const colHeights = [0, RIGHT_COL_OFFSET];
	const lastHeights = [HEIGHT_POOL[2], HEIGHT_POOL[4]]; // seed with different bands

	const result: StartupWithSize[] = [];

	for (const startup of startups) {
		// Shortest column gets the next block
		const column = (colHeights[0] <= colHeights[1] ? 0 : 1) as 0 | 1;
		const height = pickHeight(lastHeights[column]);
		const top = colHeights[column];

		result.push({ ...startup, column, top, height });

		lastHeights[column] = height;
		colHeights[column] += height + GAP;
	}

	return result;
}

export function computeContainerHeight(startups: StartupWithSize[]): number {
	if (!startups.length) return 0;
	return Math.max(...startups.map((s) => s.top + s.height)) + GAP;
}
