import React from "react";
import "./ProgressBar.css";

const progressBar = props => {
  let currentValue = props.currentPercent;
  let currentPercent = "";

  let progressAtts = {};

  if (currentValue != null) {
    progressAtts["value"] = currentValue;

    currentPercent = `${currentValue}%`;
  }

  let classes = ["progress","prog-ht"];

  if (props.progressClasses) {
    classes = classes.concat(props.progressClasses);
  }

  return (
    <progress {...progressAtts} className={classes.join(" ")} max="100">
      {currentPercent}
    </progress>
  );
};

export default progressBar;
