import React, { Component } from 'react';
import classes from './Layout.css';
import {Toolbar} from '../../components/Navigation/Toolbar/Toolbar';
import { connect } from "react-redux";
import * as actionTypes from "../../store/actions";

class Layout extends Component {
    state = {
        showSideDrawer: false
    }

    render () {
        return (
            <React.Fragment>
                <Toolbar currentUser={this.props.currentUser} onUserSignout={event => this.props.onUserSignOut()} />

                <main className="Content">
                    {this.props.children}
                </main>
            </React.Fragment>
        )
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
  
  export default connect(mapStateToProps,mapDispatchToProps)(Layout);