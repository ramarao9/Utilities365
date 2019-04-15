import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './AnchorButton.css'

const anchorButton = props => {
  let icon = null

  if (props.iconName) {
    let iconClasses = ['icon']
    if (props.iconClasses) {
      iconClasses = iconClasses.concat(props.iconClasses)
    }
    icon = (
      <span className={iconClasses.join(' ')}>
        <FontAwesomeIcon icon={props.iconName} />
      </span>
    )
  }

  let buttonClasses = ['button', 'btnMrgn'];
  if (props.classes) {
    buttonClasses = buttonClasses.concat(props.classes)
  }

  return (
    <a
      className={buttonClasses.join(' ')}
      disabled={props.disabled}
      onClick={props.clicked}
    >
      {icon}
      <span>{props.label}</span>
    </a>
  )
}

export default anchorButton
