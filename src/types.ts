import type { DocumentReference } from 'firebase/firestore';

export type Entry = {
	startTime: Date,
	endTime: Date,
	comment?: String,
	payMultiplier?: Number,
	basePayAtTime?: Number,
}

export type Job = {
	name: String,
	id: String,
	payPerHour: Number,
	entries: Entry[],
	ownerId: String,
}

export type ClockStatus = {
	clockedIn: Boolean,
	clockedInJob?: String,
	clockInTime?: Date,
}

export type User = {
	jobs: DocumentReference[],
	clockStatus: ClockStatus
}