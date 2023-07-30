import { gql} from "@apollo/client";

export const ALL_BOOKS = gql`
query findWithFilter($author: String, $genre: String)  {
    allBooks(author: $author,genre: $genre) {
      author {
        name
      }
      title
      published
      genres
      id
    }
  }
`
export const ALL_AUTHORS = gql`
query{
    allAuthors {
      name
      id
      born
      bookCount
    }
  }
`

export const ADD_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
       author: $author,
        published: $published, 
        genres: $genres) {
            title
            author {
              name
            }
            published
    }
  }
`

export const EDIT_AUTHOR =gql`
mutation editAuthorYear($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name, 
      setBornTo: $setBornTo) {
        name
        born
        bookCount
    }
  }
`

export const LOGIN =gql`
mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const ME =gql`
query {
    me {
      id
      username
      favoriteGenre
    }
  }
`

export const BOOK_ADDED= gql`
subscription  {
  bookAdded {
    title
    author {
      name
      id
    }
    published
    genres
    id
  }
}

`