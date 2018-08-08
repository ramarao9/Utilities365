import React, { Component }  from 'react';
import 'bulma/css/bulma.css'
import classes from './NavigationItems.css';
import NavigationItem from './NavigationItem/NavigationItem';
import { NavLink } from 'react-router-dom';
class navigationItems extends Component {


    state = {
        isActive: false
    }

    onNavBurgerClicked = () => {

//
        this.setState({ isActive: !this.state.isActive });
    }



    render() {

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
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}

export default navigationItems;