import React, { useState } from "react";
import "bulma/css/bulma.css";
import "./NavigationItems.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import DropDownMenu from "../../UI/DropDownMenu/DropDownMenu";
import { MenuItem } from "../../../interfaces/MenuItem";
import { UserInfo } from "../../../interfaces/UserInfo";
import store from "../../../store/store";
import { useDispatch } from "react-redux";
import * as actionTypes from "../../../store/actions"


interface NavProps {
  currentUser?: UserInfo;
  onUserSignout?(): void;
}


export const NavigationItems: React.FC<NavProps> = (navProps: NavProps) => {
  let navigate = useNavigate();
  let location = useLocation();
  const dispatch = useDispatch()

  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedNavItem, setSelectedNavItem] = useState<string>("home");

  const onNavBurgerClicked = () => {
    setIsActive(!isActive);
  };

  const OnUserMenuItemClick = (event: any, menuItem: any) => {

    switch (menuItem.id) {
      case "signout":
  
        setSelectedNavItem("");
        navigate("/auth");

        dispatch({ type: actionTypes.SIGNOUT_USER });
        break;

      default:
        break;
    }

  };

  const onNavItemClick = (ev: any, itemName: string) => {
    setSelectedNavItem(itemName);
  }


  const userMenuOptions = [{ id: "signout", label: "Sign Out" }];

  let navEndUI = null;

  if (navProps && navProps.currentUser) {
    navEndUI = (<div className="userInfo">
      <div className="userDetail">
        <span className="orgName">{navProps.currentUser.orgName}</span>
        <span className="userName">{navProps.currentUser.name}</span>
        <span className="userId">{navProps.currentUser.userId}</span>
      </div>
      <DropDownMenu
        menuItems={userMenuOptions}
        menuItemClick={OnUserMenuItemClick} />
    </div>
    );
  }



  return (<div>
    <nav className="navbar is-link">
      <div className="navbar-brand">
        <a className={`navbar-burger ${(isActive ? "is-active" : "")}`}
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
          <NavLink className={`navbar-item ${selectedNavItem === "home" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "home")} to="home">
            Home
          </NavLink>
          <NavLink className={`navbar-item ${selectedNavItem === "cli" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "cli")} to="cli">
            CLI
          </NavLink>
          <NavLink className={`navbar-item ${selectedNavItem === "gs" ? "is-active" : ""}`} onClick={ev => onNavItemClick(ev, "gs")} to="guidsearch">
            Guid Search
          </NavLink>
        </div>
        <div className="navbar-end">{navEndUI}</div>
      </div>
    </nav>
  </div>);

}



