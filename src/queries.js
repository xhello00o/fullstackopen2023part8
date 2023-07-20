import { gql} from "@apollo/client";

export const ALL_BOOKS = gql`
query{
    allBooks {
      author
      title
      published
    }
  }
`
export const ALL_AUTHORS = gql`
query{
    allAuthors {
      name
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
      author
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