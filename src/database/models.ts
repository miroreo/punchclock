import mongoose from 'mongoose';
import { genUUID } from '../utils';

export interface IUser extends mongoose.Document {
	_id: string;
	username: string;
	authProvider: {
		name: string;
		userId: any;
	};
	email: string;
	oauthToken?: string;
	jobs: mongoose.PopulatedDoc<IJob>[];
	status: {
		clockedIn: boolean;
		job?: mongoose.PopulatedDoc<IJob>;
		time?: Date;
	};
	roles: string[];
	profileVisibility: {
		category: "PUBLIC" | "PRIVATE" | "CERTAIN_USERS";
		users: mongoose.PopulatedDoc<IUser>[];
	};
}

const userSchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID() },
	username: String,
	authProvider: {
		name: String,
		userId: mongoose.Schema.Types.Mixed
	},
	email: String,
	oauthToken: String,
	jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
	status: {
		clockedIn: Boolean,
		job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
		time: Date
	},
	roles: [String],
	profileVisibility: {
		category: String,
		users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
	}
});
export const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', userSchema, 'Users');

export interface IJob extends mongoose.Document {
	name: string;
	payPerHour: number;
	entries: mongoose.PopulatedDoc<IEntry>[];
	owner: mongoose.PopulatedDoc<IUser>;
}
const jobSchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID() },
	name: String,
	payPerHour: Number,
	entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
export const Job: mongoose.Model<IJob> = mongoose.model('Job', jobSchema, 'Jobs');

export interface IEntry extends mongoose.Document {
	_id: string;
	startTime: Date;
	endTime: Date;
	comment: string;
	payMultiplier: number;
	basePay: number;
	job: mongoose.PopulatedDoc<IJob>;
}
const entrySchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID() },
	startTime: Date,
	endTime: Date,
	comment: String,
	payMultiplier: Number,
	basePay: Number,
	job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }
});
export const Entry: mongoose.Model<IEntry> = mongoose.model('Entry', entrySchema, 'Entries');

export interface IClass extends mongoose.Document {
	_id: string;
	name: string;
	members: mongoose.PopulatedDoc<IUser>[];
	
}
