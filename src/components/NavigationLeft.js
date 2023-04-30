import { React, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "./auth";
import "../App.css";
function NavigationLeft(props) {
  let loc = useLocation();
  let name;
  const auth = useAuth();
  if (auth.user) {
    name = auth.user;
  }
  const [toggleClasses, setToggleClasses] = useState("navigation-left");

  let modalDisplay = false;
  let pathname = loc.pathname;


  if (pathname == "/" || pathname.substring(0, 6) == "/tasks") {
    modalDisplay = true;
  }

  let k;
  if (modalDisplay) {
    k = (
      <Modal
        children={props.children}
        data={props.data}
        dataSetter={props.dataSetter}
        url={props.url}
        rerender={props.rerender}
        setRerender={props.setRerender}
      />
    );
  } else k = "";


  const filterSelector = (e) => {
    props.setFilter(e.target.id);
  };
  const filterClassSelector = (name) => {
   
    let a;
 
    if (name === props.filter) {
      a = "navigation-bottom-elements" + " navigation-bottom-elements-active";

      return a;
    } else {
      a = "navigation-bottom-elements";
    }

    return a;
  };
  const toggleHamburger = () => {
    setToggleClasses(
      toggleClasses === "navigation-left"
        ? "navigation-left sidebar-visible"
        : "navigation-left"
    );
  };
  return (
    <>
      <div role="button" onClick={toggleHamburger} className="toggle-sidebar">
      <img src="https://img.icons8.com/external-those-icons-lineal-those-icons/96/null/external-sidebar-applications-windows-those-icons-lineal-those-icons.png"/>
      </div>
      <div className={toggleClasses}>
        <div className="left-navigation-wrapper bg-clr-1">
          <div
            className={filterClassSelector("all")}
            id="all"
            onClick={filterSelector}
          >
            All tasks
          </div>

          <div
            className={filterClassSelector("completed")}
            onClick={filterSelector}
            id="completed"
          >
            Completed tasks
          </div>
          <div
            className={filterClassSelector("incomplete")}
            id="incomplete"
            onClick={filterSelector}
          >
            Incomplete tasks
          </div>
          {k}
        </div>
      </div>
    </>
  );
}

export default NavigationLeft;
