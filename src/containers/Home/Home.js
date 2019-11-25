import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import Aux from '../../hoc/_Aux/_Aux';
import * as crmUtil from '../../helpers/crmutil';
import "./Home.css";
import { openWindow } from "../../helpers/util";
class Home extends Component {
    state = {

    }

    onLinkClick = (ev, url) => {
        openWindow(url, true);
    }

    render() {
        if (!crmUtil.isValidToken(this.props.tokenData)) {
            this.props.history.push('/Auth');
        }

        return (
            <React.Fragment>
                <h4 className="title is-4" style={{marginBottom: 10}}>Welcome to Utilities 365!</h4>
                <hr className="hr" style={{marginBottom: 0,marginTop:0}}></hr>
                <div>
                    <div className="docMenuItem">
                        <span className="spTitle">Documentation</span>
                        <ul>
                            <li><p><a className="docLink" onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/")}>Overview</a></p></li>
                            <li><a className="docLink" onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/wiki/CLI")}>CLI</a></li>
                            <li><a className="docLink" onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/wiki/Guid-Search")}>Guid Search</a></li>
                        </ul>
                    </div>
                    <div className="docMenuItem">
                        <span className="spTitle">Other</span>
                        <ul>
                            <li><a className="docLink" onClick={ev => this.onLinkClick(ev, "https://github.com/ramarao9/Utilities365/issues")}>Issue</a></li>
                        </ul>
                    </div>
                </div>
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