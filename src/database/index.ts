import mongoose from 'mongoose';

const uri: string = import.meta.env.VITE_MONGODB_URI as string;

export const getConnection = async () => {
	// check if we have a connection to the database or if it's currently
	// connecting or disconnecting (readyState 1, 2 and 3)
	if (mongoose.connection.readyState >= 1) {
		return;
	}
	return mongoose.connect(uri);
};
