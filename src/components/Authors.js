import { useQuery } from "@apollo/client"
import { ALL_AUTHORS } from "../queries"
import EditAuthorBornYear from "./EditAuthorBornYear"

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  if (!props.show) {
    return null
  }

  
  console.log("🚀 ~ file: Authors.js:10 ~ Authors ~ authors:", result)
  

  if (result.loading) {
    return(
      <p> Loading...</p>
    )
  }



  const authors = result.data.allAuthors


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token?
      <EditAuthorBornYear authors={authors}/>:
      null
      }
      
    </div>
  )
}

export default Authors
