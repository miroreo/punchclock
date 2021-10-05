import { gql } from "apollo-server-micro";

// import noteSchema from "./note";
import customSchema from "./custom";

const linkSchema = gql`
  type Query {
    _: Boolean
		getHello: String!
		currentUser: User
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
	
	type User {
		id: String
		username: String
		email: String
		
	}
`;

export default [linkSchema, customSchema];