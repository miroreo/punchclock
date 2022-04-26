import { AuthenticationError, SchemaDirectiveVisitor } from 'apollo-server-lambda';
import { defaultFieldResolver } from 'graphql';
import { getConnection } from '../../database';
import jwt from 'jsonwebtoken';
import { User } from '../../database/models';
class AuthDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const requiredRole = this.args.requires;
    const originalResolve = field.resolve || defaultFieldResolver;
    field.resolve = async function(...args) {
      const context = args[2];
      const user = await getUser(context.token);
			const requiresOwner = requiredRole === 'OWNER';
      const isUnauthorized = !requiresOwner && !user.hasRole(requiredRole);
			
      if (isUnauthorized) {
        throw new AuthenticationError(`You need following role: ${requiredRole}`);
      }
			const data = await originalResolve.apply(this, args);
			
      if (requiresOwner) {
        assertOwner(field, user, data);
				
      }
      return data;
    }
  }
}

const assertOwner = (field, user, data) => {
	console.log("Asserting Owner for Type " + field.type.name);
	console.log(field.name);
	console.log(data);
  if (field.type.name === 'User' && user.id !== data.id) {
		console.log(data);
    throw new AuthenticationError('You are not authorized to view this information.');
  } else if(field.name === 'email' && user.id !== data.id) {
		throw new AuthenticationError("Authentication");
	}
}

const getUser = async (token: string) => {
	const dbConnection = getConnection()
	let decoded;
	try {
		decoded = jwt.verify(token, import.meta.env.VITE_JWT_SECRET);
	}	catch(err) {
		return {
			hasRole: (role: string) => false,
			id: null
		}	
	}
	let user = await User.findOne({_id: decoded.id});
	return {
		hasRole: (role: string) => {
			if(role == "USER") return true
			else return user.roles.toString().indexOf(role) != -1
		},
		id: user._id
	}
};

export default AuthDirective;