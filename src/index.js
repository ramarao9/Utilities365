import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store/store";

import "./index.css";
import {App} from "./App";
import registerServiceWorker from "./registerServiceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";

import {
  faCopy,
  faTimes,
  faTrashAlt,
  faSearch,
  faPlus,
  faPencilAlt,
  faEraser,
  faSlash,
  faAngleDown,
  faGreaterThan,
  faBan
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faAngleDown,
  faGreaterThan,
  faTimes,
  faSearch,
  faEraser,
  faPencilAlt,
  faTrashAlt,
  faPlus,
  faCopy,
  faSlash,
  faBan
);

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(app, document.getElementById("root"));
registerServiceWorker();
