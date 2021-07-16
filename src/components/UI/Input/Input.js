import React from 'react';
import './Input.css';
import 'bulma-switch';
import 'bulma-checkradio';

const input = (props) => {




    if (props.isHidden) {

        return (<React.Fragment></React.Fragment>);
    }



    let inputElement = null;

    const addonButtonClasses = ['button is-info'];
    const inputClasses = [''];
    const fieldLabelClasses = ['field-label'];
    if (props.size) {
        inputClasses.push(props.size);//small, normal etc.
        fieldLabelClasses.push(props.size);//small, normal etc.
        addonButtonClasses.push(props.size);
    }

    if (props.labelStyle) {
        fieldLabelClasses.push(props.labelStyle);
    }
    if (props.inputState) {
        inputClasses.push(props.inputState);//loading, disabled etc.
    }


    let reqIndicatorSp = null;
    if (props.required) {
        reqIndicatorSp=<span className="req-indicator">*</span>
    }


    switch (props.elementType) {
        case ('inputChk'):
            inputClasses.push('switch')
            inputClasses.push('is-rounded');

            inputElement = <input
                {...props.elementConfig}
                id={props.id}
                checked={props.checked}
                onChange={props.changed}
                className={inputClasses.join(' ')}
            />;
            break;

        case ('input'):
            inputClasses.push('input');



            if (props.refrnc) {
                inputElement = <input
                    ref={props.refrnc}
                    onChange={props.changed}
                    className={inputClasses.join(' ')}
                    {...props.elementConfig}
                    value={props.value} />;
            }
            else {
                inputElement = <input
                    onChange={props.changed}
                    className={inputClasses.join(' ')}
                    {...props.elementConfig}
                    value={props.value} />;
            }



            break;

        case ('password'):
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


        case ('radio'):

            inputClasses.push('is-checkradio');
            inputElement = <React.Fragment>
                <div className="field">
                    {props.elementConfig.options.map((option, i) => (
                        <React.Fragment key={option + "_" + i}>
                            <input type="radio"
                                id={option + i}
                                className={inputClasses.join(' ')}
                                name={props.elementConfig.name}
                                onChange={props.changed}
                                checked={props.value === option}
                                value={option} />
                            <label htmlFor={option + i}>{option}</label>
                        </React.Fragment>
                    )
                    )}
                </div>
            </React.Fragment>;
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
                <label className="label">{props.label} {reqIndicatorSp}</label>
            </div>
            {fieldControl}
        </div>

    );
};


export default input;