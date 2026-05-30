import { type Startup } from './startups.data';

export interface StartupWithSize extends Startup {
	colSpan: number;
	rowSpan: number;
}

const COLS = 3;

type OccupiedSet = Set<string>;

function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function cellKey(r: number, c: number) {
	return `${r},${c}`;
}

function markOccupied(
	occupied: OccupiedSet,
	row: number,
	col: number,
	colSpan: number,
	rowSpan: number,
) {
	for (let r = row; r < row + rowSpan; r++) {
		for (let c = col; c < col + colSpan; c++) {
			occupied.add(cellKey(r, c));
		}
	}
}

function nextFreeCell(occupied: OccupiedSet, fromRow: number, fromCol: number): [number, number] {
	let r = fromRow;
	let c = fromCol;
	while (occupied.has(cellKey(r, c))) {
		c++;
		if (c >= COLS) {
			c = 0;
			r++;
		}
	}
	return [r, c];
}

function freeColsAt(occupied: OccupiedSet, row: number, col: number): number {
	let count = 0;
	for (let c = col; c < COLS; c++) {
		if (occupied.has(cellKey(row, c))) break;
		count++;
	}
	return count;
}

function freeRowsFor(occupied: OccupiedSet, row: number, col: number, colSpan: number): number {
	let count = 0;
	for (let r = row; ; r++) {
		let rowFree = true;
		for (let c = col; c < col + colSpan; c++) {
			if (occupied.has(cellKey(r, c))) {
				rowFree = false;
				break;
			}
		}
		if (!rowFree) break;
		count++;
		if (count >= 2) break;
	}
	return Math.max(count, 1);
}

export function assignSizes(startups: Startup[]): StartupWithSize[] {
	const rng = mulberry32(Math.floor(Math.random() * 1e9));
	const occupied: OccupiedSet = new Set();
	const result: StartupWithSize[] = [];
	let cursor: [number, number] = [0, 0];

	for (let i = 0; i < startups.length; i++) {
		const [row, col] = nextFreeCell(occupied, cursor[0], cursor[1]);
		const availableCols = freeColsAt(occupied, row, col);

		let colSpan: number;
		if (availableCols >= 2 && rng() > 0.35) {
			colSpan = 2;
		} else {
			colSpan = 1;
		}
		const remainder = availableCols - colSpan;
		if (remainder !== 0 && remainder < 1) {
			colSpan = availableCols;
		}

		const rowSpan = freeRowsFor(occupied, row, col, colSpan);

		markOccupied(occupied, row, col, colSpan, rowSpan);
		result.push({ ...startups[i], colSpan, rowSpan });

		cursor = [row, col + colSpan];
		if (cursor[1] >= COLS) cursor = [row + 1, 0];
	}

	return result;
}
