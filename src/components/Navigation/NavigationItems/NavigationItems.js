import React, { Component }  from 'react';
import { connect } from "react-redux";
import 'bulma/css/bulma.css'
import classes from './NavigationItems.css';
import NavigationItem from './NavigationItem/NavigationItem';
import { NavLink } from 'react-router-dom';
class navigationItems extends Component {


    state = {
        isActive: false,
        isAuthenticated:false
    }

    onNavBurgerClicked = () => {

//
        this.setState({ isActive: !this.state.isActive });
    }



    render() {

let navEndUI = null;


if(this.props.currentUser!=null)
{

const user=this.props.currentUser;

navEndUI=(
    <div className="userInfo">
    <span className="orgName">{user.orgName}</span>
<span className="userName">{user.name}</span>
 <span className="userId">{user.userId}</span>
</div>
);
}



        return (
            <div>

                <nav className="navbar is-link">
                    <div className="navbar-brand">
                        {/* navbar items, navbar burger */}

                        <a role="button" className={"navbar-burger " + (this.state.isActive ? 'is-active' : '')} aria-label="menu" aria-expanded="false" onClick={this.onNavBurgerClicked}>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div className={"navbar-menu " + (this.state.isActive ? 'is-active' : '')}>
                        {/* navbar start, navbar end  */}
                        <div className="navbar-start">
                            <NavLink className="navbar-item" exact to="/home">Home</NavLink>
                            <NavLink className="navbar-item" exact to="/guidsearch">Guid Search</NavLink>
                            <NavLink className="navbar-item" exact to="/cli">CLI</NavLink>
                        </div>

                           <div className="navbar-end">
{navEndUI}

                           </div>
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


export default connect(
  mapStateToProps
)(navigationItems);


