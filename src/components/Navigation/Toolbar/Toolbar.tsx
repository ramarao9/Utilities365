import React from 'react';

import './Toolbar.css';
import { NavigationItems } from '../NavigationItems/NavigationItems';

import {UserInfo} from "../../../interfaces/UserInfo";

interface ToolbarProps{
    currentUser?:UserInfo|null;
    onUserSignout?():void;
  }
  

export const Toolbar: React.FC<ToolbarProps> = (toolbarProps:ToolbarProps) => (
    <header>
        <nav className="DesktopOnly">
            <NavigationItems currentUser={toolbarProps.currentUser} onUserSignout={toolbarProps.onUserSignout} />
        </nav>
    </header>
  

);
