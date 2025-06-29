const { Budget } = require("../models/budget");

const typeDefs = `#graphql

type Budget {
    _id: ID!
    name: String!
    amount: Float!
    spent: Float
    income: Float
    startDate: String!
    endDate: String!
    remaining: Float
    isDeleted: Boolean
    deletedAt: String
    createdAt: String!
    updatedAt: String!
    User: GetUserResponse
}



input CreateBudgetInput {
    name: String!
    amount: Float!
    startDate: String!
    endDate: String!
}

type ResponseMessage {
    message: String!
}

type Query {
    getBudgets: [Budget]
}

type Mutation {
    createBudget(input: CreateBudgetInput): ResponseMessage
}

`;

const resolvers = {
  Query: {
    getBudgets: async (_, args, contextValue) => {
      const { db, auth } = contextValue;
      const user = await auth();

      const budgets = await Budget.getBudgets(db);

      return budgets;
    },
  },
  Mutation: {
    createBudget: async (_, args, contextValue) => {
      const { db, auth } = contextValue;
      const { input } = args;
      const { UserId } = await auth();

      const budgets = await Budget.createBudget(input, db, UserId);

      return budgets;
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};

// Budget Routes
// router.post("/budget", Controller.createBudget);
// router.get("/budget", Controller.getMyBudget);
// router.get("/budget/:id", Controller.getMyBudgetById);
// router.put("/budget/:id", authorizationBudget, Controller.updateMyBudget);
// router.delete("/budget/:id", authorizationBudget, Controller.deleteMyBudget);
// router.patch(
//   "/budget/restore/:id",
//   authorizationBudgetForRestore,
//   Controller.restoreMyBudget
// );
