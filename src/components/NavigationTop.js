import { React, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth";
import "../App.css";
function NavigationTop() {
  let name;
  const [profileVisible, setProfileVisible] = useState(false);
  const [navClasses,setNavClasses]=useState("nav-top-elem-wrapper");
  const loginRef = useRef(null);
  const auth = useAuth();
  if (auth.user) {
    name = auth.user;
  }
  const showProfile = () => {
    setProfileVisible(!profileVisible);
  };
  const detectOutsideClick = (e) => {

    if (
      loginRef &&
      !loginRef.current.contains(e.target) &&
      loginRef.current.parentNode !== e.target
    ) {
      setProfileVisible(false);
    }
  };
  const logoutHandler = () => {
    fetch("http://localhost:4000/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).then(window.location.replace("http://localhost:4000/login"));
  };
  useEffect(() => {
    document.addEventListener("mousedown", detectOutsideClick);
  });
  let classes = "profile-dropdown  bg-clr-1 ";
  if (!profileVisible) {
    classes = "profile-dropdown  profile-dropdown-scale";
  }
  const navClassHandler=()=>{
    if(navClasses=="nav-top-elem-wrapper"){
      setNavClasses("nav-top-elem-wrapper nav-visible")
    }
    else setNavClasses("nav-top-elem-wrapper")
  }
  return (
    <div className="top-bar-container  bg-clr-1">
      <div className="top-bar txt-clr-1">
        <div className="welcome-div">Welcome, {name}</div>
        <div className="toggle-menu-right" onClick={navClassHandler}>
          <div className="toggle-menu-child"></div>
          <div className="toggle-menu-child"></div>
          <div className="toggle-menu-child"></div>
        </div>
      
      </div>
      <div className={navClasses}>
      <div className="profile bg-clr-2" onClick={showProfile}>
       <div className="fs-head-1 profile-letter txt-clr-1">
        {name?name.charAt(0).toUpperCase():null}
        </div> 
            <div
              ref={loginRef}
              className={classes}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="logout">
                <div onClick={logoutHandler}>Logout</div>
              </div>
            </div>
          </div>
          <Link to="/">
            <div className="nav-top-element">Home</div>
          </Link>
          <Link to="/monthview">
            <div className="nav-top-element">Month View</div>
          </Link>
          
        </div>
    </div>
  );
}

export default NavigationTop;
