import React from 'react';
import './Input.css';
import 'bulma-switch';

const input = (props) => {

    let inputElement = null;

    const addonButtonClasses = ['button is-info'];
    const inputClasses = [''];
    const fieldLabelClasses = ['field-label'];
    if (props.size) {
        inputClasses.push(props.size);//small, normal etc.
        fieldLabelClasses.push(props.size);//small, normal etc.
        addonButtonClasses.push(props.size);
    }
    if (props.inputState) {
        inputClasses.push(props.inputState);//loading, disabled etc.
    }






    switch (props.elementType) {
        case ('inputChk'):
            inputClasses.push('switch')
            inputClasses.push('is-rounded');

            inputElement = <input
                {...props.elementConfig}
                id={props.id}
                checked={props.checked}
                className={inputClasses.join(' ')}
            />;
            break;

        case ('input'):
            inputClasses.push('input');
            inputElement = <input
                onChange={props.changed}
                className={inputClasses.join(' ')}
                {...props.elementConfig}
                value={props.value} />;
            break;
        case ('textarea'):
            inputElement = <textarea
                onChange={props.changed}
                className={inputClasses.join(' ')}
                {...props.elementConfig}
                value={props.value} />;
            break;

        case ('select'):
            inputElement = <select
                className={inputClasses.join(' ')}
                onChange={props.changed}
                value={props.value} >
                {props.elementConfig.options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.displayValue}
                    </option>
                )

                )};
            </select>;
            break;


        default:
            inputClasses.push('input');
            inputElement = <input
                onChange={props.changed}
                placeholder={props.placeholder}
                className={inputClasses.join(' ')}
                {...props.elementConfig}
                value={props.value} />;
            break;
    }


    let fieldControl = "";

    switch (props.elementConfig.type) {

        case "checkbox": fieldControl = (<div className="field-body">
            <div className="field">
                {inputElement}
                <label onClick={props.clicked} id={props.id}></label>
            </div>
        </div>)
            break;

        case "textAddOn": fieldControl = (<div className="field-body">
            <div className="field">
                <div className="control">
                    {inputElement}
                </div>
            </div>
            <div className="control">
                <a className={addonButtonClasses.join(' ')} onClick={props.clicked}>{props.addOnLabel}</a>
            </div>

        </div>)
            break;

        default: fieldControl = (<div className="field-body">
            <div className="field">
                <div className="control">
                    {inputElement}
                </div>
            </div>
        </div>)
    }


    return (

        <div className="field is-horizontal">
            <div className={fieldLabelClasses.join(' ')}>
                <label className="label">{props.label}</label>
            </div>
            {fieldControl}
        </div>

    );
};


export default input;