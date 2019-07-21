import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store/store";

import "./index.css";
import {App} from "./App";
import registerServiceWorker from "./registerServiceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faTimes,
  faTrashAlt,
  faSearch,
  faPlus,
  faPencilAlt,
  faEraser,
  faAngleDown
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faAngleDown,
  faTimes,
  faSearch,
  faEraser,
  faPencilAlt,
  faTrashAlt,
  faPlus,
  faCopy
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
