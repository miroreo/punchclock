import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { getConnection } from '../../database';
import { User } from '../../database/models';
import jwt from 'jsonwebtoken';

export const authDirectiveBase = (directiveName: string, getUserFn: (token: string) => {hasRole: (role: string) => boolean}) => {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return (schema: GraphQLSchema) => mapSchema(schema, {
		[MapperKind.TYPE]: type => {
			
			const authDirective = getDirective(schema, type, directiveName)?.[0]
			if (authDirective) {
				typeDirectiveArgumentMaps[type.name] = authDirective
			}
			return undefined
		},
		// Executes once for each object field in the schema
		[MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
			const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0] ?? typeDirectiveArgumentMaps[typeName];
			// only run if the current directive exists
			if (authDirective) {
				const { requires } = authDirective;
				
				if (requires) {
					const requiredRole = requires;
					const requiresOwner = requiredRole === 'OWNER';
					
					const { resolve = defaultFieldResolver } = fieldConfig;
					fieldConfig.resolve = async function (source, args, context, info) {
						console.log(requires);
						const user = await getUserFn(context.token);
						if (!user.hasRole(requires)) {
							throw new Error('not authorized');
						}
						return resolve(source, args, context, info);
					}
					return fieldConfig;
				}
			}
		}
	});
}

const getUser = async (token: string) => {
	const dbConnection = getConnection()
	let decoded;
	try {
		decoded = jwt.verify(token, import.meta.env.VITE_JWT_SECRET);
	}	catch(err) {
		return {
			hasRole: (role: string) => false
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

export default (schema: GraphQLSchema, directiveName: string) => authDirectiveBase(directiveName, getUser)(schema);