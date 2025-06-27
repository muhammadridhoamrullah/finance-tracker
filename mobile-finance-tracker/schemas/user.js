const { User } = require("../models/user");

const typeDefs = `#graphql
type User {
    _id: ID!
    firstName: String!
    lastName: String
    email: String!
    password: String!
    phoneNumber: String!
    address: String!
    role: String!
    isVerified: Boolean!
    createdAt: String!
    updatedAt: String!
}

input CreateUserInput {
    firstName: String!
    lastName: String
    email: String!
    password: String!
    phoneNumber: String!
    address: String!
}

type CreateUserResponse {
    message: String!
    _id: ID!
}

type Query {
_: Boolean
}


type Mutation {
    createUser(input: CreateUserInput) : CreateUserResponse
}
`;

const resolvers = {
  Query: {},
  Mutation: {
    createUser: async (_, args, contextValue) => {
      const { db, ts } = contextValue;
      console.log(ts, "context ts aja");

      const { input } = args;

      const user = await User.createUser(input, db);
      console.log(user, "user created");

      return user;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
