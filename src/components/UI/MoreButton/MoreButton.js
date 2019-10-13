import React, { useEffect, useState, useRef } from "react";
import pickerMore from "./more-16.png";
import "./MoreButton.css";

const MoreButton = ({ clicked, actions, contextObj }) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const node = useRef();

  useEffect(() => {
    // add when mounted
    document.addEventListener("mousedown", closeDropDownWhenClickedOutside);
    // return function to be called when unmounted
    return () => {
      document.removeEventListener(
        "mousedown",
        closeDropDownWhenClickedOutside
      );
    };
  }, []);

  const closeDropDownWhenClickedOutside = e => {
    if (node.current.contains(e.target)) return;

    setShowActionsMenu(false);
  };

  const onActionClicked = (event, action) => {
    clicked(event, action, contextObj);
  };

  let dropdownStyles = ["dropdown"];

  if (showActionsMenu) {
    dropdownStyles.push("is-active");
  }

  const dropDownActions = [...actions];

  let dropDownContent = dropDownActions.map(action => (
    <a
      key={action.id}
      href="#"
      className="dropdown-item"
      onClick={event => onActionClicked(event, action)}
    >
      {action.label}
    </a>
  ));

  return (
    <div className={dropdownStyles.join(" ")}>
      <div
        className="dropdown-trigger"
        onClick={ev => setShowActionsMenu(true)}
      >
        <img src={pickerMore} />
      </div>

      <div className="dropdown-menu" ref={node}>
        <div className="dropdown-content">{dropDownContent}</div>
      </div>
    </div>
  );
};

export default MoreButton;
