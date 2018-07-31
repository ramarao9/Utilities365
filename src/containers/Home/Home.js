import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import Aux from '../../hoc/_Aux/_Aux';

class Home extends Component {
    state = {

    }


    render() {

        if (this.props.tokenData === null || this.props.tokenData === undefined) {
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