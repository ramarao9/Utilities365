import React, { Component } from 'react';
import classes from './Layout.css';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';


class Layout extends Component {
    state = {
        showSideDrawer: false
    }



    //
    render () {
        return (
            <React.Fragment>
                <Toolbar drawerToggleClicked={this.sideDrawerToggleHandler} />

                <main className="Content">
                    {this.props.children}
                </main>
            </React.Fragment>
        )
    }
}

export default Layout;



