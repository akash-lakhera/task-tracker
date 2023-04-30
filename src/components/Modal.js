import { React, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import mod from "../clipart171655.png";
import "../App.css";
function Modal(props) {
  const loc = useLocation();
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("");
  const [days, setDays] = useState(new Array(7).fill(false));
  const [taskError, setTaskError] = useState("");
  const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const { url } = props;

  const modalDaysHandler = (ind) => {
    const newDays = days.map((element, index) =>
      index === ind ? !element : element
    );
   
    setDays(newDays);
  };
  const modalHandler = () => {
    if(active){
      setName('')
      setMetric('')
    }
    setActive(!active);
  };
  const onChangeHandler = (e) => {
 
    if (e.target.id === "new-task") {
      setName(e.target.value);
    } else setMetric(e.target.value);
  };
  var newTaskCreator = (e) => {
    e.preventDefault();
   
    let emptycheck = false;
    let nameUnique = true;
    days.forEach((element) => {
      if (element) {
        emptycheck = true;
      }
    });
    if (!emptycheck) {
      setTaskError("Please Select At Least One Day");
      setTimeout(() => {
        setTaskError("");
      }, 10000);
    }
    if (props.children) {
      props.children.forEach((element) => {
        if (element.name.toUpperCase() == name.toUpperCase()) {
          nameUnique = false;
          setTaskError("Sibling Tasks cannot Have Same Names");
          setTimeout(() => {
            setTaskError("");
          }, 10000);
        }
      });
    }
    if (emptycheck && nameUnique) {
    
      let fetchDays = week.map((element, index) => {
     
        if (days[index]) return element;
        else return 0;
      });

   
      fetch("/api/v1/tasks/" + url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), metric: metric, days: fetchDays }),
      }).then(() => {
        const temp_name = name;
        const temp_metric = metric;
        setName("");
        setMetric("");
        setActive(false);
        if(days[new Date().getDay]){

          props.dataSetter({
            date: props.data,
          children: [
            ...props.children,
            {
              name: temp_name,
              metrics: [
                { name: temp_metric, requiredValue: 0, currentValue: 0 },
              ],
            },
          ],
        });
      }
      setDays(new Array(7).fill(false));
      props.setRerender(!props.rerender);
      });
    } else {

    }
  };
  var classes;
  var main;
  if (!active) classes = "modal none";
  else classes = "modal";
  useEffect(() => {
   
    return () => {};
  }, []);
  return (
    <>
      <div
        className="styled-button modal-add-task-button"
        onClick={modalHandler}
      >
        <img className="modal-button-png" src={mod} alt="logo top"></img>
      </div>
      <div className={classes}>
        <div className="modal-main">
          <button
            className="styled-button modal-close-button"
            onClick={modalHandler}
          >
            X
          </button>
          <form onSubmit={newTaskCreator}>
            <h3 className="modal-add-task-label">
              <label htmlFor="new-task">Enter The Task Name</label>
            </h3>
            <input
              maxLength={15}
              className="modal-add-task-input"
              id="new-task"
              autoComplete="off"
              required
              value={name}
              onChange={onChangeHandler}
            ></input>
            <h3 className="modal-add-task-label">
              <label htmlFor="new-task-metric">Enter The Task Metric</label>
            </h3>
            <input
             maxLength={15}
              className="modal-add-task-input"
              id="new-task-metric"
              value={metric}
              autoComplete="off"
              required
              onChange={onChangeHandler}
            ></input>
            <h3 className="modal-add-task-label">Select Days</h3>
            <ul className="modal-add-task-days">
              {week.map((element, index) => {
                let disableValue;
                if (!props.data) disableValue = false;
                else {
                  disableValue = props.data[index] ? false : true;
                }
                return (
                  <li key={element}>
                    <div className="modal-days-item">
                      <input
                        type="checkbox"
                        id={index}
                        onChange={() => {
                          modalDaysHandler(index);
                        }}
                        disabled={disableValue}
                        value={element}
                        checked={days[index]}
                      />
                      <label className="modal-days-item-label" htmlFor={index}>
                        {element}{" "}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button className="styled-button modal-submit">Save task</button>
          </form>
          <div className="limit">{taskError}</div>
        </div>
      </div>
    </>
  );
}

export default Modal;
