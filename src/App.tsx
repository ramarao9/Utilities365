import React from "react";
import {
  Routes,
  Route
} from "react-router-dom";
import { Home } from "./containers/Home/Home";
import { Auth } from "./containers/Auth/Auth";
import { Layout } from "./hoc/Layout/Layout";
import {GuidSearch} from "./containers/GuidSearch/GuidSearch";
import { CLI } from "./containers/CLI/CLI";
import "./App.css";
import "./css/appstyles.css";
import store from "./store/store";
import * as crmUtil from "./helpers/crmutil";
import { StoreState } from "./interfaces/Store/StoreState";
import { useSelector } from "react-redux";


interface IProps {
  children: React.ReactElement;
  redirectTo: React.ReactElement
  // any other props that come into the component
}
export const App: React.FC = () => {

  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const RequireAuth = ({ children, redirectTo }: IProps) => {
    try {
      const storeData = store.getState();
      let isAuthenticated = storeData && crmUtil.isValidToken(storeData.tokenData);
      return isAuthenticated ? children : redirectTo;
    }
    catch {
      console.log("error in auth check");
      return children;
    }
  }



  return (
    <div className="root-div">
      <Layout currentUser={currentUser}>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/home"
            element={
              <RequireAuth redirectTo={<Auth />}>
                <Home />
              </RequireAuth>
            }
          />


          <Route
            path="/cli"
            element={
              <RequireAuth redirectTo={<Auth />}>
                <CLI />
              </RequireAuth>
            }
          />


          <Route
            path="/guidsearch"
            element={
              <RequireAuth redirectTo={<Auth />}>
                <GuidSearch />
              </RequireAuth>
            }
          />


          <Route path="*" element={<Auth />} />
        </Routes>
      </Layout>
    </div>
  );
};


