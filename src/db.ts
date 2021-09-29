import { app, auth, firestore } from './firebase';
import { getDoc, addDoc, doc, collection, DocumentReference, setDoc, DocumentSnapshot, updateDoc, query, where } from 'firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { startWith } from 'rxjs/operators';
import type { ClockStatus, Job, User, Entry } from './types';
import { genUUID } from './utils';
import { PunchClockStore } from './store';
/**
 * Firestore is a TEMPORARY solution.
 * API hopefully to come via vercel or something
 */

const jobConverter = {
	toFirestore: (job: Job) => {
		return job;
	},
	fromFirestore: (data): Job => {
		let job = data.data();
		console.log(job);
		const outEntries: Entry[] = [];
		job.entries.forEach((v) => {
			let tmpEntry = v;
			console.log(v);
			tmpEntry.startTime = v.startTime.toDate();
			tmpEntry.endTime = v.endTime.toDate();
			// console.log(typeof v.startTime);
			outEntries.push(tmpEntry);
		})
		const out: Job = {
			entries: outEntries,
			id: job.id,
			name: job.name,
			ownerId: job.ownerId,
			payPerHour: job.payPerHour,
		}
		console.log(out);
		return out;
	}
}

export const userJobs = () => {
	const user = auth.currentUser;
	if (!user) return null;
	const jobsRef = collection(firestore, "jobs");
	const jobsQuery = query(jobsRef, where("ownerId", "==", user.uid));
	return collectionData(jobsQuery, { idField: 'id' }).pipe(startWith([]));
}

export const userJob = (id: string) => {
	const user = auth.currentUser;
	if (!user) return null;
	const jobRef = doc(firestore, 'jobs', id).withConverter(jobConverter);
	let observable =  docData(jobRef, { idField: 'id' });
	return observable;
}

export const getJobEntries = async (jobId: string): Promise<Entry[]> => {
	const docRef = doc(firestore, "jobs", jobId).withConverter(jobConverter)
	return (await getDoc(docRef)).data().entries;
}

export const addUserJob = async (job: Job): Promise<DocumentReference> => {
	return await addDoc(collection(firestore, 'jobs'), job)
}

export const addUserDefaults = async () => {
	const user = auth.currentUser;
	if (!user) throw new Error("Not Authenticated.");
	if (await getDoc(doc(firestore, 'users', user.uid))) return;
	let defaultInfo: User = {
		jobs: [await addUserJob({
			entries: [],
			id: genUUID(),
			name: "Default Job",
			ownerId: user.uid,
			payPerHour: 0,
		})],
		clockStatus: {
			clockedIn: false,
		}
	}
	await setDoc(doc(firestore, 'users', user.uid), defaultInfo);

}


export const clockIn = async (clockInTime?: Date) => {
	const user = auth.currentUser;
	if (!user) throw new Error("Not Authenticated.");

	if ((await getDoc(doc(firestore, 'users', user.uid))).data().clockStatus.clockedIn) throw new Error("Already Clocked In.");

	await updateDoc(doc(firestore, 'users', user.uid), {
		clockStatus: {
			clockedIn: true,
			clockedInAt: (clockInTime ? clockInTime : new Date(Date.now())),
			clockedInJob: ((await getDoc(doc(firestore, 'users', user.uid))).data().jobs[0].id)
		}
	});
}

export const clockOut = async (clockOutTime?: Date) => {
	const user = auth.currentUser;
	if (!user) throw new Error("Not Authenticated.");
	const clockStatus: ClockStatus = (await getDoc(doc(firestore, 'users', user.uid))).data().clockStatus
	if (!clockStatus.clockedIn) throw new Error("Not Clocked In.");
	const time = (clockOutTime ? clockOutTime : new Date(Date.now()));

	if (clockStatus.clockInTime > time) throw new Error("Clock-in time is after clock-out time.");

	await updateDoc(doc(firestore, 'users', user.uid), {
		clockStatus: {
			clockedIn: false,
			clockedInJob: null,
			clockedInAt: null,
		}
	});
	
	await updateDoc(doc('jobs', clockStatus.clockedInJob.id), {
		
	})
}