import { useMutation } from "@apollo/client"
import { Button, TextField } from "@mui/material"
import { LOGIN } from "../queries"
import { useState } from "react"
import { useEffect } from "react"


const Login = (props) => {
    const [login,result] = useMutation(LOGIN,{onCompleted:(data)=>{
        setUsername("")
        setPassword("")
        props.setPage('authors')
    }})
    
    const [username,setUsername] = useState("")
    const [password, setPassword] = useState("")
    useEffect(()=>{
        console.log("testing")
        if (result.data) {
            
            const token = result.data.login.value
            window.localStorage.setItem('token',token)
            props.setToken(token)
        }
    },[result.data])
   

    const handlelogin=(event)=>{
        event.preventDefault()
        console.log("login")
        login({variables: {username,password}}) 
    }

    console.log(props.show,"show Login")
    if (!props.show) {
        return null
      }


   

    

    return(
        <div>
            <h2> Login</h2>
            <form onSubmit={handlelogin}>
                <TextField 
                    required
                    label="Username"
                    value={username}
                    onChange={({target})=> setUsername(target.value)}
                    />
                <TextField
                    required
                    label = "Password"
                    type="password"
                    value={password}
                    onChange={({target})=> setPassword(target.value)}
                    />
                <Button variant="contained" type="submit"> Login </Button>
            </form>
        </div>
    )
}

export default Login