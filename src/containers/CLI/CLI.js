import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import * as crmUtil from '../../helpers/crmutil';
import * as actionTypes from '../../store/actions';
import Terminal from '../../components/UI/Terminal/Terminal';
import IsEmpty from 'is-empty';


class CLI extends Component {

    state = {

        outputs: []
    };

    onTerminalInputChanged = (ev) => {

        if (ev.keyCode !== 13)
            return;

        let userInput = ev.target.value;

        if (IsEmpty(userInput)) {
            //To Do :- create a new empty output
            return;
        }

        let userArgs = userInput.split(' ');

        var s = 100;
    }

    render() {

        if (!crmUtil.isValidToken(this.props.tokenData)) {
            return <Redirect to='/Auth' />
        }


        return (<div>
            <h2>CLI</h2>

            <div className="terminalContainer">
                <Terminal
                    outputs={this.state.outputs}
                    terminalInputChange={this.onTerminalInputChanged} />
            </div>
        </div>
        );
    }

}


const mapStateToProps = state => {
    return {
        tokenData: state.tokenData
    };

}

const mapDispatchToProps = dispatch => {
    return {
        onTokenRefresh: () => dispatch({ type: actionTypes.REFRESH_ACCESS_TOKEN })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CLI);

