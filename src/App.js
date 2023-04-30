import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import { useState, React,useEffect } from "react";
import TaskRoute from "./components/TaskRoute";
import NavigationLeft from "./components/NavigationLeft";
import NavigationTop from "./components/NavigationTop";
import PreviousData from "./components/PreviousData";
import Monthly from "./components/Monthly";
import PrevAll from "./components/PrevAll";
import PrevTask from "./components/PrevTask";
import {Authprovider,useAuth} from "./components/auth"
function App() {

  
  const auth=useAuth();
  const [data, setData] = useState("");
  const [filter,setFilter]=useState("all");
  const [rerender,setRerender]=useState(true);
  const [url,setUrl]=useState("");
  const urlSetter=(u)=>{
      setUrl(u);
  }

  const dataSetter = (value) => {
    setData(value);
  };

  
  const dataDeletor = (e, urladd) => {
    const eventa = e;
   var k= fetch("/api/v1"+urladd, { method:"DELETE" }).then(()=>{
      setData((prev) => {
        return {
          date: prev.date,
          children: prev.children.filter((elem) => e.target.name != elem.name),
        };
      })
   }
    );

  };
  useEffect(() => {
    fetch(`/user`).then((response) => {
      return response.json();
      
    })
    .then((dataJson) => {
      auth.login(dataJson)
    });
      return ()=>{
        
      }
      
  }, []);
  // <input className='app-add-task-input' id="new-task" placeholder='Add' autoComplete='off' required></input>
  //   <input className='app-add-task-input' id="new-task" placeholder='Add' autoComplete='off'></input>
  //<h2 className='app-add-task-label'>
  //<label htmlFor='new-task'>
  //  Add A New Task
  // </label>
  //  </h2>
  //<div className='app-container'>
  //</div>
  //<div className="app-top-header">Personal Progress Tracker</div>
  //<p className='app-top-header-desc'>A great way to manage a to-do list and track your daily progress</p>
  return (
    <>
      <BrowserRouter>

        <div className="container">
        <NavigationTop/>
        <NavigationLeft filter={filter} setFilter={setFilter} children={data.children} data={data.days} dataSetter={dataSetter} url={url}  rerender={rerender}
                      setRerender={setRerender}/>
        <div className="body-main">
       <Routes>
           <Route
                  path="/"
                  element={
                    <Home
                     filter={filter}
                      rerender={rerender}
                      setRerender={setRerender}
                      data={data}
                      dataSetter={dataSetter}
                      dataDeletor={dataDeletor}
                      urlSetter={urlSetter}
                     
                    />
                  }
                />
                <Route
                  path="/tasks/:task"
                  element={
                    <TaskRoute
                    filter={filter}
                    rerender={rerender}
                      setRerender={setRerender}
                      data={data}
                      dataSetter={dataSetter}
                      dataDeletor={dataDeletor}
                      urlSetter={urlSetter}
                    
                    />
                  }
                />
                <Route path="/particularday" element={<PrevAll  filter={filter} />} />
                <Route path="/particularday/:task" element={<PrevTask filter={filter}/>}/>
                <Route path="/previoustask/:task" element={<PreviousData />}/>
                <Route path="/monthview" element={<Monthly/>}/>
              </Routes>
             
            </div>
          </div>
                
      </BrowserRouter>
    </>
  );
}

export default App;
