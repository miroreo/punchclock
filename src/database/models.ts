import mongoose from 'mongoose';
import { genUUID } from '../utils';
// const userSchema = new mongoose.
const userSchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID()},
	username: String,
	authProvider: {
		name: String,
		userId: mongoose.Schema.Types.Mixed,
	},
	email: String,
	oauthToken: String,
	jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
	status: {
		clockedIn: Boolean,
		job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
		time: Date
	},
});
export const User = mongoose.model('User', userSchema, 'Users');

const jobSchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID()},
	name: String,
	payPerHour: Number,
	entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' }],
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})
export const Job = mongoose.model('Job', jobSchema, 'Jobs');

const entrySchema = new mongoose.Schema({
	_id: { type: String, default: () => genUUID()},
	startTime: Date,
	endTime: Date,
	comment: String,
	payMultiplier: Number,
	basePay: Number,
});
export const Entry = mongoose.model('Entry', entrySchema, 'Entries');