import "../App.css"
import { React, useState, useEffect,} from "react";
import Task from "./Task";
import { Link,useParams,useLocation,useSearchParams} from "react-router-dom";
function Home(props) {

  const {data,dataSetter}=props

  const add=(e)=>{
  } 
  useEffect(() => {
       let fetchUrl
       fetchUrl="/api/v1/tasks/"
    
    
    //fetch data for Home page
    fetch(fetchUrl)
      .then((response) => {
        return response.json();
      })
      .then((dataJson) => {
        props.dataSetter(dataJson);
        props.urlSetter("")
      });
      return ()=>{
        
        props.dataSetter("")
      }
      
  }, [props.rerender]);
  var tasks;

  //function to set children as completed from outside
  const childrenCompletedHandler=(checked,element)=>{
    const newData =data.children.map((elem)=>{
      if (elem.name===element.name)
      return{...elem,completed:checked}
      return elem
    })
  dataSetter({...data,children:newData})
  }

  //Create a listed array of 'tasks' if data is available otherwise keep array empty
  if (Object.keys(data).length) {
    if(data.children)
    tasks = data.children.filter((element)=>{
      if(props.filter==="completed"){
        return (element.completed===true)
      }
      else if(props.filter==="incomplete"){
        return(element.completed===false)
      }
      else return true
    }).map((element) => {
      return <Task  element={element} key={element.name} dataSetter={props.dataSetter} dataDeletor={props.dataDeletor} childrenCompletedHandler={childrenCompletedHandler} />; 
    });
  } else {
    tasks = "";
  }

  
  return (
    <div className="home-container">
      <h1 className="home-heading-top txt-clr-4 fs-head-1 fw-1">Primary Tasks</h1>
      <ul className="task-elements-ul">{tasks}</ul>
     
    </div>
  );
}
// <Link to={"/test/wording/?ligma=ballz"}>HERE HERE</Link>
export default Home;
