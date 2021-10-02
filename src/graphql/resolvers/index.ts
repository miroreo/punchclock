export default {
	// Date: GraphQLDate,
	// Time: GraphQLTime,
	// DateTime: GraphQLDateTime,
	Query: {
		userById: async (): Promise<User> => {

		},
    getHello: async (): Promise<String> => {
      return new Promise((res) => "Hello World!");
    },
	}
};