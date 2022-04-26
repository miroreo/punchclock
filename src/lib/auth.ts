import { getConnection } from '../database';
import { IUser, User } from '../database/models';
import jwt from 'jsonwebtoken';

export const getUserFromToken = async (token: string): Promise<IUser> => {
	const conn = await getConnection();
	let decoded;
	try {
		decoded = jwt.verify(token, import.meta.env['VITE_JWT_SECRET'])	
	} catch(err) {
		console.error(err);
		throw new Error("Invalid Token");
	}
	const user: IUser = await User.findOne({
		_id: decoded.id
	});
	
	return user
}