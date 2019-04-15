import React, { Component } from "react";
import pickerMore from "./picker_more.svg";
import "./MoreButton.css";

class MoreButton extends Component {
  state = {
    showActionsMenu: false
  };
  componentWillMount() {
    document.addEventListener(
      "mousedown",
      this.closeDropDownWhenClickedOutside,
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      "mousedown",
      this.closeDropDownWhenClickedOutside,
      false
    );
  }

  closeDropDownWhenClickedOutside = e => {
    if (!this.menu.contains(e.target)) {
      this.toggleMenuDisplay();
    }
  };

  toggleMenuDisplay = ev => {
    this.setState(prevState => ({
      showActionsMenu: !prevState.showActionsMenu
    }));
  };

  onActionClicked = (event, action) => {
    this.props.clicked(event, action, this.props.contextObj);
    this.toggleMenuDisplay();
  };

  render() {
    let dropdownStyles = ["dropdown"];

    if (this.state.showActionsMenu) {
      dropdownStyles.push("is-active");
    }

    const dropDownActions = [...this.props.actions];

    let dropDownContent = dropDownActions.map(action => (
      <a
        key={action.id}
        href="#"
        className="dropdown-item"
        onClick={event => this.onActionClicked(event, action)}
      >
        {action.label}
      </a>
    ));

    return (
      <div className={dropdownStyles.join(" ")}>
        <div
          className="dropdown-trigger"
          onClick={ev => this.toggleMenuDisplay(ev)}
        >
          <img src={pickerMore} />
        </div>

        <div
          className="dropdown-menu"
          onBlur={this.toggleMenuDisplay}
          ref={menu => (this.menu = menu)}
        >
          <div className="dropdown-content">{dropDownContent}</div>
        </div>
      </div>
    );
  }
}

export default MoreButton;
