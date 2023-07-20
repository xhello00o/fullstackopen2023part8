import { useMutation } from "@apollo/client"
import { ALL_AUTHORS,EDIT_AUTHOR } from "../queries"
import { useState } from "react"
import { Autocomplete, TextField } from "@mui/material"


const EditAuthorBornYear = ({authors}) => {
    const [ editAuthorYear] = useMutation(EDIT_AUTHOR,
        {refetchQueries:[{query:ALL_AUTHORS}]})
    const [year , setYear] = useState(null)
    const [author, setAuthor] = useState(null)
    console.log(author,year)
    const handleEdit = (event) => {
        event.preventDefault()
        console.log(typeof author.name,year)

        editAuthorYear({variables:{name:author.name, setBornTo: year}})
        setAuthor(null)
        setYear('')
    }

    return(
        <div>
        <h2>Set birthyear</h2>
        <form onSubmit={handleEdit}>
            <Autocomplete
            value={author}
            onChange={(event,newValue)=>setAuthor(newValue)}
            options={authors}
            getOptionLabel={(option)=>option.name}
            renderInput={(params)=><TextField {...params} label="Author"/>}/>
            <div>Born: <input  type={"number"} value={year} onChange={({target})=>setYear(Number(target.value))}/></div>  
            <button type="submit">update author</button>
        </form>
        
        </div>
    )
}

export default EditAuthorBornYear