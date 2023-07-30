import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { Button, ButtonGroup } from "@mui/material"
import { useState } from "react"
import { useEffect } from "react"



const Books = ({show,books,refetch}) => {
  const [genre,setGenre] =useState(null)
  const [genresButton,setGenres]=useState([])
  const client = useApolloClient()
  const [findWithFilter,genreResult] = useLazyQuery(ALL_BOOKS,{variables:{genre:null},fetchPolicy:"network-only"})
  console.log("🚀 ~ file: Books.js:9 ~ Books ~ genre:", genre)
  
  useEffect(()=>{
   
      setGenre(null)
    
  },[show])

  if (!show) {
    return null
  }



    const genres = [... new Set(books.map(book=> book.genres).flat())]
    console.log("🚀 ~ file: Books.js:22 ~ Books ~ genres:", genres)
  


 
  
  


  
  

  

  

  
  console.log("🚀 ~ file: Books.js:39 ~ Books ~ genreResult:", genreResult)

  if(genreResult.loading){
    return <p> Loading...</p>
  }

  if (genre) {
    books = genreResult.data.allBooks
    
    client.cache.updateQuery({query:ALL_BOOKS,variables:{genre:null}},
      ({allBooks}) => {
        console.log("🚀 ~ file: Books.js:57 ~ Books ~ allBooksCACHE:", allBooks)
        const booksID = allBooks.map(book => book.id)
        const newCache = allBooks.filter(book => {
          console.log(book.genres, "BOOOOOKK")
          return !book.genres.includes(genre)})
        console.log("🚀 ~ file: Books.js:60 ~ Books ~ newCache:", newCache)
        return({
          allBooks:newCache.concat(books)
        })
          
          
        })


      
    
  }



  

  console.log("final books",books)

  

  return (
    <div>
      <h2>books</h2>
      {genre?
      <h3>with genre of {genre}</h3>
    :null}

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

      <ButtonGroup variant="text">
        {genres.map(genre=>(
          <Button key={genre} onClick={()=>{
            setGenre(genre)
            findWithFilter({variables:{genre}})
            
          }}>{genre}</Button>
        )
        )}
        <Button onClick={()=>{
          setGenre(null)
          refetch()
         }
        } >All genres</Button>
      </ButtonGroup>
    </div>
  )
}

export default Books
