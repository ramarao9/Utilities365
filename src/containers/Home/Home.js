import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import Aux from '../../hoc/_Aux/_Aux';
import * as crmUtil from '../../helpers/crmutil';


class Home extends Component {
    state = {

    }


    render() {

        if (!crmUtil.isValidToken(this.props.tokenData)) {
            return <Redirect to='/Auth' />
        }

        return (
            <Aux>
                <h1>Welcome to Utilities365!</h1>
            </Aux>
        );
    }

}


const mapStateToProps = state => {
    return {
        tokenData: state.tokenData
    };
}


export default connect(mapStateToProps, null)(Home);