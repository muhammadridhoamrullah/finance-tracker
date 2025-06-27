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

const server = new ApolloServer({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
  introspection: true,
});

async function startServer() {
  try {
    await connect();

    const db = await getDB();
    const ts = "hai";

    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
      context: async () => ({
        db,
        ts,
      }),
    });

    console.log(`🚀 Server ready at ${url}`);
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
}

startServer();
