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
function TaskRoute(props) {
  const [met, setMet] = useState("");
  const { data, dataSetter, urlSetter } = props;
  const { task } = useParams();
  const [addingMetric, setAddingMetric] = useState(false);
  const [newMetricValue, setNewMetricValue] = useState("");
  var metricAddClasses = addingMetric
    ? "modal-metric"
    : "modal-metric metricClose";
  let { state } = useLocation() || {
    name: task.substring(task.lastIndexOf("+")),
  };
  if (!state) {
    state = { name: task.substring(task.lastIndexOf("+") + 1) };
  }
  let heading = state.name;
  let str = "";
  heading = heading.trim();
  let temp = heading.substring(0, 1).toUpperCase() + heading.substring(1);
  heading = temp;
  let count = heading.indexOf(" ");
  while (count > -1) {
    temp = heading.charAt(count + 1).toUpperCase();
    str = str + heading.substring(0, count + 1) + temp;
    heading = heading.substring(count + 2);
    count = heading.indexOf(" ");
  }
  str = str + heading;
  //Show display to add a new metric (upto 3 total)
  const addNewMetric = (e) => {
    setAddingMetric(!addingMetric);
  };
  //submit the new metric name to server
  const submitNewMetric = (e) => {
    e.preventDefault();
    let nameUnique = true;
    met.forEach((element) => {
      if (element.name.toUpperCase() == newMetricValue.toUpperCase())
        nameUnique = false;
    });
    if (met.length < 3 && nameUnique) {
      fetch("/api/v1/tasks/" + task, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addMetric: {newMetricValue:newMetricValue,days:data.days} }),
      }).then(() => {
        setNewMetricValue("");
        setAddingMetric(false);
        props.setRerender(!props.rerender);
      });
    }
  };
  //  component that updates the current values of the metrics to the server
  const saveMetricHandler = (e) => {
    const id = e.target.id;
    let fetch_data;
    met.forEach((element) => {
      if (element.name + "-required" == id)
        fetch_data = {
          requiredValue: { name: element.name, value: e.target.value },
        };
      else if (element.name + "-current" == id) {
      
        fetch_data = {
          currentValue: { name: element.name, value:new Number(e.target.value) },
        };
      }
    });
    fetch("/api/v1/tasks/" + task, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fetch_data),
    }).then(props.setRerender(!props.rerender));
  };
  // controlled react component that handles input change to metric inputs
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
  //function to mark the task as completed
  const completedHandler = (e) => {
    fetch("/api/v1/tasks/" + task, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: { value: !data.completed } }),
    }).then(
      dataSetter((elem) => {
        return { ...data, completed: !data.completed };
      })
    );
  };
  const childrenCompletedHandler = (checked, element) => {
    const newData = data.children.map((elem) => {
      if (elem.name === element.name) return { ...elem, completed: checked };
      return elem;
    });

    dataSetter({ ...data, children: newData });
  };

  let tasks;
  let metrics;

  //Create a listed array of 'tasks' if data is available otherwise keep array empty
  if (Object.keys(data).length) {
    if (data.children && data.children.length > 0) {
      tasks = data.children
        .filter((element) => {
          if (props.filter === "completed") {
            return element.completed === true;
          } else if (props.filter === "incomplete") {
            return element.completed === false;
          } else return true;
        })
        .map((element) => {
          return (
            <Task
              element={element}
              key={element.name}
              dataSetter={props.dataSetter}
              dataDeletor={props.dataDeletor}
              childrenCompletedHandler={childrenCompletedHandler}
              preurl={task}
            />
          );
        });
    }

    if (met && data.parent === state.name) {
      metrics = met.map((element) => {
        return (
          <Fragment key={element.name}>
            <div className="info-child bg-clr-2 txt-clr-1">
              <label
                className="info-child-input-label"
                htmlFor={element.name + "-current"}
              >
                {element.name + " "}{" "}
              </label>
              <input
                className="info-child-input txt-clr-1"
                type="numeric"
                placeholder="Enter Value"
                value={element.currentValue}
                id={element.name + "-current"}
                onChange={metricChangeHandler}
                onBlur={saveMetricHandler}
              />
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

  // USE EFFECT
  useEffect(() => {
    fetch("/api/v1/tasks/" + task+"/")
      .then((response) => {
      
        let a = response.json();
   
        return a;
      })
      .then((dataJson) => {
        dataSetter(dataJson);
        setMet(dataJson.metrics);
        urlSetter(task);
      });
    return () => {
      props.dataSetter("");
    };
  }, [task, props.rerender]);
  return (
    <div className="task-route-container">
      <h1 className="task-route-heading-top txt-clr-4 fw-1 fs-head-1">{str}</h1>
      <div className="previous">
        <Link to={"/previoustask/" + task}>
          <button className="button-1 prev">Previous Data</button>
        </Link>
      </div>
      <div className="flex">
        <div className="info-container bg-clr-1">
          <div className="info-row-header">
            <div className="info-row-completed fs-head-2">
              Completed{" "}
              <input
                type="checkbox"
                onChange={completedHandler}
                className="markCompleted"
                checked={data.completed || false}
              />
            </div>
            <div>
              <button className="button-1" onClick={addNewMetric}>
                + Add Metric
              </button>
            </div>
          </div>

          <div className="info">
            <div className="info-child-header txt-clr-3 fs-head-2">
              <div>Target Name</div>
              <div>Target Achieved</div>
            </div>
            {metrics}
          </div>
          {
            <div className={metricAddClasses}>
              <div className="addAnotherMetric-main">
                <button
                  className="styled-button modal-close-button"
                  onClick={() => {
                    setAddingMetric(false);
                  }}
                >
                  X
                </button>
                {met.length < 3 ? (
                  ""
                ) : (
                  <div className="limit">*Cannot Add More Than 3 Metrics</div>
                )}
                <form onSubmit={submitNewMetric}>
                  <h3 className="modal-add-task-label marg">
                    <label htmlFor="addAnotherMetricInput">
                      Add Another Metric
                    </label>
                  </h3>
                  <input
                    id="addAnotherMetricInput"
                    type="text"
                    className="addAnotherMetricInput modal-add-task-input"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                  />
                  <button className="metric-submit styled-button">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          }
        </div>

        <div className="last-seven-days bg-clr-1">
          <ChartBuilder task={task} rerender={props.rerender} />
        </div>
      </div>
      <ul className="task-elements-ul">{tasks}</ul>
    </div>
  );
}

export default TaskRoute;
