import isoDate from 'graphql-iso-date';
import { IUser, User } from '../../database/models';
import { getConnection } from '../../database';
import { getUserFromToken } from '../../lib/auth';
export default {
	// Date: GraphQLDate,
	// Time: GraphQLTime,
	
	DateTime: isoDate['GraphQLDateTime'],
	Query: {
		userById: async (parent, args, context, info): Promise<IUser> => {
			await getConnection(); // make sure the database is connected
			let user: IUser;
			try {
				user = User.findOne({ _id: args.id });
				console.log(context.userToken);
				let newUser;
				if(context.userToken?.id != user.id) {
					if(user.profileVisibility){}
					newUser = user;
					newUser.email = null;
				}
				
				return newUser;
			}
			catch(err) {
				console.log(err);
				throw new Error("Failed to fetch user")
			}
		},
		getHello: async (): Promise<String> => {
			return new Promise((res, rej) => res('Hello World!'));
		},
		currentUser: async (parent, args, context, info): Promise<IUser> => {
			console.log("Current User Requested");
			return await context.getUser();
		},
		currentToken: (parent, args, context, info) => Promise.resolve(context.token),
	}
};
