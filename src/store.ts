// import { persist, indexedDBStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';
// import { userJobs } from './db';
// import type { Job } from './types';

export const PunchClockStore = writable({
	currentJob: null,
	user: null,
	page: 'jobs'
});

export const GlobalStore = writable({
	data: {},
});
