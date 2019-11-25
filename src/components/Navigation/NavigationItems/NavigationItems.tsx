import React, { useState } from "react";
import "bulma/css/bulma.css";
import "./NavigationItems.css";
import { NavLink, useHistory ,useLocation} from "react-router-dom";
import DropDownMenu from "../../UI/DropDownMenu/DropDownMenu";
import {MenuItem} from "../../../interfaces/MenuItem";
import {UserInfo} from "../../../interfaces/UserInfo";
import store from "../../../store/store";



interface NavProps{
  currentUser?:UserInfo;
  onUserSignout?():void;
}


export const NavigationItems: React.FC<NavProps> = (navProps:NavProps) => {
  let history = useHistory();
  let location = useLocation();

    const [isActive, setIsActive] = useState<boolean>(false); 
    const [selectedNavItem, setSelectedNavItem] = useState<string>("home");

  const onNavBurgerClicked = () => {
    setIsActive(!isActive);
  };

  const OnUserMenuItemClick = (event:any, menuItem:any) => {

    switch (menuItem.id) {
      case "signout": 
if(navProps.onUserSignout){
  navProps.onUserSignout();
}

      let { from } = location.state || { from: { pathname: "/" } };
      history.replace(from);
        break;

      default:
        break;
    }

  };

 const  onNavItemClick = (ev:any, itemName:string) => {
    setSelectedNavItem(itemName);
  }


  const userMenuOptions = [{ id: "signout", label: "Sign Out" }];

  let  navEndUI =null;
  
  if(navProps && navProps.currentUser)
  {
navEndUI=  (<div className="userInfo">
<div className="userDetail">
  <span className="orgName">{navProps.currentUser.orgName}</span>
  <span className="userName">{navProps.currentUser.name}</span>
  <span className="userId">{navProps.currentUser.userId}</span>
</div>
<DropDownMenu
  menuItems={userMenuOptions}
  menuItemClick={OnUserMenuItemClick}/>
</div>
);
  }



  return (<div>
    <nav className="navbar is-link">
    <div className="navbar-brand">
      <a className={`navbar-burger ${(isActive ? "is-active" : "")}` }
        aria-label="menu"
        aria-expanded="false"
        onClick={onNavBurgerClicked}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>
    <div className={`navbar-menu ${(isActive ? "is-active" : "")}`}>
      {/* navbar start, navbar end  */}
      <div className="navbar-start">
      <NavLink className={`navbar-item ${selectedNavItem == "home" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "home")} exact to="/home">
      Home
    </NavLink>
    <NavLink className={`navbar-item ${selectedNavItem == "cli" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "cli")} exact to="/cli">
      CLI
    </NavLink>
    <NavLink className={`navbar-item ${selectedNavItem == "gs" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "gs")} exact to="/guidsearch">
    Guid Search
    </NavLink>
      </div>
      <div className="navbar-end">{navEndUI}</div>
    </div>
  </nav>
</div>);
  
}


 
