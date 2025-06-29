if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server");
const { connect, getDB } = require("./config/mongo");
const { startStandaloneServer } = require("@apollo/server/standalone");

const PORT = process.env.PORT;

const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
} = require("./schemas/user");
const { authentication } = require("./middlewares/authentication");

const {
  typeDefs: budgetTypeDefs,
  resolvers: budgetResolvers,
} = require("./schemas/budget");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, budgetTypeDefs],
  resolvers: [userResolvers, budgetResolvers],
  introspection: true,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return {
      message: error.message,
      locations: error.locations,
    };
  },
});

async function startServer() {
  try {
    await connect();

    const db = await getDB();

    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: async ({ req }) => ({
        db,
        auth: async () => authentication(req, db),
      }),
    });

    console.log(`🚀 Server ready at ${url}`);
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
}

startServer();
