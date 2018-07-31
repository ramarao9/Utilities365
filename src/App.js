import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './containers/Home/Home';
import Auth from './containers/Auth/Auth';
import Layout from './hoc/Layout/Layout';
import GuidSearch from './containers/GuidSearch/GuidSearch';

import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <Layout>
        <Switch>
            <Route path="/" exact component={GuidSearch} />
            <Route path="/home" exact component={Home} />
            <Route path="/auth" exact component={Auth} />
            <Route path="/guidsearch" exact component={GuidSearch} />
          </Switch>
        </Layout>
      </div>
    );
  }
}

export default App;
