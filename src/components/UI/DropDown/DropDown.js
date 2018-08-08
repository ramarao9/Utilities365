import React, { Component } from 'react'
import Aux from '../../../hoc/_Aux/_Aux';
import IsEmpty from 'is-empty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './DropDown.css';
class dropDown extends Component {


    // <Dropdown placeholder='Select Entity(s)' fluid multiple search selection options={props.entities} />
    state = {
        selections: [],
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
        const updatedSelectionsArr = [...this.state.selections];

        if(selectedValue != null && selectedValue !== "") {
            updatedSelectionsArr.push(selectedValue);
        }
        const updatedSelections = updatedSelectionsArr.join(",");

        const currentDropDownOptions = this.getCurrentDropDownOptions(updatedSelectionsArr);

        this.props.changed(updatedSelections);

        //Update SetState to indicate selections and current options and to clear input
        this.setState({ selections: updatedSelectionsArr, currentDropdownOptions: currentDropDownOptions, showDropwDownMenu: false });


    }

    removeOption = (event,entityToRemove) => {

        const currentSelectionsArr = [...this.state.selections];

        const updatedSelectionsArr = currentSelectionsArr.filter(optionValue => {
            return optionValue !== entityToRemove;
        });

        const updatedSelectionsCsv = updatedSelectionsArr.join(",");

        this.props.changed(updatedSelectionsCsv);

        const currentDropDownOptions = this.getCurrentDropDownOptions(updatedSelectionsArr);

        //Update SetState to indicate selections and current options and to clear input
        this.setState({ selections: updatedSelectionsArr, currentDropdownOptions: currentDropDownOptions });


    }

    getCurrentDropDownOptions = (updatedSelectionsArr) => {


        const dropDownOptions = [...this.state.dropdownOptions];

        const currentDropdownOptions = dropDownOptions.filter(option => {
            return !updatedSelectionsArr.includes(option.Value);
        });

        return currentDropdownOptions;
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
                    <a key={ddwnOption.Value} onClick={() => this.onDropdownClick(ddwnOption.Value)} className="dropdown-item">{ddwnOption.Label}</a>
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
   
        if (this.state.selections.length>0) {
            const selectionsArr = [...this.state.selections];
                selectionsDisplay = (
                    selectionsArr.map(selection => (
                        <a key={selection} className="button is-small is-light">
                            <span>{dropDownOptions.find(option => { return option.Value === selection }).Label}</span>
                            <span className="icon is-small" onClick={(ev) => this.removeOption(ev,selection)}>
                                <FontAwesomeIcon icon="times" />
                            </span>
                        </a>
                    ))
                );           
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
                                    <div className="dropdown-menu w100" role="menu">
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