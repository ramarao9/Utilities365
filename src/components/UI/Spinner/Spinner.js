import React from "react";

import "./Spinner.css";

const spinner = props => (
  <div className="spinner-cont">
    <div className="spinner" />
    {props.text}
  </div>
);

export default spinner;
