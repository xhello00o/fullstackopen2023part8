const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const  jwt  = require("jsonwebtoken");
const bcrypt  = require ('bcrypt')
require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./utils/config");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

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

const typeDefs = `
type Test {
    test:String
}
  
  type Author {
    name: String!
    id:ID!
    born:Int
    bookCount:Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id:ID!
    genres: [String!]!

  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author:String,genre:String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book
    editAuthor(
        name: String!,
        setBornTo: Int!
    ): Author
    resetData(
        test: String
    ) : Test
    createUser(
        username: String!
        password: String!
        favoriteGenre: String!
      ): User
    login(
    username: String!
    password: String!
    ): Token

  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log("GETTING ALL BOOKS");
      console.log(args);
      if (args) {
        let bookscopy = await Book.find({}).populate("author");
        for (let arg in args) {
          console.log(arg, "arg");
          if (arg === "genre") {
            bookscopy = bookscopy.filter((book) =>
              book["genres"].includes(args[arg])
            );
          } else {
            bookscopy = bookscopy.filter((book) => book[arg] === args[arg]);
          }
        }
        console.log(bookscopy);
        return bookscopy;
      }
      return bookscopy;
    },
    allAuthors: async () => {
      console.log("GETTING ALL AUTHORS");
      return Author.find({});
    },
    me: async (root, arg, context) => {
      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => {
      const booksDB = await Book.find({}).populate("author");
      return booksDB.filter((book) => book.author.name === root.name).length;
    },
  },
  Mutation: {
    addBook: async (root, arg,context) => {
      console.log("🚀 ~ file: index.js:229 ~ addBook: ~ context:", context)
      console.log("ADDING A NEW BOOK");
      console.log(arg);
      const currentUser = context.currentUser
      console.log("🚀 ~ file: index.js:233 ~ addBook: ~ currentUser:", currentUser)
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      let author = await Author.findOne({ name: arg.author }).exec();
      console.log("🚀 ~ file: index.js:210 ~ addBook: ~ author:", author);
      let newbookRes;
      if (!author) {
        console.log(`author not found`);
        const newAuthor = new Author({
          name: arg.author,
        });
        try {
          const newAuthorRes = await newAuthor.save();
        } catch (error) {
          console.log("🚀 ~ file: index.js:221 ~ addBook: ~ error:", error);
          throw new GraphQLError("Author is not defined correctly", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: arg.author,
              error,
            },
          });
        }

        console.log(
          "🚀 ~ file: index.js:218 ~ addBook: ~ newAuthorRes:",
          newAuthorRes
        );
        author = newAuthorRes;
        const newbook = new Book({ ...arg, author: author._id });
        try {
          newbookRes = await newbook.save();
        } catch (error) {
          console.log("🚀 ~ file: index.js:228 ~ addBook: ~ error:", error);
          throw new GraphQLError("Failed to create new book", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: arg.title,
              error,
            },
          });
        }
        console.log(
          "🚀 ~ file: index.js:220 ~ addBook: ~ newbookRes:",
          newbookRes
        );
      } else {
        const newbook = new Book({ ...arg, author: author._id });
        try {
          newbookRes = await newbook.save();
        } catch (error) {
          console.log("🚀 ~ file: index.js:228 ~ addBook: ~ error:", error);
          throw new GraphQLError("Failed to create new book", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: arg.title,
              error,
            },
          });
        }
        console.log(
          "🚀 ~ file: index.js:225 ~ addBook: ~ newbookRes:",
          newbookRes
        );
      }
      console.log(newbookRes.toJSON());
      const finalbook = { ...newbookRes.toJSON(), author };
      console.log("🚀 ~ file: index.js:229 ~ addBook: ~ finalbook:", finalbook);

      return finalbook;
    },
    editAuthor: (root, arg,context) => {
      console.log("🚀 ~ file: index.js:309 ~ context:", context)
      console.log("🚀 ~ file: index.js:188 ~ arg:", arg);

      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          
        }})  }
      
      const authorToEdit = authors.find((author) => author.name === arg.name);
      if (authorToEdit) {
        authorToEdit.born = arg.setBornTo;
        authors = authors.map((author) =>
          author.name === arg.name ? authorToEdit : author
        );
        return authors.find((author) => author.name === arg.name);
      } else {
        return null;
      }
    },
    createUser: async (root, arg) => {
      console.log("🚀 ~ file: index.js:310 ~ createUser: ~ arg:", arg);

      const passwordHash = await bcrypt.hash(arg.password, 10);
      const newUser = new User({
        username: arg.username,
        favoriteGenre: arg.favoriteGenre,
        passwordHash,
      });

      const newUserRes = newUser.save();
      console.log(
        "🚀 ~ file: index.js:321 ~ createUser: ~ newUserRes:",
        newUserRes
      );
      return newUserRes;
    },
    login: async (root, arg) => {
      const { username, password } = arg;
      const user = await User.findOne({ username });
      console.log("🚀 ~ file: index.js:327 ~ login: ~ user:", user);

      const passwordCorrect = !user
        ? false
        : await bcrypt.compare(password, user.passwordHash);

      if (!(user && passwordCorrect)) {
        throw new GraphQLError("invalid username or password", {
          extensions: {
            code: "INVALID_USER_OR_PW",
            invalidArgs: username,
            password
          },
        });
      }


      const userToken = {
        username: user.username,
        id: user._id,
      };

      const token = jwt.sign(userToken, process.env.SECRET);

      return {value:token}
    },

    resetData: async (root, arg) => {
      console.log("resetting data");
      const bookres = await Book.deleteMany({});
      const authorres = await Author.deleteMany({});
      for (let author of authors) {
        delete author.id;
        let newAuthor = new Author({ ...author });
        const authorRes = await newAuthor.save();;
        const authorbooks = books.filter(
          (book) => book.author === authorRes.name
        );
    
        for (let book of authorbooks) {
          delete book.id;
          const newBook = new Book({ ...book, author: authorRes._id });
          
          await newBook.save();
        }
      }
      return null;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    console.log("🚀 ~ file: index.js:413 ~ context: ~ auth:", auth)
    if (auth && auth.startsWith("Bearer")) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET);
      console.log("🚀 ~ file: index.js:415 ~ context: ~ decodedToken:", decodedToken)
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
