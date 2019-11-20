import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import Aux from '../../hoc/_Aux/_Aux';
import * as crmUtil from '../../helpers/crmutil';

import { openWindow } from "../../helpers/util";
class Home extends Component {
    state = {

    }

    onLinkClick = (ev, url) => {
        openWindow(url, true);
    }

    render() {
        if (!crmUtil.isValidToken(this.props.tokenData)) {
            return <Redirect to='/Auth' />
        }

        return (
            <React.Fragment>
                <h4 className="title is-4">Welcome to Utilities 365!</h4>
                <p><a onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/wiki")}>Documentation</a></p>
                <p><a onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/issues")}>Issue</a></p>
            </React.Fragment>
        );
    }

}


const mapStateToProps = state => {
    return {
        tokenData: state.tokenData
    };
}


export default connect(mapStateToProps, null)(Home);