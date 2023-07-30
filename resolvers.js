const { GraphQLError } = require("graphql");
const  jwt  = require("jsonwebtoken");
const bcrypt  = require ('bcrypt')
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const {authors,books} = require('./testexample')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount: async () => Book.collection.countDocuments(),
      authorCount: async () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
        console.log("GETTING ALL BOOKS");
        console.log(args);
        let bookscopy
        if (args) {
           bookscopy = await Book.find({}).populate("author");
          for (let arg in args) {
            console.log(arg, "arg");
            if(args[arg]=== null){
              continue
            }
            if (arg === "genre") {
              bookscopy = bookscopy.filter((book) =>
                book["genres"].includes(args[arg])
              );
            } else {
              bookscopy = bookscopy.filter((book) => book[arg] === args[arg]);
            }
          }
          console.log(bookscopy)
          return bookscopy;
        }
        console.log(bookscopy)
        return bookscopy;
      },
      allAuthors: async () => {
        console.log("GETTING ALL AUTHORS");
        const authorRes = await Author.find({}).populate('books',{_id:1})
        const tempAuthor = [...authorRes] 
        const returnAuthor = tempAuthor.map(author=>{
          const bookCount = author.books.length
          return {...author.toJSON(),bookCount}
        })
           return returnAuthor
      },
      me: async (root, arg, context) => {
          console.log("getting ME")
        return context.currentUser;
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
        let newbookRes,newAuthorRes
        if (!author) {
          console.log(`author not found`);
          const newAuthor = new Author({
            name: arg.author,
          });
          try {
             newAuthorRes = await newAuthor.save();
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
            newAuthorRes.toJSON()
          );
          
          const newbook = new Book({ ...arg, author: newAuthorRes._id });
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

          const reupdateAuthor = await Author.findByIdAndUpdate(newAuthorRes._id,{
            books:[newbookRes._id]
          },{new:true})

          console.log("🚀 ~ file: resolvers.js:116 ~ addBook: ~ reupdateAuthor:", reupdateAuthor.toJSON())
          
          console.log(
            "🚀 ~ file: index.js:220 ~ addBook: ~ newbookRes:",
            newbookRes
          );

          author = reupdateAuthor.toJSON()
        } else {
          const newbook = new Book({ ...arg, author: author._id});
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

          const reupdateAuthor = await Author.findByIdAndUpdate(author._id,{
            books:author.books.concat(newbookRes._id)
          },{new:true})
          console.log("🚀 ~ file: resolvers.js:116 ~ addBook: ~ reupdateAuthor:", reupdateAuthor.toJSON())

          author = reupdateAuthor.toJSON()
        }
        console.log(newbookRes.toJSON());
        const bookCount = author.books.length
        const returnAuthor={...author, bookCount}


        const finalbook = { ...newbookRes.toJSON(), author:returnAuthor };
        console.log("🚀 ~ file: index.js:229 ~ addBook: ~ finalbook:", finalbook);

        pubsub.publish('BOOK_ADDED',{bookAdded:finalbook})
  
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

          let authorBooksDB = []
      
          for (let book of authorbooks) {
            delete book.id;
            const newBook = new Book({ ...book, author: authorRes._id });
            
            const newBookresp = await newBook.save();

            authorBooksDB.push(newBookresp._id)
            
          }
                   
          const result = await Author.findByIdAndUpdate(authorRes._id,{
            books: authorBooksDB
          },{new:true}
          ).exec()
          console.log("🚀 ~ file: resolvers.js:248 ~ result ~ result:", result.toJSON())

          
          

        
        }

        
        return null;
      },
    },
    Subscription:{
        bookAdded:{
            subscribe:()=> pubsub.asyncIterator('BOOK_ADDED')
        }
    }
  };

  module.exports= resolvers



  