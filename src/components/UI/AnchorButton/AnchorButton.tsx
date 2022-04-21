import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AnchorButton.css";
import { IconName } from "@fortawesome/fontawesome-svg-core";


interface AnchorButtonProps {
  iconName?: IconName;
  iconClasses?: string[];
  label?: string;
  tooltip?: string;
  classes?: string[];
  disabled?: boolean;
  onClick?(event: any): void;
}



export const AnchorButton: React.FC<AnchorButtonProps> = (props: AnchorButtonProps) => {
  let icon = null;

  if (props.iconName) {
    let iconClasses = ["icon"];
    if (props.iconClasses) {
      iconClasses = iconClasses.concat(props.iconClasses);
    }

    icon = (
      <span className={iconClasses.join(" ")}>
        <FontAwesomeIcon icon={props.iconName} />
      </span>
    );
  }

  let buttonClasses = ["button", "btnMrgn", "btn"];
  if (props.label == null || props.label === "") {
    buttonClasses.push("no-label");
  }

  if (props.classes) {
    buttonClasses = buttonClasses.concat(props.classes);
  }

  return (
    <button className={buttonClasses.join(" ")}
      title={props.tooltip}
      disabled={props.disabled}
      onClick={props.onClick}>
      {icon}
      <span>{props.label}</span>
    </button>
  );
};


