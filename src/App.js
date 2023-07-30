import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import Recommended from "./components/Recommended";
import { ME, ALL_BOOKS, BOOK_ADDED } from "./queries";
import Alert from "./components/Alert";

export const updateCache = (cache, query, addedItem) => {
  // helper that is used to eliminate saving same person twice
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.id
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, (data) => {
    console.log("🚀 ~ file: App.js:22 ~ cache.updateQuery ~ data:", data)
    const dataKey = Object.keys(data)[0]
    console.log("🚀 ~ file: App.js:22 ~ cache.updateQuery ~ dataKey:", dataKey)
    const finaldata = data[dataKey].concat(addedItem)
    console.log("🚀 ~ file: App.js:26 ~ cache.updateQuery ~ finaldata:", finaldata)
    console.log({
      [dataKey]: uniqByName(finaldata),
    })
    return ({
      [dataKey]: uniqByName(finaldata),
    })
  })
}



const App = () => {
  const client = useApolloClient();
  const userresult = useQuery(ME,{fetchPolicy:"no-cache"});
  const bookresult = useQuery(ALL_BOOKS, {
    variables: { genre: null },
  });
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [alertItem, setAlertItem] = useState(null)
  console.log("🚀 ~ file: App.js:47 ~ App ~ alertItem:", alertItem)

  useSubscription(BOOK_ADDED,{
    onData: ({data})=>{
      console.log(data, "SUBSCRIPTION")
      const addedBook = data.data.bookAdded
      updateCache(client.cache, {query:ALL_BOOKS,variables:{genre:null}},addedBook)
      setAlertItem({title:"New Book Added", value:addedBook})

      setTimeout(()=>{
        if(!alertItem){
          setAlertItem(null)
        }
      },3000)
    }
  })
  console.log("🚀 ~ file: App.js:13 ~ App ~ userresult:", userresult)
  
  console.log("🚀 ~ file: App.js:16 ~ App ~ bookresult:", bookresult);
  
  console.log("🚀 ~ file: App.js:12 ~ App ~ token:", token);

  useEffect(() => {
    const storageToken = window.localStorage.getItem("token");
    setToken(storageToken);
  }, []);

  const handlelogout = (event) => {
    setToken(null);
    localStorage.clear("token");
    client.resetStore();
    setPage("authors");
  };

  const handleclosealert = (event)=>{
    event.preventDefault()
    
    setAlertItem(null)
    
  }

  console.log(page, "page");
  console.log(token, "token");
  return (
    <div>
      <Alert handleclose={handleclosealert} alertitem={alertItem}/>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>

        {token ? (
          <div>
            <button onClick={() => setPage("add")}>add book</button>
            <button
              onClick={() => {
                setPage("recommend")
                userresult.refetch();
              }}
            >
              recommendations
            </button>
            <button onClick={handlelogout}>logout</button>
          </div>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      

      <Authors show={page === "authors"} token={token} />

      {bookresult.loading ? (
        <p>Loading...</p>
      ) : (
        <Books
          show={page === "books"}
          books={bookresult.data.allBooks}
          refetch={bookresult.refetch}
        />
      )}

      <NewBook show={page === "add"} token={token} />

      <Login show={page === "login"} setToken={setToken} setPage={setPage} />

      {userresult.loading ? (
        <p>Loading...</p>
      ) : userresult.data || userresult.data.me ? (
        <Recommended show={page === "recommend"} user={userresult.data.me} />
      ) : (
        <p>Hi</p>
      )}


    </div>
  );
};

export default App;
