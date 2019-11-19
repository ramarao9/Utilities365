import React, { useEffect, useState, useRef } from "react";
import Aux from "../../../hoc/_Aux/_Aux";
import IsEmpty from "is-empty";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DropDown.css";

const dropDown = props => {
  const node = useRef();
  const [showDropDown, setShowDropDown] = useState(false);
  const [dropdownOptions, setDropdownoptions] = useState(props.options);
  const [currentDropdownOptions, setCurrentDropdownOptions] = useState(
    props.options
  );

  useEffect(() => {
    document.addEventListener("mousedown", closeDropDownWhenClickedOutside);

    if (
      (currentDropdownOptions == null || currentDropdownOptions.length === 0) &&
      props.options != null &&
      props.options.length > 0
    ) {
      setDropdownoptions(props.options);
      setCurrentDropdownOptions(props.options);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        closeDropDownWhenClickedOutside
      );
    };
  }, [props.options]);

  const closeDropDownWhenClickedOutside = e => {
    if (node.current.contains(e.target)) return;

    hideMenu();
  };

  const showMenu = () => {
    setShowDropDown(true);
  };

  const hideMenu = () => {
    setShowDropDown(false);
  };

  const onsearchTextChange = ev => {
    const searchText = ev.target.value;
    const entitiesFromSearch = dropdownOptions.filter(
      option =>
        option.Label.includes(searchText) ||
        option.Value.includes(searchText) ||
        (option.AlternateValue != null && option.AlternateValue == searchText)
    );

    setCurrentDropdownOptions(entitiesFromSearch);
  };

  const onDropdownClick = selectedValue => {
    //Set Selections
    const updatedSelectionsArr = [...props.selections];

    if (selectedValue != null && selectedValue !== "") {
      updatedSelectionsArr.push(selectedValue);
    }
   
    const options = getCurrentDropDownOptions(updatedSelectionsArr);

   
    //Update State to indicate selections and current options and to clear input
    setCurrentDropdownOptions(options);
    showMenu(false);

     props.changed(updatedSelectionsArr);
  };

  const removeOption = (event, entityToRemove) => {
    const currentSelectionsArr = [...props.selections];

    const updatedSelectionsArr = currentSelectionsArr.filter(optionValue => {
      return optionValue !== entityToRemove;
    });

  
    

    const updatedCurrentDropDownOptions = getCurrentDropDownOptions(
      updatedSelectionsArr
    );

    //Update State to indicate selections and current options and to clear input
    setCurrentDropdownOptions(updatedCurrentDropDownOptions);

    props.changed(updatedSelectionsArr);
  };

  const getCurrentDropDownOptions = updatedSelectionsArr => {
    const ddOptions = [...dropdownOptions];

    const updatedOptions = ddOptions.filter(option => {
      return !updatedSelectionsArr.includes(option.Value);
    });

    return updatedOptions;
  };

  let drpDownClasses = ["dropdown", "w100"];
  if (showDropDown) {
    drpDownClasses.push("is-active");
  }

  let dropdownContent = null;
  if (!IsEmpty(currentDropdownOptions)) {
    let options = null;
    if (currentDropdownOptions.length > 0) {
      options = currentDropdownOptions.map(ddwnOption => (
        <a
          key={ddwnOption.Value}
          onClick={() => onDropdownClick(ddwnOption.Value)}
          className="dropdown-item"
        >
          {ddwnOption.Label}
        </a>
      ));

      dropdownContent = (
        <div className="dropdown-content cstm-dropdown-content">{options}</div>
      );
    }
  }
  //Using selections Add to Selections Div
  let selectionsDisplay = "";

  if (props.selections.length > 0) {
    const selectionsArr = [...props.selections];
    selectionsDisplay = selectionsArr.map(selection => (
      <a key={selection} className="button is-small is-light">
        <span>
          {
            dropdownOptions.find(option => {
              return option.Value === selection;
            }).Label
          }
        </span>
        <span
          className="icon is-small"
          onClick={ev => removeOption(ev, selection)}
        >
          <FontAwesomeIcon icon="times" />
        </span>
      </a>
    ));
  }

  return (
    <Aux>
      <div className="field is-horizontal">
        <div className="field-label is-small">
          <label className="label">{props.label}</label>
        </div>
        <div className="field-body">
          <div className="field">
            <div className="control">
              <div className={drpDownClasses.join(" ")}>
                <div className="dropdown-trigger w100">
                  <div className="dropdown-selection">
                    <div className="selectedItemsDiv w100">
                      {selectionsDisplay}
                      <input
                        onFocus={showMenu}
                        type="text"
                        onKeyUp={ev => onsearchTextChange(ev)}
                      />
                    </div>
                    <div />
                    <div className="drpdwnBtnDiv">
                      <button
                        className="button"
                        aria-haspopup="true"
                        onClick={showMenu}
                        aria-controls="dropdown-menu"
                      >
                        <span className="icon is-small">
                          <FontAwesomeIcon icon="angle-down" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="dropdown-menu w100" ref={node} role="menu">
                  {dropdownContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Aux>
  );
};

export default dropDown;
