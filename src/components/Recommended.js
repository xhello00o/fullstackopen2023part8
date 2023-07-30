import { useApolloClient, useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { useEffect } from "react"

const Recommended =({show,user})=>{
    console.log(user)
    const client = useApolloClient()
    const recommendResult = useQuery(ALL_BOOKS,{variables:{genre:user.favoriteGenre},fetchPolicy:'network-only'})
    console.log("🚀 ~ file: Recommended.js:7 ~ Recommended ~ recommendResult:", recommendResult)

    useEffect(()=>{
        recommendResult.refetch()
    },[show])
    
    
    
      if (recommendResult.loading){
        return(
           <p> Loading...</p>
        )
      }

      if (!show || !recommendResult.data) {
        console.log("returning null")
        return null
      }
      console.log("why still running")

       const books = recommendResult.data.allBooks

    return (
        <div>
            <h2> Recommendations </h2>
            <p> books in your favorite genre {user.favoriteGenre}</p> 
            <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

        </div>
    )
}

export default Recommended