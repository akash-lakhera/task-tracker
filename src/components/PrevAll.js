import "../App.css";
import { React, useState, useEffect,} from "react";
import Task from "./Task";
import { Link,useParams,useLocation,useSearchParams} from "react-router-dom";
function PrevAll(props) {

  const [data,dataSetter]=useState('');
  const [searchParams]=useSearchParams()

  const add=(e)=>{
  } 
  useEffect(() => {
       let fetchUrl
       fetchUrl="/api/v1/tasks/?date="+searchParams.get("date")
      
    //fetch data for Home page
    fetch(fetchUrl)
      .then((response) => {
        return response.json();
      })
      .then((dataJson) => {
        dataSetter(dataJson);
        
      });
      return ()=>{
        
        dataSetter("")
      }
      
  }, []);
  var tasks;
  //Create a listed array of 'tasks' if data is available otherwise keep array empty
  if (Object.keys(data).length) {
    tasks = data.children.filter((element)=>{
      if(props.filter==="completed"){
        return (element.completed===true)
      }
      else if(props.filter==="incomplete"){
        return(element.completed===false)
      }
      else return true
    }).map((element) => {
      return <Task date={searchParams.get("date")?searchParams.get("date"):null} element={element} key={element.name} dataSetter={props.dataSetter} dataDeletor={props.dataDeletor} />; 
    });
  } else {
    tasks = "";
  }
  return (
    <div className="home-container">
      <h2 className="home-heading-top">Primary Tasks</h2>
      <ul className="task-elements-ul">{tasks}</ul>
     
    </div>
  );
}
// <Link to={"/test/wording/?ligma=ballz"}>HERE HERE</Link>
export default PrevAll;
