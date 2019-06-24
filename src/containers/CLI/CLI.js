import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import * as crmUtil from '../../helpers/crmutil';
import * as actionTypes from '../../store/actions';
import Terminal from '../../components/UI/Terminal/Terminal';
import IsEmpty from 'is-empty';
import { getCliData } from '../../services/CliParsingService';
import { PerformCrmAction } from '../../services/CLI/CrmCliService';

import { ELEMENT_TYPE_TEXT } from '../../services/CLI/CliResponse';
class CLI extends Component {

    state = {

        inputText: "",
        outputs: []
    };

    onTerminalInputKeyUp = async (ev) => {

        if (ev.keyCode !== 13)
            return;

        const userInput = this.state.inputText;

        const cliData = getCliData(userInput);

       let cliResponse= await PerformCrmAction(cliData);

       this.showActionResult(cliResponse);

    }

    onTerminalInputChanged = (ev) => {
        const userInput = ev.target.value;
        this.setState({ inputText: userInput });
    }

    showActionResult = (cliResponse) => {
 
        const userInput = this.state.inputText;

        const updatedOutputs = [...this.state.outputs];
        updatedOutputs.push({type:ELEMENT_TYPE_TEXT,data:">" + userInput});
        if(cliResponse!=null){
        updatedOutputs.push(cliResponse);
        }
        this.setState({ outputs: updatedOutputs, inputText: "" });
    }

    addTextToOutput = (outputText) => {
        const updatedOutputs = [...this.state.outputs];
        updatedOutputs.push(outputText);
        this.setState({ outputs: updatedOutputs });
    }

    clearInputText = () => {
        this.setState({ inputText: "" });
    }

    render() {

        if (!crmUtil.isValidToken(this.props.tokenData)) {
            return <Redirect to='/Auth' />
        }

        return (
            <div>
                <h2>CLI</h2>

                <div className="terminalContainer">
                    <Terminal
                        outputs={this.state.outputs}
                        terminalInputChange={(event) => this.onTerminalInputChanged(event)}
                        terminalInputKeyUp={this.onTerminalInputKeyUp}
                        inputText={this.state.inputText}
                    />
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

