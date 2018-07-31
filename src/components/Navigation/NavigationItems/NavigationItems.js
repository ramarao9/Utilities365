import React from 'react';
import 'bulma/css/bulma.css'
import classes from './NavigationItems.css';
import NavigationItem from './NavigationItem/NavigationItem';
import { NavLink } from 'react-router-dom';
const navigationItems = () => (
    <div>

        <nav className="navbar is-primary">
            <div className="navbar-brand">
                {/* navbar items, navbar burger */}
            </div>
            <div className="navbar-menu">
                {/* navbar start, navbar end  */}
                <div className="navbar-start">
                    <NavLink className="navbar-item" exact to="/home">Home</NavLink>
                    <NavLink className="navbar-item" exact to="/guidsearch">Guid Search</NavLink>
                </div>
            </div>
        </nav>
    </div>
);

export default navigationItems;