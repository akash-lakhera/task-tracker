import { React, useEffect, Fragment, useState } from "react";
import "../App.css";
import {
  Link,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import Task from "./Task";
import ChartBuilder from "./ChartBuilder";
function PrevTask(props) {

  const [met, setMet] = useState("");
  const [ data, dataSetter ] = useState('');
  const [searchParams]=useSearchParams()

  const { task } = useParams();
  const [addingMetric,setAddingMetric]=useState(false)
  const [newMetricValue,setNewMetricValue]=useState('')

  let { state } = useLocation() || {
  name: task.substring(task.lastIndexOf("+")),
  };
  if (!state) {
    state = { name: task.substring(task.lastIndexOf("+") + 1) };
  }
  let heading = state.name;
  let length = heading.length;
  let str = "";
  heading = heading.trim();
  let temp = heading.substring(0, 1).toUpperCase() + heading.substring(1);
  heading = temp;
  let count = heading.indexOf(" ");
  while (count > -1) {
    temp = heading.substring(count + 1, count + 2);
    temp = temp.toUpperCase();
    str = str + heading.substring(0, count + 1) + temp;
    heading = heading.substring(count + 2);
    count = heading.indexOf(" ");
  }
  str = str + heading;

  const saveMetricHandler = (e) => {
    const id = e.target.id;
    let fetch_data;
    met.forEach((element) => {
      if (element.name + "-required" == id)
        fetch_data = {
          requiredValue: { name: element.name, value: e.target.value },
        };
    });
    fetch("/api/v1/tasks/" + task, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fetch_data),
    });
  };
  const metricChangeHandler = (e) => {
    const id = e.target.id;
    const newMet = met.map((element) => {
      if (element.name + "-required" == id)
        return { ...element, requiredValue: e.target.value };
      else if (element.name + "-current" == id)
        return { ...element, currentValue: e.target.value };
      return element;
    });
    setMet(newMet);
  };
  
  let tasks;
  let metrics;

  //Create a listed array of 'tasks' if data is available otherwise keep array empty
  if (Object.keys(data).length) {
    if (data.children && data.children.length > 0) {
      tasks = data.children.filter((element)=>{
        if(props.filter==="completed"){
          return (element.completed===true)
        }
        else if(props.filter==="incomplete"){
          return(element.completed===false)
        }
        else return true
      }).map((element) => {
        return (
          <Task
          date={searchParams.get("date")?searchParams.get("date"):null}
            element={element}
            key={element.name}
            dataSetter={props.dataSetter}
            dataDeletor={props.dataDeletor}
            preurl={task}
          />
        );
      });
    }

    if (met && data.parent === task) {
      metrics = met.map((element) => {
        return (
          <Fragment key={element.name}>
            
          
          
            
            <div className="info-child-prev">

            
            {element.currentValue} {element.name}
            </div>
           
          
              
           
        
        </Fragment>
        );
      });
    } else {
      metrics = "";
    }
  } else {
    tasks = "";
    metrics = "";
  }
  const addNewMetric=(e)=>{
    setAddingMetric(!addingMetric)
    
  }
  const submitNewMetric=()=>{
    fetch("/api/v1/tasks/"+task, {
      method:"PUT",headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ addMetric:newMetricValue }),
    }).then(()=>{setNewMetricValue('')
  setAddingMetric(false)})
  
  }
  useEffect(() => {
    //fetch data for Home page
   
 
    fetch(`/api/v1/tasks/${task}/?date=${searchParams.get("date")}`)
      .then((response) => {
        let a = response.json();
        return a;
      })
      .then((dataJson) => {
        dataSetter(dataJson);
        setMet(dataJson.metrics);
        
      });
    return () => {
      dataSetter("");
    };
  }, [task],props.rerender);
  return (
    <div className="task-route-container">
     <div className="flex-R-SB"> <h2 className="task-route-heading-top">{str}</h2> <h2 className="task-route-heading-top">{searchParams.get("date")}</h2></div> 
      <Link to={`/previoustask/${task}/?date=${searchParams.get("date")}`}>
      <div className="previous">
        <button className="add-new-metric prev">Previous Data</button>
        </div>
      </Link>
      <div className="flex">

      <div className="info-container">
      <div className="info">
          
          <div className="info-child-header flex-R-C">Target Achieved</div>
          {metrics}
        </div>
       {addingMetric?<div className="addAnotherMetric">
          <input type="text" className="addAnotherMetricInput" value={newMetricValue} onChange={(e)=>{
            setNewMetricValue(e.target.value)
            
          }} />
          <button onClick={submitNewMetric}>Submit</button>
        </div>:''}
      </div>
      <div className="last-seven-days"><ChartBuilder task={task} date={searchParams.get("date")?searchParams.get("date"):null}/>
     </div>
          </div>
      <ul className="task-elements-ul">{tasks}</ul>
    </div>
  );
}

export default PrevTask;
