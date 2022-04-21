
import ReactDOM from "react-dom";
import { MemoryRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./store/store";

import "./index.css";
import {App} from "./App";


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
  faBan,
  faLink,
  faTable
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
  faBan,
  faLink,
  faTable
);

const app = (
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);

ReactDOM.render(app, document.getElementById("root"));

