const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const { GraphQLError } = require("graphql");
const  jwt  = require("jsonwebtoken");
const bcrypt  = require ('bcrypt')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')


require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./utils/config");

const User = require("./models/user");




/*
  you can remove the placeholder query once your first own has been implemented 
*/

mongoose.set("strictQuery", false);

console.log("connecting to URL");
mongoose
  .connect(config.MONGO_DB_URL)
  .then((res) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to mongDO", error.message);
  });

  const start = async ()=>{
    const app = express()
    const httpServer = http.createServer(app)
    const wsServer = new WebSocketServer({
        server:httpServer,
        path:'/'
    })

    const schema = makeExecutableSchema({typeDefs,resolvers})
    const serverCleanup = useServer({schema},wsServer)

    const server = new ApolloServer({
        schema,
        plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
            return {
                async drainServer() {
                await serverCleanup.dispose();
                },
            };
            },
        },
        ],
    })

   
    await server.start()
    app.use('/',
    cors(),
    express.json(),
    expressMiddleware(server,{
        context: async ({ req, res }) => {
            const auth = req ? req.headers.authorization : null;
            if (auth && auth.startsWith("Bearer")) {
        
              const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET);
              const currentUser = await User.findById(decodedToken.id);
              return { currentUser };
            }
          }
        
    }))
    const PORT = 4000
    httpServer.listen(PORT,()=>{
        console.log(`Server is now running on http://localhost:${PORT}`)
    })
      

  }
  start()



