
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import App from './App';

it('renders without crashing', () => {
  const app = (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );

  //const div = document.createElement('div');
  //ReactDOM.render(app,div);
  //ReactDOM.unmountComponentAtNode(div);
});


