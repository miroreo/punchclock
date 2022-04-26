import type { Entry } from './types';

export const getTotalHours = (entries: Entry[]): Number => {
	console.log('gettin totals');
	let total = 0;
	entries.forEach((v) => {
		console.log(v.endTime);
		const secondDiff = (v.endTime.getTime() - v.startTime.getTime()) / 1000;
		total += secondDiff / 3600;
	});
	console.log(total);
	return total;
};
