import { gql } from "apollo-server-micro";

// import noteSchema from "./note";
import customSchema from "./custom";

const linkSchema = gql`
  type Query {
    _: Boolean
		getHello: String!
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
	
	type User {
		
	}
`;

export default [linkSchema, customSchema];