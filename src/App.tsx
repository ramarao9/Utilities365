import React, { Component, ReactNode } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./containers/Home/Home";
import {Auth} from "./containers/Auth/Auth";
import Layout from "./hoc/Layout/Layout";
import GuidSearch from "./containers/GuidSearch/GuidSearch";
import { CLI } from "./containers/CLI/CLI";
import "./App.css";
import "./css/appstyles.css";
import store from "./store/store";
import * as crmUtil from "./helpers/crmutil";

interface IProps {
  children: ReactNode;
  path:string
  // any other props that come into the component
}
export const App: React.FC = () => {


  const PrivateRoute=({ children, ...rest } : IProps) =>{

    const storeData = store.getState();
    return (
      <Route
        {...rest}
        render={({ location }) =>
        
        storeData && crmUtil.isValidToken(storeData.tokenData) ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/auth",
                state: { from: location }
              }}
            />
          )
        }
      />
    );
  }



  return (
    <div className="root-div">
      <Layout>
        <Switch>
        <Route path="/auth" exact component={Auth} />
        <PrivateRoute path="/home">
           <Home/>
        </PrivateRoute>
        <PrivateRoute path="/cli">
           <CLI/>
        </PrivateRoute>
        <PrivateRoute path="/guidsearch">
        <GuidSearch/>
        </PrivateRoute>
        <Route path="*" exact component={Auth} />
        </Switch>
      </Layout>
    </div>
  );
};


