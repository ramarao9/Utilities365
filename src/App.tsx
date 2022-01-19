import React from "react";
import {
  Routes,
  Route,
  Navigate,
  To
} from "react-router-dom";
import { Home } from "./containers/Home/Home";
import { Auth } from "./containers/Auth/Auth";
import Layout from "./hoc/Layout/Layout";
import GuidSearch from "./containers/GuidSearch/GuidSearch";
import { CLI } from "./containers/CLI/CLI";
import "./App.css";
import "./css/appstyles.css";
import store from "./store/store";
import * as crmUtil from "./helpers/crmutil";


interface IProps {
  children: React.ReactElement;
  redirectTo: To
  // any other props that come into the component
}
export const App: React.FC = () => {


  const RequireAuth = ({ children, redirectTo }: IProps) => {
    const storeData = store.getState();
    let isAuthenticated = storeData && crmUtil.isValidToken(storeData.tokenData);
    return isAuthenticated ? children : <Navigate to={redirectTo} />;
  }



  return (
    <div className="root-div">
      <Layout>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/home"
            element={
              <RequireAuth redirectTo="/auth">
                <Home />
              </RequireAuth>
            }
          />


          <Route
            path="/cli"
            element={
              <RequireAuth redirectTo="/auth">
                <CLI />
              </RequireAuth>
            }
          />

          <Route
            path="/clitemp"
            element={<Home />}
          />


          <Route
            path="/guidsearch"
            element={
              <RequireAuth redirectTo="/auth">
                <GuidSearch />
              </RequireAuth>
            }
          />

          <Route path="/" element={<Auth />} />

          <Route path="#" element={<Auth />} />

          <Route path="*" element={<Auth />} />
        </Routes>
      </Layout>
    </div>
  );
};


