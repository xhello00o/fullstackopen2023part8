import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ADD_BOOK,ALL_AUTHORS,ALL_BOOKS } from '../queries'

const NewBook = (props) => {
  const [title, setTitle] = useState(null)
  const [author, setAuthor] = useState(null)
  const [published, setPublished] = useState(null)
  const [genre, setGenre] = useState(null)
  const [genres, setGenres] = useState([])
  const [createBook] = useMutation(ADD_BOOK,
    {refetchQueries: [{query:ALL_AUTHORS},{query:ALL_BOOKS}]})

  if (!props.show) {
    return null
  }
  console.log(title,author,published,typeof published)

  const submit = async (event) => {
    event.preventDefault()

    console.log('add book...')
    createBook({variables:{title,author,published,genres}})

    setTitle(null)
    setPublished(null)
    setAuthor(null)
    setGenres([])
    setGenre(null)
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook