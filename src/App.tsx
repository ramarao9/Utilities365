import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home/Home";
import Auth from "./containers/Auth/Auth";
import Layout from "./hoc/Layout/Layout";
import GuidSearch from "./containers/GuidSearch/GuidSearch";
import { CLI } from "./containers/CLI/CLI";
import "./App.css";

export const App: React.FC = () => {
  return (
    <div className="root-div">
      <Layout>
        <Switch>
          <Route path="#" exact component={Home} />
          <Route path="./" exact component={Home} />
          <Route path="/" exact component={Home} />
          <Route path="/home" exact component={Home} />
          <Route path="/auth" exact component={Auth} />
          <Route path="/guidsearch" exact component={GuidSearch} />
          <Route path="/cli" exact component={CLI} />
          <Route path="*" component={Home} />
        </Switch>
      </Layout>
    </div>
  );
};


