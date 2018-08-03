import React, { Component } from 'react'
import Aux from '../../../hoc/_Aux/_Aux';
import IsEmpty from 'is-empty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './DropDown.css';
class dropDown extends Component {


    // <Dropdown placeholder='Select Entity(s)' fluid multiple search selection options={props.entities} />
    state = {
        selections: "",
        showDropwDownMenu: false,
        dropdownOptions: [...this.props.options],
        currentDropdownOptions: [...this.props.options]
    }

    componentDidUpdate(prevprops) {


        if ((prevprops.options == null || prevprops.options.length == 0) && this.props.options != null) {
            this.setState({ dropdownOptions: [...this.props.options], currentDropdownOptions: [...this.props.options] });
        }
    }

    showMenu = () => {
        this.setState({ showDropwDownMenu: true });
    }

    hideMenu = () => {
        this.setState({ showDropwDownMenu: false });
    }



    onsearchTextChange = (ev) => {
        const dropDownOptions = [...this.state.dropdownOptions];


        const searchText = ev.target.value;
        const entitiesFromSearch = dropDownOptions.filter(option => option.Label.includes(searchText) ||
            option.Value.includes(searchText) || (option.AlternateValue != null && option.AlternateValue == searchText));

        this.setState({ currentDropdownOptions: entitiesFromSearch });

    }

    onDropdownClick = (selectedValue) => {



        //Set Selections
        const currentSelections = this.state.selections;

        const updatedSelections = (currentSelections != null && currentSelections !== "") ? currentSelections + "," + selectedValue : selectedValue;
        const updatedSelectionsArr = updatedSelections.split(",");
        const dropDownOptions = [...this.state.dropdownOptions];

        const currentDropdownOptions = dropDownOptions.filter(option => {
            return !updatedSelectionsArr.includes(option.Value);
        });



        this.props.changed(updatedSelections);

        //Update SetState to indicate selections and current options and to clear input
        this.setState({ selections: updatedSelections, currentDropdownOptions: currentDropdownOptions, showDropwDownMenu: false });


    }


    render() {



        let drpDownClasses = ["dropdown", "w100"];
        if (this.state.showDropwDownMenu) {
            drpDownClasses.push("is-active");
        }

        let dropdownContent = null;
        if (!IsEmpty(this.state.currentDropdownOptions)) {
            let currentDropDownOptions = [...this.state.currentDropdownOptions];

            let options = null;
            if (currentDropDownOptions.length > 0) {
                options = currentDropDownOptions.map(ddwnOption => (
                    <a key={ddwnOption.Value}  onClick={() => this.onDropdownClick(ddwnOption.Value)} className="dropdown-item">{ddwnOption.Label}</a>
                ));

                dropdownContent = (
                    <div className='dropdown-content cstm-dropdown-content'>
                        {options}
                    </div>
                );
            }


        }
        const dropDownOptions = [...this.state.dropdownOptions];
        //Using selections Add to Selections Div
        let selectionsDisplay = "";
        const selectionsStr = this.state.selections;
        if (!IsEmpty(selectionsStr)) {
            const selectionsArr = selectionsStr.split(",");

            if (selectionsArr != null && selectionsArr.length > 0) {

                selectionsDisplay = (
                    selectionsArr.map(selection => (
                        <a key={selection} className="button is-small is-light">
                            <span>{dropDownOptions.find(option => { return option.Value === selection }).Label}</span>
                            <span className="icon is-small">
                                <FontAwesomeIcon icon="times" />
                            </span>
                        </a>
                    ))
                );
            }
        }

        return (
            <Aux>
                <div className="field is-horizontal">
                    <div className="field-label is-small">
                        <label className="label">{this.props.label}</label>
                    </div>
                    <div className="field-body">
                        <div className="field">
                            <div className="control">
                                <div className={drpDownClasses.join(' ')}>
                                    <div className="dropdown-trigger w100">
                                        <div className="dropdown-selection">
                                            <div className="selectedItemsDiv w100">
                                                {selectionsDisplay}
                                                <input onFocus={this.showMenu} type="text" onKeyUp={(ev) => this.onsearchTextChange(ev)} />
                                            </div>
                                            <div>
                                            </div>
                                            <div className="drpdwnBtnDiv">
                                                <button className="button" aria-haspopup="true" onClick={this.showMenu} aria-controls="dropdown-menu">
                                                    <span className="icon is-small">
                                                        <FontAwesomeIcon icon="angle-down" />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="dropdown-menu" role="menu">
                                        {dropdownContent}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </Aux>
        );
    }

};


export default dropDown;