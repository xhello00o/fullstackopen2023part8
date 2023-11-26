# fullstackopen2023part8

## Course Content


## GraphQL-server (Exercises 8.1 - 8.7)
GraphQL benefits over convention REST API is that it allows you to customize what data is returned instead of receiving all the information at once.
In GraphQL, the schema starts with types representing modules or tables, specifying item/column types. The ```Query``` type defines methods for retrieving data, and resolvers, implemented for each query method, fetch and return data based on the associated module/table type. Similarly, the ```Mutations``` type handles operations that modify or create data. Mutations with modifications often have both input and output types, where input specifies data sent by the client, and output defines the structure of the response returned by the server. This structured approach ensures clarity: types define data, queries specify operations for data retrieval, and mutations handle operations for data modification or creation. Resolvers link queries and mutations to data fetching and manipulation and also for creating new outputs for basic types. Another type is the ```enum```. It is used to specify predefined values.
```javascript
type Address {
  street: String!
  city: String! 
}
type Person {
  name: String!
  phone: String
  address: Address!
  id: ID!
}
type Query {
  personCount: Int!
  allPersons(phone: YesNo): [Person!]!
  findPerson(name: String!): Person
}
type Mutation {
  addPerson(
    name: String!
    phone: String
    street: String!
    city: String!
  ): Person
}
enum YesNo {
  YES
  NO
}
```
The exercises here is to create a GraphQL backend for a small library. They can be found in [```main```](https://github.com/xhello00o/fullstackopen2023part8/blob/main)

## React with GraphQL ( Exercises 8.8 - 8.12 )
We utilize ```@apollo/client``` for queries and mutations, specifically employing ```useQuery``` for queries and ```useMutation``` for mutations. ```useQuery``` automatically runs the query every time the component is rendered. However, in the event, the query is to run on demand, we can use ```useLazyQuery``` or pass a skip(boolean) to the ```useQuery```. 

```javascript
const App = () => {
  const result = useQuery(ALL_PERSONS)
  const result = useQuery(FIND_PERSON, {
      variables: { nameToSearch },
      skip: !nameToSearch,//boolean
    })
  const [ createPerson ] = useMutation(CREATE_PERSON, {
    refetchQueries: [ { query: ALL_PERSONS }, { query: OTHER_QUERY }, { query: ... } ] // pass as many queries as you need
  })
  const submit = (event) => {
      event.preventDefault()
      createPerson({  variables: { name, phone, street, city } })
    }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {result.data.allPersons.map(p => p.name).join(', ')}
    </div>
  )
}
```

The exercises here built up the frontend of the library that we started the backend for in the previous exercises. These exercises can be found in [```part8.8_apollo```](https://github.com/xhello00o/fullstackopen2023part8/blob/part8.8_apollo/). Note that for the rest of the excercises, they build on the same frontend that was started in this app. Therefore, whatever you see in this branch is the final state and the answer for this section may have been in previous commits.

## Database and User Administration
From the previous exercises, we build on and added a mongoDB database using ```mongoose```. The resolvers are modified such that it can query and update the data from the mongoDB database and also throw a GraphQL error when necessary using ```try/catch```. 

These exercises can be found in [```part8.8_apollo```](https://github.com/xhello00o/fullstackopen2023part8/blob/part8.8_apollo/)

## Login and Updating the Cache ( Exercises 8.17 - 8.22 )
As we continue to build on the library app, we added a user login and token with ```jwt```. In order to have a user login and token, we need to use ```useContext``` from apolloclient. The context can then be retrived by the resolvers 

``` javascript
import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})
```
## Fragments and subscriptions ( Exercises 8.23 - 8.26 )
Fragments are a mechanism that allows you to define reusable sets of fields for a given type. They can be reused in other queries mutation for convenience. 
```javascript
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`
const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    id
    name
    phone 
    address {
      street 
      city
    }
  }
`
```
Subscriptions provide a real-time communication mechanism between the server and clients. While queries and mutations are used for fetching and modifying data, respectively, subscriptions enable clients to receive real-time updates when data changes on the server. Since it is real-time, it requires Websockets for server subscriber communication. For the graphQL backend server, we will be using ```expressMiddleware``` for the websocket since the original ```startStandaloneServer``` is not able to handle websockers, which means that Express must also be configured for the application, with the GraphQL server acting as middleware. These packages are also required ```graphql-ws```,```ws```,```@graphql-tools/schema```. For the resolvers,```graphql-subscriptions``` is also required. On the frontend, ```useSubscription``` is used. 
```javascript
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

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
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id).populate(
            'friends'
          )
          return { currentUser }
        }
      },
    }),
  )

  const PORT = 4000

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )
}
```
These exercises continues on from the previous part to complete this library app by adding in subscriptions and resolving the n+1 problem. These exercises can be found in [```part8.8_apollo```](https://github.com/xhello00o/fullstackopen2023part8/blob/part8.8_apollo/)

** The N+1 problem in GraphQL refers to the execution of N additional queries for fetching related data in a one-to-many relationship. With each additional relation, an extra query is performed, leading to performance issues. The problem arises when resolving one-to-many relationships in GraphQL, where related data is not stored in the database, and each item in the list triggers a separate query. Solutions include storing relationships directly in the database and querying them directly or utilizing batching and data loader libraries to optimize and reduce the number of database queries.
