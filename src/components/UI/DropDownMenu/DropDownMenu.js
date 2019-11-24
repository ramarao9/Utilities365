import React, { useEffect, useState, useRef } from "react";
import classes from "./DropDownMenu.css";
 const DropDownMenu = ({ menuItems, menuItemClick }) => {
  const node = useRef();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // add when mounted
     document.addEventListener("mousedown", handleClickOutside);
    // return function to be called when unmounted
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = e => {
    if (e.target.classList.contains("dropdownMenu-trigger")) return;
    if (node.current.contains(e.target)) return;
    closeMenu();
  };

  const closeMenu = () => {
    setOpen(false);
  };

  const onContClick = () => {
    setOpen(true);
  };

  let dropdownStyles = ["dropdown", "dropdownMenu"];
  if (open) {
    dropdownStyles.push("is-active");
  }

  let dropDownContent = menuItems.map(menuItem => (
    <a
      key={menuItem.id}
      href="/#"
      className="dropdown-item"
      onClick={event => {
        closeMenu();
        menuItemClick(event, menuItem);
      }}
    >
      {menuItem.label}
    </a>
  ));

  return (
    <div className={dropdownStyles.join(" ")}>
      <div className="dropdownMenu-trigger" onClick={onContClick} />
      <div className="dropdown-menu" ref={node}>
        <div className="dropdown-content">{dropDownContent}</div>
      </div>
    </div>
  );
};


export default DropDownMenu;
