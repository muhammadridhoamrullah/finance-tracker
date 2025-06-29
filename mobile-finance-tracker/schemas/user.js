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

input LoginUserInput {
  email: String!
  password: String!
}

type CreateUserResponse {
    message: String!
    _id: ID!
}

type LoginUserResponse {
  access_token: String!
}

type GetUserResponse {
  _id: ID!
  firstName: String!
  lastName: String
  email: String!
  phoneNumber: String!
  address: String!
  role: String!
  isVerified: Boolean!
  createdAt: String!
  updatedAt: String!
}

type Query {
getUser: [GetUserResponse!]
}


type Mutation {
    createUser(input: CreateUserInput) : CreateUserResponse
    loginUser(input: LoginUserInput): LoginUserResponse
}
`;

const resolvers = {
  Query: {
    getUser: async (_, args, contextValue) => {
      const { db, auth } = contextValue;
      const user = await auth();
      console.log("user", user);

      const findUsers = await User.getUser(db);
      console.log(findUsers, "find di sch");

      return findUsers;
    },
  },
  Mutation: {
    createUser: async (_, args, contextValue) => {
      const { db } = contextValue;

      const { input } = args;

      const user = await User.createUser(input, db);

      return user;
    },
    loginUser: async (_, args, contextValue) => {
      const { db } = contextValue;
      const { input } = args;

      const user = await User.loginUser(input, db);

      return user;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
