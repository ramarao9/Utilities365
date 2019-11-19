import React from "react";
import {Spinner} from "../../../interfaces/Spinner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export const SpinIcon: React.FC<Spinner> =(tableProps: Spinner)=>{

return (
    <FontAwesomeIcon icon="slash" color="white" spin style={{ height:'10px'}} size="1x"/>);
}