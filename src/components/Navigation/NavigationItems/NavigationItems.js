import React, { Component } from "react";
import { connect } from "react-redux";
import "bulma/css/bulma.css";
import classes from "./NavigationItems.css";
import NavigationItem from "./NavigationItem/NavigationItem";
import { NavLink } from "react-router-dom";
import DropDownMenu from "../../UI/DropDownMenu/DropDownMenu";
import * as actionTypes from "../../../store/actions";
class navigationItems extends Component {
  state = {
    isActive: false,
    isAuthenticated: false
  };

  onNavBurgerClicked = () => {
    //
    this.setState({ isActive: !this.state.isActive });
  };

  onUserMenuItemClick = (event, menuItem) => {

    
    switch (menuItem.id) {
      case "signout":  this.props.onUserSignOut();  
        break;
    
      default:
        break;
    }

  };

  render() {
    let navEndUI = null;

    if (this.props.currentUser != null) {
      const user = this.props.currentUser;

      const userMenuOptions = [{ id: "signout", label: "Sign Out" }];

      navEndUI = (
        <div className="userInfo">
          <div className="userDetail">
            <span className="orgName">{user.orgName}</span>
            <span className="userName">{user.name}</span>
            <span className="userId">{user.userId}</span>
          </div>
          <DropDownMenu
            menuItems={userMenuOptions}
            menuItemClick={this.onUserMenuItemClick}
          />
       
        </div>
      );
    }

    return (
      <div>
        <nav className="navbar is-link">
          <div className="navbar-brand">
            {/* navbar items, navbar burger */}

            <a
              role="button"
              className={
                "navbar-burger " + (this.state.isActive ? "is-active" : "")
              }
              aria-label="menu"
              aria-expanded="false"
              onClick={this.onNavBurgerClicked}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </a>
          </div>
          <div
            className={
              "navbar-menu " + (this.state.isActive ? "is-active" : "")
            }
          >
            {/* navbar start, navbar end  */}
            <div className="navbar-start">
              <NavLink className="navbar-item" exact to="/home">
                Home
              </NavLink>
              <NavLink className="navbar-item" exact to="/guidsearch">
                Guid Search
              </NavLink>
              <NavLink className="navbar-item" exact to="/cli">
                CLI
              </NavLink>
            </div>

            <div className="navbar-end">{navEndUI}</div>
          </div>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentUser: state.currentUser
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onUserSignOut:() =>
      dispatch({ type: actionTypes.SIGNOUT_USER})
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(navigationItems);
