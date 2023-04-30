import {React,useState } from "react";
import { Link} from "react-router-dom";
import "../App.css";
function Task(props) {
  console.log("Inside Task")
  const [checked,setChecked]=useState('')
  var element = props.element;
  var preurl = props.preurl || "";
  let fetching;
  if (!props.date)
  {
    if (preurl != "") 
    fetching = `/tasks/${preurl}+${element.name}`;
    else fetching = `/tasks/${element.name}`;
  }
 else{
  
   if(preurl!=""){
     fetching=`/particularday/${preurl}+${element.name}/?date=${props.date}`
     
    }
    else fetching = `/particularday/${element.name}/?date=${props.date}`;
  }

  const stop = (e) => {
    let a=e.target.checked
    console.log(e.target.checked)
    console.log("are you kidding me")
    console.log("/api/v1/tasks/")
    fetch(`/api/v1/tasks/${preurl}${element.name}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({completed:{value:e.target.checked}}),
    }).then(props.childrenCompletedHandler(a,element));
    
  };
 
  return (
    <Link
      to={fetching}
      state={{ name: element.name }}
      title={`Click to view details of ${element.name}`}
      onClick={(e) => {
      }}
    >
      <li className="task-element">
        <div className="task-div appear">
          <div className="task-header txt-clr-1">{element.name.toUpperCase()}</div>
          

          <div>
            <div className={!props.date?"metric-div":"prev-task-metric-div"}>
              {element.metrics[0].name.toUpperCase()}:{element.metrics[0].currentValue}
            </div> 
            {props.date?'':<div><div className="check-div">
              <label
                onChange={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                htmlFor={element.name}
              >
                <input
                  type="checkbox"
                  id={element.name}
                  onChange={stop}
                  title=""
                  checked={element.completed}
                ></input>
                Completed
              </label>
            </div>
            <div
              className="delete-button-div"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button className="delete-button button-1"
                onClick={(e) => {
                  e.preventDefault();
                  props.dataDeletor(e, fetching);
                }}
                title="Delete Task"
                name={element.name}
              >
                Delete Task
              </button>
            </div>
            </div>}
          </div>
        </div>
      </li>
    </Link>
  );
}

export default Task;
