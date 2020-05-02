import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './ErrorMessage.css';

const errorMessage = (props) => (
    <div className="errorDetailCont">
        <span class="icon has-text-danger">
            <FontAwesomeIcon icon="ban" />
        </span>
        <div className="errorDetail">{props.message}</div>
    </div>
);

export default errorMessage;


