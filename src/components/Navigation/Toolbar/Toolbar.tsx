import React from 'react';

import './Toolbar.css';
import { NavigationItems } from '../NavigationItems/NavigationItems';

import {UserInfo} from "../../../interfaces/UserInfo";

interface LayoutProps{
    currentUser?:UserInfo;
    onUserSignout?():void;
  }
  

export const Toolbar: React.FC<LayoutProps> = (layoutProps:LayoutProps) => (
    <header>
        <nav className="DesktopOnly">
            <NavigationItems currentUser={layoutProps.currentUser} onUserSignout={layoutProps.onUserSignout} />
        </nav>
    </header>
  

);
