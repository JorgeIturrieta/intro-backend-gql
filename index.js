const express = require('express')
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/envConfig');


// Librerias necesarias para apollo
const { ApolloServer } = require('apollo-server-express')
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws")
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { resolvers } = require('./resolvers');
const { typeDefs } = require('./typeDefs');
const { getUser } = require('./getUser');


// Comunicacion con db mongo
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  });



(async function () {

  // Configuracion de express
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {

      const token = req.headers.authorization || '';
      if (token !== '') {
        const currentUser = await getUser(token);
        return { currentUser }
      }

    }
  })

  await server.start();
  server.applyMiddleware({
    app,
    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: '/'
  });

  //  Crear subscripcion al servidor

  SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: server.graphqlPath }
  );


  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server is now running on http://localhost:${PORT}${server.graphqlPath}`)
  );

})();


