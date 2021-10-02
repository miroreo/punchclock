import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import { ApolloError } from 'apollo-server-micro';


export default {
	Date: GraphQLDate,
	Time: GraphQLTime,
	DateTime: GraphQLDateTime,
	Query: {
    getHello: async (): Promise<String> => {
      return new Promise((res) => "Hello World!");
    },
	}
};